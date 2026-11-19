import { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { KeadaanKosong, PesanGalat } from './KeadaanHalaman.jsx';

export default function BagianFaqBeranda() {
  const { pengguna } = useAuth();
  const [daftarFaq, setDaftarFaq] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [terbukaId, setTerbukaId] = useState(null);

  const muatFaq = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/faq');
      const items = res.faq || [];
      setDaftarFaq(items);
      if (items.length > 0) {
        setTerbukaId((prev) => prev ?? items[0].faq_id);
      }
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatFaq();
  }, [muatFaq]);

  const toggleItem = (faqId) => {
    setTerbukaId((prev) => (prev === faqId ? null : faqId));
  };

  return (
    <section className="space-y-4" aria-labelledby="judul-faq-beranda">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="judul-faq-beranda" className="text-xl font-bold">
            Pertanyaan Umum (FAQ)
          </h2>
          <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
            Panduan pemesanan, pembayaran, verifikasi legalitas, dan pengiriman di Agro Maritim.
          </p>
        </div>

        {pengguna?.role_user === 'Admin' && (
          <Link
            to="/admin?tab=faq"
            className="text-sm font-semibold text-[#14452F] dark:text-emerald-300 hover:underline whitespace-nowrap shrink-0"
          >
            Kelola FAQ di Panel Admin
          </Link>
        )}
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatFaq} />

      {memuat ? (
        <div
          role="status"
          aria-busy="true"
          aria-label="Memuat daftar pertanyaan umum..."
          className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] divide-y divide-stone-200 dark:divide-emerald-900/60"
        >
          <span className="sr-only">Memuat daftar pertanyaan umum...</span>
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} aria-hidden="true" className="p-5 space-y-2">
              <div className="h-3 w-20 rounded bg-stone-200/80 dark:bg-emerald-950/60 motion-safe:animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-emerald-950/80 motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      ) : daftarFaq.length === 0 && !galat ? (
        <KeadaanKosong
          judul="Belum ada pertanyaan umum"
          deskripsi="Admin dapat menambahkan daftar pertanyaan dan jawaban melalui Panel Admin."
        />
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] divide-y divide-stone-200 dark:divide-emerald-900/60">
          {daftarFaq.map((item) => {
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
                  onClick={() => toggleItem(item.faq_id)}
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
                    className={`w-5 h-5 text-[#53665c] dark:text-emerald-200/70 shrink-0 mt-1 transition-transform duration-200 ${
                      terbuka ? 'rotate-180 text-[#14452F] dark:text-emerald-300' : ''
                    }`}
                  />
                </button>

                {terbuka && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={tombolId}
                    className="px-5 pb-5 pt-0 text-sm text-[#53665c] dark:text-emerald-100/80 leading-relaxed"
                  >
                    {item.jawaban}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
