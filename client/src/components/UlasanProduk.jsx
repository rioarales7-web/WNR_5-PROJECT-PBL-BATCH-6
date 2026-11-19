import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { panggilApi } from '../api/klienApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatTanggal, PERAN_PRODUSEN } from '../utils/format.js';
import { PesanGalat } from './KeadaanHalaman.jsx';

const LABEL_RATING = {
  1: 'Sangat Buruk',
  2: 'Kurang Memuaskan',
  3: 'Cukup Baik',
  4: 'Baik & Sesuai Grade',
  5: 'Sangat Memuaskan',
};

function BarisBintang({ nilai, ukuran = 'w-4 h-4' }) {
  return (
    <div className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((angka) => (
        <Star
          key={angka}
          className={`${ukuran} ${
            angka <= Math.round(nilai)
              ? 'fill-amber-400 text-amber-400'
              : 'text-stone-300 dark:text-emerald-900'
          }`}
        />
      ))}
    </div>
  );
}

export default function UlasanProduk({ produkId, onRingkasanBerubah }) {
  const { pengguna } = useAuth();
  const { toastSukses, toastGalat } = useToast();

  const [ringkasan, setRingkasan] = useState({
    rata_rating: 0,
    jumlah_ulasan: 0,
    distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [ulasan, setUlasan] = useState([]);
  const [pesananDapatDiulas, setPesananDapatDiulas] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  const [orderTerpilih, setOrderTerpilih] = useState('');
  const [ratingPilih, setRatingPilih] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [galatForm, setGalatForm] = useState('');
  const [mengirim, setMengirim] = useState(false);

  const muatUlasan = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi(`/produk/${produkId}/ulasan`);
      const ringkasanBaru = res.ringkasan || {
        rata_rating: 0,
        jumlah_ulasan: 0,
        distribusi: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
      setRingkasan(ringkasanBaru);
      setUlasan(res.ulasan || []);
      const daftarOrder = res.pesanan_dapat_diulas || [];
      setPesananDapatDiulas(daftarOrder);
      setOrderTerpilih((prev) => {
        if (prev && daftarOrder.some((o) => String(o.order_id) === String(prev))) {
          return prev;
        }
        return daftarOrder.length > 0 ? String(daftarOrder[0].order_id) : '';
      });
      if (onRingkasanBerubah) {
        onRingkasanBerubah(ringkasanBaru);
      }
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, [produkId, onRingkasanBerubah]);

  useEffect(() => {
    muatUlasan();
  }, [muatUlasan]);

  const adalahPembeli =
    pengguna && !PERAN_PRODUSEN.includes(pengguna.role_user) && pengguna.role_user !== 'Admin';

  const handleKirimUlasan = async (e) => {
    e.preventDefault();
    setGalatForm('');

    if (!orderTerpilih) {
      setGalatForm('Pilih nomor invoice pesanan selesai yang ingin diulas.');
      return;
    }
    const komentarBersih = komentar.trim();
    if (komentarBersih.length < 5) {
      setGalatForm('Tuliskan komentar ulasan minimal 5 karakter.');
      return;
    }

    setMengirim(true);
    try {
      const res = await panggilApi(`/produk/${produkId}/ulasan`, {
        method: 'POST',
        body: {
          order_id: Number(orderTerpilih),
          rating: ratingPilih,
          komentar: komentarBersih,
        },
      });
      const ringkasanBaru = res.ringkasan || ringkasan;
      setRingkasan(ringkasanBaru);
      setUlasan(res.ulasan || []);
      const sisaOrder = res.pesanan_dapat_diulas || [];
      setPesananDapatDiulas(sisaOrder);
      setOrderTerpilih(sisaOrder.length > 0 ? String(sisaOrder[0].order_id) : '');
      setKomentar('');
      setRatingPilih(5);
      if (onRingkasanBerubah) {
        onRingkasanBerubah(ringkasanBaru);
      }
      toastSukses(res.pesan || 'Ulasan produk berhasil dikirim.');
    } catch (err) {
      setGalatForm(err.message);
      toastGalat(err.message);
    } finally {
      setMengirim(false);
    }
  };

  const bintangAktif = ratingHover || ratingPilih;

  return (
    <section
      id="ulasan-produk"
      aria-labelledby="judul-ulasan-produk"
      className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--warna-garis)] pb-4">
        <div className="space-y-1">
          <h2 id="judul-ulasan-produk" className="text-xl font-bold text-[var(--warna-teks)]">
            Ulasan &amp; Penilaian Pembeli
          </h2>
          <p className="text-xs sm:text-sm text-[var(--warna-teks-redup)]">
            Penilaian terverifikasi dari pembeli perusahaan lokal dan importir setelah transaksi
            selesai.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--warna-permukaan-sekunder)] border border-[var(--warna-garis)] text-[var(--warna-teks)] angka-tabular">
          <MessageSquare className="w-3.5 h-3.5 text-[#0f5c6e] dark:text-cyan-300" />
          <span>{ringkasan.jumlah_ulasan} Ulasan</span>
        </span>
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatUlasan} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan-sekunder)]/50 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[84px]">
                <p className="text-4xl font-extrabold text-[#14452F] dark:text-emerald-300 angka-tabular">
                  {ringkasan.jumlah_ulasan > 0 ? ringkasan.rata_rating.toFixed(1) : '0.0'}
                </p>
                <p className="text-[11px] text-[var(--warna-teks-redup)] mt-0.5">dari 5.0</p>
              </div>

              <div className="space-y-1.5">
                <BarisBintang nilai={ringkasan.rata_rating} ukuran="w-5 h-5" />
                <p className="text-xs text-[var(--warna-teks-redup)]">
                  {ringkasan.jumlah_ulasan > 0
                    ? `Berdasarkan ${ringkasan.jumlah_ulasan} ulasan transaksi selesai`
                    : 'Belum ada penilaian untuk komoditas ini'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--warna-garis)]">
              {[5, 4, 3, 2, 1].map((bintang) => {
                const jumlah = Number(ringkasan.distribusi?.[bintang] || 0);
                const persen =
                  ringkasan.jumlah_ulasan > 0
                    ? Math.round((jumlah / ringkasan.jumlah_ulasan) * 100)
                    : 0;
                return (
                  <div key={bintang} className="flex items-center gap-2.5 text-xs">
                    <span className="w-8 font-semibold text-[var(--warna-teks)] inline-flex items-center gap-1 angka-tabular">
                      <span>{bintang}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--warna-garis)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${persen}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[var(--warna-teks-redup)] angka-tabular">
                      {jumlah}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {adalahPembeli && (
            <div className="rounded-2xl border border-[var(--warna-garis)] p-5 space-y-4">
              <h3 className="text-base font-bold text-[var(--warna-teks)]">
                Tulis Ulasan Komoditas
              </h3>

              {pesananDapatDiulas.length > 0 ? (
                <form onSubmit={handleKirimUlasan} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="ulasan-invoice"
                      className="block text-xs font-semibold text-[var(--warna-teks-redup)]"
                    >
                      Transaksi Selesai yang Diulas
                    </label>
                    <select
                      id="ulasan-invoice"
                      value={orderTerpilih}
                      onChange={(e) => setOrderTerpilih(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                    >
                      {pesananDapatDiulas.map((ord) => (
                        <option key={ord.order_id} value={ord.order_id}>
                          {ord.nomor_invoice} ({Number(ord.kuantitas).toLocaleString('id-ID')}{' '}
                          {ord.satuan})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold text-[var(--warna-teks-redup)]">
                      Rating Kualitas &amp; Pengiriman
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((nilai) => (
                          <button
                            key={nilai}
                            type="button"
                            onClick={() => setRatingPilih(nilai)}
                            onMouseEnter={() => setRatingHover(nilai)}
                            onMouseLeave={() => setRatingHover(0)}
                            aria-label={`Beri rating ${nilai} bintang`}
                            className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                nilai <= bintangAktif
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-emerald-900'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-[#14452F] dark:text-emerald-300">
                        {LABEL_RATING[bintangAktif]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="ulasan-komentar"
                        className="block text-xs font-semibold text-[var(--warna-teks-redup)]"
                      >
                        Komentar Ulasan
                      </label>
                      <span className="text-[11px] text-[var(--warna-teks-redup)] angka-tabular">
                        {komentar.trim().length}/1000
                      </span>
                    </div>
                    <textarea
                      id="ulasan-komentar"
                      rows={3}
                      maxLength={1000}
                      value={komentar}
                      onChange={(e) => {
                        setKomentar(e.target.value);
                        if (galatForm) setGalatForm('');
                      }}
                      placeholder="Ceritakan kesesuaian grade kualitas, kesegaran komoditas, pengemasan, dan ketepatan pengiriman..."
                      className="w-full p-3 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                    />
                  </div>

                  {galatForm && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{galatForm}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={mengirim}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 tombol-halus cursor-pointer"
                  >
                    {mengirim ? 'Mengirim Ulasan...' : 'Kirim Ulasan'}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-[var(--warna-teks-redup)] leading-relaxed">
                  Ulasan dapat ditulis setelah Anda membeli komoditas ini dan status pesanan telah
                  mencapai <strong>Selesai</strong>.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          {memuat ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--warna-garis)] p-4 space-y-2.5 motion-safe:animate-pulse"
                >
                  <div className="h-4 w-40 rounded bg-stone-200 dark:bg-emerald-950/60" />
                  <div className="h-3.5 w-full rounded bg-stone-200/80 dark:bg-emerald-950/40" />
                  <div className="h-3.5 w-2/3 rounded bg-stone-200/80 dark:bg-emerald-950/40" />
                </div>
              ))}
            </div>
          ) : ulasan.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--warna-garis)] p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-[var(--warna-teks-redup)]/60" />
              <p className="text-sm font-semibold text-[var(--warna-teks)]">
                Belum ada ulasan pembeli
              </p>
              <p className="text-xs text-[var(--warna-teks-redup)] max-w-sm mx-auto">
                Jadilah pembeli pertama yang memberikan penilaian setelah pesanan komoditas ini
                selesai dikirim.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ulasan.map((item) => (
                <article
                  key={item.review_id}
                  className="rounded-2xl border border-[var(--warna-garis)] p-4 sm:p-5 space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[var(--warna-teks)]">
                          {item.nama_perusahaan || item.nama_pembeli}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Transaksi Terverifikasi</span>
                        </span>
                      </div>
                      <p className="text-xs text-[var(--warna-teks-redup)]">
                        {item.nama_pembeli}
                        {item.kota_pembeli ? ` · ${item.kota_pembeli}` : ''} · {item.nomor_invoice}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <BarisBintang nilai={item.rating} ukuran="w-3.5 h-3.5" />
                      <p className="text-[11px] text-[var(--warna-teks-redup)]">
                        {formatTanggal(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--warna-teks)] leading-relaxed">
                    {item.komentar}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
