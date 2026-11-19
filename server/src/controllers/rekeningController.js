import { query, withTransaction } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';
import { wajibIsi } from '../utils/validasi.js';

export async function daftarRekening(req, res, next) {
  try {
    const rows = await query(
      `SELECT rekening_id, user_id, nama_bank, nomor_rekening, atas_nama, swift_code, is_utama
       FROM rekening_bank
       WHERE user_id = ?
       ORDER BY is_utama DESC, rekening_id DESC`,
      [req.pengguna.user_id]
    );
    return res.json({ sukses: true, rekening: rows });
  } catch (err) {
    return next(err);
  }
}

export async function tambahRekening(req, res, next) {
  try {
    const namaBank = wajibIsi(req.body.nama_bank, 'Nama bank');
    const nomorRekening = wajibIsi(req.body.nomor_rekening, 'Nomor rekening');
    const atasNama = wajibIsi(req.body.atas_nama, 'Nama pemilik rekening');
    const swiftCode = req.body.swift_code ? String(req.body.swift_code).trim().toUpperCase() : null;
    const isUtama = req.body.is_utama ? 1 : 0;

    const baruId = await withTransaction(async (conn) => {
      const [cekAda] = await conn.execute(
        'SELECT COUNT(*) AS jumlah FROM rekening_bank WHERE user_id = ?',
        [req.pengguna.user_id]
      );
      const jadikanUtama = Number(cekAda[0].jumlah) === 0 ? 1 : isUtama;

      if (jadikanUtama === 1) {
        await conn.execute('UPDATE rekening_bank SET is_utama = 0 WHERE user_id = ?', [
          req.pengguna.user_id,
        ]);
      }

      const [resInsert] = await conn.execute(
        `INSERT INTO rekening_bank (user_id, nama_bank, nomor_rekening, atas_nama, swift_code, is_utama)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.pengguna.user_id, namaBank, nomorRekening, atasNama, swiftCode, jadikanUtama]
      );
      return resInsert.insertId;
    });

    const [rekening] = await query('SELECT * FROM rekening_bank WHERE rekening_id = ? LIMIT 1', [
      baruId,
    ]);

    return res.status(201).json({
      sukses: true,
      pesan: 'Rekening bank berhasil ditambahkan.',
      rekening,
    });
  } catch (err) {
    return next(err);
  }
}

export async function ubahRekening(req, res, next) {
  try {
    const rekeningId = Number(req.params.id);
    if (!Number.isInteger(rekeningId) || rekeningId <= 0) {
      throw new AppError('ID rekening tidak valid.', 400);
    }

    const rows = await query('SELECT * FROM rekening_bank WHERE rekening_id = ? LIMIT 1', [
      rekeningId,
    ]);
    if (rows.length === 0) {
      throw new AppError('Rekening bank tidak ditemukan.', 404);
    }
    const lama = rows[0];
    if (lama.user_id !== req.pengguna.user_id) {
      throw new AppError('Anda tidak berhak mengubah rekening ini.', 403);
    }

    const namaBank = req.body.nama_bank
      ? wajibIsi(req.body.nama_bank, 'Nama bank')
      : lama.nama_bank;
    const nomorRekening = req.body.nomor_rekening
      ? wajibIsi(req.body.nomor_rekening, 'Nomor rekening')
      : lama.nomor_rekening;
    const atasNama = req.body.atas_nama
      ? wajibIsi(req.body.atas_nama, 'Atas nama')
      : lama.atas_nama;
    const swiftCode =
      req.body.swift_code !== undefined
        ? req.body.swift_code
          ? String(req.body.swift_code).trim().toUpperCase()
          : null
        : lama.swift_code;

    await query(
      `UPDATE rekening_bank
       SET nama_bank = ?, nomor_rekening = ?, atas_nama = ?, swift_code = ?
       WHERE rekening_id = ?`,
      [namaBank, nomorRekening, atasNama, swiftCode, rekeningId]
    );

    const [terbaru] = await query('SELECT * FROM rekening_bank WHERE rekening_id = ? LIMIT 1', [
      rekeningId,
    ]);

    return res.json({
      sukses: true,
      pesan: 'Rekening bank berhasil diperbarui.',
      rekening: terbaru,
    });
  } catch (err) {
    return next(err);
  }
}

export async function jadikanUtama(req, res, next) {
  try {
    const rekeningId = Number(req.params.id);
    if (!Number.isInteger(rekeningId) || rekeningId <= 0) {
      throw new AppError('ID rekening tidak valid.', 400);
    }

    await withTransaction(async (conn) => {
      const [rows] = await conn.execute(
        'SELECT * FROM rekening_bank WHERE rekening_id = ? LIMIT 1',
        [rekeningId]
      );
      if (rows.length === 0) {
        throw new AppError('Rekening bank tidak ditemukan.', 404);
      }
      if (rows[0].user_id !== req.pengguna.user_id) {
        throw new AppError('Anda tidak berhak mengubah rekening ini.', 403);
      }

      await conn.execute('UPDATE rekening_bank SET is_utama = 0 WHERE user_id = ?', [
        req.pengguna.user_id,
      ]);
      await conn.execute('UPDATE rekening_bank SET is_utama = 1 WHERE rekening_id = ?', [
        rekeningId,
      ]);
    });

    return res.json({
      sukses: true,
      pesan: 'Rekening utama berhasil diperbarui.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function hapusRekening(req, res, next) {
  try {
    const rekeningId = Number(req.params.id);
    if (!Number.isInteger(rekeningId) || rekeningId <= 0) {
      throw new AppError('ID rekening tidak valid.', 400);
    }

    const rows = await query('SELECT * FROM rekening_bank WHERE rekening_id = ? LIMIT 1', [
      rekeningId,
    ]);
    if (rows.length === 0) {
      throw new AppError('Rekening bank tidak ditemukan.', 404);
    }
    if (rows[0].user_id !== req.pengguna.user_id) {
      throw new AppError('Anda tidak berhak menghapus rekening ini.', 403);
    }

    await query('DELETE FROM rekening_bank WHERE rekening_id = ?', [rekeningId]);

    return res.json({
      sukses: true,
      pesan: 'Rekening bank berhasil dihapus.',
    });
  } catch (err) {
    return next(err);
  }
}
