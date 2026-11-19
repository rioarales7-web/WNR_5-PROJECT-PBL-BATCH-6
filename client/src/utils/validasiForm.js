const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POLA_NOMOR_HP = /^\+?[0-9]{8,15}$/;

export function validasiIdentitasLogin(nilai) {
  const bersih = String(nilai || '').trim();
  if (!bersih) {
    return 'Email atau nomor handphone wajib diisi.';
  }

  if (bersih.includes('@') || /[a-zA-Z]/.test(bersih)) {
    if (!POLA_EMAIL.test(bersih)) {
      return 'Format email tidak valid. Gunakan format seperti nama@perusahaan.co.id.';
    }
    return '';
  }

  const hanyaAngkaDanPlus = bersih.replace(/[\s()-]/g, '');
  if (!POLA_NOMOR_HP.test(hanyaAngkaDanPlus)) {
    return 'Format nomor handphone tidak valid. Masukkan 8–15 digit angka (contoh: 081234567890).';
  }

  return '';
}

export function validasiPasswordLogin(nilai) {
  if (!nilai || String(nilai).trim() === '') {
    return 'Kata sandi wajib diisi.';
  }
  return '';
}

export function validasiKataSandiBaru(nilai) {
  if (!nilai || String(nilai).length < 8) {
    return 'Kata sandi baru minimal 8 karakter.';
  }
  return '';
}

export function formatPesanGalatServer(err, pesanBaku = 'Gagal memproses permintaan.') {
  if (!err) return pesanBaku;
  if (err.name === 'TypeError' && /fetch|network/i.test(err.message || '')) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi Anda atau pastikan layanan backend aktif.';
  }
  return err.message || pesanBaku;
}
