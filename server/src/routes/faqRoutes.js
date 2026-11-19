import { Router } from 'express';
import { daftarFaqPublik } from '../controllers/faqController.js';

const router = Router();

router.get('/', daftarFaqPublik);

export default router;
