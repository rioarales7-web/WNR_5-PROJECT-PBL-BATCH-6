import { env } from '../config/env.js';
import { query, withTransaction } from '../config/database.js';
import { hitungRincianTagihan } from '../services/kalkulasiOrder.js';
import { AppError } from '../utils/kesalahan.js';
import {
  INCOTERMS_VALID,
  PERAN_PRODUSEN,
  validasiAngkaPositif,
  validasiEnum,
  wajibIsi,
} from '../utils/validasi.js';

async function ambilDanValidasiItem(itemsInput) {
  if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
    throw new AppError('Keranjang pesanan masih kosong.', 400);
  }

  const hasil = [];
  for (const item of itemsInput) {
    const produkId = Number(item.produk_id);
    const kuantitas = validasiAngkaPositif(item.kuantitas, 'Kuantitas produk');
    if (!Number.isInteger(produkId) || produkId <= 0) {
      throw new AppError('ID produk di keranjang tidak valid.', 400);
    }

    const rows = await query(
      `SELECT p.produk_id, p.produsen_id, p.nama_komoditas, p.satuan, p.harga_idr,
              p.harga_usd, p.stok_tersedia, p.status_produk, u.kota_wilayah
       FROM produk_komoditas p
       INNER JOIN users u ON u.user_id = p.produsen_id
       WHERE p.produk_id = ? LIMIT 1`,
      [produkId]
    );

    if (rows.length === 0) {
      throw new AppError(`Produk dengan ID ${produkId} tidak ditemukan.`, 404);
    }

    const produk = rows[0];
    if (produk.status_produk !== 'Aktif') {
      throw new AppError(`Produk "${produk.nama_komoditas}" sedang nonaktif.`, 400);
    }
    if (Number(produk.stok_tersedia) < kuantitas) {
      throw new AppError(
        `Stok "${produk.nama_komoditas}" tidak mencukupi (tersedia ${produk.stok_tersedia} ${produk.satuan}).`,
        400
      );
    }

    hasil.push({
      ...produk,
      kuantitas,
    });
  }

  return hasil;
}

export async function pratinjauCheckout(req, res, next) {
  try {
    const tipePasar = validasiEnum(req.body.tipe_pasar, ['Lokal', 'Ekspor'], 'Tipe pasar');
    const defaultIncoterms = tipePasar === 'Lokal' ? 'Lokal_Franco' : 'FOB';
    const incoterms = validasiEnum(
      req.body.incoterms || defaultIncoterms,
      INCOTERMS_VALID,
      'Incoterms'
    );

    const items = await ambilDanValidasiItem(req.body.items);
    const rincian = hitungRincianTagihan({ items, tipePasar, incoterms });

    return res.json({
      sukses: true,
      ringkasan: {
        ...rincian,
        mata_uang: tipePasar === 'Ekspor' ? 'USD' : 'IDR',
        total_tagihan_usd: Number((rincian.total_tagihan_idr / env.kursUsd).toFixed(2)),
        kurs_usd: env.kursUsd,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function buatOrder(req, res, next) {
  try {
    const tipePasar = validasiEnum(req.body.tipe_pasar, ['Lokal', 'Ekspor'], 'Tipe pasar');
    const defaultIncoterms = tipePasar === 'Lokal' ? 'Lokal_Franco' : 'FOB';
    const incoterms = validasiEnum(
      req.body.incoterms || defaultIncoterms,
      INCOTERMS_VALID,
      'Incoterms'
    );
    const tujuan = wajibIsi(
      req.body.pelabuhan_tujuan,
      tipePasar === 'Ekspor' ? 'Pelabuhan tujuan' : 'Alamat gudang tujuan'
    );

    const itemsInput = req.body.items;
    if (!Array.isArray(itemsInput) || itemsInput.length === 0) {
      throw new AppError('Keranjang pesanan tidak boleh kosong.', 400);
    }

    const mataUang = tipePasar === 'Ekspor' ? 'USD' : 'IDR';

    const hasilOrder = await withTransaction(async (conn) => {
      const itemTervalidasi = [];

      for (const item of itemsInput) {
        const produkId = Number(item.produk_id);
        const kuantitas = validasiAngkaPositif(item.kuantitas, 'Kuantitas produk');

        const [rows] = await conn.execute(
          `SELECT p.produk_id, p.produsen_id, p.nama_komoditas, p.satuan,
                  p.harga_idr, p.harga_usd, p.stok_tersedia, p.status_produk,
                  u.kota_wilayah
           FROM produk_komoditas p
           INNER JOIN users u ON u.user_id = p.produsen_id
           WHERE p.produk_id = ?
           FOR UPDATE`,
          [produkId]
        );

        if (rows.length === 0) {
          throw new AppError(`Produk ID ${produkId} tidak ditemukan.`, 404);
        }

        const produk = rows[0];
        if (produk.status_produk !== 'Aktif') {
          throw new AppError(`Komoditas "${produk.nama_komoditas}" sedang nonaktif.`, 400);
        }
        if (Number(produk.stok_tersedia) < kuantitas) {
          throw new AppError(
            `Stok "${produk.nama_komoditas}" tersisa ${produk.stok_tersedia} ${produk.satuan}.`,
            400
          );
        }

        itemTervalidasi.push({ ...produk, kuantitas });
      }

      const rincian = hitungRincianTagihan({
        items: itemTervalidasi,
        tipePasar,
        incoterms,
      });

      const nomorInvoice = `INV-AM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const [orderRes] = await conn.execute(
        `INSERT INTO order_transaksi (
          nomor_invoice, buyer_id, tipe_pasar, incoterms, mata_uang,
          subtotal_produk_idr, biaya_logistik_ekspor_idr, pajak_bea_idr,
          total_tagihan_idr, status_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu_DP')`,
        [
          nomorInvoice,
          req.pengguna.user_id,
          tipePasar,
          incoterms,
          mataUang,
          rincian.subtotal_produk_idr,
          rincian.biaya_logistik_ekspor_idr,
          rincian.pajak_bea_idr,
          rincian.total_tagihan_idr,
        ]
      );

      const orderId = orderRes.insertId;

      for (const item of itemTervalidasi) {
        const subtotalItem = Math.round(Number(item.harga_idr) * item.kuantitas);
        await conn.execute(
          `INSERT INTO detail_order (
            order_id, produk_id, nama_komoditas_snapshot,
            kuantitas, satuan, harga_satuan_deal_idr, subtotal_idr
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.produk_id,
            item.nama_komoditas,
            item.kuantitas,
            item.satuan,
            item.harga_idr,
            subtotalItem,
          ]
        );

        await conn.execute(
          'UPDATE produk_komoditas SET stok_tersedia = stok_tersedia - ? WHERE produk_id = ?',
          [item.kuantitas, item.produk_id]
        );
      }

      const pelabuhanAsal =
        req.body.pelabuhan_asal ||
        (tipePasar === 'Ekspor'
          ? 'Pelabuhan Tanjung Priok, Jakarta'
          : itemTervalidasi[0].kota_wilayah || 'Gudang Produsen');
      const jenisArmada =
        tipePasar === 'Ekspor' ? 'Kapal Kargo Kontainer Reefer' : 'Truk Pendingin Darat';
      const estimasiHari = tipePasar === 'Ekspor' ? 14 : 4;
      const estimasiTiba = new Date(Date.now() + estimasiHari * 86400 * 1000)
        .toISOString()
        .slice(0, 10);

      await conn.execute(
        `INSERT INTO pengiriman_ekspor (
          order_id, jenis_armada, nomor_kontainer_resi, no_peb_beacukai,
          sertifikat_pendukung, pelabuhan_asal, pelabuhan_tujuan,
          status_pengiriman, estimasi_tiba
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Persiapan_Dokumen', ?)`,
        [
          orderId,
          jenisArmada,
          `AM-LOG-${String(orderId).padStart(5, '0')}`,
          tipePasar === 'Ekspor' ? 'Menunggu Penerbitan PEB' : 'Tidak Diperlukan (Lokal)',
          tipePasar === 'Ekspor' ? 'Phytosanitary / Health Certificate' : 'Surat Jalan Resmi',
          pelabuhanAsal,
          tujuan,
          estimasiTiba,
        ]
      );

      return { orderId, nomorInvoice, ...rincian };
    });

    return res.status(201).json({
      sukses: true,
      pesan: 'Pesanan berhasil dibuat. Silakan lanjutkan ke pembayaran.',
      order: hasilOrder,
    });
  } catch (err) {
    return next(err);
  }
}

export async function daftarOrder(req, res, next) {
  try {
    const { role_user: role, user_id: userId } = req.pengguna;

    let sql;
    let params = [];

    if (role === 'Admin') {
      sql = `
        SELECT o.*, u.nama_lengkap AS nama_buyer, pr.nama_perusahaan AS perusahaan_buyer,
               pg.status_pengiriman, pg.pelabuhan_tujuan, pg.estimasi_tiba,
               pg.nomor_kontainer_resi, pg.jenis_armada, pg.no_peb_beacukai, pg.pelabuhan_asal
        FROM order_transaksi o
        INNER JOIN users u ON u.user_id = o.buyer_id
        LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
        LEFT JOIN pengiriman_ekspor pg ON pg.order_id = o.order_id
        ORDER BY o.tanggal_order DESC
      `;
    } else if (PERAN_PRODUSEN.includes(role)) {
      sql = `
        SELECT DISTINCT o.*, u.nama_lengkap AS nama_buyer, pr.nama_perusahaan AS perusahaan_buyer,
               pg.status_pengiriman, pg.pelabuhan_tujuan, pg.estimasi_tiba,
               pg.nomor_kontainer_resi, pg.jenis_armada, pg.no_peb_beacukai, pg.pelabuhan_asal
        FROM order_transaksi o
        INNER JOIN detail_order d ON d.order_id = o.order_id
        INNER JOIN produk_komoditas pk ON pk.produk_id = d.produk_id
        INNER JOIN users u ON u.user_id = o.buyer_id
        LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
        LEFT JOIN pengiriman_ekspor pg ON pg.order_id = o.order_id
        WHERE pk.produsen_id = ?
        ORDER BY o.tanggal_order DESC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT o.*, u.nama_lengkap AS nama_buyer, pr.nama_perusahaan AS perusahaan_buyer,
               pg.status_pengiriman, pg.pelabuhan_tujuan, pg.estimasi_tiba,
               pg.nomor_kontainer_resi, pg.jenis_armada, pg.no_peb_beacukai, pg.pelabuhan_asal
        FROM order_transaksi o
        INNER JOIN users u ON u.user_id = o.buyer_id
        LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
        LEFT JOIN pengiriman_ekspor pg ON pg.order_id = o.order_id
        WHERE o.buyer_id = ?
        ORDER BY o.tanggal_order DESC
      `;
      params = [userId];
    }

    const orders = await query(sql, params);

    return res.json({
      sukses: true,
      orders,
    });
  } catch (err) {
    return next(err);
  }
}

export async function detailOrder(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new AppError('ID pesanan tidak valid.', 400);
    }

    const [order] = await query(
      `SELECT o.*, u.nama_lengkap AS nama_buyer, u.email AS email_buyer,
              pr.nama_perusahaan AS perusahaan_buyer
       FROM order_transaksi o
       INNER JOIN users u ON u.user_id = o.buyer_id
       LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
       WHERE o.order_id = ? LIMIT 1`,
      [orderId]
    );

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    const items = await query(
      `SELECT d.*, pk.produsen_id, pk.gambar, u.nama_lengkap AS nama_produsen
       FROM detail_order d
       INNER JOIN produk_komoditas pk ON pk.produk_id = d.produk_id
       INNER JOIN users u ON u.user_id = pk.produsen_id
       WHERE d.order_id = ?`,
      [orderId]
    );

    const { role_user: role, user_id: userId } = req.pengguna;
    const adalahProdusenTerkait = items.some((it) => it.produsen_id === userId);
    if (role !== 'Admin' && order.buyer_id !== userId && !adalahProdusenTerkait) {
      throw new AppError('Anda tidak memiliki akses ke pesanan ini.', 403);
    }

    const [pengiriman] = await query('SELECT * FROM pengiriman_ekspor WHERE order_id = ? LIMIT 1', [
      orderId,
    ]);

    const pembayaran = await query(
      'SELECT * FROM pembayaran WHERE order_id = ? ORDER BY payment_id DESC',
      [orderId]
    );

    const totalLunasIdr = pembayaran
      .filter((p) => p.status_pembayaran === 'Lunas')
      .reduce((acc, p) => acc + Number(p.nominal_dibayar_idr), 0);

    return res.json({
      sukses: true,
      order: {
        ...order,
        total_lunas_idr: totalLunasIdr,
        sisa_tagihan_idr: Math.max(0, Number(order.total_tagihan_idr) - totalLunasIdr),
        items,
        pengiriman: pengiriman || null,
        pembayaran,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function ringkasanBeranda(req, res, next) {
  try {
    const { role_user: role, user_id: userId } = req.pengguna;

    const produkUnggulan = await query(
      `SELECT p.produk_id, p.sektor, p.nama_komoditas, p.grade_kualitas,
              p.satuan, p.harga_idr, p.harga_usd, p.stok_tersedia, p.gambar,
              u.nama_lengkap AS nama_produsen, u.kota_wilayah AS kota_produsen,
              COALESCE(ul.rata_rating, 0) AS rata_rating,
              COALESCE(ul.jumlah_ulasan, 0) AS jumlah_ulasan
       FROM produk_komoditas p
       INNER JOIN users u ON u.user_id = p.produsen_id
       LEFT JOIN (
         SELECT produk_id, ROUND(AVG(rating), 1) AS rata_rating, COUNT(*) AS jumlah_ulasan
         FROM ulasan_produk
         GROUP BY produk_id
       ) ul ON ul.produk_id = p.produk_id
       WHERE p.status_produk = 'Aktif'
       ORDER BY p.produk_id DESC
       LIMIT 6`
    );

    const komoditas = produkUnggulan.map((item) => ({
      ...item,
      rata_rating: Number(item.rata_rating || 0),
      jumlah_ulasan: Number(item.jumlah_ulasan || 0),
      url_gambar:
        item.gambar && item.gambar.startsWith('/uploads/')
          ? item.gambar
          : `/img/${item.gambar || `${item.produk_id}.jpg`}`,
    }));

    if (PERAN_PRODUSEN.includes(role)) {
      const [stokAgg] = await query(
        `SELECT COUNT(*) AS total_produk, COALESCE(SUM(stok_tersedia), 0) AS total_stok
         FROM produk_komoditas
         WHERE produsen_id = ? AND status_produk = 'Aktif'`,
        [userId]
      );

      const [orderAgg] = await query(
        `SELECT COUNT(DISTINCT o.order_id) AS pesanan_masuk,
                COALESCE(SUM(CASE WHEN o.status_order IN ('Diproses', 'Dikirim', 'Selesai')
                  THEN d.subtotal_idr ELSE 0 END), 0) AS total_pendapatan_idr
         FROM detail_order d
         INNER JOIN produk_komoditas p ON p.produk_id = d.produk_id
         INNER JOIN order_transaksi o ON o.order_id = d.order_id
         WHERE p.produsen_id = ?`,
        [userId]
      );

      return res.json({
        sukses: true,
        ringkasan: {
          kategori: 'Produsen',
          total_produk: Number(stokAgg?.total_produk || 0),
          total_stok: Number(stokAgg?.total_stok || 0),
          pesanan_masuk: Number(orderAgg?.pesanan_masuk || 0),
          total_pendapatan_idr: Number(orderAgg?.total_pendapatan_idr || 0),
          komoditas_unggulan: komoditas,
        },
      });
    }

    if (role === 'Admin') {
      const [verifikasi] = await query(
        "SELECT COUNT(*) AS menunggu_verifikasi FROM profil_perusahaan WHERE status_verifikasi_legal = 'Menunggu'"
      );
      const [bayar] = await query(
        "SELECT COUNT(*) AS menunggu_pembayaran FROM pembayaran WHERE status_pembayaran = 'Menunggu'"
      );
      const [order] = await query('SELECT COUNT(*) AS total_pesanan FROM order_transaksi');

      return res.json({
        sukses: true,
        ringkasan: {
          kategori: 'Admin',
          menunggu_verifikasi: Number(verifikasi?.menunggu_verifikasi || 0),
          menunggu_pembayaran: Number(bayar?.menunggu_pembayaran || 0),
          total_pesanan: Number(order?.total_pesanan || 0),
          komoditas_unggulan: komoditas,
        },
      });
    }

    const [buyerAgg] = await query(
      `SELECT COUNT(*) AS pesanan_aktif,
              COALESCE(SUM(total_tagihan_idr), 0) AS total_belanja_idr
       FROM order_transaksi
       WHERE buyer_id = ? AND status_order != 'Dibatalkan'`,
      [userId]
    );

    return res.json({
      sukses: true,
      ringkasan: {
        kategori: 'Pembeli',
        pesanan_aktif: Number(buyerAgg?.pesanan_aktif || 0),
        total_belanja_idr: Number(buyerAgg?.total_belanja_idr || 0),
        komoditas_unggulan: komoditas,
      },
    });
  } catch (err) {
    return next(err);
  }
}

function escapeCsvCell(nilai) {
  let teks = nilai === null || nilai === undefined ? '' : String(nilai);
  if (/^[=+\-@]/.test(teks)) {
    teks = `'${teks}`;
  }
  if (/[",\r\n]/.test(teks)) {
    return `"${teks.replace(/"/g, '""')}"`;
  }
  return teks;
}

export async function unduhLaporanPenjualanCsv(req, res, next) {
  try {
    const { role_user: role, user_id: userId } = req.pengguna;

    const kondisi = role === 'Admin' ? '' : 'WHERE pk.produsen_id = ?';
    const params = role === 'Admin' ? [] : [userId];

    const rows = await query(
      `SELECT o.nomor_invoice, o.tanggal_order, d.nama_komoditas_snapshot,
              pk.sektor, pk.grade_kualitas, d.kuantitas, d.satuan,
              d.harga_satuan_deal_idr, d.subtotal_idr, o.tipe_pasar,
              o.incoterms, o.status_order,
              u.nama_lengkap AS nama_buyer,
              COALESCE(pr.nama_perusahaan, '-') AS perusahaan_buyer,
              COALESCE(pg.status_pengiriman, '-') AS status_pengiriman
       FROM detail_order d
       INNER JOIN produk_komoditas pk ON pk.produk_id = d.produk_id
       INNER JOIN order_transaksi o ON o.order_id = d.order_id
       INNER JOIN users u ON u.user_id = o.buyer_id
       LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
       LEFT JOIN pengiriman_ekspor pg ON pg.order_id = o.order_id
       ${kondisi}
       ORDER BY o.tanggal_order DESC, o.order_id DESC`,
      params
    );

    const header = [
      'Nomor Invoice',
      'Tanggal Order',
      'Nama Komoditas',
      'Sektor',
      'Grade',
      'Kuantitas',
      'Satuan',
      'Harga Satuan (IDR)',
      'Subtotal (IDR)',
      'Tipe Pasar',
      'Incoterms',
      'Pembeli',
      'Perusahaan Pembeli',
      'Status Order',
      'Status Pengiriman',
    ];

    const barisCsv = [
      header.map(escapeCsvCell).join(','),
      ...rows.map((r) =>
        [
          r.nomor_invoice,
          r.tanggal_order ? new Date(r.tanggal_order).toISOString().slice(0, 10) : '',
          r.nama_komoditas_snapshot,
          r.sektor,
          r.grade_kualitas,
          r.kuantitas,
          r.satuan,
          r.harga_satuan_deal_idr,
          r.subtotal_idr,
          r.tipe_pasar,
          r.incoterms,
          r.nama_buyer,
          r.perusahaan_buyer,
          r.status_order,
          r.status_pengiriman,
        ]
          .map(escapeCsvCell)
          .join(',')
      ),
    ];

    const tanggalFile = new Date().toISOString().slice(0, 10);
    const isiCsv = `\uFEFF${barisCsv.join('\r\n')}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="laporan-penjualan-agro-maritim-${tanggalFile}.csv"`
    );
    return res.send(isiCsv);
  } catch (err) {
    return next(err);
  }
}

export async function unduhLaporanTransaksiCsv(req, res, next) {
  try {
    const { role_user: role, user_id: userId } = req.pengguna;

    if (PERAN_PRODUSEN.includes(role)) {
      return unduhLaporanPenjualanCsv(req, res, next);
    }

    const kondisi = role === 'Admin' ? '' : 'WHERE o.buyer_id = ?';
    const params = role === 'Admin' ? [] : [userId];

    const rows = await query(
      `SELECT o.nomor_invoice, o.tanggal_order, o.tipe_pasar, o.incoterms,
              o.subtotal_produk_idr, o.biaya_logistik_ekspor_idr, o.pajak_bea_idr,
              o.total_tagihan_idr, o.mata_uang, o.status_order,
              COALESCE(pg.pelabuhan_tujuan, '-') AS pelabuhan_tujuan,
              COALESCE(pg.status_pengiriman, '-') AS status_pengiriman
       FROM order_transaksi o
       LEFT JOIN pengiriman_ekspor pg ON pg.order_id = o.order_id
       ${kondisi}
       ORDER BY o.tanggal_order DESC, o.order_id DESC`,
      params
    );

    const header = [
      'Nomor Invoice',
      'Tanggal Order',
      'Tipe Pasar',
      'Incoterms',
      'Subtotal Produk (IDR)',
      'Biaya Logistik (IDR)',
      'Pajak / Bea (IDR)',
      'Total Tagihan (IDR)',
      'Mata Uang',
      'Status Order',
      'Tujuan Pengiriman',
      'Status Pengiriman',
    ];

    const barisCsv = [
      header.map(escapeCsvCell).join(','),
      ...rows.map((r) =>
        [
          r.nomor_invoice,
          r.tanggal_order ? new Date(r.tanggal_order).toISOString().slice(0, 10) : '',
          r.tipe_pasar,
          r.incoterms,
          r.subtotal_produk_idr,
          r.biaya_logistik_ekspor_idr,
          r.pajak_bea_idr,
          r.total_tagihan_idr,
          r.mata_uang,
          r.status_order,
          r.pelabuhan_tujuan,
          r.status_pengiriman,
        ]
          .map(escapeCsvCell)
          .join(',')
      ),
    ];

    const tanggalFile = new Date().toISOString().slice(0, 10);
    const isiCsv = `\uFEFF${barisCsv.join('\r\n')}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="laporan-transaksi-agro-maritim-${tanggalFile}.csv"`
    );
    return res.send(isiCsv);
  } catch (err) {
    return next(err);
  }
}
