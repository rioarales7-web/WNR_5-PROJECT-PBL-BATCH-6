import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/kesalahan.js';
import { validasiEnum, validasiKataSandi, wajibIsi } from '../utils/validasi.js';

let tabelKredensialSiap = false;

async function ensureTabelKredensialDokumen() {
  if (tabelKredensialSiap) return;
  await query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  tabelKredensialSiap = true;
}

function parseDetailSektor(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function ambilProfil(req, res, next) {
  try {
    await ensureTabelKredensialDokumen();
    const [profil] = await query('SELECT * FROM profil_perusahaan WHERE user_id = ? LIMIT 1', [
      req.pengguna.user_id,
    ]);
    const [kredensial] = await query(
      'SELECT * FROM kredensial_produsen WHERE user_id = ? LIMIT 1',
      [req.pengguna.user_id]
    );
    const dokumen = await query(
      `SELECT dokumen_id, user_id, jenis_dokumen, nomor_dokumen, nama_file_asli,
              path_file, ukuran_byte, mime_type, status_dokumen, diunggah_pada
       FROM dokumen_verifikasi_produsen
       WHERE user_id = ?
       ORDER BY diunggah_pada DESC, dokumen_id DESC`,
      [req.pengguna.user_id]
    );

    return res.json({
      sukses: true,
      pengguna: req.pengguna,
      perusahaan: profil || null,
      kredensial_produsen: kredensial
        ? {
            ...kredensial,
            detail_sektor: parseDetailSektor(kredensial.detail_sektor),
          }
        : null,
      dokumen_verifikasi: dokumen,
    });
  } catch (err) {
    return next(err);
  }
}

export async function ubahProfil(req, res, next) {
  try {
    const namaLengkap = wajibIsi(req.body.nama_lengkap, 'Nama lengkap');
    const noHp = wajibIsi(req.body.no_hp, 'Nomor HP');
    const kotaWilayah = wajibIsi(req.body.kota_wilayah, 'Kota atau wilayah');
    const asalNegara = wajibIsi(req.body.asal_negara || 'Indonesia', 'Asal negara');

    await query(
      `UPDATE users
       SET nama_lengkap = ?, no_hp = ?, kota_wilayah = ?, asal_negara = ?
       WHERE user_id = ?`,
      [namaLengkap, noHp, kotaWilayah, asalNegara, req.pengguna.user_id]
    );

    const [terbaru] = await query(
      `SELECT user_id, nama_lengkap, email, no_hp, role_user, asal_negara,
              kota_wilayah, status_akun, created_at
       FROM users WHERE user_id = ? LIMIT 1`,
      [req.pengguna.user_id]
    );

    return res.json({
      sukses: true,
      pesan: 'Profil pribadi berhasil diperbarui.',
      pengguna: terbaru,
    });
  } catch (err) {
    return next(err);
  }
}

export async function ubahKataSandi(req, res, next) {
  try {
    const sandiLama = wajibIsi(req.body.kata_sandi_lama, 'Kata sandi saat ini');
    const sandiBaru = validasiKataSandi(req.body.kata_sandi_baru);

    const [userRow] = await query('SELECT password_hash FROM users WHERE user_id = ? LIMIT 1', [
      req.pengguna.user_id,
    ]);

    const cocok = await bcrypt.compare(sandiLama, userRow.password_hash);
    if (!cocok) {
      throw new AppError('Kata sandi saat ini tidak sesuai.', 400);
    }

    const hashBaru = await bcrypt.hash(sandiBaru, 10);
    await query('UPDATE users SET password_hash = ? WHERE user_id = ?', [
      hashBaru,
      req.pengguna.user_id,
    ]);
    await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
      req.pengguna.user_id,
      'Mengubah kata sandi akun',
    ]);

    return res.json({
      sukses: true,
      pesan: 'Kata sandi berhasil diperbarui.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function ubahPerusahaan(req, res, next) {
  try {
    const namaPerusahaan = wajibIsi(req.body.nama_perusahaan, 'Nama perusahaan atau usaha');
    const nomorIzin = wajibIsi(req.body.nomor_izin_npwp_taxid, 'Nomor izin / NPWP / Tax ID');
    const alamatKantor = wajibIsi(req.body.alamat_kantor_pelabuhan, 'Alamat kantor atau pelabuhan');
    const picKontak = wajibIsi(req.body.pic_kontak, 'Nama PIC kontak');

    const ada = await query('SELECT profil_id FROM profil_perusahaan WHERE user_id = ? LIMIT 1', [
      req.pengguna.user_id,
    ]);

    if (ada.length === 0) {
      await query(
        `INSERT INTO profil_perusahaan (
          user_id, nama_perusahaan, tipe_entitas, nomor_izin_npwp_taxid,
          alamat_kantor_pelabuhan, pic_kontak, status_verifikasi_legal
        ) VALUES (?, ?, 'Perorangan', ?, ?, ?, 'Menunggu')`,
        [req.pengguna.user_id, namaPerusahaan, nomorIzin, alamatKantor, picKontak]
      );
    } else {
      await query(
        `UPDATE profil_perusahaan
         SET nama_perusahaan = ?, nomor_izin_npwp_taxid = ?,
             alamat_kantor_pelabuhan = ?, pic_kontak = ?,
             status_verifikasi_legal = 'Menunggu'
         WHERE user_id = ?`,
        [namaPerusahaan, nomorIzin, alamatKantor, picKontak, req.pengguna.user_id]
      );
    }

    const [terbaru] = await query('SELECT * FROM profil_perusahaan WHERE user_id = ? LIMIT 1', [
      req.pengguna.user_id,
    ]);

    return res.json({
      sukses: true,
      pesan: 'Data legalitas perusahaan diperbarui dan dikirim ulang untuk verifikasi admin.',
      perusahaan: terbaru,
    });
  } catch (err) {
    return next(err);
  }
}

export async function simpanKredensialProdusen(req, res, next) {
  try {
    await ensureTabelKredensialDokumen();
    const sektor = validasiEnum(
      req.body.sektor,
      ['Pertanian', 'Perikanan', 'Peternakan'],
      'Sektor'
    );
    const nomorRegistrasi = wajibIsi(
      req.body.nomor_registrasi_sektor,
      'Nomor sertifikat / izin sektor'
    );
    const lembagaPenerbit = wajibIsi(req.body.lembaga_penerbit, 'Lembaga penerbit sertifikat');
    const luasKapasitas = wajibIsi(req.body.luas_kapasitas, 'Luas lahan / kapasitas produksi');
    const lokasiSentra = wajibIsi(req.body.lokasi_sentra, 'Lokasi sentra produksi');
    const tanggalBerlaku = req.body.tanggal_berlaku
      ? String(req.body.tanggal_berlaku).slice(0, 10)
      : null;
    const catatanTambahan = String(req.body.catatan_tambahan || '').trim();
    const detailSektor =
      req.body.detail_sektor && typeof req.body.detail_sektor === 'object'
        ? req.body.detail_sektor
        : {};

    const sudahAda = await query(
      'SELECT kredensial_id FROM kredensial_produsen WHERE user_id = ? LIMIT 1',
      [req.pengguna.user_id]
    );

    if (sudahAda.length === 0) {
      await query(
        `INSERT INTO kredensial_produsen (
          user_id, sektor, nomor_registrasi_sektor, lembaga_penerbit,
          luas_kapasitas, lokasi_sentra, tanggal_berlaku, detail_sektor,
          catatan_tambahan, status_verifikasi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')`,
        [
          req.pengguna.user_id,
          sektor,
          nomorRegistrasi,
          lembagaPenerbit,
          luasKapasitas,
          lokasiSentra,
          tanggalBerlaku,
          JSON.stringify(detailSektor),
          catatanTambahan,
        ]
      );
    } else {
      await query(
        `UPDATE kredensial_produsen
         SET sektor = ?, nomor_registrasi_sektor = ?, lembaga_penerbit = ?,
             luas_kapasitas = ?, lokasi_sentra = ?, tanggal_berlaku = ?,
             detail_sektor = ?, catatan_tambahan = ?, status_verifikasi = 'Menunggu'
         WHERE user_id = ?`,
        [
          sektor,
          nomorRegistrasi,
          lembagaPenerbit,
          luasKapasitas,
          lokasiSentra,
          tanggalBerlaku,
          JSON.stringify(detailSektor),
          catatanTambahan,
          req.pengguna.user_id,
        ]
      );
    }

    await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
      req.pengguna.user_id,
      `Memperbarui kredensial sektor ${sektor}`,
    ]);

    const [terbaru] = await query('SELECT * FROM kredensial_produsen WHERE user_id = ? LIMIT 1', [
      req.pengguna.user_id,
    ]);

    return res.json({
      sukses: true,
      pesan: `Kredensial sektor ${sektor} berhasil disimpan untuk peninjauan verifikasi.`,
      kredensial_produsen: {
        ...terbaru,
        detail_sektor: parseDetailSektor(terbaru?.detail_sektor),
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function unggahDokumenVerifikasiProfil(req, res, next) {
  try {
    await ensureTabelKredensialDokumen();
    if (!req.file) {
      throw new AppError('Pilih berkas dokumen verifikasi (PDF, JPG, PNG, atau WEBP).', 400);
    }

    const jenisDokumen = wajibIsi(req.body.jenis_dokumen, 'Jenis dokumen verifikasi');
    const nomorDokumen = String(req.body.nomor_dokumen || '').trim();
    const pathFile = `/uploads/dokumen/${req.file.filename}`;

    const hasil = await query(
      `INSERT INTO dokumen_verifikasi_produsen (
        user_id, jenis_dokumen, nomor_dokumen, nama_file_asli,
        path_file, ukuran_byte, mime_type, status_dokumen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu')`,
      [
        req.pengguna.user_id,
        jenisDokumen,
        nomorDokumen,
        req.file.originalname,
        pathFile,
        req.file.size || 0,
        req.file.mimetype || '',
      ]
    );

    await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
      req.pengguna.user_id,
      `Mengunggah dokumen verifikasi: ${jenisDokumen}`,
    ]);

    const [dokumen] = await query(
      'SELECT * FROM dokumen_verifikasi_produsen WHERE dokumen_id = ? LIMIT 1',
      [hasil.insertId]
    );

    return res.status(201).json({
      sukses: true,
      pesan: `Dokumen "${jenisDokumen}" berhasil diunggah untuk verifikasi.`,
      dokumen,
    });
  } catch (err) {
    return next(err);
  }
}

export async function hapusDokumenVerifikasiProfil(req, res, next) {
  try {
    await ensureTabelKredensialDokumen();
    const dokumenId = Number(req.params.dokumenId);
    if (!Number.isInteger(dokumenId) || dokumenId <= 0) {
      throw new AppError('ID dokumen tidak valid.', 400);
    }

    const [dok] = await query(
      'SELECT * FROM dokumen_verifikasi_produsen WHERE dokumen_id = ? AND user_id = ? LIMIT 1',
      [dokumenId, req.pengguna.user_id]
    );
    if (!dok) {
      throw new AppError('Dokumen verifikasi tidak ditemukan.', 404);
    }

    await query('DELETE FROM dokumen_verifikasi_produsen WHERE dokumen_id = ? AND user_id = ?', [
      dokumenId,
      req.pengguna.user_id,
    ]);

    if (dok.path_file && dok.path_file.startsWith('/uploads/dokumen/')) {
      const namaFile = path.basename(dok.path_file);
      const lokasiFisik = path.join(env.rootDir, 'uploads', 'dokumen', namaFile);
      await fs.unlink(lokasiFisik).catch(() => {});
    }

    return res.json({
      sukses: true,
      pesan: 'Dokumen verifikasi berhasil dihapus.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function riwayatAktivitas(req, res, next) {
  try {
    const rows = await query(
      `SELECT log_id, user_id, aksi, waktu
       FROM log_aktivitas
       WHERE user_id = ?
       ORDER BY waktu DESC, log_id DESC
       LIMIT 100`,
      [req.pengguna.user_id]
    );
    return res.json({ sukses: true, aktivitas: rows });
  } catch (err) {
    return next(err);
  }
}
