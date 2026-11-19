import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';

export async function wajibLogin(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return next(new AppError('Sesi tidak ditemukan. Silakan masuk terlebih dahulu.', 401));
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      return next(new AppError('Token sesi sudah kedaluwarsa atau tidak valid.', 401));
    }

    const rows = await query(
      `SELECT user_id, nama_lengkap, email, no_hp, role_user, asal_negara, kota_wilayah, status_akun, created_at
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [payload.user_id]
    );

    if (rows.length === 0) {
      return next(new AppError('Akun pengguna tidak ditemukan.', 401));
    }

    const pengguna = rows[0];
    if (pengguna.status_akun !== 'Aktif') {
      return next(new AppError('Akun Anda sedang tidak aktif atau ditangguhkan.', 403));
    }

    req.pengguna = pengguna;
    return next();
  } catch (err) {
    return next(err);
  }
}

export function izinkanPeran(...peranDiizinkan) {
  return (req, _res, next) => {
    if (!req.pengguna) {
      return next(new AppError('Autentikasi diperlukan.', 401));
    }
    if (!peranDiizinkan.includes(req.pengguna.role_user)) {
      return next(new AppError('Anda tidak memiliki izin untuk mengakses fitur ini.', 403));
    }
    return next();
  };
}

export async function opsionalLogin(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) {
      req.pengguna = null;
      return next();
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      req.pengguna = null;
      return next();
    }

    const rows = await query(
      `SELECT user_id, nama_lengkap, email, no_hp, role_user, asal_negara, kota_wilayah, status_akun, created_at
       FROM users
       WHERE user_id = ? AND status_akun = 'Aktif'
       LIMIT 1`,
      [payload.user_id]
    );

    req.pengguna = rows.length > 0 ? rows[0] : null;
    return next();
  } catch {
    req.pengguna = null;
    return next();
  }
}
