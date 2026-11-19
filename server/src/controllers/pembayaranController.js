import PDFDocument from 'pdfkit';
import { query, withTransaction } from '../config/database.js';
import {
  buatInstruksiPembayaran,
  daftarBankDidukung,
  hitungNominalTahap,
  verifikasiTandaTanganWebhook,
} from '../services/pembayaran.js';
import { AppError } from '../utils/kesalahan.js';
import {
  BANK_INDONESIA,
  METODE_BAYAR_VALID,
  TAHAP_BAYAR_VALID,
  validasiEnum,
} from '../utils/validasi.js';

export async function ambilDaftarBank(_req, res) {
  return res.json({
    sukses: true,
    ...daftarBankDidukung(),
  });
}

export async function buatPembayaran(req, res, next) {
  try {
    const orderId = Number(req.body.order_id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new AppError('ID pesanan tidak valid.', 400);
    }

    const tahapPembayaran = validasiEnum(
      req.body.tahap_pembayaran,
      TAHAP_BAYAR_VALID,
      'Tahap pembayaran'
    );
    const metodePembayaran = validasiEnum(
      req.body.metode_pembayaran,
      METODE_BAYAR_VALID,
      'Metode pembayaran'
    );
    const namaBank = validasiEnum(req.body.nama_bank, BANK_INDONESIA, 'Bank tujuan');

    const bankKoresponden = req.body.bank_koresponden
      ? String(req.body.bank_koresponden).trim()
      : '';
    const swiftKoresponden = req.body.swift_koresponden
      ? String(req.body.swift_koresponden).trim().toUpperCase()
      : '';

    const hasil = await withTransaction(async (conn) => {
      const [orders] = await conn.execute(
        'SELECT * FROM order_transaksi WHERE order_id = ? FOR UPDATE',
        [orderId]
      );

      if (orders.length === 0) {
        throw new AppError('Pesanan tidak ditemukan.', 404);
      }

      const order = orders[0];
      if (req.pengguna.role_user !== 'Admin' && order.buyer_id !== req.pengguna.user_id) {
        throw new AppError('Anda tidak berhak membayar pesanan ini.', 403);
      }

      if (order.status_order === 'Dibatalkan') {
        throw new AppError('Pesanan yang dibatalkan tidak dapat dibayar.', 400);
      }

      const [bayarRows] = await conn.execute(
        `SELECT COALESCE(SUM(nominal_dibayar_idr), 0) AS sudah_lunas
         FROM pembayaran
         WHERE order_id = ? AND status_pembayaran = 'Lunas'`,
        [orderId]
      );

      const sudahLunas = Number(bayarRows[0]?.sudah_lunas || 0);
      const { nominalIdr, nominalUsd } = hitungNominalTahap(
        order.total_tagihan_idr,
        tahapPembayaran,
        sudahLunas
      );

      const instruksi = await buatInstruksiPembayaran({
        orderId,
        nomorInvoice: order.nomor_invoice,
        tahapPembayaran,
        metodePembayaran,
        namaBank,
        bankKoresponden,
        swiftKoresponden,
        nominalIdr,
        nominalUsd,
      });

      const batasSql = instruksi.batas_waktu_bayar.toISOString().slice(0, 19).replace('T', ' ');

      const [insertRes] = await conn.execute(
        `INSERT INTO pembayaran (
          order_id, kode_transaksi_bank, tahap_pembayaran, metode_pembayaran,
          nominal_dibayar_idr, nominal_usd, bank_pengirim_tujuan,
          status_pembayaran, batas_waktu_bayar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?)`,
        [
          orderId,
          instruksi.kode_transaksi_bank,
          tahapPembayaran,
          metodePembayaran,
          nominalIdr,
          nominalUsd,
          instruksi.bank_pengirim_tujuan,
          batasSql,
        ]
      );

      return {
        payment_id: insertRes.insertId,
        ...instruksi,
      };
    });

    return res.status(201).json({
      sukses: true,
      pesan: 'Instruksi pembayaran berhasil dibuat.',
      instruksi: hasil,
    });
  } catch (err) {
    return next(err);
  }
}

export async function unggahBukti(req, res, next) {
  try {
    const paymentId = Number(req.params.id);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      throw new AppError('ID pembayaran tidak valid.', 400);
    }
    if (!req.file) {
      throw new AppError('Berkas bukti transfer wajib diunggah.', 400);
    }

    const rows = await query(
      `SELECT pb.*, o.buyer_id
       FROM pembayaran pb
       INNER JOIN order_transaksi o ON o.order_id = pb.order_id
       WHERE pb.payment_id = ? LIMIT 1`,
      [paymentId]
    );

    if (rows.length === 0) {
      throw new AppError('Data pembayaran tidak ditemukan.', 404);
    }

    const pembayaran = rows[0];
    if (req.pengguna.role_user !== 'Admin' && pembayaran.buyer_id !== req.pengguna.user_id) {
      throw new AppError('Anda tidak berhak mengunggah bukti untuk transaksi ini.', 403);
    }

    const pathBukti = `/uploads/bukti/${req.file.filename}`;
    await query(
      `UPDATE pembayaran
       SET bukti_transfer = ?, tanggal_bayar = COALESCE(tanggal_bayar, NOW())
       WHERE payment_id = ?`,
      [pathBukti, paymentId]
    );

    return res.json({
      sukses: true,
      pesan: 'Bukti transfer berhasil diunggah dan menunggu verifikasi.',
      bukti_transfer: pathBukti,
    });
  } catch (err) {
    return next(err);
  }
}

export async function riwayatPembayaran(req, res, next) {
  try {
    const { status, tanggal_mulai, tanggal_selesai } = req.query;
    const kondisi = [];
    const params = [];

    if (req.pengguna.role_user !== 'Admin') {
      kondisi.push('o.buyer_id = ?');
      params.push(req.pengguna.user_id);
    }

    if (status && ['Menunggu', 'Lunas', 'Gagal'].includes(status)) {
      kondisi.push('pb.status_pembayaran = ?');
      params.push(status);
    }

    if (tanggal_mulai) {
      kondisi.push('DATE(COALESCE(pb.tanggal_bayar, o.tanggal_order)) >= ?');
      params.push(tanggal_mulai);
    }

    if (tanggal_selesai) {
      kondisi.push('DATE(COALESCE(pb.tanggal_bayar, o.tanggal_order)) <= ?');
      params.push(tanggal_selesai);
    }

    const whereClause = kondisi.length > 0 ? `WHERE ${kondisi.join(' AND ')}` : '';
    const rows = await query(
      `SELECT pb.*, o.nomor_invoice, o.tipe_pasar, o.mata_uang, o.total_tagihan_idr,
              u.nama_lengkap AS nama_buyer
       FROM pembayaran pb
       INNER JOIN order_transaksi o ON o.order_id = pb.order_id
       INNER JOIN users u ON u.user_id = o.buyer_id
       ${whereClause}
       ORDER BY pb.payment_id DESC`,
      params
    );

    return res.json({
      sukses: true,
      pembayaran: rows,
    });
  } catch (err) {
    return next(err);
  }
}

export async function unduhBuktiPdf(req, res, next) {
  try {
    const paymentId = Number(req.params.id);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      throw new AppError('ID pembayaran tidak valid.', 400);
    }

    const rows = await query(
      `SELECT pb.*, o.nomor_invoice, o.buyer_id, o.tipe_pasar, o.incoterms,
              u.nama_lengkap AS nama_buyer, u.email AS email_buyer,
              pr.nama_perusahaan
       FROM pembayaran pb
       INNER JOIN order_transaksi o ON o.order_id = pb.order_id
       INNER JOIN users u ON u.user_id = o.buyer_id
       LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
       WHERE pb.payment_id = ? LIMIT 1`,
      [paymentId]
    );

    if (rows.length === 0) {
      throw new AppError('Data pembayaran tidak ditemukan.', 404);
    }

    const data = rows[0];
    if (req.pengguna.role_user !== 'Admin' && data.buyer_id !== req.pengguna.user_id) {
      throw new AppError('Anda tidak berhak mengunduh bukti pembayaran ini.', 403);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Bukti-Pembayaran-${data.kode_transaksi_bank}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(20).fillColor('#14452F').text('AGRO MARITIM NUSANTARA', { align: 'left' });
    doc.fontSize(10).fillColor('#475569').text('Bukti Resmi Transaksi Pembayaran Komoditas');
    doc.moveDown(1.5);

    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    const baris = [
      ['Kode Transaksi Bank', data.kode_transaksi_bank],
      ['Nomor Invoice', data.nomor_invoice],
      [
        'Pembeli / Perusahaan',
        `${data.nama_buyer}${data.nama_perusahaan ? ` (${data.nama_perusahaan})` : ''}`,
      ],
      ['Tipe Pasar / Incoterms', `${data.tipe_pasar} / ${data.incoterms}`],
      ['Tahap Pembayaran', data.tahap_pembayaran.replace('_', ' ')],
      ['Metode Pembayaran', data.metode_pembayaran.replace('_', ' ')],
      ['Bank Tujuan / Koresponden', data.bank_pengirim_tujuan],
      ['Nominal IDR', `Rp ${Number(data.nominal_dibayar_idr).toLocaleString('id-ID')}`],
      [
        'Nominal USD',
        `USD ${Number(data.nominal_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      ],
      ['Status Pembayaran', data.status_pembayaran],
      [
        'Tanggal Pembayaran',
        data.tanggal_bayar
          ? new Date(data.tanggal_bayar).toLocaleString('id-ID')
          : 'Menunggu Verifikasi',
      ],
    ];

    baris.forEach(([label, nilai]) => {
      const y = doc.y;
      doc.fontSize(10).fillColor('#64748B').text(label, 50, y, { width: 180 });
      doc.fontSize(10).fillColor('#0F172A').text(String(nilai), 240, y, { width: 300 });
      doc.moveDown(0.7);
    });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor('#64748B')
      .text(
        'Dokumen ini diterbitkan secara otomatis oleh sistem Agro Maritim dan sah tanpa tanda tangan basah.'
      );

    doc.end();
    return undefined;
  } catch (err) {
    return next(err);
  }
}

export async function webhookPembayaran(req, res, next) {
  try {
    const signature = req.headers['x-agromaritim-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    if (!verifikasiTandaTanganWebhook(rawBody, signature)) {
      throw new AppError('Tanda tangan webhook tidak valid.', 401);
    }

    const { kode_transaksi_bank: kode, status } = req.body;
    if (!kode || !['Lunas', 'Gagal'].includes(status)) {
      throw new AppError('Payload webhook tidak valid.', 400);
    }

    await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        'SELECT * FROM pembayaran WHERE kode_transaksi_bank = ? FOR UPDATE',
        [kode]
      );
      if (rows.length === 0) {
        throw new AppError('Transaksi bank tidak ditemukan.', 404);
      }

      const pembayaran = rows[0];
      await conn.execute(
        'UPDATE pembayaran SET status_pembayaran = ?, tanggal_bayar = NOW() WHERE payment_id = ?',
        [status, pembayaran.payment_id]
      );

      if (status === 'Lunas') {
        await conn.execute(
          `UPDATE order_transaksi
           SET status_order = CASE WHEN status_order = 'Menunggu_DP' THEN 'Diproses' ELSE status_order END
           WHERE order_id = ?`,
          [pembayaran.order_id]
        );
      }
    });

    return res.json({
      sukses: true,
      pesan: 'Webhook pembayaran diproses.',
    });
  } catch (err) {
    return next(err);
  }
}
