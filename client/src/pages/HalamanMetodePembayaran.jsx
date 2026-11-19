import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import KerangkaHalamanInfo, {
  BagianInfo,
  DaftarButir,
  KartuInfo,
} from '../components/KerangkaHalamanInfo.jsx';
import { TANGGAL_PEMBARUAN_DOKUMEN } from '../utils/dataPerusahaan.js';

const TAHAP = [
  ['DP 30%', 'Uang muka 30% dari total tagihan. Pilihan umum untuk pesanan lokal.'],
  ['DP 50%', 'Uang muka 50% dari total tagihan. Lazim untuk pesanan bernilai besar atau ekspor.'],
  [
    'Pelunasan',
    'Seluruh sisa tagihan yang belum dibayar. Nominalnya otomatis menyesuaikan pembayaran yang sudah lunas.',
  ],
];

const METODE = [
  {
    nama: 'Virtual Account',
    untuk: 'Pesanan lokal',
    isi: 'Sistem menerbitkan nomor VA khusus untuk pesanan Anda. Bayar lewat ATM, mobile banking, atau internet banking bank yang dipilih. Nominal harus sama persis dengan yang tertera.',
  },
  {
    nama: 'Transfer Bank / RTGS',
    untuk: 'Pesanan lokal bernilai besar',
    isi: 'Transfer ke rekening penampungan PT Agro Maritim Nusantara di bank yang Anda pilih. Gunakan RTGS untuk nominal di atas batas transfer harian bank Anda.',
  },
  {
    nama: 'Telegraphic Transfer (T/T)',
    untuk: 'Pesanan ekspor',
    isi: 'Pengiriman dana lintas negara lewat jaringan SWIFT melalui bank koresponden. Biaya bank pengirim dan perantara ditanggung pembeli, kecuali disepakati lain.',
  },
  {
    nama: 'Letter of Credit (L/C)',
    untuk: 'Pesanan ekspor',
    isi: 'Bank penerbit L/C menjamin pembayaran setelah dokumen pengapalan memenuhi syarat. Cocok untuk transaksi pertama dengan nilai besar.',
  },
];

const BANK_LOKAL = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata'];
const BANK_KORESPONDEN = [
  'DBS Singapore',
  'HSBC Hong Kong',
  'MUFG Tokyo',
  'Citibank New York',
  'Deutsche Bank Frankfurt',
];

const STATUS = [
  ['Menunggu', 'Instruksi sudah diterbitkan, dana belum kami terima.'],
  ['Lunas', 'Dana sudah diterima dan dicocokkan dengan tagihan.'],
  ['Gagal', 'Pembayaran tidak diterima sampai batas waktu atau ditolak bank.'],
];

export default function HalamanMetodePembayaran() {
  return (
    <KerangkaHalamanInfo
      ikon={Wallet}
      judul="Metode Pembayaran"
      ringkasan="Tahap pembayaran, metode, dan bank yang tersedia untuk pesanan lokal maupun ekspor."
      diperbarui={TANGGAL_PEMBARUAN_DOKUMEN}
    >
      <BagianInfo id="tahap" judul="Tahap pembayaran">
        <p>
          Tagihan dapat dibayar bertahap. Pilih tahap pada halaman pembayaran pesanan, lalu buat
          instruksi baru untuk tahap berikutnya setelah tahap sebelumnya lunas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TAHAP.map(([nama, isi]) => (
            <KartuInfo key={nama} className="space-y-1.5">
              <h3 className="font-semibold text-[#102119] dark:text-emerald-50">{nama}</h3>
              <p>{isi}</p>
            </KartuInfo>
          ))}
        </div>
      </BagianInfo>

      <BagianInfo id="metode" judul="Metode yang tersedia">
        <div className="space-y-3">
          {METODE.map((item) => (
            <KartuInfo key={item.nama} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-[#102119] dark:text-emerald-50">{item.nama}</h3>
                <span className="text-xs font-medium text-[#0f5c6e] dark:text-cyan-300">
                  {item.untuk}
                </span>
              </div>
              <p>{item.isi}</p>
            </KartuInfo>
          ))}
        </div>
      </BagianInfo>

      <BagianInfo id="bank" judul="Bank yang didukung">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <KartuInfo className="space-y-2">
            <h3 className="font-semibold text-[#102119] dark:text-emerald-50">
              Bank penerima di Indonesia
            </h3>
            <ul className="flex flex-wrap gap-2">
              {BANK_LOKAL.map((nama) => (
                <li
                  key={nama}
                  className="rounded-lg bg-[var(--warna-permukaan-sekunder)] px-2.5 py-1 text-xs font-medium text-[#102119] dark:text-emerald-50"
                >
                  {nama}
                </li>
              ))}
            </ul>
          </KartuInfo>
          <KartuInfo className="space-y-2">
            <h3 className="font-semibold text-[#102119] dark:text-emerald-50">
              Bank koresponden ekspor
            </h3>
            <ul className="flex flex-wrap gap-2">
              {BANK_KORESPONDEN.map((nama) => (
                <li
                  key={nama}
                  className="rounded-lg bg-[var(--warna-permukaan-sekunder)] px-2.5 py-1 text-xs font-medium text-[#102119] dark:text-emerald-50"
                >
                  {nama}
                </li>
              ))}
            </ul>
          </KartuInfo>
        </div>
      </BagianInfo>

      <BagianInfo id="alur" judul="Setelah Anda membayar">
        <DaftarButir
          bernomor
          butir={[
            'Instruksi pembayaran berlaku 24 jam sejak diterbitkan. Lewat dari itu, buat instruksi baru dari halaman pembayaran.',
            'Konfirmasi masuk otomatis dari bank. Bila dana belum terbaca, unggah foto bukti transfer di halaman yang sama agar admin dapat memverifikasi secara manual.',
            'Status pembayaran berubah menjadi Lunas dan pesanan berpindah dari Menunggu DP ke Diproses.',
            'Bukti pembayaran dalam format PDF dapat diunduh dari menu Riwayat Pembayaran.',
          ]}
        />
        <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] divide-y divide-[var(--warna-garis)]">
          {STATUS.map(([nama, arti]) => (
            <div
              key={nama}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 p-4"
            >
              <span className="sm:w-28 shrink-0 font-semibold text-[#102119] dark:text-emerald-50">
                {nama}
              </span>
              <span>{arti}</span>
            </div>
          ))}
        </div>
      </BagianInfo>

      <BagianInfo id="kurs" judul="Mata uang dan kurs">
        <p>
          Pesanan lokal ditagih dalam rupiah. Pesanan ekspor ditagih dalam dolar AS. Nilai dolar
          pada instruksi pembayaran dihitung dari kurs referensi platform pada saat instruksi
          dibuat, sehingga bisa berbeda dari kurs harian bank Anda.
        </p>
      </BagianInfo>

      <BagianInfo id="keamanan" judul="Keamanan pembayaran">
        <DaftarButir
          butir={[
            'Transfer hanya ke nomor VA atau rekening yang tampil di halaman pembayaran setelah Anda masuk ke akun.',
            'Kami tidak pernah meminta kata sandi, kode OTP, atau PIN lewat WhatsApp, telepon, maupun email.',
            'Bila ragu dengan sebuah pesan yang mengatasnamakan Agro Maritim, hubungi nomor resmi di bagian bawah halaman ini.',
          ]}
        />
        <p>
          Pertanyaan lain seputar tagihan ada di{' '}
          <Link
            to="/faq"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            FAQ
          </Link>
          .
        </p>
      </BagianInfo>
    </KerangkaHalamanInfo>
  );
}
