import { query } from '../config/database.js';
import { AppError } from '../utils/kesalahan.js';
import { PERAN_PRODUSEN } from '../utils/validasi.js';

export async function daftarPengiriman(req, res, next) {
  try {
    const { role_user: role, user_id: userId } = req.pengguna;
    let sql;
    let params = [];

    if (role === 'Admin') {
      sql = `
        SELECT pg.*, o.nomor_invoice, o.tipe_pasar, o.status_order, o.tanggal_order,
               u.nama_lengkap AS nama_buyer
        FROM pengiriman_ekspor pg
        INNER JOIN order_transaksi o ON o.order_id = pg.order_id
        INNER JOIN users u ON u.user_id = o.buyer_id
        ORDER BY pg.pengiriman_id DESC
      `;
    } else if (PERAN_PRODUSEN.includes(role)) {
      sql = `
        SELECT DISTINCT pg.*, o.nomor_invoice, o.tipe_pasar, o.status_order, o.tanggal_order,
               u.nama_lengkap AS nama_buyer
        FROM pengiriman_ekspor pg
        INNER JOIN order_transaksi o ON o.order_id = pg.order_id
        INNER JOIN detail_order d ON d.order_id = o.order_id
        INNER JOIN produk_komoditas pk ON pk.produk_id = d.produk_id
        INNER JOIN users u ON u.user_id = o.buyer_id
        WHERE pk.produsen_id = ?
        ORDER BY pg.pengiriman_id DESC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT pg.*, o.nomor_invoice, o.tipe_pasar, o.status_order, o.tanggal_order,
               u.nama_lengkap AS nama_buyer
        FROM pengiriman_ekspor pg
        INNER JOIN order_transaksi o ON o.order_id = pg.order_id
        INNER JOIN users u ON u.user_id = o.buyer_id
        WHERE o.buyer_id = ?
        ORDER BY pg.pengiriman_id DESC
      `;
      params = [userId];
    }

    const rows = await query(sql, params);
    return res.json({ sukses: true, pengiriman: rows });
  } catch (err) {
    return next(err);
  }
}

export async function detailPengiriman(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new AppError('ID pesanan tidak valid.', 400);
    }

    const rows = await query(
      `SELECT pg.*, o.nomor_invoice, o.buyer_id, o.tipe_pasar, o.status_order
       FROM pengiriman_ekspor pg
       INNER JOIN order_transaksi o ON o.order_id = pg.order_id
       WHERE pg.order_id = ? LIMIT 1`,
      [orderId]
    );

    if (rows.length === 0) {
      throw new AppError('Data pengiriman tidak ditemukan.', 404);
    }

    const data = rows[0];
    if (req.pengguna.role_user !== 'Admin' && data.buyer_id !== req.pengguna.user_id) {
      const terkait = await query(
        `SELECT 1 FROM detail_order d
         INNER JOIN produk_komoditas pk ON pk.produk_id = d.produk_id
         WHERE d.order_id = ? AND pk.produsen_id = ? LIMIT 1`,
        [orderId, req.pengguna.user_id]
      );
      if (terkait.length === 0) {
        throw new AppError('Anda tidak berhak melihat pelacakan pengiriman ini.', 403);
      }
    }

    return res.json({ sukses: true, pengiriman: data });
  } catch (err) {
    return next(err);
  }
}
