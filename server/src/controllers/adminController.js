import { query, withTransaction } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';
import { validasiEnum } from '../utils/validasi.js';

export async function daftarVerifikasiLegal(_req, res, next) {
  try {
    const rows = await query(
      `SELECT p.*, u.nama_lengkap, u.email, u.role_user, u.kota_wilayah, u.asal_negara
       FROM profil_perusahaan p
       INNER JOIN users u ON u.user_id = p.user_id
       ORDER BY FIELD(p.status_verifikasi_legal, 'Menunggu', 'Ditolak', 'Terverifikasi'), p.profil_id DESC`
    );

    let kredensialMap = {};
    let dokumenMap = {};
    try {
      const kredRows = await query('SELECT * FROM kredensial_produsen');
      kredensialMap = Object.fromEntries(
        kredRows.map((k) => [
          k.user_id,
          {
            ...k,
            detail_sektor:
              typeof k.detail_sektor === 'string'
                ? JSON.parse(k.detail_sektor || '{}')
                : k.detail_sektor || {},
          },
        ])
      );
      const dokRows = await query(
        'SELECT * FROM dokumen_verifikasi_produsen ORDER BY diunggah_pada DESC'
      );
      dokRows.forEach((d) => {
        if (!dokumenMap[d.user_id]) dokumenMap[d.user_id] = [];
        dokumenMap[d.user_id].push(d);
      });
    } catch {
      // Abaikan jika tabel kredensial belum dibuat pada DB lama
    }

    const daftar = rows.map((r) => ({
      ...r,
      kredensial_produsen: kredensialMap[r.user_id] || null,
      dokumen_verifikasi: dokumenMap[r.user_id] || [],
    }));

    return res.json({ sukses: true, daftar });
  } catch (err) {
    return next(err);
  }
}

export async function prosesVerifikasiLegal(req, res, next) {
  try {
    const profilId = Number(req.params.profilId);
    if (!Number.isInteger(profilId) || profilId <= 0) {
      throw new AppError('ID profil perusahaan tidak valid.', 400);
    }

    const status = validasiEnum(
      req.body.status_verifikasi_legal,
      ['Terverifikasi', 'Ditolak', 'Menunggu'],
      'Status verifikasi legal'
    );

    const [profil] = await query(
      'SELECT user_id FROM profil_perusahaan WHERE profil_id = ? LIMIT 1',
      [profilId]
    );
    if (!profil) {
      throw new AppError('Profil perusahaan tidak ditemukan.', 404);
    }

    await query('UPDATE profil_perusahaan SET status_verifikasi_legal = ? WHERE profil_id = ?', [
      status,
      profilId,
    ]);

    try {
      await query('UPDATE kredensial_produsen SET status_verifikasi = ? WHERE user_id = ?', [
        status,
        profil.user_id,
      ]);
      await query('UPDATE dokumen_verifikasi_produsen SET status_dokumen = ? WHERE user_id = ?', [
        status,
        profil.user_id,
      ]);
    } catch {
      // Abaikan jika tabel opsional belum ada
    }

    return res.json({
      sukses: true,
      pesan: `Status legalitas diperbarui menjadi ${status}.`,
    });
  } catch (err) {
    return next(err);
  }
}

export async function daftarPembayaranAdmin(_req, res, next) {
  try {
    const rows = await query(
      `SELECT pb.*, o.nomor_invoice, o.tipe_pasar, o.status_order,
              u.nama_lengkap AS nama_buyer, pr.nama_perusahaan
       FROM pembayaran pb
       INNER JOIN order_transaksi o ON o.order_id = pb.order_id
       INNER JOIN users u ON u.user_id = o.buyer_id
       LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
       ORDER BY FIELD(pb.status_pembayaran, 'Menunggu', 'Gagal', 'Lunas'), pb.payment_id DESC`
    );
    return res.json({ sukses: true, pembayaran: rows });
  } catch (err) {
    return next(err);
  }
}

export async function konfirmasiPembayaranManual(req, res, next) {
  try {
    const paymentId = Number(req.params.paymentId);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      throw new AppError('ID pembayaran tidak valid.', 400);
    }

    const statusBaru = validasiEnum(
      req.body.status_pembayaran,
      ['Lunas', 'Gagal'],
      'Status pembayaran'
    );

    await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        'SELECT * FROM pembayaran WHERE payment_id = ? FOR UPDATE',
        [paymentId]
      );
      if (rows.length === 0) {
        throw new AppError('Data pembayaran tidak ditemukan.', 404);
      }

      const pb = rows[0];
      await conn.execute(
        `UPDATE pembayaran
         SET status_pembayaran = ?, tanggal_bayar = COALESCE(tanggal_bayar, NOW())
         WHERE payment_id = ?`,
        [statusBaru, paymentId]
      );

      if (statusBaru === 'Lunas') {
        await conn.execute(
          `UPDATE order_transaksi
           SET status_order = CASE WHEN status_order = 'Menunggu_DP' THEN 'Diproses' ELSE status_order END
           WHERE order_id = ?`,
          [pb.order_id]
        );
      }
    });

    return res.json({
      sukses: true,
      pesan: `Pembayaran berhasil ditandai sebagai ${statusBaru}.`,
    });
  } catch (err) {
    return next(err);
  }
}

export async function ubahStatusPengiriman(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new AppError('ID pesanan tidak valid.', 400);
    }

    const statusPengiriman = validasiEnum(
      req.body.status_pengiriman,
      ['Persiapan_Dokumen', 'Muat_Kargo', 'Bea_Cukai', 'Dalam_Perjalanan', 'Tiba_Di_Tujuan'],
      'Status pengiriman'
    );

    await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        'SELECT * FROM pengiriman_ekspor WHERE order_id = ? FOR UPDATE',
        [orderId]
      );
      if (rows.length === 0) {
        throw new AppError('Data pengiriman tidak ditemukan.', 404);
      }

      const lama = rows[0];
      await conn.execute(
        `UPDATE pengiriman_ekspor
         SET status_pengiriman = ?,
             jenis_armada = ?,
             nomor_kontainer_resi = ?,
             no_peb_beacukai = ?,
             sertifikat_pendukung = ?,
             pelabuhan_asal = ?,
             pelabuhan_tujuan = ?,
             estimasi_tiba = ?
         WHERE order_id = ?`,
        [
          statusPengiriman,
          req.body.jenis_armada ?? lama.jenis_armada,
          req.body.nomor_kontainer_resi ?? lama.nomor_kontainer_resi,
          req.body.no_peb_beacukai ?? lama.no_peb_beacukai,
          req.body.sertifikat_pendukung ?? lama.sertifikat_pendukung,
          req.body.pelabuhan_asal ?? lama.pelabuhan_asal,
          req.body.pelabuhan_tujuan ?? lama.pelabuhan_tujuan,
          req.body.estimasi_tiba || lama.estimasi_tiba,
          orderId,
        ]
      );

      let statusOrderBaru = null;
      if (statusPengiriman === 'Dalam_Perjalanan') {
        statusOrderBaru = 'Dikirim';
      } else if (statusPengiriman === 'Tiba_Di_Tujuan') {
        statusOrderBaru = 'Selesai';
      } else if (statusPengiriman === 'Muat_Kargo' || statusPengiriman === 'Bea_Cukai') {
        statusOrderBaru = 'Diproses';
      }

      if (statusOrderBaru) {
        await conn.execute('UPDATE order_transaksi SET status_order = ? WHERE order_id = ?', [
          statusOrderBaru,
          orderId,
        ]);
      }
    });

    return res.json({
      sukses: true,
      pesan: 'Status pengiriman dan pesanan berhasil diperbarui.',
    });
  } catch (err) {
    return next(err);
  }
}
