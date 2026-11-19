import app from './src/app.js';
import { cekKoneksiDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';

async function mulaiServer() {
  try {
    await cekKoneksiDatabase();
    console.log(`Terhubung ke MySQL (${env.db.database})`);
  } catch {
    console.warn(
      'Peringatan: Belum dapat terhubung ke MySQL saat startup. Pastikan layanan MySQL aktif sebelum melakukan transaksi.'
    );
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server Agro Maritim berjalan di http://localhost:${env.port}`);
  });
}

mulaiServer();
