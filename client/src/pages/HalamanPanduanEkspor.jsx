import { Ship } from 'lucide-react';
import { Link } from 'react-router-dom';
import KerangkaHalamanInfo, {
  BagianInfo,
  DaftarButir,
  KartuInfo,
} from '../components/KerangkaHalamanInfo.jsx';
import { DATA_PERUSAHAAN, TANGGAL_PEMBARUAN_DOKUMEN } from '../utils/dataPerusahaan.js';

const INCOTERMS = [
  {
    kode: 'EXW',
    nama: 'Ex Works',
    penjual: 'Menyiapkan barang di lokasi produsen.',
    pembeli: 'Pengangkutan, pengurusan ekspor, dan seluruh risiko sejak barang diambil.',
  },
  {
    kode: 'FOB',
    nama: 'Free On Board',
    penjual: 'Mengurus dokumen ekspor dan menaikkan barang ke kapal di pelabuhan muat.',
    pembeli: 'Freight laut, asuransi, bea impor, dan risiko sejak barang berada di atas kapal.',
  },
  {
    kode: 'CIF',
    nama: 'Cost, Insurance and Freight',
    penjual: 'Biaya muat, freight sampai pelabuhan tujuan, dan asuransi pengangkutan.',
    pembeli: 'Bongkar di tujuan, bea impor, dan risiko sejak barang berada di atas kapal.',
  },
  {
    kode: 'DDP',
    nama: 'Delivered Duty Paid',
    penjual: 'Seluruh biaya dan risiko sampai tempat tujuan, termasuk bea dan pajak impor.',
    pembeli: 'Menerima barang dan membongkar muatan.',
  },
];

const DOKUMEN = [
  {
    nama: 'Commercial Invoice',
    isi: 'Rincian barang, harga, dan syarat penjualan. Dasar penghitungan bea di negara tujuan.',
  },
  {
    nama: 'Packing List',
    isi: 'Jumlah kemasan, berat bersih dan kotor, serta isi tiap kemasan.',
  },
  {
    nama: 'PEB (Pemberitahuan Ekspor Barang)',
    isi: 'Diajukan eksportir ke Bea Cukai sebelum barang dimuat. Setelah disetujui, terbit Nota Pelayanan Ekspor (NPE) sebagai izin muat.',
  },
  {
    nama: 'Bill of Lading / Airway Bill',
    isi: 'Bukti penyerahan barang kepada pengangkut, diterbitkan oleh perusahaan pelayaran atau maskapai.',
  },
  {
    nama: 'Certificate of Origin (SKA)',
    isi: 'Menerangkan asal barang. Diperlukan bila pembeli ingin memanfaatkan tarif preferensi dalam perjanjian perdagangan.',
  },
  {
    nama: 'Sertifikat karantina',
    isi: 'Phytosanitary Certificate untuk produk tanaman, Health Certificate untuk produk perikanan dan hewan. Diterbitkan setelah pemeriksaan oleh Badan Karantina Indonesia.',
  },
  {
    nama: 'Sertifikat asuransi',
    isi: 'Diperlukan pada penjualan CIF dan DDP sebagai bukti pertanggungan selama pengangkutan.',
  },
];

const TAHAP_PENGIRIMAN = [
  ['Persiapan Dokumen', 'Invoice, packing list, dan sertifikat disiapkan; PEB diajukan.'],
  ['Muat Kargo', 'Barang dikemas, diperiksa mutu, lalu dimuat ke kontainer atau armada.'],
  ['Pemeriksaan Bea Cukai', 'Kontainer diperiksa dan NPE diterbitkan bila dokumen lengkap.'],
  [
    'Dalam Perjalanan',
    'Kapal berangkat. Nomor kontainer dan estimasi tiba tersedia di menu Pesanan.',
  ],
  ['Tiba di Tujuan', 'Barang sampai di pelabuhan tujuan dan siap diurus sesuai Incoterms.'],
];

export default function HalamanPanduanEkspor() {
  return (
    <KerangkaHalamanInfo
      ikon={Ship}
      judul="Panduan Ekspor"
      ringkasan="Incoterms yang tersedia di Agro Maritim, dokumen yang disiapkan untuk Bea Cukai, dan cara memantau kargo."
      diperbarui={TANGGAL_PEMBARUAN_DOKUMEN}
    >
      <BagianInfo id="incoterms" judul="Memilih Incoterms">
        <p>
          Incoterms menentukan siapa yang menanggung biaya dan risiko pada tiap bagian perjalanan
          barang. Pilihan ini dibuat di halaman Keranjang dan memengaruhi biaya logistik pada
          tagihan. Untuk pesanan lokal, ketentuan yang dipakai adalah Lokal Franco Gudang: barang
          diantar ke gudang penerima di dalam negeri.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)]">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--warna-garis)] text-xs uppercase tracking-wider text-[#53665c] dark:text-emerald-200/70">
                <th scope="col" className="p-4 font-semibold">
                  Ketentuan
                </th>
                <th scope="col" className="p-4 font-semibold">
                  Tanggungan penjual
                </th>
                <th scope="col" className="p-4 font-semibold">
                  Tanggungan pembeli
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--warna-garis)]">
              {INCOTERMS.map((item) => (
                <tr key={item.kode} className="align-top">
                  <th scope="row" className="p-4 font-normal">
                    <span className="block font-bold text-[#102119] dark:text-emerald-50">
                      {item.kode}
                    </span>
                    <span className="text-xs">{item.nama}</span>
                  </th>
                  <td className="p-4">{item.penjual}</td>
                  <td className="p-4">{item.pembeli}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs">
          FOB dan CIF hanya berlaku untuk pengangkutan laut. Ringkasan di atas bersifat umum; isi
          lengkap ada pada teks resmi Incoterms 2020 terbitan ICC.
        </p>
      </BagianInfo>

      <BagianInfo id="dokumen" judul="Dokumen ekspor">
        <p>
          Tim kami membantu menyiapkan dokumen berikut bersama produsen. Daftar yang pasti
          bergantung pada komoditas dan aturan negara tujuan, jadi kami mengonfirmasinya ke Anda
          setelah pesanan dibuat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOKUMEN.map((item) => (
            <KartuInfo key={item.nama} className="space-y-1.5">
              <h3 className="font-semibold text-[#102119] dark:text-emerald-50">{item.nama}</h3>
              <p>{item.isi}</p>
            </KartuInfo>
          ))}
        </div>
      </BagianInfo>

      <BagianInfo id="pemantauan" judul="Memantau kargo">
        <p>
          Setiap pesanan memiliki lini masa pengiriman di menu Pesanan. Statusnya bergerak dalam
          urutan berikut.
        </p>
        <ol className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] divide-y divide-[var(--warna-garis)]">
          {TAHAP_PENGIRIMAN.map(([nama, isi], idx) => (
            <li key={nama} className="flex gap-4 p-4">
              <span className="w-6 h-6 rounded-full bg-[#14452F]/10 dark:bg-emerald-900/50 text-[#14452F] dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 angka-tabular">
                {idx + 1}
              </span>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#102119] dark:text-emerald-50">{nama}</p>
                <p>{isi}</p>
              </div>
            </li>
          ))}
        </ol>
        <p>
          Nomor PEB, nomor kontainer atau resi, pelabuhan asal dan tujuan, serta estimasi tanggal
          tiba muncul di detail pesanan begitu data tersebut tersedia.
        </p>
      </BagianInfo>

      <BagianInfo id="persiapan" judul="Yang perlu Anda siapkan sebagai importir">
        <DaftarButir
          butir={[
            'Tax ID atau nomor registrasi perusahaan di negara Anda, diunggah pada halaman Profil.',
            'Nama dan alamat lengkap pelabuhan tujuan, serta pihak yang akan menerima pemberitahuan kedatangan.',
            'Persyaratan impor khusus di negara Anda untuk komoditas yang dipesan, misalnya izin impor atau standar residu.',
            'Rekening bank atau fasilitas L/C bila memilih T/T atau Letter of Credit sebagai metode bayar.',
          ]}
        />
        <p>
          Ketentuan pembayaran ekspor dijelaskan di{' '}
          <Link
            to="/metode-pembayaran"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            Metode Pembayaran
          </Link>
          . Untuk pertanyaan teknis seputar dokumen dan pengapalan, kirim email ke{' '}
          <a
            href={DATA_PERUSAHAAN.kontak.emailEkspor.href}
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            {DATA_PERUSAHAAN.kontak.emailEkspor.tampil}
          </a>
          .
        </p>
      </BagianInfo>
    </KerangkaHalamanInfo>
  );
}
