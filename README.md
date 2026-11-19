# Agro Maritim

Platform niaga komoditas pertanian, perikanan, dan peternakan untuk pasar lokal dan ekspor.

- Client: React 19, Vite, Tailwind CSS 4, React Router
- Server: Node.js, Express 4, MySQL (mysql2)

## Struktur

```
client/        aplikasi React (halaman, komponen, konteks)
server/        API Express (controller, route, layanan, skema SQL)
deploy/        skrip untuk Hostinger, PuTTY, dan MySQL
uploads/       berkas unggahan produsen dan bukti bayar (tidak masuk git)
```

## Menjalankan di komputer sendiri

1. Pasang dependensi: `npm install`
2. Salin `.env.example` menjadi `.env`, lalu isi `DB_*` dan `JWT_SECRET`.
3. Buat database `agro_maritim` secara manual melalui MySQL Workbench atau terminal MySQL.
4. Pilih database `agro_maritim`, lalu jalankan seluruh isi `server/src/db/schema.sql` untuk membuat tabel.
5. Isi data secara manual menggunakan perintah SQL `INSERT` atau melalui formulir aplikasi.

Client berjalan di `http://localhost:5000` dan meneruskan `/api` ke server di port 3000.
Saat `npm run dev`, client memakai data simulasi di browser kalau server belum menyala.
Untuk memaksa memakai API asli, buat `client/.env.local` berisi `VITE_PAKAI_SIMULASI=false`.
Build production selalu memakai API asli.

## Deploy ke Hostinger

Siapkan dulu di hPanel: database MySQL (catat nama database, pengguna, dan kata sandi) dan
akses SSH. Pakai Node.js 20.19 atau lebih baru.

### 1. Unggah proyek

Unggah isi folder proyek tanpa `node_modules` dan `client/dist`, lewat Git atau File Manager.

### 2. Masuk lewat PuTTY

Isi Host Name dengan IP server, Port `65002` (port SSH Hostinger), tipe SSH, lalu login.
Setelah itu:

```bash
cd ~/domains/domainanda.com/agro-maritim
cp deploy/.env.production.example .env
nano .env
bash deploy/hostinger-setup.sh
```

Skrip tersebut hanya memasang dependensi, membangun client, lalu menjalankan server dengan pm2 bila tersedia. Pembuatan database dan tabel dilakukan manual. Buat database di hPanel, buka phpMyAdmin, pilih database tersebut, lalu impor `server/src/db/schema.sql` sebelum menjalankan aplikasi. Kalau pm2 tidak ada, jalankan aplikasi dari
menu Node.js di hPanel dengan file awal `server/server.js`.

Di `.env`, `JWT_SECRET` dan `PAYMENT_WEBHOOK_SECRET` wajib diganti. Server menolak start di
mode production kalau nilainya masih bawaan.

### 3. Mengelola database dari komputer

Jalankan `deploy/terowongan-mysql.bat` (memakai plink dari paket PuTTY). Selama jendelanya
terbuka, klien MySQL seperti HeidiSQL atau DBeaver dapat tersambung ke `127.0.0.1` port `3307`
dengan pengguna dan kata sandi database Hostinger.

Dari PuTTY langsung:

```bash
mysql -u u123456789_agro -p u123456789_agro
SELECT email, created_at FROM langganan_newsletter ORDER BY created_at DESC;
```

Cadangan database: `bash deploy/cadangan-database.sh` (hasil di folder `cadangan/`).

## Halaman publik

Halaman berikut dapat dibuka tanpa login dan ditautkan dari footer:

| Alamat | Isi |
| :--- | :--- |
| `/faq` | Pertanyaan umum, diambil dari tabel `faq_platform` (dikelola di Panel Admin) |
| `/panduan-pemesanan` | Langkah pemesanan dan arti status pesanan |
| `/metode-pembayaran` | Tahap, metode, dan bank pembayaran |
| `/panduan-ekspor` | Incoterms, dokumen ekspor, dan pemantauan kargo |
| `/syarat-ketentuan` | Syarat dan ketentuan penggunaan |
| `/kebijakan-privasi` | Kebijakan privasi |

Formulir buletin di footer mengirim email ke `POST /api/newsletter` dan disimpan di tabel
`langganan_newsletter`.

## Skrip npm

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Server dan client untuk pengembangan |
| `npm run build` | Build client ke `client/dist` |
| `npm start` | Jalankan server (menyajikan `client/dist` bila `NODE_ENV=production`) |
|  | Isi data awal dari berkas Excel |
| `npm run lint` | Periksa kode dengan ESLint |
