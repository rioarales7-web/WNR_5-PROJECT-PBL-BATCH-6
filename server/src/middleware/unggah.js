import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/kesalahan.js';

const EKSTENSI_DIIZINKAN = ['.jpg', '.jpeg', '.png', '.webp'];
const MIME_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'];
const MAKS_UKURAN = 3 * 1024 * 1024;

function buatPenyimpanan(subFolder) {
  const tujuan = path.join(env.rootDir, 'uploads', subFolder);
  fs.mkdirSync(tujuan, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, tujuan),
    filename: (_req, file, cb) => {
      const ekstensi = path.extname(file.originalname).toLowerCase();
      const namaAcak = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ekstensi}`;
      cb(null, namaAcak);
    },
  });
}

function filterGambar(_req, file, cb) {
  const ekstensi = path.extname(file.originalname).toLowerCase();
  if (!EKSTENSI_DIIZINKAN.includes(ekstensi) || !MIME_DIIZINKAN.includes(file.mimetype)) {
    return cb(new AppError('Format gambar hanya mendukung JPG, PNG, atau WEBP.', 400));
  }
  return cb(null, true);
}

const EKSTENSI_DOKUMEN = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const MIME_DOKUMEN = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAKS_UKURAN_DOKUMEN = 5 * 1024 * 1024;

function filterDokumen(_req, file, cb) {
  const ekstensi = path.extname(file.originalname).toLowerCase();
  if (!EKSTENSI_DOKUMEN.includes(ekstensi) || !MIME_DOKUMEN.includes(file.mimetype)) {
    return cb(new AppError('Format dokumen hanya mendukung PDF, JPG, PNG, atau WEBP.', 400));
  }
  return cb(null, true);
}

export const unggahFotoProduk = multer({
  storage: buatPenyimpanan('produk'),
  limits: { fileSize: MAKS_UKURAN },
  fileFilter: filterGambar,
});

export const unggahBuktiBayar = multer({
  storage: buatPenyimpanan('bukti'),
  limits: { fileSize: MAKS_UKURAN },
  fileFilter: filterGambar,
});

export const unggahDokumenVerifikasi = multer({
  storage: buatPenyimpanan('dokumen'),
  limits: { fileSize: MAKS_UKURAN_DOKUMEN },
  fileFilter: filterDokumen,
});
