import { AppError } from './kesalahan.js';

export const PERAN_VALID = [
  'Petani',
  'Nelayan',
  'Peternak',
  'Buyer_PT_Lokal',
  'Buyer_Internasional',
  'Admin',
];

export const PERAN_PRODUSEN = ['Petani', 'Nelayan', 'Peternak'];
export const PERAN_PEMBELI = ['Buyer_PT_Lokal', 'Buyer_Internasional'];
export const SEKTOR_VALID = ['Pertanian', 'Perikanan', 'Peternakan'];
export const INCOTERMS_VALID = ['EXW', 'FOB', 'CIF', 'DDP', 'Lokal_Franco'];
export const TAHAP_BAYAR_VALID = ['DP_30', 'DP_50', 'Pelunasan'];
export const METODE_BAYAR_VALID = ['Virtual_Account', 'Transfer_RTGS', 'T_T', 'L_C'];

export const BANK_INDONESIA = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata'];

export function wajibIsi(nilai, namaField) {
  if (nilai === undefined || nilai === null || String(nilai).trim() === '') {
    throw new AppError(`${namaField} wajib diisi.`, 400);
  }
  return String(nilai).trim();
}

export function validasiEmail(email) {
  const bersih = wajibIsi(email, 'Email').toLowerCase();
  const pola = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!pola.test(bersih)) {
    throw new AppError('Format email tidak valid.', 400, { field: 'identitas' });
  }
  return bersih;
}

export function validasiNomorHp(nilai) {
  const asli = wajibIsi(nilai, 'Nomor HP');
  const bersih = asli.replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{8,15}$/.test(bersih)) {
    throw new AppError(
      'Format nomor handphone tidak valid. Masukkan 8–15 digit angka (contoh: 081234567890).',
      400,
      { field: 'identitas' }
    );
  }
  return { asli, bersih };
}

export function validasiIdentitasLogin(nilai) {
  const bersih = wajibIsi(nilai, 'Email atau nomor handphone');
  if (bersih.includes('@') || /[a-zA-Z]/.test(bersih)) {
    const email = validasiEmail(bersih);
    return { tipe: 'email', nilai: email, asli: bersih };
  }
  const hp = validasiNomorHp(bersih);
  return { tipe: 'no_hp', nilai: hp.bersih, asli: hp.asli };
}

export function validasiAngkaPositif(nilai, namaField) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka) || angka <= 0) {
    throw new AppError(`${namaField} harus berupa angka lebih dari nol.`, 400);
  }
  return angka;
}

export function validasiAngkaNonNegatif(nilai, namaField) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka) || angka < 0) {
    throw new AppError(`${namaField} tidak boleh bernilai negatif.`, 400);
  }
  return angka;
}

export function validasiEnum(nilai, daftar, namaField) {
  const bersih = wajibIsi(nilai, namaField);
  if (!daftar.includes(bersih)) {
    throw new AppError(`${namaField} tidak valid.`, 400);
  }
  return bersih;
}

export function validasiKataSandi(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('Kata sandi minimal 8 karakter.', 400);
  }
  return password;
}
