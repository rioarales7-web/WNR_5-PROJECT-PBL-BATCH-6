import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, CircleHelp, Search } from 'lucide-react';
import { panggilApi } from '../api/klienApi.js';
import KerangkaHalamanInfo from '../components/KerangkaHalamanInfo.jsx';
import { KeadaanKosong, PesanGalat } from '../components/KeadaanHalaman.jsx';

export default function HalamanFaq() {
  const [daftarFaq, setDaftarFaq] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [kata, setKata] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [terbukaId, setTerbukaId] = useState(null);

  const muatFaq = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/faq');
      setDaftarFaq(res.faq || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatFaq();
  }, [muatFaq]);

  const daftarKategori = useMemo(() => {
    const unik = [];
    daftarFaq.forEach((item) => {
      if (!unik.includes(item.kategori)) unik.push(item.kategori);
    });
    return ['Semua', ...unik];
  }, [daftarFaq]);

  const hasil = useMemo(() => {
    const kunci = kata.trim().toLowerCase();
    return daftarFaq.filter((item) => {
      if (kategoriAktif !== 'Semua' && item.kategori !== kategoriAktif) return false;
      if (!kunci) return true;
      return (
        item.pertanyaan.toLowerCase().includes(kunci) || item.jawaban.toLowerCase().includes(kunci)
      );
    });
  }, [daftarFaq, kata, kategoriAktif]);

  return (
    <KerangkaHalamanInfo
      ikon={CircleHelp}
      judul="Pertanyaan Umum (FAQ)"
      ringkasan="Jawaban singkat seputar pemesanan, pembayaran, pengiriman ekspor, dan pendaftaran produsen."
    >
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="cari-faq" className="sr-only">
            Cari pertanyaan
          </label>
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#53665c] dark:text-emerald-200/60 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="cari-faq"
            type="search"
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Cari, misalnya: DP, Incoterms, NPWP"
            className="w-full rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] pl-10 pr-4 py-2.5 text-sm text-[var(--warna-teks)] placeholder:text-[#53665c]/70 focus:outline-none focus:border-[#14452F] dark:focus:border-emerald-400"
          />
        </div>

        {daftarKategori.length > 2 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
            {daftarKategori.map((nama) => (
              <button
                key={nama}
                type="button"
                onClick={() => setKategoriAktif(nama)}
                aria-pressed={kategoriAktif === nama}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                  kategoriAktif === nama
                    ? 'bg-[#14452F] border-[#14452F] text-white'
                    : 'bg-[var(--warna-permukaan)] border-[var(--warna-garis)] text-[#53665c] dark:text-emerald-100/75 hover:border-[#14452F]'
                }`}
              >
                {nama}
              </button>
            ))}
          </div>
        )}
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatFaq} />

      {memuat ? (
        <div
          role="status"
          aria-busy="true"
          className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] divide-y divide-stone-200 dark:divide-emerald-900/60"
        >
          <span className="sr-only">Memuat daftar pertanyaan...</span>
          {[0, 1, 2, 3, 4].map((idx) => (
            <div key={idx} aria-hidden="true" className="p-5 space-y-2">
              <div className="h-3 w-20 rounded bg-stone-200/80 dark:bg-emerald-950/60 motion-safe:animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-emerald-950/80 motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      ) : hasil.length === 0 && !galat ? (
        <KeadaanKosong
          judul={daftarFaq.length === 0 ? 'Belum ada pertanyaan umum' : 'Tidak ada yang cocok'}
          deskripsi={
            daftarFaq.length === 0
              ? 'Daftar pertanyaan sedang disiapkan. Silakan hubungi tim kami lewat WhatsApp atau email.'
              : 'Coba kata kunci lain atau pilih kategori Semua.'
          }
        />
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] divide-y divide-stone-200 dark:divide-emerald-900/60">
          {hasil.map((item) => {
            const terbuka = terbukaId === item.faq_id;
            const panelId = `faq-panel-${item.faq_id}`;
            const tombolId = `faq-tombol-${item.faq_id}`;

            return (
              <div key={item.faq_id}>
                <button
                  id={tombolId}
                  type="button"
                  aria-expanded={terbuka}
                  aria-controls={panelId}
                  onClick={() => setTerbukaId(terbuka ? null : item.faq_id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-emerald-950/25 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#0f5c6e] dark:text-cyan-300">
                      {item.kategori}
                    </p>
                    <h3 className="text-sm sm:text-base font-semibold text-[#102119] dark:text-emerald-50">
                      {item.pertanyaan}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 mt-1 transition-transform duration-200 ${
                      terbuka
                        ? 'rotate-180 text-[#14452F] dark:text-emerald-300'
                        : 'text-[#53665c] dark:text-emerald-200/70'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {terbuka && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={tombolId}
                    className="px-5 pb-5 text-sm text-[#53665c] dark:text-emerald-100/80 leading-relaxed"
                  >
                    {item.jawaban}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </KerangkaHalamanInfo>
  );
}
