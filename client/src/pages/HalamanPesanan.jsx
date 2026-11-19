import { useCallback, useEffect, useState } from 'react';
import { Check, CreditCard, Download, Ship, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import { KeadaanKosong, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { SkeletonDaftarBaris } from '../components/SkeletonProduk.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { unduhCsvLokal } from '../utils/eksporCsv.js';
import {
  formatRupiah,
  formatTanggal,
  labelStatusOrder,
  labelStatusPengiriman,
  PERAN_PEMBELI,
} from '../utils/format.js';

const URUTAN_PENGIRIMAN = [
  'Persiapan_Dokumen',
  'Muat_Kargo',
  'Bea_Cukai',
  'Dalam_Perjalanan',
  'Tiba_Di_Tujuan',
];

export default function HalamanPesanan() {
  const { pengguna } = useAuth();
  const { toastSukses } = useToast();
  const [orders, setOrders] = useState([]);
  const [terbuka, setTerbuka] = useState(null);
  const [detailPeta, setDetailPeta] = useState({});
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  const muatPesanan = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/order');
      setOrders(res.orders || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatPesanan();
  }, [muatPesanan]);

  const bukaDetail = async (orderId) => {
    if (terbuka === orderId) {
      setTerbuka(null);
      return;
    }
    setTerbuka(orderId);
    if (!detailPeta[orderId]) {
      try {
        const res = await panggilApi(`/order/${orderId}`);
        setDetailPeta((prev) => ({ ...prev, [orderId]: res.order }));
      } catch (err) {
        setGalat(err.message);
      }
    }
  };

  const eksporPesananCsv = () => {
    if (orders.length === 0) return;
    const header = [
      'Nomor Invoice',
      'Tanggal Order',
      'Tipe Pasar',
      'Incoterms',
      'Total Tagihan (IDR)',
      'Mata Uang',
      'Status Order',
      'Status Pengiriman',
      'Pelabuhan Tujuan',
    ];
    const baris = orders.map((o) => [
      o.nomor_invoice,
      o.tanggal_order ? String(o.tanggal_order).slice(0, 10) : '',
      o.tipe_pasar,
      o.incoterms,
      o.total_tagihan_idr,
      o.mata_uang || 'IDR',
      labelStatusOrder(o.status_order),
      labelStatusPengiriman(
        o.status_pengiriman || o.pengiriman?.status_pengiriman || 'Persiapan_Dokumen'
      ),
      o.pelabuhan_tujuan || o.pengiriman?.pelabuhan_tujuan || '-',
    ]);
    unduhCsvLokal(
      `daftar-pesanan-agro-maritim-${new Date().toISOString().slice(0, 10)}.csv`,
      header,
      baris
    );
    toastSukses(`${orders.length} data pesanan diekspor ke CSV.`);
  };

  const adalahPembeli = pengguna && PERAN_PEMBELI.includes(pengguna.role_user);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pesanan &amp; Pelacakan Pengiriman</h1>
          <p className="text-sm text-[var(--warna-teks-redup)]">
            Pantau status kontrak, dokumen ekspor/lokal, dan garis waktu perjalanan kargo Anda.
          </p>
        </div>

        <button
          type="button"
          disabled={memuat || orders.length === 0}
          onClick={eksporPesananCsv}
          className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatPesanan} />

      {memuat ? (
        <SkeletonDaftarBaris jumlah={4} label="Memuat daftar pesanan..." />
      ) : orders.length === 0 ? (
        <KeadaanKosong
          judul="Belum ada pesanan"
          deskripsi="Pesanan yang dibuat atau diterima akan tampil lengkap dengan pelacakan logistiknya."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const detail = detailPeta[o.order_id];
            const pg = detail?.pengiriman || o;
            const posisiTahap = URUTAN_PENGIRIMAN.indexOf(
              pg.status_pengiriman || 'Persiapan_Dokumen'
            );

            return (
              <div
                key={o.order_id}
                className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] overflow-hidden"
              >
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#53665c] dark:text-emerald-200/75">
                      <span className="font-mono font-semibold text-[#102119] dark:text-emerald-100">
                        {o.nomor_invoice}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatTanggal(o.tanggal_order)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {o.tipe_pasar} ({o.incoterms.replace('_', ' ')})
                      </span>
                    </div>
                    <p className="text-base font-bold angka-tabular">
                      {formatRupiah(o.total_tagihan_idr)}
                    </p>
                    <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                      Status Pesanan:{' '}
                      <span className="font-semibold text-[#14452F] dark:text-emerald-300">
                        {labelStatusOrder(o.status_order)}
                      </span>
                      {' · '}Tujuan: {o.pelabuhan_tujuan || '-'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {adalahPembeli &&
                      o.status_order !== 'Selesai' &&
                      o.status_order !== 'Dibatalkan' && (
                        <Link
                          to={`/pembayaran/${o.order_id}`}
                          className="h-10 px-4 rounded-xl text-xs font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </Link>
                      )}

                    <button
                      type="button"
                      onClick={() => bukaDetail(o.order_id)}
                      className="h-10 px-4 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                    >
                      {terbuka === o.order_id ? 'Tutup Rincian' : 'Lacak & Rincian'}
                    </button>
                  </div>
                </div>

                {terbuka === o.order_id && (
                  <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-stone-200 dark:border-emerald-900/60 space-y-6 bg-stone-50/50 dark:bg-emerald-950/20">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        {o.tipe_pasar === 'Ekspor' ? (
                          <Ship className="w-4 h-4 text-[#0f5c6e]" />
                        ) : (
                          <Truck className="w-4 h-4 text-[#14452F]" />
                        )}
                        <span>Garis Waktu Pengiriman</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {URUTAN_PENGIRIMAN.map((tahapKey, indeks) => {
                          const selesai = indeks <= posisiTahap;
                          return (
                            <div
                              key={tahapKey}
                              className={`p-3 rounded-xl border text-xs ${
                                selesai
                                  ? 'border-[#14452F] bg-[#14452F]/10 dark:border-emerald-400 dark:bg-emerald-900/40 font-semibold'
                                  : 'border-stone-200 dark:border-emerald-900/50 text-[#53665c] dark:text-emerald-200/60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                    selesai
                                      ? 'bg-[#14452F] text-white'
                                      : 'bg-stone-200 dark:bg-emerald-950 text-[#53665c]'
                                  }`}
                                >
                                  {selesai ? <Check className="w-3 h-3" /> : indeks + 1}
                                </span>
                                <span>{labelStatusPengiriman(tahapKey)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                        <div>
                          <dt className="text-[#53665c] dark:text-emerald-200/70">Armada</dt>
                          <dd className="font-semibold mt-0.5">{pg.jenis_armada || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#53665c] dark:text-emerald-200/70">
                            Nomor Kontainer / Resi
                          </dt>
                          <dd className="font-mono font-semibold mt-0.5">
                            {pg.nomor_kontainer_resi || '-'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#53665c] dark:text-emerald-200/70">
                            No. PEB Bea Cukai
                          </dt>
                          <dd className="font-mono font-semibold mt-0.5">
                            {pg.no_peb_beacukai || '-'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#53665c] dark:text-emerald-200/70">
                            Pelabuhan Asal
                          </dt>
                          <dd className="font-semibold mt-0.5">{pg.pelabuhan_asal || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#53665c] dark:text-emerald-200/70">
                            Pelabuhan / Gudang Tujuan
                          </dt>
                          <dd className="font-semibold mt-0.5">{pg.pelabuhan_tujuan || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-[#53665c] dark:text-emerald-200/70">Estimasi Tiba</dt>
                          <dd className="font-semibold mt-0.5 angka-tabular">
                            {formatTanggal(pg.estimasi_tiba)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {detail?.items && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-[#53665c] dark:text-emerald-200/75">
                          Daftar Komoditas Dipesan
                        </h4>
                        <div className="divide-y divide-stone-200 dark:divide-emerald-900/50 rounded-xl border border-stone-200 dark:border-emerald-900/50 bg-white dark:bg-[#12201b]">
                          {detail.items.map((it) => (
                            <div
                              key={it.detail_id}
                              className="p-3 flex items-center justify-between text-xs sm:text-sm"
                            >
                              <span>
                                {it.nama_komoditas_snapshot} ({it.kuantitas} {it.satuan})
                              </span>
                              <span className="font-semibold angka-tabular">
                                {formatRupiah(it.subtotal_idr)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
