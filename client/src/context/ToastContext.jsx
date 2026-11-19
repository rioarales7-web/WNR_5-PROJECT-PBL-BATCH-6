import { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [daftarToast, setDaftarToast] = useState([]);

  const tutupToast = useCallback((id) => {
    setDaftarToast((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const tampilkanToast = useCallback(
    (pesan, tipe = 'sukses', durasi = 3800) => {
      if (!pesan) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setDaftarToast((prev) => [...prev.slice(-3), { id, pesan, tipe }]);

      if (durasi > 0) {
        setTimeout(() => {
          tutupToast(id);
        }, durasi);
      }
    },
    [tutupToast]
  );

  const toastSukses = useCallback((pesan) => tampilkanToast(pesan, 'sukses'), [tampilkanToast]);
  const toastGalat = useCallback((pesan) => tampilkanToast(pesan, 'galat', 5000), [tampilkanToast]);
  const toastInfo = useCallback((pesan) => tampilkanToast(pesan, 'info'), [tampilkanToast]);

  return (
    <ToastContext.Provider
      value={{ tampilkanToast, toastSukses, toastGalat, toastInfo, tutupToast }}
    >
      {children}

      <div
        aria-live="polite"
        aria-label="Notifikasi sistem"
        className="fixed z-50 bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2.5 pointer-events-none"
      >
        {daftarToast.map((toast) => {
          const adalahGalat = toast.tipe === 'galat';
          const adalahInfo = toast.tipe === 'info';

          return (
            <div
              key={toast.id}
              role={adalahGalat ? 'alert' : 'status'}
              className={`pointer-events-auto rounded-2xl border p-4 shadow-lg flex items-start gap-3 transition-all ${
                adalahGalat
                  ? 'bg-red-50 dark:bg-red-950/95 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                  : adalahInfo
                    ? 'bg-cyan-50 dark:bg-cyan-950/95 border-cyan-200 dark:border-cyan-800 text-cyan-950 dark:text-cyan-100'
                    : 'bg-white dark:bg-[#12201b] border-emerald-200 dark:border-emerald-800 text-[#102119] dark:text-emerald-50'
              }`}
            >
              {adalahGalat ? (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              ) : adalahInfo ? (
                <Info className="w-5 h-5 text-[#0f5c6e] dark:text-cyan-300 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#14452F] dark:text-emerald-300 shrink-0 mt-0.5" />
              )}

              <p className="flex-1 text-sm font-medium leading-snug">{toast.pesan}</p>

              <button
                type="button"
                onClick={() => tutupToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="w-6 h-6 rounded-lg opacity-70 hover:opacity-100 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider.');
  return ctx;
}
