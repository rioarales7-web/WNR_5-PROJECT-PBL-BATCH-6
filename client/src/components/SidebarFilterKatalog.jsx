import { Check, RotateCcw } from 'lucide-react';

export const DAFTAR_SEKTOR_KATALOG = [
  { nilai: 'Pertanian', label: 'Pertanian', keterangan: 'Kopi, rempah, beras, palawija' },
  { nilai: 'Perikanan', label: 'Perikanan', keterangan: 'Tuna, udang, ikan tangkap & budidaya' },
  { nilai: 'Peternakan', label: 'Peternakan', keterangan: 'Daging sapi, unggas, olahan ternak' },
];

export default function SidebarFilterKatalog({
  filter,
  jumlahPerSektor,
  adaFilterAktif,
  terbukaDiSeluler,
  onToggleSektor,
  onPilihSemuaSektor,
  onUbahFilter,
  onReset,
}) {
  return (
    <aside
      aria-label="Sidebar filter kategori sektor"
      className={`md:col-span-4 lg:col-span-3 md:sticky md:top-22 rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-5 space-y-6 transition-colors ${
        terbukaDiSeluler ? 'block' : 'hidden md:block'
      }`}
    >
      <div className="flex items-center justify-between border-b border-[var(--warna-garis)] pb-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--warna-teks)]">Filter Kategori</h2>
          <p className="text-[11px] text-[var(--warna-teks-redup)] mt-0.5">
            Pembaruan katalog instan
          </p>
        </div>

        {adaFilterAktif && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-[#ea580c] hover:underline inline-flex items-center gap-1 tombol-halus cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <fieldset className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <legend className="text-xs font-semibold text-[var(--warna-teks-redup)]">
            Sektor Komoditas
          </legend>
          {filter.sektor.length > 0 && (
            <button
              type="button"
              onClick={onPilihSemuaSektor}
              className="text-[11px] font-semibold text-[var(--warna-hijau-tua)] dark:text-emerald-300 hover:underline cursor-pointer"
            >
              Tampilkan semua
            </button>
          )}
        </div>

        <div className="space-y-2">
          {DAFTAR_SEKTOR_KATALOG.map((item) => {
            const tercentang = filter.sektor.includes(item.nilai);
            const jumlah = jumlahPerSektor?.[item.nilai];

            return (
              <label
                key={item.nilai}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none tombol-halus ${
                  tercentang
                    ? 'border-[#14452F] bg-[#14452F]/8 dark:border-emerald-400 dark:bg-emerald-900/35 shadow-xs'
                    : 'border-[var(--warna-garis)]/70 bg-[var(--warna-permukaan-sekunder)]/40 hover:border-[#14452F]/40 dark:hover:border-emerald-700'
                }`}
              >
                <span className="relative mt-0.5 flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    name="sektor"
                    value={item.nilai}
                    checked={tercentang}
                    onChange={() => onToggleSektor(item.nilai)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      tercentang
                        ? 'bg-[#14452F] border-[#14452F] text-white dark:bg-emerald-400 dark:border-emerald-400 dark:text-[#0b1411]'
                        : 'bg-[var(--warna-permukaan)] border-stone-400 dark:border-emerald-700'
                    }`}
                  >
                    {tercentang && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </span>

                <span className="flex-1 min-w-0 leading-tight">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--warna-teks)]">
                      {item.label}
                    </span>
                    {typeof jumlah === 'number' && (
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--warna-permukaan)] border border-[var(--warna-garis)] text-[var(--warna-teks-redup)] angka-tabular">
                        {jumlah}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-[var(--warna-teks-redup)] mt-1">
                    {item.keterangan}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="pt-4 border-t border-[var(--warna-garis)] space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="filter-pasar"
            className="block text-xs font-semibold text-[var(--warna-teks-redup)]"
          >
            Target Pasar
          </label>
          <select
            id="filter-pasar"
            value={filter.pasar}
            onChange={(e) => onUbahFilter('pasar', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 focus:ring-[#14452F]"
          >
            <option value="">Semua Pasar</option>
            <option value="Lokal">Lokal (IDR)</option>
            <option value="Ekspor">Ekspor (USD)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="filter-grade"
            className="block text-xs font-semibold text-[var(--warna-teks-redup)]"
          >
            Grade Kualitas
          </label>
          <input
            id="filter-grade"
            type="text"
            value={filter.grade}
            onChange={(e) => onUbahFilter('grade', e.target.value)}
            placeholder="Mis. Grade A, Sashimi"
            className="w-full h-10 px-3 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 focus:ring-[#14452F]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="filter-harga-max"
            className="block text-xs font-semibold text-[var(--warna-teks-redup)]"
          >
            Batas Harga Maksimal (IDR)
          </label>
          <input
            id="filter-harga-max"
            type="number"
            min="0"
            value={filter.harga_max}
            onChange={(e) => onUbahFilter('harga_max', e.target.value)}
            placeholder="Contoh: 150000"
            className="w-full h-10 px-3 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm text-[var(--warna-teks)] angka-tabular focus:outline-none focus:ring-2 focus:ring-[#14452F]"
          />
        </div>
      </div>
    </aside>
  );
}
