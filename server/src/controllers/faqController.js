import { query } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';
import { validasiAngkaNonNegatif, wajibIsi } from '../utils/validasi.js';

const FAQ_BAWAAN = [
  {
    kategori: 'Pemesanan',
    pertanyaan: 'Bagaimana alur pemesanan hasil panen untuk pembeli PT lokal dan importir?',
    jawaban:
      'Pembeli dapat memilih komoditas dari katalog, menentukan kuantitas, lalu memilih tipe pasar (Lokal atau Ekspor) beserta ketentuan Incoterms (EXW, FOB, CIF, DDP, atau Lokal Franco) saat checkout. Seluruh komponen logistik dan pajak atau bea dihitung otomatis di server.',
    urutan: 1,
  },
  {
    kategori: 'Pembayaran',
    pertanyaan: 'Metode dan tahapan pembayaran apa saja yang tersedia di Agro Maritim?',
    jawaban:
      'Platform mendukung pembayaran bertahap DP 30%, DP 50%, maupun Pelunasan menggunakan Virtual Account, Transfer Bank/RTGS (BCA, Mandiri, BNI, BRI, CIMB Niaga, Permata), serta Telegraphic Transfer (T/T) dan Letter of Credit (L/C) dengan bank koresponden SWIFT untuk transaksi ekspor.',
    urutan: 2,
  },
  {
    kategori: 'Pengiriman Ekspor',
    pertanyaan: 'Bagaimana cara memantau dokumen bea cukai dan pergerakan kargo ekspor?',
    jawaban:
      'Setiap pesanan yang dibuat otomatis terhubung dengan lini masa pengiriman di menu Pesanan. Pembeli dan produsen dapat memantau jenis armada, nomor kontainer atau resi, nomor PEB Bea Cukai, pelabuhan asal/tujuan, serta estimasi tanggal tiba.',
    urutan: 3,
  },
  {
    kategori: 'Produsen',
    pertanyaan:
      'Bagaimana petani, nelayan, dan peternak mendaftarkan komoditas serta menerima pencairan dana?',
    jawaban:
      'Produsen dapat mengunggah foto dan data komoditas langsung melalui menu Jual Panen, mengatur harga IDR/USD serta stok, dan mendaftarkan rekening bank utama pada halaman Rekening Bank Saya untuk menerima pencairan transaksi.',
    urutan: 4,
  },
  {
    kategori: 'Legalitas',
    pertanyaan: 'Mengapa pembeli perusahaan dan produsen perlu melengkapi data NPWP atau Tax ID?',
    jawaban:
      'Verifikasi NPWP untuk PT lokal, Tax ID untuk importir internasional, serta identitas usaha produsen memastikan kepatuhan dokumen niaga, penerbitan invoice resmi, dan kelancaran proses kepabeanan.',
    urutan: 5,
  },
  {
    kategori: 'Pembayaran',
    pertanyaan: 'Berapa lama instruksi pembayaran berlaku dan apa yang terjadi jika terlewat?',
    jawaban:
      'Instruksi pembayaran berlaku 24 jam sejak diterbitkan. Jika terlewat, buka halaman pembayaran pesanan dan buat instruksi baru. Nominal tahap yang dipilih dihitung ulang dari sisa tagihan yang belum lunas.',
    urutan: 6,
  },
  {
    kategori: 'Pembayaran',
    pertanyaan: 'Saya sudah transfer tetapi status masih Menunggu. Apa yang harus dilakukan?',
    jawaban:
      'Konfirmasi dari bank biasanya masuk otomatis dalam beberapa menit hingga beberapa jam. Jika belum berubah, unggah foto bukti transfer pada halaman pembayaran agar admin dapat memverifikasi secara manual, atau hubungi kami dengan menyebut nomor invoice.',
    urutan: 7,
  },
  {
    kategori: 'Pemesanan',
    pertanyaan: 'Apa perbedaan pasar Lokal dan Ekspor saat checkout?',
    jawaban:
      'Pasar Lokal ditagih dalam rupiah dengan ketentuan Lokal Franco Gudang dan PPN. Pasar Ekspor ditagih dalam dolar AS dengan pilihan Incoterms EXW, FOB, CIF, atau DDP, serta membutuhkan pelabuhan tujuan.',
    urutan: 8,
  },
  {
    kategori: 'Pengiriman Ekspor',
    pertanyaan: 'Dokumen apa saja yang diperlukan untuk ekspor komoditas?',
    jawaban:
      'Umumnya meliputi commercial invoice, packing list, PEB dan NPE dari Bea Cukai, bill of lading, serta sertifikat karantina seperti Phytosanitary atau Health Certificate. Daftar pastinya bergantung pada komoditas dan negara tujuan. Penjelasan lengkap ada di halaman Panduan Ekspor.',
    urutan: 9,
  },
  {
    kategori: 'Ulasan & Mutu',
    pertanyaan: 'Kapan saya bisa memberi ulasan produk?',
    jawaban:
      'Ulasan dapat ditulis setelah status pesanan Anda berubah menjadi Selesai. Anda memberi rating bintang 1 sampai 5 dan komentar pada halaman detail produk.',
    urutan: 10,
  },
  {
    kategori: 'Akun',
    pertanyaan: 'Saya lupa kata sandi. Bagaimana cara mengatur ulang?',
    jawaban:
      'Buka halaman masuk lalu pilih Lupa kata sandi. Masukkan email atau nomor telepon yang terdaftar dan ikuti petunjuk untuk membuat kata sandi baru. Kata sandi baru minimal 8 karakter.',
    urutan: 11,
  },
];

let tabelFaqSiap = false;

async function pastikanTabelFaq() {
  if (tabelFaqSiap) return;

  await query(`
    CREATE TABLE IF NOT EXISTS faq_platform (
      faq_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      kategori VARCHAR(80) NOT NULL DEFAULT 'Umum',
      pertanyaan VARCHAR(255) NOT NULL,
      jawaban TEXT NOT NULL,
      urutan INT NOT NULL DEFAULT 0,
      status_aktif TINYINT(1) NOT NULL DEFAULT 1,
      diperbarui_oleh INT UNSIGNED NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_faq_aktif_urutan (status_aktif, urutan, faq_id),
      CONSTRAINT fk_faq_admin
        FOREIGN KEY (diperbarui_oleh) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const cek = await query('SELECT COUNT(*) AS total FROM faq_platform');
  if (Number(cek[0]?.total || 0) === 0) {
    for (const item of FAQ_BAWAAN) {
      await query(
        `INSERT INTO faq_platform (kategori, pertanyaan, jawaban, urutan, status_aktif)
         VALUES (?, ?, ?, ?, 1)`,
        [item.kategori, item.pertanyaan, item.jawaban, item.urutan]
      );
    }
  }

  tabelFaqSiap = true;
}

export async function daftarFaqPublik(_req, res, next) {
  try {
    await pastikanTabelFaq();
    const rows = await query(
      `SELECT faq_id, kategori, pertanyaan, jawaban, urutan, updated_at
       FROM faq_platform
       WHERE status_aktif = 1
       ORDER BY urutan ASC, faq_id ASC`
    );
    return res.json({ sukses: true, faq: rows });
  } catch (err) {
    return next(err);
  }
}

export async function daftarFaqAdmin(_req, res, next) {
  try {
    await pastikanTabelFaq();
    const rows = await query(
      `SELECT f.*, u.nama_lengkap AS nama_admin_pembaru
       FROM faq_platform f
       LEFT JOIN users u ON u.user_id = f.diperbarui_oleh
       ORDER BY f.urutan ASC, f.faq_id ASC`
    );
    return res.json({ sukses: true, faq: rows });
  } catch (err) {
    return next(err);
  }
}

export async function tambahFaqAdmin(req, res, next) {
  try {
    await pastikanTabelFaq();
    const kategori = String(req.body.kategori || 'Umum').trim() || 'Umum';
    const pertanyaan = wajibIsi(req.body.pertanyaan, 'Pertanyaan');
    const jawaban = wajibIsi(req.body.jawaban, 'Jawaban');
    const urutan =
      req.body.urutan !== undefined && req.body.urutan !== ''
        ? Math.trunc(validasiAngkaNonNegatif(req.body.urutan, 'Urutan tampil'))
        : 0;
    const statusAktif = req.body.status_aktif === false || req.body.status_aktif === 0 ? 0 : 1;

    const result = await query(
      `INSERT INTO faq_platform (kategori, pertanyaan, jawaban, urutan, status_aktif, diperbarui_oleh)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [kategori, pertanyaan, jawaban, urutan, statusAktif, req.user.user_id]
    );

    const rows = await query('SELECT * FROM faq_platform WHERE faq_id = ?', [result.insertId]);

    return res.status(201).json({
      sukses: true,
      pesan: 'Item FAQ baru berhasil ditambahkan.',
      faq: rows[0],
    });
  } catch (err) {
    return next(err);
  }
}

export async function perbaruiFaqAdmin(req, res, next) {
  try {
    await pastikanTabelFaq();
    const faqId = Number(req.params.faqId);
    if (!Number.isInteger(faqId) || faqId <= 0) {
      throw new AppError('ID FAQ tidak valid.', 400);
    }

    const existing = await query('SELECT * FROM faq_platform WHERE faq_id = ?', [faqId]);
    if (existing.length === 0) {
      throw new AppError('Data FAQ tidak ditemukan.', 404);
    }
    const lama = existing[0];

    const kategori =
      req.body.kategori !== undefined ? wajibIsi(req.body.kategori, 'Kategori') : lama.kategori;
    const pertanyaan =
      req.body.pertanyaan !== undefined
        ? wajibIsi(req.body.pertanyaan, 'Pertanyaan')
        : lama.pertanyaan;
    const jawaban =
      req.body.jawaban !== undefined ? wajibIsi(req.body.jawaban, 'Jawaban') : lama.jawaban;
    const urutan =
      req.body.urutan !== undefined && req.body.urutan !== ''
        ? Math.trunc(validasiAngkaNonNegatif(req.body.urutan, 'Urutan tampil'))
        : lama.urutan;
    const statusAktif =
      req.body.status_aktif !== undefined
        ? req.body.status_aktif === true ||
          req.body.status_aktif === 1 ||
          req.body.status_aktif === '1'
          ? 1
          : 0
        : lama.status_aktif;

    await query(
      `UPDATE faq_platform
       SET kategori = ?, pertanyaan = ?, jawaban = ?, urutan = ?, status_aktif = ?, diperbarui_oleh = ?
       WHERE faq_id = ?`,
      [kategori, pertanyaan, jawaban, urutan, statusAktif, req.user.user_id, faqId]
    );

    const updated = await query('SELECT * FROM faq_platform WHERE faq_id = ?', [faqId]);

    return res.json({
      sukses: true,
      pesan: 'Pertanyaan dan jawaban FAQ berhasil diperbarui.',
      faq: updated[0],
    });
  } catch (err) {
    return next(err);
  }
}

export async function hapusFaqAdmin(req, res, next) {
  try {
    await pastikanTabelFaq();
    const faqId = Number(req.params.faqId);
    if (!Number.isInteger(faqId) || faqId <= 0) {
      throw new AppError('ID FAQ tidak valid.', 400);
    }

    const result = await query('DELETE FROM faq_platform WHERE faq_id = ?', [faqId]);
    if (result.affectedRows === 0) {
      throw new AppError('Data FAQ tidak ditemukan.', 404);
    }

    return res.json({
      sukses: true,
      pesan: 'Item FAQ berhasil dihapus.',
    });
  } catch (err) {
    return next(err);
  }
}
