import { Router } from 'express';
import {
  ambilProfil,
  hapusDokumenVerifikasiProfil,
  riwayatAktivitas,
  simpanKredensialProdusen,
  ubahKataSandi,
  ubahPerusahaan,
  ubahProfil,
  unggahDokumenVerifikasiProfil,
} from '../controllers/profilController.js';
import { izinkanPeran, wajibLogin } from '../middleware/auth.js';
import { unggahDokumenVerifikasi } from '../middleware/unggah.js';

const router = Router();

router.use(wajibLogin);
router.get('/', ambilProfil);
router.put('/', ubahProfil);
router.put('/kata-sandi', ubahKataSandi);
router.put('/perusahaan', ubahPerusahaan);
router.put(
  '/kredensial-produsen',
  izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'),
  simpanKredensialProdusen
);
router.post(
  '/dokumen-verifikasi',
  izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'),
  unggahDokumenVerifikasi.single('berkas_dokumen'),
  unggahDokumenVerifikasiProfil
);
router.delete(
  '/dokumen-verifikasi/:dokumenId',
  izinkanPeran('Petani', 'Nelayan', 'Peternak', 'Admin'),
  hapusDokumenVerifikasiProfil
);
router.get('/aktivitas', riwayatAktivitas);

export default router;
