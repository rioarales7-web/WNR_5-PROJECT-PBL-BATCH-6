import { Router } from 'express';
import { daftarPengiriman, detailPengiriman } from '../controllers/pengirimanController.js';
import { wajibLogin } from '../middleware/auth.js';

const router = Router();

router.use(wajibLogin);
router.get('/', daftarPengiriman);
router.get('/order/:orderId', detailPengiriman);

export default router;
