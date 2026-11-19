import { Router } from 'express';
import {
  ambilDaftarBank,
  buatPembayaran,
  riwayatPembayaran,
  unduhBuktiPdf,
  unggahBukti,
  webhookPembayaran,
} from '../controllers/pembayaranController.js';
import { wajibLogin } from '../middleware/auth.js';
import { unggahBuktiBayar } from '../middleware/unggah.js';

const router = Router();

router.get('/bank', wajibLogin, ambilDaftarBank);
router.get('/riwayat', wajibLogin, riwayatPembayaran);
router.get('/:id/pdf', wajibLogin, unduhBuktiPdf);
router.post('/', wajibLogin, buatPembayaran);
router.post('/:id/bukti', wajibLogin, unggahBuktiBayar.single('bukti_transfer'), unggahBukti);
router.post('/webhook', webhookPembayaran);

export default router;
