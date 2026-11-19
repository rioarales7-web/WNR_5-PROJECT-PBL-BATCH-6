import { Router } from 'express';
import {
  daftarRekening,
  hapusRekening,
  jadikanUtama,
  tambahRekening,
  ubahRekening,
} from '../controllers/rekeningController.js';
import { wajibLogin } from '../middleware/auth.js';

const router = Router();

router.use(wajibLogin);
router.get('/', daftarRekening);
router.post('/', tambahRekening);
router.put('/:id', ubahRekening);
router.patch('/:id/utama', jadikanUtama);
router.delete('/:id', hapusRekening);

export default router;
