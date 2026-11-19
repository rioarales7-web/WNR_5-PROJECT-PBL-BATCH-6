import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(rootDir, '.env') });

export const env = {
  rootDir,
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5000',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agro_maritim',
  },
  jwtSecret: process.env.JWT_SECRET || 'agro_maritim_pengembangan_lokal_sementara',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  kursUsd: Number(process.env.KURS_USD) || 16250,
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'webhook_rahasia_agro_maritim',
};

if (env.nodeEnv === 'production') {
  const bawaan = ['agro_maritim_pengembangan_lokal_sementara', 'webhook_rahasia_agro_maritim'];
  if (
    bawaan.includes(env.jwtSecret) ||
    bawaan.includes(env.paymentWebhookSecret) ||
    env.jwtSecret.length < 32
  ) {
    throw new Error(
      'JWT_SECRET (minimal 32 karakter) dan PAYMENT_WEBHOOK_SECRET wajib diisi di .env untuk mode production.'
    );
  }
}
