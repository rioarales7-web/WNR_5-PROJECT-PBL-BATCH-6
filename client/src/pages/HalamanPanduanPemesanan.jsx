import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import KerangkaHalamanInfo, {
  BagianInfo,
  DaftarButir,
  KartuInfo,
} from '../components/KerangkaHalamanInfo.jsx';
import { TANGGAL_PEMBARUAN_DOKUMEN } from '../utils/dataPerusahaan.js';

const LANGKAH = [
  {
    judul: 'Buat akun dan lengkapi data usaha',
    isi: 'Daftar sebagai Pembeli PT Lokal atau Importir Internasional. Setelah masuk, buka halaman Profil dan isi data perusahaan: NPWP untuk PT lokal, Tax ID untuk importir. Dokumen legal yang Anda unggah diperiksa oleh tim kami.',
  },
  {
    judul: 'Pilih komoditas di Katalog',
    isi: 'Gunakan filter kategori (pertanian, perikanan, peternakan) dan kata kunci untuk mempersempit pilihan. Halaman detail produk menampilkan harga dalam rupiah dan dolar, stok tersedia, kredensial produsen, dan ulasan pembeli sebelumnya.',
  },
  {
    judul: 'Masukkan ke keranjang',
    isi: 'Tentukan jumlah sesuai satuan yang tertera pada produk. Anda bisa menggabungkan beberapa komoditas dalam satu pesanan. Jumlah yang melebihi stok akan ditolak oleh sistem.',
  },
  {
    judul: 'Tentukan pasar dan Incoterms',
    isi: 'Di halaman Keranjang, pilih Pasar Lokal atau Ekspor Internasional. Pasar lokal memakai Lokal Franco Gudang dan dibayar dalam rupiah. Pasar ekspor memakai EXW, FOB, CIF, atau DDP dan ditagihkan dalam dolar AS. Isi juga alamat gudang penerima atau pelabuhan tujuan.',
  },
  {
    judul: 'Periksa rincian tagihan',
    isi: 'Subtotal produk, biaya logistik, serta pajak atau bea dihitung otomatis di server berdasarkan pilihan Anda, jadi angkanya tidak bisa diubah dari sisi browser. Pesanan yang dibuat langsung mendapat nomor invoice dan berstatus Menunggu DP.',
  },
  {
    judul: 'Lakukan pembayaran',
    isi: 'Buka halaman pembayaran pesanan, pilih tahap (DP 30%, DP 50%, atau pelunasan), metode, dan bank tujuan. Instruksi pembayaran berlaku 24 jam. Setelah transfer, unggah bukti pembayaran bila diminta.',
  },
  {
    judul: 'Pantau pesanan dan pengiriman',
    isi: 'Menu Pesanan menampilkan status pesanan dan lini masa pengiriman, termasuk armada, nomor kontainer atau resi, serta estimasi tiba. Untuk pesanan ekspor tersedia juga nomor PEB dan sertifikat pendukung.',
  },
  {
    judul: 'Terima barang dan beri ulasan',
    isi: 'Setelah status pesanan menjadi Selesai, Anda dapat memberi rating dan ulasan pada halaman detail produk. Ulasan membantu pembeli lain menilai mutu dan ketepatan pengiriman produsen.',
  },
];

const STATUS_PESANAN = [
  ['Menunggu DP', 'Pesanan sudah dibuat, pembayaran pertama belum diterima.'],
  ['Diproses', 'Pembayaran diterima dan produsen menyiapkan komoditas.'],
  ['Dikirim', 'Barang sudah diserahkan ke armada pengangkut.'],
  ['Selesai', 'Barang diterima dan transaksi ditutup.'],
  ['Dibatalkan', 'Pesanan tidak dilanjutkan dan tidak dapat dibayar lagi.'],
];

export default function HalamanPanduanPemesanan() {
  return (
    <KerangkaHalamanInfo
      ikon={ShoppingCart}
      judul="Panduan Pemesanan"
      ringkasan="Urutan yang Anda lewati sebagai pembeli, dari memilih komoditas sampai pesanan diterima."
      diperbarui={TANGGAL_PEMBARUAN_DOKUMEN}
    >
      <BagianInfo id="langkah" judul="Langkah demi langkah">
        <ol className="space-y-3">
          {LANGKAH.map((item, idx) => (
            <li key={item.judul}>
              <KartuInfo className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-[#14452F] text-white text-sm font-bold flex items-center justify-center shrink-0 angka-tabular">
                  {idx + 1}
                </span>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-semibold text-[#102119] dark:text-emerald-50">
                    {item.judul}
                  </h3>
                  <p>{item.isi}</p>
                </div>
              </KartuInfo>
            </li>
          ))}
        </ol>
      </BagianInfo>

      <BagianInfo id="status" judul="Arti status pesanan">
        <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] divide-y divide-[var(--warna-garis)]">
          {STATUS_PESANAN.map(([nama, arti]) => (
            <div
              key={nama}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 p-4"
            >
              <span className="sm:w-32 shrink-0 font-semibold text-[#102119] dark:text-emerald-50">
                {nama}
              </span>
              <span>{arti}</span>
            </div>
          ))}
        </div>
      </BagianInfo>

      <BagianInfo id="catatan" judul="Hal yang sering terlewat">
        <DaftarButir
          butir={[
            'Stok dikurangi saat pesanan dibuat, bukan saat pembayaran. Bila Anda tidak jadi membeli, hubungi tim kami agar pesanan dibatalkan.',
            'Harga satuan yang tercatat pada invoice adalah harga saat pesanan dibuat. Perubahan harga setelahnya tidak memengaruhi pesanan Anda.',
            'Pesanan ekspor membutuhkan pelabuhan tujuan yang jelas. Alamat yang tidak lengkap menunda penerbitan dokumen.',
            'Simpan nomor invoice. Nomor ini diminta tim kami setiap kali Anda menanyakan status pesanan.',
          ]}
        />
        <p>
          Rincian metode transfer ada di{' '}
          <Link
            to="/metode-pembayaran"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            Metode Pembayaran
          </Link>
          , sedangkan penjelasan Incoterms dan dokumen ekspor ada di{' '}
          <Link
            to="/panduan-ekspor"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            Panduan Ekspor
          </Link>
          .
        </p>
      </BagianInfo>
    </KerangkaHalamanInfo>
  );
}
