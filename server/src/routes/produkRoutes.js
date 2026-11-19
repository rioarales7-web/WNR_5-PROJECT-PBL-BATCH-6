import { Router } from 'express';
import {
  daftarProduk,
  daftarUlasanProduk,
  detailProduk,
  produkSaya,
  tambahProduk,
  tambahUlasanProduk,
  ubahProduk,
} from '../controllers/produkController.js';
import { izinkanPeran, opsionalLogin, wajibLogin } from '../middleware/auth.js';
import { unggahFotoProduk } from '../middleware/unggah.js';

const router = Router();

router.get('/', daftarProduk);
router.get('/saya', wajibLogin, izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'), produkSaya);
router.get('/:id/ulasan', opsionalLogin, daftarUlasanProduk);
router.post('/:id/ulasan', wajibLogin, tambahUlasanProduk);
router.get('/:id', detailProduk);
router.post(
  '/',
  wajibLogin,
  izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'),
  unggahFotoProduk.single('gambar'),
  tambahProduk
);
router.put(
  '/:id',
  wajibLogin,
  izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'),
  unggahFotoProduk.single('gambar'),
  ubahProduk
);

export default router;
