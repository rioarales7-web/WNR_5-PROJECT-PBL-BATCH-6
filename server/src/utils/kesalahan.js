export class AppError extends Error {
  constructor(pesan, statusCode = 400, detail = null) {
    super(pesan);
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

export function penanganGalat(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      sukses: false,
      pesan: err.message,
      ...(err.detail ? { detail: err.detail } : {}),
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      sukses: false,
      pesan: 'Ukuran berkas melebihi batas maksimal 3 MB.',
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      sukses: false,
      pesan: 'Data sudah terdaftar sebelumnya.',
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      sukses: false,
      pesan:
        'Koneksi database MySQL belum tersedia. Pastikan layanan MySQL aktif dan konfigurasi .env sudah benar.',
    });
  }

  console.error('Galat server:', err.message);
  return res.status(500).json({
    sukses: false,
    pesan: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
  });
}

export function ruteTidakDitemukan(_req, res) {
  return res.status(404).json({
    sukses: false,
    pesan: 'Endpoint API tidak ditemukan.',
  });
}
