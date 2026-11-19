import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sprout } from 'lucide-react';

export const KOMODITAS_UNGGULAN_SLIDE = [
  {
    id: 'kopi-gayo',
    gambar: '/img/1.jpg',
    sektor: 'Pertanian',
    grade: 'Grade 1 Ekspor',
    asal: 'Takengon, Aceh',
    judul: 'Biji Kopi Arabika Gayo Washed',
    deskripsi:
      'Biji kopi arabika pilihan dataran tinggi Gayo dengan kadar air terukur untuk industri roastery nasional dan pasar ekspor.',
  },
  {
    id: 'tuna-yellowfin',
    gambar: '/img/2.jpg',
    sektor: 'Perikanan',
    grade: 'Sashimi Grade',
    asal: 'Bitung, Sulawesi Utara',
    judul: 'Tuna Sirip Kuning (Yellowfin Loin)',
    deskripsi:
      'Hasil tangkapan nelayan laut dalam yang diproses dengan rantai dingin standar pelabuhan ekspor dan kontainer reefer.',
  },
  {
    id: 'udang-vaname',
    gambar: '/img/3.jpg',
    sektor: 'Perikanan',
    grade: 'Size 30-40 Ekspor',
    asal: 'Makassar, Sulawesi Selatan',
    judul: 'Udang Vaname Segar Beku',
    deskripsi:
      'Panen tambak terverifikasi dengan penyortiran ukuran presisi untuk distributor pangan dalam negeri dan importir mancanegara.',
  },
  {
    id: 'daging-sapi',
    gambar: '/img/4.jpg',
    sektor: 'Peternakan',
    grade: 'Grade A Karkas Segar',
    asal: 'Boyolali, Jawa Tengah',
    judul: 'Daging Sapi Potong Segar',
    deskripsi:
      'Pasokan daging sapi segar dari sentra peternakan rakyat dengan kontrol kesehatan hewan dan distribusi berpendingin.',
  },
  {
    id: 'lada-pala',
    gambar: '/img/5.jpg',
    sektor: 'Pertanian',
    grade: 'Kering Mutu Ekspor',
    asal: 'Lampung & Kepulauan Banda',
    judul: 'Lada Hitam & Pala Banda Kering',
    deskripsi:
      'Rempah unggulan Nusantara hasil pengeringan alami petani lokal dengan aroma dan kadar minyak atsiri terjaga.',
  },
];

function formatNomorSlide(angka) {
  return String(angka).padStart(2, '0');
}

export default function SliderKomoditasUnggulan({
  slides = KOMODITAS_UNGGULAN_SLIDE,
  intervalMs = 4500,
  varian = 'pembuka',
  onAksiSlide = null,
  labelAksiSlide = null,
  children = null,
}) {
  const [indeksAktif, setIndeksAktif] = useState(0);
  const [dijeda, setDijeda] = useState(false);
  const [berhentiManual, setBerhentiManual] = useState(false);
  const [gambarGagal, setGambarGagal] = useState({});

  const totalSlide = slides.length;
  const adalahKatalog = varian === 'katalog';

  const keBerikutnya = useCallback(() => {
    setIndeksAktif((prev) => (prev + 1) % totalSlide);
  }, [totalSlide]);

  const keSebelumnya = useCallback(() => {
    setIndeksAktif((prev) => (prev - 1 + totalSlide) % totalSlide);
  }, [totalSlide]);

  useEffect(() => {
    if (dijeda || berhentiManual || totalSlide <= 1) return undefined;
    const timer = setInterval(keBerikutnya, intervalMs);
    return () => clearInterval(timer);
  }, [dijeda, berhentiManual, intervalMs, keBerikutnya, totalSlide]);

  const slideAktif = slides[indeksAktif] || slides[0];

  if (!slideAktif) return null;

  const teksTombolKatalog =
    typeof labelAksiSlide === 'function'
      ? labelAksiSlide(slideAktif)
      : slideAktif.aksiLabel || `Lihat Sektor ${slideAktif.sektor}`;

  const bilahKontrol = (
    <div className="rounded-2xl bg-[#071811]/75 backdrop-blur-md border border-white/15 px-3.5 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
      <div
        className="flex items-center gap-2.5 overflow-x-auto px-1.5 py-1.5"
        role="tablist"
        aria-label="Pilih foto komoditas unggulan"
      >
        {slides.map((slide, idx) => {
          const aktif = idx === indeksAktif;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={aktif}
              aria-label={`Tampilkan ${slide.judul}`}
              onClick={() => setIndeksAktif(idx)}
              className={`group relative w-14 sm:w-16 aspect-[4/3] rounded-lg overflow-hidden shrink-0 tombol-halus cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                aktif
                  ? 'ring-2 ring-[#ea580c] ring-offset-2 ring-offset-[#071811] opacity-100'
                  : 'border border-white/20 opacity-60 hover:opacity-100 hover:-translate-y-0.5'
              }`}
            >
              {gambarGagal[slide.id] ? (
                <div className="w-full h-full bg-[#14452F] flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-emerald-200/60" />
                </div>
              ) : (
                <img
                  src={slide.gambar}
                  alt={slide.judul}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 h-1 transition-opacity duration-300 ${
                  aktif
                    ? 'bg-[#ea580c] opacity-100'
                    : 'bg-white/40 opacity-0 group-hover:opacity-60'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <span className="font-mono text-xs font-medium text-emerald-100/90 angka-tabular tracking-wider px-1">
          {formatNomorSlide(indeksAktif + 1)} / {formatNomorSlide(totalSlide)}
        </span>

        <span aria-hidden="true" className="h-5 w-px bg-white/15" />

        <div className="inline-flex items-center rounded-xl bg-white/10 border border-white/15 p-1 gap-0.5">
          <button
            type="button"
            onClick={() => setBerhentiManual((v) => !v)}
            aria-label={berhentiManual ? 'Putar slide otomatis' : 'Jeda slide otomatis'}
            title={berhentiManual ? 'Putar otomatis' : 'Jeda slide'}
            className="w-8 h-8 rounded-lg text-white/90 hover:text-white hover:bg-white/15 flex items-center justify-center tombol-halus cursor-pointer"
          >
            {berhentiManual ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={keSebelumnya}
            aria-label="Slide sebelumnya"
            title="Sebelumnya"
            className="w-8 h-8 rounded-lg text-white/90 hover:text-white hover:bg-white/15 flex items-center justify-center tombol-halus cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={keBerikutnya}
            aria-label="Slide berikutnya"
            title="Berikutnya"
            className="w-8 h-8 rounded-lg text-white/90 hover:text-white hover:bg-white/15 flex items-center justify-center tombol-halus cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={
        adalahKatalog ? 'Sorotan Sektor Katalog Agro Maritim' : 'Komoditas Unggulan Agro Maritim'
      }
      onMouseEnter={() => setDijeda(true)}
      onMouseLeave={() => setDijeda(false)}
      onFocusCapture={() => setDijeda(true)}
      onBlurCapture={() => setDijeda(false)}
      className={
        adalahKatalog
          ? 'relative w-full min-h-[340px] sm:min-h-[380px] lg:min-h-[410px] rounded-3xl overflow-hidden border border-[var(--warna-garis)] bg-[#0c261b] text-white flex items-end shadow-lg'
          : 'relative w-full min-h-[calc(100vh-4rem)] overflow-hidden bg-[#0c261b] text-white flex items-center'
      }
    >
      <div className="absolute inset-0">
        {slides.map((slide, idx) => {
          const aktif = idx === indeksAktif;
          const gagal = Boolean(gambarGagal[slide.id]);
          return (
            <div
              key={slide.id}
              aria-hidden={!aktif}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`absolute inset-0 motion-safe:transition-[opacity,transform] motion-safe:duration-1000 will-change-[opacity,transform] ${
                aktif ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.06] pointer-events-none'
              }`}
            >
              {gagal ? (
                <div className="w-full h-full gradasi-maritim flex items-center justify-center">
                  <Sprout className="w-20 h-20 text-emerald-200/35" />
                </div>
              ) : (
                <img
                  src={slide.gambar}
                  alt={`${slide.judul} — ${slide.sektor}`}
                  referrerPolicy="no-referrer"
                  onError={() => setGambarGagal((prev) => ({ ...prev, [slide.id]: true }))}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-r from-[#071811]/92 via-[#071811]/70 to-[#071811]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071811]/88 via-[#071811]/20 to-[#071811]/30" />
      </div>

      {adalahKatalog ? (
        <div className="relative z-10 w-full px-5 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div key={slideAktif.id} className="space-y-2.5 max-w-2xl animasi-teks-slide">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-emerald-200">
                <span>Sorotan Katalog</span>
                <span aria-hidden="true">·</span>
                <span>{slideAktif.sektor}</span>
                <span aria-hidden="true">·</span>
                <span>{slideAktif.grade}</span>
                <span aria-hidden="true">·</span>
                <span>{slideAktif.asal}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white text-balance">
                {slideAktif.judul}
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                {slideAktif.deskripsi}
              </p>
            </div>

            {onAksiSlide && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => onAksiSlide(slideAktif)}
                  className="h-11 px-5 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] inline-flex items-center gap-2 tombol-halus cursor-pointer whitespace-nowrap shadow-md"
                >
                  <span>{teksTombolKatalog}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="max-w-3xl">{bilahKontrol}</div>
        </div>
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-2.5 max-w-xl">
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-300">
                  Agro Maritim Nusantara
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] tracking-tight text-white text-balance">
                  Selamat Datang di Agro Maritim
                </h1>
                <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed">
                  Platform niaga hasil panen pertanian, perikanan, dan peternakan Indonesia untuk
                  pasar nasional maupun ekspor.
                </p>
              </div>

              <div className="pt-6 border-t border-white/15 space-y-5 max-w-2xl">
                <div key={slideAktif.id} className="space-y-2 animasi-teks-slide">
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-emerald-200">
                    <span>Komoditas Unggulan</span>
                    <span aria-hidden="true">·</span>
                    <span>{slideAktif.sektor}</span>
                    <span aria-hidden="true">·</span>
                    <span>{slideAktif.grade}</span>
                    <span aria-hidden="true">·</span>
                    <span>{slideAktif.asal}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold leading-snug text-white text-balance">
                    {slideAktif.judul}
                  </h2>

                  <p className="text-sm text-emerald-100/85 leading-relaxed">
                    {slideAktif.deskripsi}
                  </p>
                </div>

                {bilahKontrol}
              </div>
            </div>

            {children && <div className="lg:col-span-5">{children}</div>}
          </div>
        </div>
      )}
    </section>
  );
}
