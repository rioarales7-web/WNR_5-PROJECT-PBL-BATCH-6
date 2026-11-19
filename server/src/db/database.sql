-- Jalankan/import file ini setelah memilih database agro_maritim di phpMyAdmin atau MySQL.
-- Database dibuat terlebih dahulu melalui hPanel Hostinger atau perintah CREATE DATABASE.

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  no_hp VARCHAR(30) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  role_user ENUM(
    'Petani',
    'Nelayan',
    'Peternak',
    'Buyer_PT_Lokal',
    'Buyer_Internasional',
    'Admin'
  ) NOT NULL,
  asal_negara VARCHAR(80) NOT NULL DEFAULT 'Indonesia',
  kota_wilayah VARCHAR(100) NOT NULL DEFAULT '',
  status_akun ENUM('Aktif', 'Nonaktif', 'Ditangguhkan') NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role_user),
  INDEX idx_users_kota (kota_wilayah),
  INDEX idx_users_status (status_akun)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profil_perusahaan (
  profil_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  nama_perusahaan VARCHAR(160) NOT NULL,
  tipe_entitas ENUM(
    'PT_Lokal',
    'Importir_Internasional',
    'Kelompok_Produsen',
    'Perorangan'
  ) NOT NULL DEFAULT 'Perorangan',
  nomor_izin_npwp_taxid VARCHAR(80) NOT NULL DEFAULT '',
  alamat_kantor_pelabuhan TEXT NOT NULL,
  pic_kontak VARCHAR(120) NOT NULL DEFAULT '',
  status_verifikasi_legal ENUM('Menunggu', 'Terverifikasi', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
  UNIQUE KEY uq_profil_user (user_id),
  INDEX idx_profil_verifikasi (status_verifikasi_legal),
  CONSTRAINT fk_profil_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produk_komoditas (
  produk_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produsen_id INT UNSIGNED NOT NULL,
  sektor ENUM('Pertanian', 'Perikanan', 'Peternakan') NOT NULL,
  nama_komoditas VARCHAR(160) NOT NULL,
  grade_kualitas VARCHAR(60) NOT NULL DEFAULT 'Grade A',
  satuan VARCHAR(30) NOT NULL DEFAULT 'kg',
  harga_idr DECIMAL(15, 2) NOT NULL,
  harga_usd DECIMAL(12, 2) NOT NULL,
  stok_tersedia DECIMAL(12, 2) NOT NULL DEFAULT 0,
  gambar VARCHAR(255) NOT NULL DEFAULT '',
  status_produk ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  INDEX idx_produk_produsen (produsen_id),
  INDEX idx_produk_sektor (sektor),
  INDEX idx_produk_status (status_produk),
  INDEX idx_produk_nama (nama_komoditas),
  INDEX idx_produk_harga_idr (harga_idr),
  CONSTRAINT fk_produk_produsen
    FOREIGN KEY (produsen_id) REFERENCES users (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_transaksi (
  order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomor_invoice VARCHAR(50) NOT NULL,
  buyer_id INT UNSIGNED NOT NULL,
  tipe_pasar ENUM('Lokal', 'Ekspor') NOT NULL,
  incoterms ENUM('EXW', 'FOB', 'CIF', 'DDP', 'Lokal_Franco') NOT NULL DEFAULT 'Lokal_Franco',
  mata_uang ENUM('IDR', 'USD') NOT NULL DEFAULT 'IDR',
  subtotal_produk_idr DECIMAL(16, 2) NOT NULL,
  biaya_logistik_ekspor_idr DECIMAL(16, 2) NOT NULL DEFAULT 0,
  pajak_bea_idr DECIMAL(16, 2) NOT NULL DEFAULT 0,
  total_tagihan_idr DECIMAL(16, 2) NOT NULL,
  status_order ENUM('Menunggu_DP', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu_DP',
  tanggal_order TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_invoice (nomor_invoice),
  INDEX idx_order_buyer (buyer_id),
  INDEX idx_order_status (status_order),
  INDEX idx_order_tanggal (tanggal_order),
  CONSTRAINT fk_order_buyer
    FOREIGN KEY (buyer_id) REFERENCES users (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detail_order (
  detail_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  produk_id INT UNSIGNED NOT NULL,
  nama_komoditas_snapshot VARCHAR(160) NOT NULL,
  kuantitas DECIMAL(12, 2) NOT NULL,
  satuan VARCHAR(30) NOT NULL,
  harga_satuan_deal_idr DECIMAL(15, 2) NOT NULL,
  subtotal_idr DECIMAL(16, 2) NOT NULL,
  INDEX idx_detail_order (order_id),
  INDEX idx_detail_produk (produk_id),
  CONSTRAINT fk_detail_order
    FOREIGN KEY (order_id) REFERENCES order_transaksi (order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detail_produk
    FOREIGN KEY (produk_id) REFERENCES produk_komoditas (produk_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pengiriman_ekspor (
  pengiriman_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  jenis_armada VARCHAR(100) NOT NULL DEFAULT 'Truk Pendingin Darat',
  nomor_kontainer_resi VARCHAR(80) NOT NULL DEFAULT '',
  no_peb_beacukai VARCHAR(80) NOT NULL DEFAULT '',
  sertifikat_pendukung VARCHAR(255) NOT NULL DEFAULT '',
  pelabuhan_asal VARCHAR(140) NOT NULL DEFAULT '',
  pelabuhan_tujuan VARCHAR(200) NOT NULL,
  status_pengiriman ENUM(
    'Persiapan_Dokumen',
    'Muat_Kargo',
    'Bea_Cukai',
    'Dalam_Perjalanan',
    'Tiba_Di_Tujuan'
  ) NOT NULL DEFAULT 'Persiapan_Dokumen',
  estimasi_tiba DATE NULL,
  UNIQUE KEY uq_pengiriman_order (order_id),
  INDEX idx_pengiriman_status (status_pengiriman),
  CONSTRAINT fk_pengiriman_order
    FOREIGN KEY (order_id) REFERENCES order_transaksi (order_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pembayaran (
  payment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  kode_transaksi_bank VARCHAR(80) NOT NULL,
  tahap_pembayaran ENUM('DP_30', 'DP_50', 'Pelunasan') NOT NULL,
  metode_pembayaran ENUM('Virtual_Account', 'Transfer_RTGS', 'T_T', 'L_C') NOT NULL,
  nominal_dibayar_idr DECIMAL(16, 2) NOT NULL,
  nominal_usd DECIMAL(14, 2) NOT NULL,
  bank_pengirim_tujuan VARCHAR(140) NOT NULL,
  status_pembayaran ENUM('Menunggu', 'Lunas', 'Gagal') NOT NULL DEFAULT 'Menunggu',
  bukti_transfer VARCHAR(255) NULL,
  batas_waktu_bayar DATETIME NULL,
  tanggal_bayar TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_pembayaran_kode (kode_transaksi_bank),
  INDEX idx_pembayaran_order (order_id),
  INDEX idx_pembayaran_status (status_pembayaran),
  INDEX idx_pembayaran_tanggal (tanggal_bayar),
  CONSTRAINT fk_pembayaran_order
    FOREIGN KEY (order_id) REFERENCES order_transaksi (order_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rekening_bank (
  rekening_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  nama_bank VARCHAR(80) NOT NULL,
  nomor_rekening VARCHAR(60) NOT NULL,
  atas_nama VARCHAR(120) NOT NULL,
  swift_code VARCHAR(20) NULL DEFAULT NULL,
  is_utama TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_rekening_user (user_id),
  CONSTRAINT fk_rekening_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS log_aktivitas (
  log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  aksi VARCHAR(120) NOT NULL,
  waktu TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_user (user_id),
  INDEX idx_log_waktu (waktu),
  CONSTRAINT fk_log_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS langganan_newsletter (
  langganan_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  status_aktif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ulasan_produk (
  review_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produk_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NOT NULL,
  buyer_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  komentar TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ulasan_order_produk (order_id, produk_id, buyer_id),
  INDEX idx_ulasan_produk (produk_id),
  INDEX idx_ulasan_buyer (buyer_id),
  CONSTRAINT fk_ulasan_produk
    FOREIGN KEY (produk_id) REFERENCES produk_komoditas (produk_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ulasan_order
    FOREIGN KEY (order_id) REFERENCES order_transaksi (order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ulasan_buyer
    FOREIGN KEY (buyer_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kredensial_produsen (
  kredensial_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  sektor ENUM('Pertanian', 'Perikanan', 'Peternakan') NOT NULL,
  nomor_registrasi_sektor VARCHAR(120) NOT NULL DEFAULT '',
  lembaga_penerbit VARCHAR(160) NOT NULL DEFAULT '',
  luas_kapasitas VARCHAR(120) NOT NULL DEFAULT '',
  lokasi_sentra VARCHAR(200) NOT NULL DEFAULT '',
  tanggal_berlaku DATE NULL,
  detail_sektor JSON NULL,
  catatan_tambahan TEXT NULL,
  status_verifikasi ENUM('Belum_Lengkap', 'Menunggu', 'Terverifikasi', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kredensial_user (user_id),
  INDEX idx_kredensial_sektor (sektor),
  INDEX idx_kredensial_status (status_verifikasi),
  CONSTRAINT fk_kredensial_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dokumen_verifikasi_produsen (
  dokumen_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  jenis_dokumen VARCHAR(120) NOT NULL,
  nomor_dokumen VARCHAR(100) NOT NULL DEFAULT '',
  nama_file_asli VARCHAR(255) NOT NULL,
  path_file VARCHAR(255) NOT NULL,
  ukuran_byte INT UNSIGNED NOT NULL DEFAULT 0,
  mime_type VARCHAR(100) NOT NULL DEFAULT '',
  status_dokumen ENUM('Menunggu', 'Terverifikasi', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
  diunggah_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dokumen_user (user_id),
  INDEX idx_dokumen_status (status_dokumen),
  CONSTRAINT fk_dokumen_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

