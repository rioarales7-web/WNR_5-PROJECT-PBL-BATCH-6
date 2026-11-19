import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Download, Package, PlusCircle, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import KartuProduk from '../components/KartuProduk.jsx';
import BagianFaqBeranda from '../components/BagianFaqBeranda.jsx';
import { PesanGalat } from '../components/KeadaanHalaman.jsx';
import { SkeletonBeranda } from '../components/SkeletonProduk.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatRupiah, labelPeran, PERAN_PRODUSEN } from '../utils/format.js';

const GALERI_SIMULASI = [
  {
    gambar: '/img/slide-pertanian.jpg',
    sektor: 'Pertanian',
    judul: 'Kopi, Rempah & Komoditas Kebun',
    deskripsi: 'Hasil panen petani terverifikasi untuk pasokan industri lokal dan ekspor.',
  },
  {
    gambar: '/img/slide-perikanan.jpg',
    sektor: 'Perikanan',
    judul: 'Hasil Tangkapan & Rantai Dingin',
    deskripsi: 'Penanganan ikan dan udang segar menuju pelabuhan muat kontainer reefer.',
  },
  {
    gambar: '/img/slide-peternakan.jpg',
    sektor: 'Peternakan',
    judul: 'Sentra Ternak & Daging Segar',
    deskripsi: 'Pasokan peternakan nasional dengan standar mutu dan keamanan pangan.',
  },
  {
    gambar: '/img/hero-maritim.jpg',
    sektor: 'Logistik Ekspor',
    judul: 'Pelabuhan & Dokumen Bea Cukai',
    deskripsi: 'Simulasi pengiriman antar pulau dan ekspor melalui rute pelabuhan utama.',
  },
];

export default function HalamanBeranda() {
  const { pengguna } = useAuth();
  const { toastSukses, toastGalat } = useToast();
  const [ringkasan, setRingkasan] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [mengunduhCsv, setMengunduhCsv] = useState(false);
  const [galat, setGalat] = useState('');

  const muatBeranda = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/order/beranda');
      setRingkasan(res.ringkasan);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatBeranda();
  }, [muatBeranda]);

  const adalahProdusen = PERAN_PRODUSEN.includes(pengguna?.role_user);
  const adalahAdmin = pengguna?.role_user === 'Admin';

  const unduhLaporanCsv = async () => {
    setGalat('');
    setMengunduhCsv(true);
    try {
      const endpoint = adalahProdusen
        ? '/order/laporan-penjualan-csv'
        : '/order/laporan-transaksi-csv';
      const prefix = adalahProdusen
        ? 'laporan-penjualan-agro-maritim'
        : 'laporan-transaksi-agro-maritim';
      const blob = await panggilApi(endpoint, { responBlob: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastSukses(
        adalahProdusen
          ? 'Laporan penjualan CSV berhasil diunduh.'
          : 'Rekap transaksi CSV berhasil diunduh.'
      );
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMengunduhCsv(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl gradasi-maritim text-white p-7 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-emerald-200">
            {labelPeran(pengguna?.role_user)} · {pengguna?.kota_wilayah || pengguna?.asal_negara}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Selamat datang, {pengguna?.nama_lengkap}
          </h1>
          <p className="text-sm text-emerald-100/90 max-w-xl">
            {adalahProdusen
              ? 'Pantau stok hasil panen, pesanan masuk dari pembeli nasional & ekspor, dan pencairan dana Anda.'
              : adalahAdmin
                ? 'Kelola verifikasi legalitas perusahaan, konfirmasi pembayaran manual L/C atau T/T, dan pembaruan pengiriman.'
                : 'Telusuri komoditas segar dari sentra produksi Indonesia dan pantau pesanan Anda secara langsung.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          {adalahProdusen ? (
            <>
              <button
                type="button"
                disabled={mengunduhCsv}
                onClick={unduhLaporanCsv}
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 inline-flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-60 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{mengunduhCsv ? 'Menyiapkan CSV...' : 'Unduh Laporan CSV'}</span>
              </button>
              <Link
                to="/jual-panen"
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-[#ea580c] hover:bg-[#c2410c] text-white inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Komoditas</span>
              </Link>
            </>
          ) : adalahAdmin ? (
            <>
              <button
                type="button"
                disabled={mengunduhCsv}
                onClick={unduhLaporanCsv}
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 inline-flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-60 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{mengunduhCsv ? 'Menyiapkan CSV...' : 'Ekspor Transaksi CSV'}</span>
              </button>
              <Link
                to="/admin"
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-[#ea580c] hover:bg-[#c2410c] text-white inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Panel Admin</span>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={mengunduhCsv}
                onClick={unduhLaporanCsv}
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 inline-flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-60 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{mengunduhCsv ? 'Menyiapkan CSV...' : 'Unduh Rekap CSV'}</span>
              </button>
              <Link
                to="/katalog"
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-[#ea580c] hover:bg-[#c2410c] text-white inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <span>Jelajahi Katalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </section>

      <PesanGalat pesan={galat} onCobaLagi={muatBeranda} />

      {memuat ? (
        <SkeletonBeranda />
      ) : (
        ringkasan && (
          <>
            {ringkasan.kategori === 'Produsen' && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Ringkasan Penjualan &amp; Stok</h2>
                  <button
                    type="button"
                    disabled={mengunduhCsv}
                    onClick={unduhLaporanCsv}
                    className="h-10 px-4 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-stone-50 dark:hover:bg-emerald-950/40 inline-flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>{mengunduhCsv ? 'Mengunduh...' : 'Unduh Laporan Penjualan (CSV)'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6">
                    <p className="text-xs font-medium text-[#53665c] dark:text-emerald-200/70">
                      Total Stok Aktif ({ringkasan.total_produk} komoditas)
                    </p>
                    <p className="mt-2 text-2xl font-bold angka-tabular">
                      {Number(ringkasan.total_stok).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6">
                    <p className="text-xs font-medium text-[#53665c] dark:text-emerald-200/70">
                      Pesanan Masuk
                    </p>
                    <p className="mt-2 text-2xl font-bold angka-tabular">
                      {ringkasan.pesanan_masuk}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6">
                    <p className="text-xs font-medium text-[#53665c] dark:text-emerald-200/70">
                      Total Pendapatan Terproses
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
                      {formatRupiah(ringkasan.total_pendapatan_idr)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {ringkasan.kategori === 'Pembeli' && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Ringkasan Pembelian</h2>
                  <button
                    type="button"
                    disabled={mengunduhCsv}
                    onClick={unduhLaporanCsv}
                    className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>{mengunduhCsv ? 'Mengunduh...' : 'Unduh Rekap Transaksi (CSV)'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--warna-teks-redup)]">
                        Pesanan Aktif
                      </p>
                      <p className="mt-1.5 text-2xl font-bold angka-tabular">
                        {ringkasan.pesanan_aktif}
                      </p>
                    </div>
                    <Link
                      to="/pesanan"
                      className="text-sm font-semibold text-[#14452F] dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                    >
                      <Package className="w-4 h-4" />
                      <span>Lihat Pesanan</span>
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--warna-teks-redup)]">
                        Akumulasi Nilai Transaksi
                      </p>
                      <p className="mt-1.5 text-2xl font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
                        {formatRupiah(ringkasan.total_belanja_idr)}
                      </p>
                    </div>
                    <Link
                      to="/riwayat-pembayaran"
                      className="text-sm font-semibold text-[#0f5c6e] dark:text-cyan-300 hover:underline inline-flex items-center gap-1"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Riwayat Bayar</span>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {ringkasan.kategori === 'Admin' && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Ringkasan Operasional Sistem</h2>
                  <button
                    type="button"
                    disabled={mengunduhCsv}
                    onClick={unduhLaporanCsv}
                    className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>{mengunduhCsv ? 'Mengunduh...' : 'Unduh Rekap Transaksi (CSV)'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6">
                    <p className="text-xs font-medium text-[var(--warna-teks-redup)]">
                      Verifikasi Legal Menunggu
                    </p>
                    <p className="mt-2 text-2xl font-bold angka-tabular">
                      {ringkasan.menunggu_verifikasi}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6">
                    <p className="text-xs font-medium text-[var(--warna-teks-redup)]">
                      Pembayaran Menunggu Konfirmasi
                    </p>
                    <p className="mt-2 text-2xl font-bold angka-tabular">
                      {ringkasan.menunggu_pembayaran}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6">
                    <p className="text-xs font-medium text-[var(--warna-teks-redup)]">
                      Total Pesanan Sistem
                    </p>
                    <p className="mt-2 text-2xl font-bold angka-tabular">
                      {ringkasan.total_pesanan}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Komoditas Unggulan</h2>
                <Link
                  to="/katalog"
                  className="text-sm font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
                >
                  Buka Katalog Lengkap
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(ringkasan.komoditas_unggulan || []).map((item) => (
                  <KartuProduk key={item.produk_id} produk={item} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">Galeri Simulasi &amp; Sektor Agro Maritim</h2>
                  <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
                    Gambaran ekosistem pasokan dari sentra panen hingga pelabuhan tujuan.
                  </p>
                </div>
                <Link
                  to="/katalog"
                  className="text-sm font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
                >
                  Telusuri Sektor di Katalog
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {GALERI_SIMULASI.map((item) => (
                  <Link
                    key={item.gambar}
                    to="/katalog"
                    className="group rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-emerald-950/50">
                      <img
                        src={item.gambar}
                        alt={item.judul}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <p className="text-xs font-semibold text-[#0f5c6e] dark:text-cyan-300">
                        {item.sektor}
                      </p>
                      <h3 className="text-sm font-bold text-[#102119] dark:text-emerald-50">
                        {item.judul}
                      </h3>
                      <p className="text-xs text-[#53665c] dark:text-emerald-200/75 leading-relaxed">
                        {item.deskripsi}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )
      )}

      <BagianFaqBeranda />
    </div>
  );
}
