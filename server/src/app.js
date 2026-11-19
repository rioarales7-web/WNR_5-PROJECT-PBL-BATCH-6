import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { cekKoneksiDatabase } from './config/database.js';
import { pembatasApi } from './middleware/rateLimit.js';
import { penanganGalat, ruteTidakDitemukan } from './utils/kesalahan.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import pembayaranRoutes from './routes/pembayaranRoutes.js';
import pengirimanRoutes from './routes/pengirimanRoutes.js';
import produkRoutes from './routes/produkRoutes.js';
import profilRoutes from './routes/profilRoutes.js';
import rekeningRoutes from './routes/rekeningRoutes.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const originDiizinkan = env.clientUrl
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || originDiizinkan.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Asal permintaan tidak diizinkan oleh kebijakan CORS.'));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(env.rootDir, 'uploads')));

app.get('/api/kesehatan', async (_req, res) => {
  try {
    await cekKoneksiDatabase();
    return res.json({ sukses: true, database: 'terhubung' });
  } catch {
    return res.status(503).json({
      sukses: false,
      database: 'terputus',
      pesan: 'Database MySQL belum terhubung.',
    });
  }
});

app.use('/api', pembatasApi);
app.use('/api/auth', authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/rekening', rekeningRoutes);
app.use('/api/pengiriman', pengirimanRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use('/api', ruteTidakDitemukan);

const clientDist = path.join(env.rootDir, 'client', 'dist');
if (env.nodeEnv === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(penanganGalat);

export default app;
