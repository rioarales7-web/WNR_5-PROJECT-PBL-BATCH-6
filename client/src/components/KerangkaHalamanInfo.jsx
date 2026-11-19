import { useEffect } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { DATA_PERUSAHAAN } from '../utils/dataPerusahaan.js';

export default function KerangkaHalamanInfo({
  ikon: Ikon,
  judul,
  ringkasan,
  diperbarui,
  tanpaKotakBantuan = false,
  children,
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const judulSebelumnya = document.title;
    document.title = `${judul} | Agro Maritim`;
    return () => {
      document.title = judulSebelumnya;
    };
  }, [judul]);

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="w-11 h-11 rounded-xl gradasi-maritim flex items-center justify-center text-white shrink-0">
            <Ikon className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102119] dark:text-emerald-50">
              {judul}
            </h1>
            {ringkasan && (
              <p className="text-sm sm:text-base leading-relaxed text-[#53665c] dark:text-emerald-100/75 max-w-3xl">
                {ringkasan}
              </p>
            )}
            {diperbarui && (
              <p className="text-xs text-[#53665c] dark:text-emerald-200/60">
                Terakhir diperbarui {diperbarui}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem] gap-8 items-start">
        <div className="space-y-10 min-w-0">
          {children}
          {!tanpaKotakBantuan && <KotakBantuan />}
        </div>

        <aside className="lg:sticky lg:top-24 space-y-3" aria-label="Halaman bantuan lainnya">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0f5c6e] dark:text-cyan-300">
            Bantuan &amp; Legal
          </h2>
          <nav className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-2">
            <ul className="space-y-0.5">
              {DATA_PERUSAHAAN.bantuanDanLegal.map((item) => (
                <li key={item.tujuan}>
                  <NavLink
                    to={item.tujuan}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-[#14452F]/10 dark:bg-emerald-900/40 font-semibold text-[#14452F] dark:text-emerald-300'
                          : 'text-[#53665c] dark:text-emerald-100/70 hover:bg-stone-100 dark:hover:bg-emerald-950/40'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}

export function BagianInfo({ id, judul, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-judul`} className="scroll-mt-24 space-y-3">
      <h2
        id={`${id}-judul`}
        className="text-lg sm:text-xl font-bold text-[#102119] dark:text-emerald-50"
      >
        {judul}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#53665c] dark:text-emerald-100/80">
        {children}
      </div>
    </section>
  );
}

export function DaftarButir({ butir, bernomor = false }) {
  const Pembungkus = bernomor ? 'ol' : 'ul';
  return (
    <Pembungkus
      className={`space-y-2 pl-5 ${bernomor ? 'list-decimal' : 'list-disc'} marker:text-[#14452F] dark:marker:text-emerald-400`}
    >
      {butir.map((teks, idx) => (
        <li key={idx} className="pl-1">
          {teks}
        </li>
      ))}
    </Pembungkus>
  );
}

export function KartuInfo({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function KotakBantuan() {
  const { kontak } = DATA_PERUSAHAAN;
  return (
    <section
      aria-labelledby="kotak-bantuan-judul"
      className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan-sekunder)] p-6 space-y-4"
    >
      <div className="space-y-1">
        <h2
          id="kotak-bantuan-judul"
          className="text-base font-bold text-[#102119] dark:text-emerald-50"
        >
          Masih ada yang belum jelas?
        </h2>
        <p className="text-sm text-[#53665c] dark:text-emerald-100/75">
          Tim kami melayani {kontak.jamOperasional}.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={kontak.whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#14452F] hover:bg-[#0d3322] px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          WhatsApp {kontak.whatsapp.tampil}
        </a>
        <a
          href={kontak.emailUmum.href}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] hover:bg-stone-50 dark:hover:bg-emerald-950/40 px-4 py-2.5 text-sm font-semibold text-[#102119] dark:text-emerald-50 transition-colors"
        >
          <Mail className="w-4 h-4" aria-hidden="true" />
          {kontak.emailUmum.tampil}
        </a>
      </div>
    </section>
  );
}
