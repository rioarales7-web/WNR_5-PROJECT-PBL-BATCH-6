import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRupiah, formatUsd } from '../utils/format.js';
import GambarKomoditas from './GambarKomoditas.jsx';

export default function KartuProduk({ produk }) {
  const gambarSrc =
    produk.url_gambar ||
    (produk.gambar && produk.gambar.startsWith('/uploads/')
      ? produk.gambar
      : `/img/${produk.gambar || `${produk.produk_id}.jpg`}`);

  const rataRating = Number(produk.rata_rating || 0);
  const jumlahUlasan = Number(produk.jumlah_ulasan || 0);

  return (
    <Link
      to={`/produk/${produk.produk_id}`}
      className="group block rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-emerald-950/50">
        <GambarKomoditas
          src={gambarSrc}
          alt={produk.nama_komoditas}
          sektor={produk.sektor}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--warna-teks-redup)] truncate">
            <span>{produk.sektor}</span>
            <span aria-hidden="true">·</span>
            <span>{produk.grade_kualitas}</span>
            {produk.kota_produsen && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{produk.kota_produsen}</span>
              </>
            )}
          </div>

          <div
            aria-label={
              jumlahUlasan > 0
                ? `Rating ${rataRating.toFixed(1)} dari ${jumlahUlasan} ulasan`
                : 'Belum ada ulasan'
            }
            className="inline-flex items-center gap-1 text-xs font-semibold shrink-0 angka-tabular"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                jumlahUlasan > 0
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-[var(--warna-teks-redup)]/50'
              }`}
            />
            {jumlahUlasan > 0 ? (
              <span className="text-[var(--warna-teks)]">
                {rataRating.toFixed(1)}{' '}
                <span className="font-normal text-[var(--warna-teks-redup)]">({jumlahUlasan})</span>
              </span>
            ) : (
              <span className="font-normal text-[var(--warna-teks-redup)]">Baru</span>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-[var(--warna-teks)] line-clamp-1">
          {produk.nama_komoditas}
        </h3>

        <div className="pt-1 flex items-baseline justify-between gap-2">
          <div>
            <p className="text-base font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
              {formatRupiah(produk.harga_idr)}
              <span className="text-xs font-normal text-[var(--warna-teks-redup)]">
                /{produk.satuan}
              </span>
            </p>
            <p className="text-xs text-[#0f5c6e] dark:text-cyan-300 angka-tabular">
              {formatUsd(produk.harga_usd)}/{produk.satuan}
            </p>
          </div>

          <span className="text-xs font-medium text-[var(--warna-teks-redup)] angka-tabular shrink-0">
            Stok {Number(produk.stok_tersedia).toLocaleString('id-ID')} {produk.satuan}
          </span>
        </div>

        {produk.nama_produsen && (
          <p className="pt-2 border-t border-[var(--warna-garis)]/70 text-xs text-[var(--warna-teks-redup)] truncate">
            Produsen: {produk.nama_produsen}
          </p>
        )}
      </div>
    </Link>
  );
}
