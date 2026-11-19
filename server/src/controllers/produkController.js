import { env } from '../config/env.js';
import { query } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';
import {
  SEKTOR_VALID,
  validasiAngkaNonNegatif,
  validasiAngkaPositif,
  validasiEnum,
  wajibIsi,
} from '../utils/validasi.js';

function bentukUrlGambar(gambar, produkId) {
  if (!gambar) {
    return `/img/${produkId}.jpg`;
  }
  if (gambar.startsWith('/uploads/') || gambar.startsWith('/img/') || gambar.startsWith('http')) {
    return gambar;
  }
  return `/img/${gambar}`;
}

export async function daftarProduk(req, res, next) {
  try {
    const { sektor, grade, harga_min, harga_max, pasar, cari, lokasi } = req.query;

    const kondisi = ["p.status_produk = 'Aktif'"];
    const params = [];

    if (sektor) {
      const daftarSektor = String(sektor)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => SEKTOR_VALID.includes(s));

      if (daftarSektor.length > 0) {
        const placeholders = daftarSektor.map(() => '?').join(', ');
        kondisi.push(`p.sektor IN (${placeholders})`);
        params.push(...daftarSektor);
      }
    }

    if (grade) {
      kondisi.push('p.grade_kualitas LIKE ?');
      params.push(`%${String(grade).trim()}%`);
    }

    if (harga_min !== undefined && harga_min !== '') {
      kondisi.push('p.harga_idr >= ?');
      params.push(Number(harga_min));
    }

    if (harga_max !== undefined && harga_max !== '') {
      kondisi.push('p.harga_idr <= ?');
      params.push(Number(harga_max));
    }

    if (pasar === 'Ekspor') {
      kondisi.push('p.harga_usd > 0');
    } else if (pasar === 'Lokal') {
      kondisi.push('p.harga_idr > 0');
    }

    if (lokasi) {
      const kataLokasi = `%${String(lokasi).trim()}%`;
      kondisi.push(
        "(u.kota_wilayah LIKE ? OR u.asal_negara LIKE ? OR COALESCE(pr.alamat_kantor_pelabuhan, '') LIKE ?)"
      );
      params.push(kataLokasi, kataLokasi, kataLokasi);
    }

    if (cari) {
      const kata = `%${String(cari).trim()}%`;
      kondisi.push(
        "(p.nama_komoditas LIKE ? OR p.sektor LIKE ? OR u.kota_wilayah LIKE ? OR u.asal_negara LIKE ? OR u.nama_lengkap LIKE ? OR COALESCE(pr.nama_perusahaan, '') LIKE ?)"
      );
      params.push(kata, kata, kata, kata, kata, kata);
    }

    const sql = `
      SELECT p.produk_id, p.produsen_id, p.sektor, p.nama_komoditas, p.grade_kualitas,
             p.satuan, p.harga_idr, p.harga_usd, p.stok_tersedia, p.gambar, p.status_produk,
             u.nama_lengkap AS nama_produsen, u.kota_wilayah AS kota_produsen,
             u.asal_negara AS negara_produsen, u.role_user AS peran_produsen,
             COALESCE(pr.nama_perusahaan, '') AS nama_perusahaan,
             pr.status_verifikasi_legal,
             COALESCE(ul.rata_rating, 0) AS rata_rating,
             COALESCE(ul.jumlah_ulasan, 0) AS jumlah_ulasan
      FROM produk_komoditas p
      INNER JOIN users u ON u.user_id = p.produsen_id
      LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
      LEFT JOIN (
        SELECT produk_id, ROUND(AVG(rating), 1) AS rata_rating, COUNT(*) AS jumlah_ulasan
        FROM ulasan_produk
        GROUP BY produk_id
      ) ul ON ul.produk_id = p.produk_id
      WHERE ${kondisi.join(' AND ')}
      ORDER BY p.produk_id DESC
    `;

    const rows = await query(sql, params);
    const produk = rows.map((item) => ({
      ...item,
      rata_rating: Number(item.rata_rating || 0),
      jumlah_ulasan: Number(item.jumlah_ulasan || 0),
      url_gambar: bentukUrlGambar(item.gambar, item.produk_id),
    }));

    return res.json({
      sukses: true,
      produk,
    });
  } catch (err) {
    return next(err);
  }
}

export async function detailProduk(req, res, next) {
  try {
    const produkId = Number(req.params.id);
    if (!Number.isInteger(produkId) || produkId <= 0) {
      throw new AppError('ID produk tidak valid.', 400);
    }

    const rows = await query(
      `SELECT p.produk_id, p.produsen_id, p.sektor, p.nama_komoditas, p.grade_kualitas,
              p.satuan, p.harga_idr, p.harga_usd, p.stok_tersedia, p.gambar, p.status_produk,
              u.nama_lengkap AS nama_produsen, u.kota_wilayah AS kota_produsen,
              u.asal_negara AS negara_produsen, u.no_hp AS kontak_produsen,
              u.role_user AS peran_produsen,
              pr.nama_perusahaan AS usaha_produsen, pr.status_verifikasi_legal,
              COALESCE(ul.rata_rating, 0) AS rata_rating,
              COALESCE(ul.jumlah_ulasan, 0) AS jumlah_ulasan
       FROM produk_komoditas p
       INNER JOIN users u ON u.user_id = p.produsen_id
       LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
       LEFT JOIN (
         SELECT produk_id, ROUND(AVG(rating), 1) AS rata_rating, COUNT(*) AS jumlah_ulasan
         FROM ulasan_produk
         GROUP BY produk_id
       ) ul ON ul.produk_id = p.produk_id
       WHERE p.produk_id = ? LIMIT 1`,
      [produkId]
    );

    if (rows.length === 0) {
      throw new AppError('Produk komoditas tidak ditemukan.', 404);
    }

    const item = rows[0];
    return res.json({
      sukses: true,
      produk: {
        ...item,
        rata_rating: Number(item.rata_rating || 0),
        jumlah_ulasan: Number(item.jumlah_ulasan || 0),
        url_gambar: bentukUrlGambar(item.gambar, item.produk_id),
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function produkSaya(req, res, next) {
  try {
    const rows = await query(
      `SELECT produk_id, produsen_id, sektor, nama_komoditas, grade_kualitas,
              satuan, harga_idr, harga_usd, stok_tersedia, gambar, status_produk
       FROM produk_komoditas
       WHERE produsen_id = ?
       ORDER BY produk_id DESC`,
      [req.pengguna.user_id]
    );

    const produk = rows.map((item) => ({
      ...item,
      url_gambar: bentukUrlGambar(item.gambar, item.produk_id),
    }));

    return res.json({
      sukses: true,
      produk,
    });
  } catch (err) {
    return next(err);
  }
}

export async function tambahProduk(req, res, next) {
  try {
    const sektor = validasiEnum(req.body.sektor, SEKTOR_VALID, 'Sektor');
    const namaKomoditas = wajibIsi(req.body.nama_komoditas, 'Nama komoditas');
    const gradeKualitas = wajibIsi(req.body.grade_kualitas || 'Grade A', 'Grade kualitas');
    const satuan = wajibIsi(req.body.satuan || 'kg', 'Satuan');
    const hargaIdr = validasiAngkaPositif(req.body.harga_idr, 'Harga IDR');
    const hargaUsd = req.body.harga_usd
      ? validasiAngkaPositif(req.body.harga_usd, 'Harga USD')
      : Number((hargaIdr / env.kursUsd).toFixed(2));
    const stokTersedia = validasiAngkaNonNegatif(req.body.stok_tersedia, 'Stok tersedia');

    const gambar = req.file ? `/uploads/produk/${req.file.filename}` : '';

    const result = await query(
      `INSERT INTO produk_komoditas (
        produsen_id, sektor, nama_komoditas, grade_kualitas,
        satuan, harga_idr, harga_usd, stok_tersedia, gambar, status_produk
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
      [
        req.pengguna.user_id,
        sektor,
        namaKomoditas,
        gradeKualitas,
        satuan,
        hargaIdr,
        hargaUsd,
        stokTersedia,
        gambar,
      ]
    );

    const [baru] = await query('SELECT * FROM produk_komoditas WHERE produk_id = ? LIMIT 1', [
      result.insertId,
    ]);

    return res.status(201).json({
      sukses: true,
      pesan: 'Komoditas panen berhasil ditambahkan ke katalog.',
      produk: {
        ...baru,
        url_gambar: bentukUrlGambar(baru.gambar, baru.produk_id),
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function ubahProduk(req, res, next) {
  try {
    const produkId = Number(req.params.id);
    if (!Number.isInteger(produkId) || produkId <= 0) {
      throw new AppError('ID produk tidak valid.', 400);
    }

    const rows = await query('SELECT * FROM produk_komoditas WHERE produk_id = ? LIMIT 1', [
      produkId,
    ]);
    if (rows.length === 0) {
      throw new AppError('Produk tidak ditemukan.', 404);
    }

    const produkLama = rows[0];
    if (req.pengguna.role_user !== 'Admin' && produkLama.produsen_id !== req.pengguna.user_id) {
      throw new AppError('Anda tidak berhak mengubah produk milik produsen lain.', 403);
    }

    const sektor = req.body.sektor
      ? validasiEnum(req.body.sektor, SEKTOR_VALID, 'Sektor')
      : produkLama.sektor;
    const namaKomoditas = req.body.nama_komoditas
      ? wajibIsi(req.body.nama_komoditas, 'Nama komoditas')
      : produkLama.nama_komoditas;
    const gradeKualitas = req.body.grade_kualitas
      ? wajibIsi(req.body.grade_kualitas, 'Grade kualitas')
      : produkLama.grade_kualitas;
    const satuan = req.body.satuan ? wajibIsi(req.body.satuan, 'Satuan') : produkLama.satuan;
    const hargaIdr =
      req.body.harga_idr !== undefined
        ? validasiAngkaPositif(req.body.harga_idr, 'Harga IDR')
        : produkLama.harga_idr;
    const hargaUsd =
      req.body.harga_usd !== undefined
        ? validasiAngkaPositif(req.body.harga_usd, 'Harga USD')
        : req.body.harga_idr !== undefined
          ? Number((hargaIdr / env.kursUsd).toFixed(2))
          : produkLama.harga_usd;
    const stokTersedia =
      req.body.stok_tersedia !== undefined
        ? validasiAngkaNonNegatif(req.body.stok_tersedia, 'Stok tersedia')
        : produkLama.stok_tersedia;
    const statusProduk = req.body.status_produk
      ? validasiEnum(req.body.status_produk, ['Aktif', 'Nonaktif'], 'Status produk')
      : produkLama.status_produk;
    const gambar = req.file ? `/uploads/produk/${req.file.filename}` : produkLama.gambar;

    await query(
      `UPDATE produk_komoditas
       SET sektor = ?, nama_komoditas = ?, grade_kualitas = ?, satuan = ?,
           harga_idr = ?, harga_usd = ?, stok_tersedia = ?, gambar = ?, status_produk = ?
       WHERE produk_id = ?`,
      [
        sektor,
        namaKomoditas,
        gradeKualitas,
        satuan,
        hargaIdr,
        hargaUsd,
        stokTersedia,
        gambar,
        statusProduk,
        produkId,
      ]
    );

    const [terbaru] = await query('SELECT * FROM produk_komoditas WHERE produk_id = ? LIMIT 1', [
      produkId,
    ]);

    return res.json({
      sukses: true,
      pesan: 'Data komoditas berhasil diperbarui.',
      produk: {
        ...terbaru,
        url_gambar: bentukUrlGambar(terbaru.gambar, terbaru.produk_id),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function muatRingkasanDanUlasan(produkId, buyerId = null) {
  const ulasan = await query(
    `SELECT up.review_id, up.produk_id, up.order_id, up.buyer_id, up.rating, up.komentar,
            up.created_at, u.nama_lengkap AS nama_pembeli, u.kota_wilayah AS kota_pembeli,
            pr.nama_perusahaan, o.nomor_invoice
     FROM ulasan_produk up
     INNER JOIN users u ON u.user_id = up.buyer_id
     INNER JOIN order_transaksi o ON o.order_id = up.order_id
     LEFT JOIN profil_perusahaan pr ON pr.user_id = u.user_id
     WHERE up.produk_id = ?
     ORDER BY up.created_at DESC, up.review_id DESC`,
    [produkId]
  );

  const distribusi = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  ulasan.forEach((item) => {
    const r = Number(item.rating);
    if (r >= 1 && r <= 5) {
      distribusi[r] += 1;
      totalRating += r;
    }
  });

  const jumlahUlasan = ulasan.length;
  const rataRating = jumlahUlasan > 0 ? Number((totalRating / jumlahUlasan).toFixed(1)) : 0;

  let pesananDapatDiulas = [];
  if (buyerId) {
    pesananDapatDiulas = await query(
      `SELECT DISTINCT o.order_id, o.nomor_invoice, o.tanggal_order, d.kuantitas, d.satuan
       FROM order_transaksi o
       INNER JOIN detail_order d ON d.order_id = o.order_id
       LEFT JOIN ulasan_produk up
         ON up.order_id = o.order_id AND up.produk_id = d.produk_id AND up.buyer_id = o.buyer_id
       WHERE o.buyer_id = ?
         AND d.produk_id = ?
         AND o.status_order = 'Selesai'
         AND up.review_id IS NULL
       ORDER BY o.tanggal_order DESC`,
      [buyerId, produkId]
    );
  }

  return {
    ringkasan: {
      rata_rating: rataRating,
      jumlah_ulasan: jumlahUlasan,
      distribusi,
    },
    ulasan,
    pesanan_dapat_diulas: pesananDapatDiulas,
  };
}

export async function daftarUlasanProduk(req, res, next) {
  try {
    const produkId = Number(req.params.id);
    if (!Number.isInteger(produkId) || produkId <= 0) {
      throw new AppError('ID produk tidak valid.', 400);
    }

    const hasil = await muatRingkasanDanUlasan(produkId, req.pengguna?.user_id || null);
    return res.json({
      sukses: true,
      ...hasil,
    });
  } catch (err) {
    return next(err);
  }
}

export async function tambahUlasanProduk(req, res, next) {
  try {
    const produkId = Number(req.params.id);
    const orderId = Number(req.body.order_id);
    const rating = Number(req.body.rating);
    const komentar = wajibIsi(req.body.komentar, 'Komentar ulasan');

    if (!Number.isInteger(produkId) || produkId <= 0) {
      throw new AppError('ID produk tidak valid.', 400);
    }
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new AppError('Pilih transaksi pesanan selesai yang ingin diulas.', 400);
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating harus berupa angka 1 hingga 5 bintang.', 400);
    }
    if (komentar.length < 5 || komentar.length > 1000) {
      throw new AppError('Komentar ulasan minimal 5 karakter dan maksimal 1000 karakter.', 400);
    }

    const orderRows = await query(
      `SELECT o.order_id, o.status_order
       FROM order_transaksi o
       INNER JOIN detail_order d ON d.order_id = o.order_id
       WHERE o.order_id = ? AND o.buyer_id = ? AND d.produk_id = ?
       LIMIT 1`,
      [orderId, req.pengguna.user_id, produkId]
    );

    if (orderRows.length === 0) {
      throw new AppError('Transaksi tidak ditemukan untuk komoditas ini.', 404);
    }
    if (orderRows[0].status_order !== 'Selesai') {
      throw new AppError('Ulasan hanya dapat diberikan setelah transaksi berstatus Selesai.', 400);
    }

    const cekSudahUlas = await query(
      `SELECT review_id FROM ulasan_produk
       WHERE order_id = ? AND produk_id = ? AND buyer_id = ? LIMIT 1`,
      [orderId, produkId, req.pengguna.user_id]
    );
    if (cekSudahUlas.length > 0) {
      throw new AppError('Anda sudah memberikan ulasan untuk transaksi dan komoditas ini.', 409);
    }

    await query(
      `INSERT INTO ulasan_produk (produk_id, order_id, buyer_id, rating, komentar)
       VALUES (?, ?, ?, ?, ?)`,
      [produkId, orderId, req.pengguna.user_id, rating, komentar]
    );

    await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
      req.pengguna.user_id,
      `Memberikan ulasan rating ${rating} bintang pada produk #${produkId}`,
    ]);

    const hasil = await muatRingkasanDanUlasan(produkId, req.pengguna.user_id);

    return res.status(201).json({
      sukses: true,
      pesan: 'Terima kasih! Ulasan Anda berhasil disimpan.',
      ...hasil,
    });
  } catch (err) {
    return next(err);
  }
}
