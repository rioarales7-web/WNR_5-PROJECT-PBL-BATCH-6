import { Router } from 'express';
import { daftarNewsletter } from '../controllers/newsletterController.js';
import { pembatasNewsletter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', pembatasNewsletter, daftarNewsletter);

export default router;
