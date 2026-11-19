import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom'; // BARU
import { panggilApi } from '../api/klienApi.js';
import KartuProduk from '../components/KartuProduk.jsx';
import { KeadaanKosong, PesanGalat } from '../components/KeadaanHalaman.jsx';
import SidebarFilterKatalog from '../components/SidebarFilterKatalog.jsx';
import { SkeletonKisiProduk } from '../components/SkeletonProduk.jsx';
import SliderKomoditasUnggulan from '../components/SliderKomoditasUnggulan.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { unduhCsvLokal } from '../utils/eksporCsv.js';
import { useDebounce } from '../utils/useDebounce.js';

const SLIDE_KATALOG = [
  {
    id: 'katalog-maritim',
    gambar: '/img/hero-maritim.jpg',
    sektor: 'Semua Sektor',
    sektorFilter: '',
    grade: 'Pasar Nasional & Ekspor',
    asal: 'Pelabuhan Utama Nusantara',
    judul: 'Jaringan Pasokan Agro & Maritim Terverifikasi',
    deskripsi:
      'Temukan komoditas unggulan langsung dari koperasi tani, pelabuhan perikanan, dan sentra peternakan dengan dukungan pengiriman lokal maupun ekspor.',
    aksiLabel: 'Tampilkan Semua Sektor',
  },
  {
    id: 'katalog-pertanian',
    gambar: '/img/slide-pertanian.jpg',
    sektor: 'Pertanian',
    sektorFilter: 'Pertanian',
    grade: 'GAP & Indikasi Geografis',
    asal: 'Aceh, Lampung & Jawa',
    judul: 'Hasil Panen Perkebunan & Rempah Pilihan',
    deskripsi:
      'Kopi arabika specialty, lada putih, pala, dan komoditas pangan kering dari kelompok tani terstandar mutu ekspor.',
    aksiLabel: 'Filter Sektor Pertanian',
  },
  {
    id: 'katalog-perikanan',
    gambar: '/img/slide-perikanan.jpg',
    sektor: 'Perikanan',
    sektorFilter: 'Perikanan',
    grade: 'Rantai Dingin HACCP',
    asal: 'Bitung, Makassar & Lampung',
    judul: 'Komoditas Laut & Tambak Berstandar Rantai Dingin',
    deskripsi:
      'Tuna sirip kuning sashimi grade dan udang vaname segar beku dengan kendali suhu kontainer reefer sejak dari pelabuhan muat.',
    aksiLabel: 'Filter Sektor Perikanan',
  },
  {
    id: 'katalog-peternakan',
    gambar: '/img/slide-peternakan.jpg',
    sektor: 'Peternakan',
    sektorFilter: 'Peternakan',
    grade: 'NKV & Halal Terjamin',
    asal: 'Boyolali & Sentra Jawa',
    judul: 'Pasokan Ternak & Daging Segar Terkurasi',
    deskripsi:
      'Karkas dan potongan daging segar dari sentra peternakan rakyat dengan sertifikasi kesehatan hewan dan fasilitas chiller modern.',
    aksiLabel: 'Filter Sektor Peternakan',
  },
];

export default function HalamanKatalog() {
  const { toastSukses } = useToast();
  const lokasiUrl = useLocation(); // BARU
  const [paramUrl, setParamUrl] = useSearchParams(); // BARU
  const [produkServer, setProdukServer] = useState([]);
  const [memuatAwal, setMemuatAwal] = useState(true);
  const [sedangMencari, setSedangMencari] = useState(false);
  const [galat, setGalat] = useState('');
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);
  const cacheKueriRef = useRef(new Map());

  const [filter, setFilter] = useState({
    cari: paramUrl.get('cari') || '', // BARU: isi awal dari URL
    lokasi: '',
    sektor: [],
    grade: '',
    pasar: '',
    harga_min: '',
    harga_max: '',
  });

  const cariBersih = filter.cari.trim();
  const lokasiBersih = filter.lokasi.trim();
  const gradeBersih = filter.grade.trim();
  const hargaMaxBersih = String(filter.harga_max || '').trim();

  const cariTertunda = useDebounce(cariBersih, 400);
  const lokasiTertunda = useDebounce(lokasiBersih, 400);
  const gradeTertunda = useDebounce(gradeBersih, 400);
  const hargaMaxTertunda = useDebounce(hargaMaxBersih, 400);

  const muatKatalog = useCallback(
    async (signal, paksaSegarkan = false) => {
      const paramsDasar = new URLSearchParams();
      const nilaiDasar = {
        cari: cariTertunda,
        lokasi: lokasiTertunda,
        grade: gradeTertunda,
        pasar: filter.pasar,
        harga_min: filter.harga_min,
        harga_max: hargaMaxTertunda,
      };
      Object.entries(nilaiDasar).forEach(([k, v]) => {
        if (String(v).trim() !== '') paramsDasar.set(k, String(v).trim());
      });

      const qsDasar = paramsDasar.toString();

      if (!paksaSegarkan && cacheKueriRef.current.has(qsDasar)) {
        setProdukServer(cacheKueriRef.current.get(qsDasar));
        setMemuatAwal(false);
        setSedangMencari(false);
        setGalat('');
        return;
      }

      setSedangMencari(true);
      setGalat('');

      try {
        const res = await panggilApi(`/produk${qsDasar ? `?${qsDasar}` : ''}`, { signal });
        const hasilProduk = res.produk || [];
        cacheKueriRef.current.set(qsDasar, hasilProduk);
        setProdukServer(hasilProduk);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setGalat(err.message);
        }
      } finally {
        if (!signal?.aborted) {
          setMemuatAwal(false);
          setSedangMencari(false);
        }
      }
    },
    [cariTertunda, lokasiTertunda, gradeTertunda, filter.pasar, filter.harga_min, hargaMaxTertunda]
  );

  useEffect(() => {
    const controller = new AbortController();
    muatKatalog(controller.signal);
    return () => controller.abort();
  }, [muatKatalog]);

  // BARU: ikuti kata pencarian dari navbar (?cari=...) saat sudah berada di halaman Katalog
  useEffect(() => {
    const dariUrl = paramUrl.get('cari') || '';
    setFilter((prev) => (prev.cari === dariUrl ? prev : { ...prev, cari: dariUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lokasiUrl.key]);

  const toggleSektor = (nilaiSektor) => {
    setFilter((prev) => {
      const sudahAda = prev.sektor.includes(nilaiSektor);
      return {
        ...prev,
        sektor: sudahAda
          ? prev.sektor.filter((item) => item !== nilaiSektor)
          : [...prev.sektor, nilaiSektor],
      };
    });
  };

  const ubahFilter = (kunci, nilai) => {
    setFilter((prev) => ({ ...prev, [kunci]: nilai }));
  };

  const pilihSemuaSektor = () => {
    setFilter((prev) => ({ ...prev, sektor: [] }));
  };

  const aturUlang = () => {
    setParamUrl({}, { replace: true }); // BARU: bersihkan ?cari= dari alamat browser
    setFilter({
      cari: '',
      lokasi: '',
      sektor: [],
      grade: '',
      pasar: '',
      harga_min: '',
      harga_max: '',
    });
  };

  const jumlahPerSektor = useMemo(() => {
    const hitung = { Pertanian: 0, Perikanan: 0, Peternakan: 0 };
    produkServer.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(hitung, item.sektor)) {
        hitung[item.sektor] += 1;
      }
    });
    return hitung;
  }, [produkServer]);

  const produkTampil = useMemo(() => {
    let hasil = produkServer;

    if (filter.sektor.length > 0) {
      hasil = hasil.filter((item) => filter.sektor.includes(item.sektor));
    }

    if (filter.pasar === 'Ekspor') {
      hasil = hasil.filter((item) => Number(item.harga_usd) > 0);
    } else if (filter.pasar === 'Lokal') {
      hasil = hasil.filter((item) => Number(item.harga_idr) > 0);
    }

    return hasil;
  }, [produkServer, filter.sektor, filter.pasar]);

  const menungguDebounce =
    cariBersih !== cariTertunda ||
    lokasiBersih !== lokasiTertunda ||
    gradeBersih !== gradeTertunda ||
    hargaMaxBersih !== hargaMaxTertunda;

  const tampilkanSkeleton = memuatAwal || sedangMencari || menungguDebounce;

  const adaFilterAktif =
    filter.sektor.length > 0 ||
    cariBersih !== '' ||
    lokasiBersih !== '' ||
    filter.pasar !== '' ||
    gradeBersih !== '' ||
    hargaMaxBersih !== '';

  const handleEksporCsv = () => {
    if (produkTampil.length === 0) return;
    const tanggal = new Date().toISOString().slice(0, 10);
    const header = [
      'ID Produk',
      'Sektor',
      'Nama Komoditas',
      'Grade Kualitas',
      'Satuan',
      'Harga IDR',
      'Harga USD',
      'Stok Tersedia',
      'Rata-Rata Rating',
      'Jumlah Ulasan',
      'Nama Produsen',
      'Kota Produsen',
    ];
    const baris = produkTampil.map((item) => [
      item.produk_id,
      item.sektor,
      item.nama_komoditas,
      item.grade_kualitas,
      item.satuan,
      item.harga_idr,
      item.harga_usd,
      item.stok_tersedia,
      Number(item.rata_rating || 0).toFixed(1),
      Number(item.jumlah_ulasan || 0),
      item.nama_produsen || '',
      item.kota_produsen || '',
    ]);
    unduhCsvLokal(`katalog-agro-maritim-${tanggal}.csv`, header, baris);
    toastSukses(`Data ${produkTampil.length} komoditas berhasil diekspor ke CSV.`);
  };

  const tanganiAksiSlideKatalog = (slide) => {
    setFilter((prev) => ({
      ...prev,
      sektor: slide.sektorFilter ? [slide.sektorFilter] : [],
    }));
    const el = document.getElementById('daftar-komoditas-katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      <SliderKomoditasUnggulan
        varian="katalog"
        slides={SLIDE_KATALOG}
        onAksiSlide={tanganiAksiSlideKatalog}
      />

      <div
        id="daftar-komoditas-katalog"
        className="flex flex-wrap items-end justify-between gap-3 pt-1"
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--warna-teks)]">
            Katalog Komoditas
          </h1>
          <p className="text-sm text-[var(--warna-teks-redup)]">
            Pilih hasil pertanian, perikanan, dan peternakan langsung dari produsen terverifikasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!memuatAwal && !galat && (
            <p
              aria-live="polite"
              className="text-xs font-medium text-[var(--warna-teks-redup)] angka-tabular mr-1"
            >
              {menungguDebounce
                ? 'Menyiapkan pencarian...'
                : sedangMencari
                  ? 'Memuat komoditas dari server...'
                  : `Menampilkan ${produkTampil.length} komoditas`}
            </p>
          )}

          <button
            type="button"
            disabled={tampilkanSkeleton || produkTampil.length === 0}
            onClick={handleEksporCsv}
            className="h-10 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-2 disabled:opacity-50 tombol-halus cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarTerbuka((b) => !b)}
            aria-expanded={sidebarTerbuka}
            className="md:hidden h-10 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold inline-flex items-center gap-2 tombol-halus cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter{filter.sektor.length > 0 ? ` (${filter.sektor.length})` : ''}</span>
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-4 sm:p-5 space-y-2.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-[var(--warna-teks-redup)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Cari nama komoditas atau nama produsen"
              value={filter.cari}
              onChange={(e) => ubahFilter('cari', e.target.value)}
              placeholder="Cari nama komoditas, koperasi, atau produsen..."
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 focus:ring-[#14452F]"
            />
            {filter.cari && (
              <button
                type="button"
                onClick={() => ubahFilter('cari', '')}
                aria-label="Hapus kata pencarian"
                className="w-7 h-7 rounded-lg text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-5 relative">
            <MapPin className="w-4 h-4 text-[var(--warna-teks-redup)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Filter lokasi produsen"
              value={filter.lokasi}
              onChange={(e) => ubahFilter('lokasi', e.target.value)}
              placeholder="Filter kota, pelabuhan, atau negara produsen..."
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 focus:ring-[#14452F]"
            />
            {filter.lokasi && (
              <button
                type="button"
                onClick={() => ubahFilter('lokasi', '')}
                aria-label="Hapus filter lokasi produsen"
                className="w-7 h-7 rounded-lg text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <SidebarFilterKatalog
          filter={filter}
          jumlahPerSektor={jumlahPerSektor}
          adaFilterAktif={adaFilterAktif}
          terbukaDiSeluler={sidebarTerbuka}
          onToggleSektor={toggleSektor}
          onPilihSemuaSektor={pilihSemuaSektor}
          onUbahFilter={ubahFilter}
          onReset={aturUlang}
        />

        <div className="md:col-span-8 lg:col-span-9 space-y-5">
          {(filter.sektor.length > 0 || cariBersih || lokasiBersih) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--warna-teks-redup)]">
                Filter aktif:
              </span>
              {cariBersih && (
                <button
                  type="button"
                  onClick={() => ubahFilter('cari', '')}
                  aria-label={`Hapus pencarian ${cariBersih}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[var(--warna-teks)] hover:bg-[var(--warna-permukaan-sekunder)] tombol-halus cursor-pointer"
                >
                  <span>Komoditas: &ldquo;{cariBersih}&rdquo;</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {lokasiBersih && (
                <button
                  type="button"
                  onClick={() => ubahFilter('lokasi', '')}
                  aria-label={`Hapus lokasi ${lokasiBersih}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[var(--warna-teks)] hover:bg-[var(--warna-permukaan-sekunder)] tombol-halus cursor-pointer"
                >
                  <span>Lokasi: &ldquo;{lokasiBersih}&rdquo;</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {filter.sektor.map((sektorAktif) => (
                <button
                  key={sektorAktif}
                  type="button"
                  onClick={() => toggleSektor(sektorAktif)}
                  aria-label={`Hapus filter sektor ${sektorAktif}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#14452F]/25 dark:border-emerald-700 bg-[#14452F]/10 dark:bg-emerald-900/40 text-xs font-semibold text-[#14452F] dark:text-emerald-200 hover:bg-[#14452F]/15 tombol-halus cursor-pointer"
                >
                  <span>{sektorAktif}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}

          <PesanGalat pesan={galat} onCobaLagi={() => muatKatalog(undefined, true)} />

          {tampilkanSkeleton ? (
            <SkeletonKisiProduk jumlah={6} label="Memuat data komoditas dari server..." />
          ) : produkTampil.length === 0 ? (
            <KeadaanKosong
              judul="Komoditas tidak ditemukan"
              deskripsi="Tidak ada hasil panen yang sesuai dengan kategori sektor, kata kunci, atau lokasi produsen saat ini."
              aksiLabel="Reset Filter"
              onAksi={aturUlang}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {produkTampil.map((item) => (
                <KartuProduk key={item.produk_id} produk={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}