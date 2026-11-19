import { query } from '../config/database.js';
import { validasiEmail } from '../utils/validasi.js';

let tabelSiap = false;

async function pastikanTabel() {
  if (tabelSiap) return;
  await query(`
    CREATE TABLE IF NOT EXISTS langganan_newsletter (
      langganan_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(160) NOT NULL,
      status_aktif TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_newsletter_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  tabelSiap = true;
}

export async function daftarNewsletter(req, res, next) {
  try {
    const email = validasiEmail(req.body.email);
    await pastikanTabel();

    await query(
      `INSERT INTO langganan_newsletter (email, status_aktif)
       VALUES (?, 1)
       ON DUPLICATE KEY UPDATE status_aktif = 1`,
      [email]
    );

    return res.status(201).json({
      sukses: true,
      pesan: 'Berhasil berlangganan.',
    });
  } catch (err) {
    return next(err);
  }
}
