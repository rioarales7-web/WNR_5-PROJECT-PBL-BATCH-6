import { Router } from 'express';
import {
  daftar,
  keluar,
  lupaKataSandi,
  masuk,
  resetKataSandi,
  saya,
} from '../controllers/authController.js';
import { wajibLogin } from '../middleware/auth.js';
import { pembatasLogin } from '../middleware/rateLimit.js';

const router = Router();

router.post('/daftar', pembatasLogin, daftar);
router.post('/masuk', pembatasLogin, masuk);
router.post('/lupa-kata-sandi', pembatasLogin, lupaKataSandi);
router.post('/reset-kata-sandi', pembatasLogin, resetKataSandi);
router.post('/keluar', wajibLogin, keluar);
router.get('/saya', wajibLogin, saya);

export default router;
