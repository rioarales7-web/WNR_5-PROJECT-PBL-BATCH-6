import { Router } from 'express';
import {
  daftarPembayaranAdmin,
  daftarVerifikasiLegal,
  konfirmasiPembayaranManual,
  prosesVerifikasiLegal,
  ubahStatusPengiriman,
} from '../controllers/adminController.js';
import {
  daftarFaqAdmin,
  hapusFaqAdmin,
  perbaruiFaqAdmin,
  tambahFaqAdmin,
} from '../controllers/faqController.js';
import { izinkanPeran, wajibLogin } from '../middleware/auth.js';

const router = Router();

router.use(wajibLogin, izinkanPeran('Admin'));
router.get('/legal', daftarVerifikasiLegal);
router.patch('/legal/:profilId', prosesVerifikasiLegal);
router.get('/pembayaran', daftarPembayaranAdmin);
router.patch('/pembayaran/:paymentId', konfirmasiPembayaranManual);
router.put('/pengiriman/:orderId', ubahStatusPengiriman);
router.get('/faq', daftarFaqAdmin);
router.post('/faq', tambahFaqAdmin);
router.put('/faq/:faqId', perbaruiFaqAdmin);
router.delete('/faq/:faqId', hapusFaqAdmin);

export default router;
