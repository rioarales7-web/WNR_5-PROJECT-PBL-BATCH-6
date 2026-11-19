import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, ShoppingBag, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import GambarKomoditas from '../components/GambarKomoditas.jsx';
import { MemuatHalaman, PesanGalat } from '../components/KeadaanHalaman.jsx';
import UlasanProduk from '../components/UlasanProduk.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useKeranjang } from '../context/KeranjangContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatRupiah, formatUsd, PERAN_PRODUSEN } from '../utils/format.js';

export default function HalamanDetailProduk() {
  const { id } = useParams();
  const { pengguna } = useAuth();
  const { tambahItem } = useKeranjang();
  const { toastSukses, toastGalat } = useToast();
  const navigasi = useNavigate();

  const [produk, setProduk] = useState(null);
  const [kuantitas, setKuantitas] = useState(10);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [pesanSukses, setPesanSukses] = useState('');

  const muatDetail = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi(`/produk/${id}`);
      setProduk(res.produk);
      setKuantitas(Math.min(10, Number(res.produk.stok_tersedia) || 1));
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, [id]);

  useEffect(() => {
    muatDetail();
  }, [muatDetail]);

  const perbaruiRingkasanRating = useCallback((ringkasanBaru) => {
    setProduk((prev) =>
      prev
        ? {
            ...prev,
            rata_rating: ringkasanBaru.rata_rating,
            jumlah_ulasan: ringkasanBaru.jumlah_ulasan,
          }
        : prev
    );
  }, []);

  if (memuat) return <MemuatHalaman teks="Memuat detail komoditas..." />;
  if (galat) return <PesanGalat pesan={galat} onCobaLagi={muatDetail} />;
  if (!produk) return null;

  const bolehPesan =
    !pengguna || (!PERAN_PRODUSEN.includes(pengguna.role_user) && pengguna.role_user !== 'Admin');

  const rataRating = Number(produk.rata_rating || 0);
  const jumlahUlasan = Number(produk.jumlah_ulasan || 0);

  const handlePesan = (langsungCheckout) => {
    if (!pengguna) {
      navigasi('/masuk');
      return;
    }
    if (!Number.isFinite(kuantitas) || kuantitas < 1) {
      toastGalat('Jumlah pesanan minimal 1 unit.');
      return;
    }
    if (kuantitas > Number(produk.stok_tersedia)) {
      toastGalat('Jumlah pesanan melebihi stok tersedia.');
      return;
    }
    tambahItem(produk, kuantitas);
    toastSukses(`${produk.nama_komoditas} (${kuantitas} ${produk.satuan}) masuk keranjang.`);
    if (langsungCheckout) {
      navigasi('/keranjang');
    } else {
      setPesanSukses('Komoditas ditambahkan ke keranjang.');
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to="/katalog"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] tombol-halus"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--warna-garis)] bg-[var(--warna-permukaan)]">
            <GambarKomoditas
              src={produk.url_gambar}
              alt={produk.nama_komoditas}
              sektor={produk.sektor}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 sm:p-7 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-[var(--warna-teks-redup)]">
                {produk.sektor} · {produk.grade_kualitas}
              </p>

              <a
                href="#ulasan-produk"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--warna-teks)] hover:underline angka-tabular"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    jumlahUlasan > 0
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-[var(--warna-teks-redup)]/50'
                  }`}
                />
                <span>
                  {jumlahUlasan > 0
                    ? `${rataRating.toFixed(1)} (${jumlahUlasan} ulasan)`
                    : 'Belum ada ulasan'}
                </span>
              </a>
            </div>
            <h1 className="text-2xl font-bold text-[var(--warna-teks)]">{produk.nama_komoditas}</h1>
          </div>

          <div className="py-4 border-y border-[var(--warna-garis)] space-y-1">
            <p className="text-2xl font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
              {formatRupiah(produk.harga_idr)}
              <span className="text-sm font-normal text-[var(--warna-teks-redup)]">
                {' '}
                / {produk.satuan}
              </span>
            </p>
            <p className="text-sm font-medium text-[#0f5c6e] dark:text-cyan-300 angka-tabular">
              {formatUsd(produk.harga_usd)} / {produk.satuan} (Referensi Ekspor)
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-[var(--warna-teks-redup)]">Stok Tersedia</dt>
            <dd className="font-semibold text-right angka-tabular">
              {Number(produk.stok_tersedia).toLocaleString('id-ID')} {produk.satuan}
            </dd>
            <dt className="text-[var(--warna-teks-redup)]">Produsen</dt>
            <dd className="font-semibold text-right">{produk.nama_produsen}</dd>
            <dt className="text-[var(--warna-teks-redup)]">Asal Wilayah</dt>
            <dd className="font-medium text-right inline-flex items-center justify-end gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{produk.kota_produsen || produk.negara_produsen}</span>
            </dd>
            <dt className="text-[var(--warna-teks-redup)]">Legalitas Produsen</dt>
            <dd className="font-medium text-right">
              {produk.status_verifikasi_legal || 'Menunggu'}
            </dd>
          </dl>

          {pesanSukses && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pesanSukses}</span>
            </div>
          )}

          {bolehPesan ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="qty" className="text-sm font-medium">
                  Jumlah Pesanan ({produk.satuan})
                </label>
                <input
                  id="qty"
                  type="number"
                  min="1"
                  max={Number(produk.stok_tersedia)}
                  value={kuantitas}
                  onChange={(e) => setKuantitas(Number(e.target.value))}
                  className="w-32 h-11 px-3 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm text-right font-semibold angka-tabular"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={Number(produk.stok_tersedia) <= 0}
                  onClick={() => handlePesan(false)}
                  className="h-11 px-4 rounded-xl border border-[#14452F] dark:border-emerald-400 text-sm font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-[#14452F]/5 tombol-halus inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Masuk Keranjang</span>
                </button>
                <button
                  type="button"
                  disabled={Number(produk.stok_tersedia) <= 0}
                  onClick={() => handlePesan(true)}
                  className="h-11 px-4 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] tombol-halus cursor-pointer disabled:opacity-50"
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--warna-teks-redup)] pt-2">
              Anda masuk sebagai {pengguna.role_user}. Hanya akun Pembeli yang dapat membuat
              pesanan.
            </p>
          )}
        </div>
      </div>

      <UlasanProduk produkId={produk.produk_id} onRingkasanBerubah={perbaruiRingkasanRating} />
    </div>
  );
}
