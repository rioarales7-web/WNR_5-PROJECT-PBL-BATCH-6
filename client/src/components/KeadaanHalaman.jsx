import { AlertCircle, Inbox } from 'lucide-react';

export function MemuatHalaman({ teks = 'Memuat data...' }) {
  return (
    <div className="space-y-4 py-8" aria-busy="true" aria-label={teks}>
      <div className="h-8 w-56 rounded-xl bg-stone-200 dark:bg-emerald-950/60 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-56 rounded-2xl bg-stone-200/80 dark:bg-emerald-950/40 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function KeadaanKosong({ judul, deskripsi, aksiLabel, onAksi }) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-[#14452F]/10 dark:bg-emerald-900/40 flex items-center justify-center text-[#14452F] dark:text-emerald-300 mb-4">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#102119] dark:text-emerald-50">{judul}</h3>
      <p className="mt-1.5 text-sm text-[#53665c] dark:text-emerald-200/70 max-w-md mx-auto">
        {deskripsi}
      </p>
      {aksiLabel && onAksi && (
        <button
          type="button"
          onClick={onAksi}
          className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] transition-colors cursor-pointer"
        >
          {aksiLabel}
        </button>
      )}
    </div>
  );
}

export function PesanGalat({ pesan, onCobaLagi }) {
  if (!pesan) return null;
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 flex items-start gap-3 text-red-900 dark:text-red-200"
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
      <div className="flex-1 text-sm leading-relaxed">{pesan}</div>
      {onCobaLagi && (
        <button
          type="button"
          onClick={onCobaLagi}
          className="text-xs font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
