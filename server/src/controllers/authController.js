import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query, withTransaction } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';
import {
  PERAN_PEMBELI,
  PERAN_PRODUSEN,
  validasiEmail,
  validasiEnum,
  validasiIdentitasLogin,
  validasiKataSandi,
  wajibIsi,
} from '../utils/validasi.js';

const PERAN_DAFTAR = [...PERAN_PRODUSEN, ...PERAN_PEMBELI];

function buatToken(userId, roleUser) {
  return jwt.sign({ user_id: userId, role_user: roleUser }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function buatTokenResetSandi(userRow) {
  const sidik = String(userRow.password_hash || '').slice(-12);
  return jwt.sign(
    {
      user_id: userRow.user_id,
      tujuan: 'reset_sandi',
      sidik,
    },
    env.jwtSecret,
    { expiresIn: '15m' }
  );
}

async function cariPenggunaDenganIdentitas(identitasTervalidasi) {
  if (identitasTervalidasi.tipe === 'email') {
    return query(
      `SELECT user_id, nama_lengkap, email, no_hp, password_hash, role_user,
              asal_negara, kota_wilayah, status_akun, created_at
       FROM users
       WHERE email = ? LIMIT 1`,
      [identitasTervalidasi.nilai]
    );
  }

  return query(
    `SELECT user_id, nama_lengkap, email, no_hp, password_hash, role_user,
            asal_negara, kota_wilayah, status_akun, created_at
     FROM users
     WHERE REPLACE(REPLACE(REPLACE(REPLACE(no_hp, ' ', ''), '-', ''), '(', ''), ')', '') = ?
        OR no_hp = ?
     LIMIT 1`,
    [identitasTervalidasi.nilai, identitasTervalidasi.asli]
  );
}

export async function daftar(req, res, next) {
  try {
    const namaLengkap = wajibIsi(req.body.nama_lengkap, 'Nama lengkap');
    const email = validasiEmail(req.body.email);
    const password = validasiKataSandi(req.body.password);
    const roleUser = validasiEnum(req.body.role_user, PERAN_DAFTAR, 'Peran pengguna');
    const noHp = wajibIsi(req.body.no_hp, 'Nomor HP');
    const kotaWilayah = wajibIsi(req.body.kota_wilayah, 'Kota atau wilayah');
    const asalNegara = req.body.asal_negara
      ? String(req.body.asal_negara).trim()
      : roleUser === 'Buyer_Internasional'
        ? wajibIsi(req.body.asal_negara, 'Asal negara')
        : 'Indonesia';

    let namaPerusahaan = req.body.nama_perusahaan
      ? String(req.body.nama_perusahaan).trim()
      : namaLengkap;
    let tipeEntitas = 'Kelompok_Produsen';
    let nomorIzin = req.body.nomor_izin_npwp_taxid
      ? String(req.body.nomor_izin_npwp_taxid).trim()
      : '';
    let alamatKantor = req.body.alamat_kantor_pelabuhan
      ? String(req.body.alamat_kantor_pelabuhan).trim()
      : kotaWilayah;

    if (roleUser === 'Buyer_PT_Lokal') {
      namaPerusahaan = wajibIsi(req.body.nama_perusahaan, 'Nama PT');
      nomorIzin = wajibIsi(req.body.nomor_izin_npwp_taxid, 'Nomor NPWP');
      alamatKantor = wajibIsi(req.body.alamat_kantor_pelabuhan, 'Alamat kantor atau gudang');
      tipeEntitas = 'PT_Lokal';
    } else if (roleUser === 'Buyer_Internasional') {
      namaPerusahaan = wajibIsi(req.body.nama_perusahaan, 'Nama perusahaan importir');
      nomorIzin = wajibIsi(req.body.nomor_izin_npwp_taxid, 'Tax ID / Nomor Izin Impor');
      alamatKantor = wajibIsi(req.body.alamat_kantor_pelabuhan, 'Alamat pelabuhan tujuan');
      tipeEntitas = 'Importir_Internasional';
    }

    const cekEmail = await query('SELECT user_id FROM users WHERE email = ? LIMIT 1', [email]);
    if (cekEmail.length > 0) {
      throw new AppError('Email sudah terdaftar. Silakan gunakan email lain atau masuk.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const hasil = await withTransaction(async (conn) => {
      const [userRes] = await conn.execute(
        `INSERT INTO users (
          nama_lengkap, email, no_hp, password_hash, role_user,
          asal_negara, kota_wilayah, status_akun
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
        [namaLengkap, email, noHp, passwordHash, roleUser, asalNegara, kotaWilayah]
      );

      const userId = userRes.insertId;

      await conn.execute(
        `INSERT INTO profil_perusahaan (
          user_id, nama_perusahaan, tipe_entitas, nomor_izin_npwp_taxid,
          alamat_kantor_pelabuhan, pic_kontak, status_verifikasi_legal
        ) VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')`,
        [userId, namaPerusahaan, tipeEntitas, nomorIzin, alamatKantor, namaLengkap]
      );

      await conn.execute('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
        userId,
        'Pendaftaran akun baru',
      ]);

      return { userId };
    });

    const token = buatToken(hasil.userId, roleUser);
    const [pengguna] = await query(
      `SELECT u.user_id, u.nama_lengkap, u.email, u.no_hp, u.role_user, u.asal_negara,
              u.kota_wilayah, u.status_akun, u.created_at,
              p.nama_perusahaan, p.tipe_entitas, p.nomor_izin_npwp_taxid,
              p.alamat_kantor_pelabuhan, p.status_verifikasi_legal
       FROM users u
       LEFT JOIN profil_perusahaan p ON p.user_id = u.user_id
       WHERE u.user_id = ? LIMIT 1`,
      [hasil.userId]
    );

    return res.status(201).json({
      sukses: true,
      pesan: 'Pendaftaran berhasil.',
      token,
      pengguna,
    });
  } catch (err) {
    return next(err);
  }
}

export async function masuk(req, res, next) {
  try {
    const identitasTervalidasi = validasiIdentitasLogin(req.body.identitas ?? req.body.email);
    const password = wajibIsi(req.body.password, 'Kata sandi');

    const rows = await cariPenggunaDenganIdentitas(identitasTervalidasi);

    if (rows.length === 0) {
      throw new AppError(
        'Email / nomor HP atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.',
        401,
        { kode: 'KREDENSIAL_SALAH' }
      );
    }

    const userRow = rows[0];
    if (userRow.status_akun !== 'Aktif') {
      throw new AppError('Akun Anda sedang dinonaktifkan. Hubungi admin.', 403, {
        kode: 'AKUN_NONAKTIF',
      });
    }

    const cocok = await bcrypt.compare(password, userRow.password_hash);
    if (!cocok) {
      throw new AppError(
        'Email / nomor HP atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.',
        401,
        { kode: 'KREDENSIAL_SALAH' }
      );
    }

    await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
      userRow.user_id,
      'Masuk ke aplikasi',
    ]);

    const [profil] = await query(
      `SELECT nama_perusahaan, tipe_entitas, nomor_izin_npwp_taxid,
              alamat_kantor_pelabuhan, pic_kontak, status_verifikasi_legal
       FROM profil_perusahaan
       WHERE user_id = ? LIMIT 1`,
      [userRow.user_id]
    );

    const { password_hash: _dihapus, ...penggunaTanpaHash } = userRow;
    const token = buatToken(userRow.user_id, userRow.role_user);

    return res.json({
      sukses: true,
      pesan: 'Berhasil masuk.',
      token,
      pengguna: {
        ...penggunaTanpaHash,
        ...(profil || {}),
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function keluar(req, res, next) {
  try {
    await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
      req.pengguna.user_id,
      'Keluar dari aplikasi',
    ]);
    return res.json({
      sukses: true,
      pesan: 'Sesi Anda telah ditutup dengan aman.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function saya(req, res, next) {
  try {
    const [profil] = await query(
      `SELECT nama_perusahaan, tipe_entitas, nomor_izin_npwp_taxid,
              alamat_kantor_pelabuhan, pic_kontak, status_verifikasi_legal
       FROM profil_perusahaan
       WHERE user_id = ? LIMIT 1`,
      [req.pengguna.user_id]
    );

    return res.json({
      sukses: true,
      pengguna: {
        ...req.pengguna,
        ...(profil || {}),
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function lupaKataSandi(req, res, next) {
  try {
    const identitasTervalidasi = validasiIdentitasLogin(req.body.identitas ?? req.body.email);
    const rows = await cariPenggunaDenganIdentitas(identitasTervalidasi);

    if (rows.length > 0) {
      const userRow = rows[0];
      if (userRow.status_akun !== 'Aktif') {
        throw new AppError('Akun Anda sedang dinonaktifkan. Hubungi admin.', 403);
      }

      await query('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
        userRow.user_id,
        'Permintaan pengaturan ulang kata sandi',
      ]);

      const tokenReset = buatTokenResetSandi(userRow);

      return res.json({
        sukses: true,
        pesan:
          'Permintaan pengaturan ulang kata sandi diproses. Silakan lanjutkan dengan mengatur kata sandi baru.',
        ...(env.nodeEnv !== 'production' ? { token_reset: tokenReset } : {}),
      });
    }

    return res.json({
      sukses: true,
      pesan:
        'Jika email atau nomor handphone terdaftar di Agro Maritim, instruksi pengaturan ulang kata sandi telah dikirimkan.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function resetKataSandi(req, res, next) {
  try {
    const token = wajibIsi(req.body.token, 'Token reset kata sandi');
    const passwordBaru = validasiKataSandi(req.body.password_baru);
    const konfirmasi = wajibIsi(req.body.konfirmasi_password, 'Konfirmasi kata sandi');

    if (passwordBaru !== konfirmasi) {
      throw new AppError('Konfirmasi kata sandi baru tidak cocok.', 400, {
        field: 'konfirmasi_password',
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new AppError(
        'Token reset kata sandi tidak valid atau sudah kedaluwarsa. Ajukan permintaan ulang.',
        400,
        { field: 'token' }
      );
    }

    if (payload.tujuan !== 'reset_sandi' || !payload.user_id) {
      throw new AppError('Token reset kata sandi tidak valid.', 400, { field: 'token' });
    }

    const rows = await query(
      'SELECT user_id, password_hash, status_akun FROM users WHERE user_id = ? LIMIT 1',
      [payload.user_id]
    );
    if (rows.length === 0) {
      throw new AppError('Akun pengguna tidak ditemukan.', 404);
    }

    const userRow = rows[0];
    if (userRow.status_akun !== 'Aktif') {
      throw new AppError('Akun Anda sedang dinonaktifkan. Hubungi admin.', 403);
    }

    if (String(userRow.password_hash || '').slice(-12) !== payload.sidik) {
      throw new AppError(
        'Token reset sudah pernah digunakan atau tidak berlaku. Ajukan permintaan baru.',
        400,
        { field: 'token' }
      );
    }

    const passwordHashBaru = await bcrypt.hash(passwordBaru, 10);

    await withTransaction(async (conn) => {
      await conn.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [
        passwordHashBaru,
        userRow.user_id,
      ]);
      await conn.execute('INSERT INTO log_aktivitas (user_id, aksi) VALUES (?, ?)', [
        userRow.user_id,
        'Kata sandi berhasil diatur ulang',
      ]);
    });

    return res.json({
      sukses: true,
      pesan: 'Kata sandi baru berhasil disimpan. Silakan masuk menggunakan kata sandi baru Anda.',
    });
  } catch (err) {
    return next(err);
  }
}
