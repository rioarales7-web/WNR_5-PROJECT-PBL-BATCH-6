import { Router } from 'express';
import {
  buatOrder,
  daftarOrder,
  detailOrder,
  pratinjauCheckout,
  ringkasanBeranda,
  unduhLaporanPenjualanCsv,
  unduhLaporanTransaksiCsv,
} from '../controllers/orderController.js';
import { izinkanPeran, wajibLogin } from '../middleware/auth.js';

const router = Router();

router.get('/beranda', wajibLogin, ringkasanBeranda);
router.get(
  '/laporan-penjualan-csv',
  wajibLogin,
  izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'),
  unduhLaporanPenjualanCsv
);
router.get('/laporan-transaksi-csv', wajibLogin, unduhLaporanTransaksiCsv);
router.post(
  '/pratinjau',
  wajibLogin,
  izinkanPeran('Buyer_PT_Lokal', 'Buyer_Internasional', 'Admin'),
  pratinjauCheckout
);
router.post(
  '/',
  wajibLogin,
  izinkanPeran('Buyer_PT_Lokal', 'Buyer_Internasional', 'Admin'),
  buatOrder
);
router.get('/', wajibLogin, daftarOrder);
router.get('/:id', wajibLogin, detailOrder);

export default router;
