import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import { MemuatHalaman, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatRupiah,
  formatTanggalWaktu,
  formatUsd,
  labelMetodeBayar,
  labelTahapBayar,
} from '../utils/format.js';

export default function HalamanPembayaran() {
  const { orderId } = useParams();
  const { toastSukses, toastGalat } = useToast();

  const [order, setOrder] = useState(null);
  const [daftarBank, setDaftarBank] = useState({ bankLokal: [], bankKoresponden: [] });
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  const [tahap, setTahap] = useState('DP_30');
  const [metode, setMetode] = useState('Virtual_Account');
  const [namaBank, setNamaBank] = useState('BCA');
  const [bankKoresponden, setBankKoresponden] = useState('');
  const [swiftKoresponden, setSwiftKoresponden] = useState('');

  const [instruksi, setInstruksi] = useState(null);
  const [membuatInstruksi, setMembuatInstruksi] = useState(false);

  const [berkasBukti, setBerkasBukti] = useState(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [suksesUnggah, setSuksesUnggah] = useState('');

  const muatData = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const [resOrder, resBank] = await Promise.all([
        panggilApi(`/order/${orderId}`),
        panggilApi('/pembayaran/bank'),
      ]);
      setOrder(resOrder.order);
      setDaftarBank({
        bankLokal: resBank.bankLokal || [],
        bankKoresponden: resBank.bankKoresponden || [],
      });

      if (resOrder.order?.tipe_pasar === 'Ekspor') {
        setMetode('T_T');
      }
      if ((resOrder.order?.pembayaran || []).length > 0) {
        const terakhir = resOrder.order.pembayaran[0];
        if (terakhir.status_pembayaran === 'Menunggu') {
          setInstruksi(terakhir);
        }
      }
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, [orderId]);

  useEffect(() => {
    muatData();
  }, [muatData]);

  const pilihKoresponden = (nama) => {
    setBankKoresponden(nama);
    const ditemukan = daftarBank.bankKoresponden.find((b) => b.nama === nama);
    setSwiftKoresponden(ditemukan ? ditemukan.swift : '');
  };

  const handleBuatInstruksi = async (e) => {
    e.preventDefault();
    setGalat('');
    setSuksesUnggah('');
    setMembuatInstruksi(true);
    try {
      const res = await panggilApi('/pembayaran', {
        method: 'POST',
        body: {
          order_id: Number(orderId),
          tahap_pembayaran: tahap,
          metode_pembayaran: metode,
          nama_bank: namaBank,
          bank_koresponden: bankKoresponden,
          swift_koresponden: swiftKoresponden,
        },
      });
      setInstruksi(res.instruksi);
      toastSukses('Nomor Virtual Account / rekening tujuan berhasil diterbitkan.');
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMembuatInstruksi(false);
    }
  };

  const handleUnggahBukti = async (e) => {
    e.preventDefault();
    if (!berkasBukti || !instruksi?.payment_id) return;
    setGalat('');
    setMengunggah(true);
    try {
      const fd = new FormData();
      fd.append('bukti_transfer', berkasBukti);
      const res = await panggilApi(`/pembayaran/${instruksi.payment_id}/bukti`, {
        method: 'POST',
        body: fd,
      });
      setSuksesUnggah(res.pesan);
      toastSukses(res.pesan || 'Bukti pembayaran berhasil diunggah.');
      setBerkasBukti(null);
      await muatData();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMengunggah(false);
    }
  };

  if (memuat) return <MemuatHalaman teks="Memuat rincian pembayaran..." />;
  if (!order) return <PesanGalat pesan={galat || 'Pesanan tidak ditemukan.'} />;

  const perluSwiftEkspor = order.tipe_pasar === 'Ekspor' || metode === 'T_T' || metode === 'L_C';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pembayaran Pesanan</h1>
          <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
            Invoice <span className="font-mono font-semibold">{order.nomor_invoice}</span> ·{' '}
            {order.tipe_pasar} ({order.incoterms.replace('_', ' ')})
          </p>
        </div>
        <Link
          to="/riwayat-pembayaran"
          className="text-sm font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
        >
          Lihat Riwayat Pembayaran
        </Link>
      </div>

      <PesanGalat pesan={galat} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleBuatInstruksi}
          className="lg:col-span-6 rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 space-y-5"
        >
          <div className="pb-4 border-b border-stone-200 dark:border-emerald-900/60 flex justify-between items-baseline">
            <div>
              <p className="text-xs text-[#53665c] dark:text-emerald-200/70">Sisa Tagihan</p>
              <p className="text-2xl font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
                {formatRupiah(order.sisa_tagihan_idr)}
              </p>
            </div>
            <p className="text-xs text-[#53665c] dark:text-emerald-200/70 angka-tabular">
              Total: {formatRupiah(order.total_tagihan_idr)}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="block text-sm font-medium">Tahap Pembayaran</span>
            <div className="grid grid-cols-3 gap-2.5">
              {['DP_30', 'DP_50', 'Pelunasan'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTahap(t)}
                  className={`h-11 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    tahap === t
                      ? 'border-[#14452F] bg-[#14452F] text-white'
                      : 'border-stone-300 dark:border-emerald-800'
                  }`}
                >
                  {labelTahapBayar(t)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="metode" className="block text-sm font-medium">
              Metode Pembayaran
            </label>
            <select
              id="metode"
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
            >
              <option value="Virtual_Account">Virtual Account</option>
              <option value="Transfer_RTGS">Transfer Bank / RTGS</option>
              <option value="T_T">Telegraphic Transfer (T/T)</option>
              <option value="L_C">Letter of Credit (L/C)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bank" className="block text-sm font-medium">
              Bank Penerima (Indonesia)
            </label>
            <select
              id="bank"
              value={namaBank}
              onChange={(e) => setNamaBank(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
            >
              {daftarBank.bankLokal.map((b) => (
                <option key={b.nama} value={b.nama}>
                  {b.nama} (SWIFT: {b.swift})
                </option>
              ))}
            </select>
          </div>

          {perluSwiftEkspor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200 dark:border-emerald-900/60">
              <div className="space-y-1.5">
                <label htmlFor="koresponden" className="block text-sm font-medium">
                  Bank Koresponden Ekspor
                </label>
                <select
                  id="koresponden"
                  value={bankKoresponden}
                  onChange={(e) => pilihKoresponden(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
                >
                  <option value="">Langsung (Direct SWIFT)</option>
                  {daftarBank.bankKoresponden.map((bk) => (
                    <option key={bk.nama} value={bk.nama}>
                      {bk.nama} ({bk.negara})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="swift" className="block text-sm font-medium">
                  Kode SWIFT Koresponden
                </label>
                <input
                  id="swift"
                  type="text"
                  value={swiftKoresponden}
                  onChange={(e) => setSwiftKoresponden(e.target.value.toUpperCase())}
                  placeholder="Contoh: DBSSSGSG"
                  className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={membuatInstruksi || order.sisa_tagihan_idr <= 0}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {membuatInstruksi
              ? 'Membuat Nomor Pembayaran...'
              : 'Terbitkan Nomor VA / Rekening Tujuan'}
          </button>
        </form>

        <div className="lg:col-span-6 space-y-5">
          {instruksi ? (
            <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#0f5c6e] dark:text-cyan-300">
                  Instruksi Pembayaran Aktif
                </p>
                <h2 className="text-lg font-bold">
                  {instruksi.bank_pengirim_tujuan || instruksi.nama_bank}
                </h2>
              </div>

              <div className="rounded-xl bg-stone-50 dark:bg-emerald-950/50 p-4 space-y-2">
                <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                  Nomor Virtual Account / Rekening Tujuan
                </p>
                <p className="text-xl font-bold font-mono tracking-wide text-[#14452F] dark:text-emerald-300 select-all">
                  {instruksi.nomor_tujuan || instruksi.kode_transaksi_bank}
                </p>
                <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                  Atas Nama: {instruksi.atas_nama || 'PT Agro Maritim Nusantara'}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
                <dt className="text-[#53665c] dark:text-emerald-200/70">Kode Transaksi</dt>
                <dd className="font-mono font-semibold text-right">
                  {instruksi.kode_transaksi_bank}
                </dd>
                <dt className="text-[#53665c] dark:text-emerald-200/70">Tahap / Metode</dt>
                <dd className="text-right font-medium">
                  {labelTahapBayar(instruksi.tahap_pembayaran)} ·{' '}
                  {labelMetodeBayar(instruksi.metode_pembayaran)}
                </dd>
                <dt className="text-[#53665c] dark:text-emerald-200/70">Nominal Bayar</dt>
                <dd className="text-right font-bold angka-tabular">
                  {formatRupiah(instruksi.nominal_idr ?? instruksi.nominal_dibayar_idr)} (
                  {formatUsd(instruksi.nominal_usd)})
                </dd>
                <dt className="text-[#53665c] dark:text-emerald-200/70">Batas Waktu Bayar</dt>
                <dd className="text-right font-medium text-[#ea580c] angka-tabular">
                  {formatTanggalWaktu(instruksi.batas_waktu_bayar)}
                </dd>
              </dl>

              {suksesUnggah && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{suksesUnggah}</span>
                </div>
              )}

              <form
                onSubmit={handleUnggahBukti}
                className="pt-4 border-t border-stone-200 dark:border-emerald-900/60 space-y-3"
              >
                <label htmlFor="bukti" className="block text-sm font-medium">
                  Unggah Bukti Transfer / MT103 (JPG, PNG, WEBP maks. 3 MB)
                </label>
                <input
                  id="bukti"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  required
                  onChange={(e) => setBerkasBukti(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#14452F]/10 file:text-[#14452F] dark:file:bg-emerald-900/60 dark:file:text-emerald-200"
                />
                <button
                  type="submit"
                  disabled={mengunggah || !berkasBukti}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] disabled:opacity-60 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{mengunggah ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 text-sm text-[#53665c] dark:text-emerald-200/75">
              Pilih tahap, metode, dan bank di sebelah kiri untuk menerbitkan nomor Virtual Account
              atau rekening tujuan pembayaran.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
