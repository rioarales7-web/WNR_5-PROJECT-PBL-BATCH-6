import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function KotakPencarian() {
  const navigasi = useNavigate();
  const [params] = useSearchParams();
  const [kata, setKata] = useState(params.get('cari') || '');

  // ikut berubah kalau parameter di URL berubah (misalnya filter direset)
  useEffect(() => {
    setKata(params.get('cari') || '');
  }, [params]);

  const kirim = (e) => {
    e.preventDefault();
    const bersih = kata.trim();
    navigasi(bersih ? `/katalog?cari=${encodeURIComponent(bersih)}` : '/katalog');
  };

  return (
    <form onSubmit={kirim} role="search" className="relative hidden lg:block">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--warna-teks-redup)] pointer-events-none" />
      <input
        type="text"
        value={kata}
        onChange={(e) => setKata(e.target.value)}
        placeholder="Cari komoditas"
        aria-label="Cari komoditas"
        className="h-10 w-44 focus:w-60 transition-all rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] pl-9 pr-8 text-sm text-[var(--warna-teks)] placeholder:text-[var(--warna-teks-redup)] outline-none focus:border-[#14452F] dark:focus:border-emerald-300"
      />
      {kata && (
        <button
          type="button"
          onClick={() => setKata('')}
          aria-label="Hapus kata pencarian"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}