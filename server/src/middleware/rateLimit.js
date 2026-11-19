import rateLimit from 'express-rate-limit';

export const pembatasLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sukses: false,
    pesan: 'Terlalu banyak percobaan masuk. Silakan coba lagi dalam 15 menit.',
  },
});

export const pembatasApi = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sukses: false,
    pesan: 'Terlalu banyak permintaan dari alamat Anda. Mohon tunggu sebentar.',
  },
});

export const pembatasNewsletter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sukses: false,
    pesan: 'Terlalu banyak percobaan berlangganan. Silakan coba lagi nanti.',
  },
});
