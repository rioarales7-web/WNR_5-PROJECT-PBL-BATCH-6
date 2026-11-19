import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { panggilApi } from '../api/klienApi.js';
import { KeadaanKosong, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { SkeletonDaftarBaris } from '../components/SkeletonProduk.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { unduhCsvLokal } from '../utils/eksporCsv.js';
import {
  formatRupiah,
  formatTanggalWaktu,
  formatUsd,
  labelMetodeBayar,
  labelTahapBayar,
} from '../utils/format.js';

export default function HalamanRiwayatPembayaran() {
  const { toastSukses, toastGalat } = useToast();
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [status, setStatus] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');

  const muatRiwayat = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (tanggalMulai) params.set('tanggal_mulai', tanggalMulai);
      if (tanggalSelesai) params.set('tanggal_selesai', tanggalSelesai);
      const qs = params.toString();
      const res = await panggilApi(`/pembayaran/riwayat${qs ? `?${qs}` : ''}`);
      setDaftar(res.pembayaran || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, [status, tanggalMulai, tanggalSelesai]);

  useEffect(() => {
    muatRiwayat();
  }, [muatRiwayat]);

  const unduhPdf = async (paymentId, kode) => {
    try {
      const blob = await panggilApi(`/pembayaran/${paymentId}/pdf`, { responBlob: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bukti-Pembayaran-${kode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastSukses(`Bukti pembayaran ${kode} berhasil diunduh.`);
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const eksporRiwayatCsv = () => {
    if (daftar.length === 0) return;
    const header = [
      'Nomor Invoice',
      'Kode Transaksi Bank',
      'Tahap Pembayaran',
      'Metode Pembayaran',
      'Bank Pengirim/Tujuan',
      'Nominal (IDR)',
      'Nominal (USD)',
      'Status Pembayaran',
      'Tanggal Transaksi',
    ];
    const baris = daftar.map((pb) => [
      pb.nomor_invoice,
      pb.kode_transaksi_bank || '-',
      labelTahapBayar(pb.tahap_pembayaran),
      labelMetodeBayar(pb.metode_pembayaran),
      pb.bank_pengirim_tujuan || '-',
      pb.nominal_dibayar_idr,
      pb.nominal_usd,
      pb.status_pembayaran,
      pb.tanggal_bayar || pb.batas_waktu_bayar || '-',
    ]);
    unduhCsvLokal(
      `riwayat-pembayaran-agro-maritim-${new Date().toISOString().slice(0, 10)}.csv`,
      header,
      baris
    );
    toastSukses(`${daftar.length} riwayat pembayaran diekspor ke CSV.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Riwayat Pembayaran</h1>
          <p className="text-sm text-[var(--warna-teks-redup)]">
            Pantau status pembayaran tagihan, ekspor ke CSV, atau unduh bukti resmi dalam format
            PDF.
          </p>
        </div>

        <button
          type="button"
          disabled={memuat || daftar.length === 0}
          onClick={eksporRiwayatCsv}
          className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      <section className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select
          aria-label="Filter status pembayaran"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
        >
          <option value="">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Lunas">Lunas</option>
          <option value="Gagal">Gagal</option>
        </select>

        <input
          type="date"
          aria-label="Tanggal mulai"
          value={tanggalMulai}
          onChange={(e) => setTanggalMulai(e.target.value)}
          className="h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
        />

        <input
          type="date"
          aria-label="Tanggal selesai"
          value={tanggalSelesai}
          onChange={(e) => setTanggalSelesai(e.target.value)}
          className="h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
        />

        <button
          type="button"
          onClick={() => {
            setStatus('');
            setTanggalMulai('');
            setTanggalSelesai('');
          }}
          className="h-11 rounded-xl border border-stone-300 dark:border-emerald-800 text-sm font-medium hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer"
        >
          Reset Filter
        </button>
      </section>

      <PesanGalat pesan={galat} onCobaLagi={muatRiwayat} />

      {memuat ? (
        <SkeletonDaftarBaris jumlah={5} label="Memuat riwayat pembayaran..." />
      ) : daftar.length === 0 ? (
        <KeadaanKosong
          judul="Belum ada riwayat pembayaran"
          deskripsi="Transaksi pembayaran DP maupun pelunasan Anda akan tercatat di sini."
        />
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-emerald-900/60 text-xs text-[#53665c] dark:text-emerald-200/70">
                <th className="py-3.5 px-4 font-semibold">Invoice</th>
                <th className="py-3.5 px-4 font-semibold">Tahap &amp; Metode</th>
                <th className="py-3.5 px-4 font-semibold">Bank</th>
                <th className="py-3.5 px-4 font-semibold text-right">Nominal IDR</th>
                <th className="py-3.5 px-4 font-semibold text-right">Nominal USD</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Tanggal</th>
                <th className="py-3.5 px-4 font-semibold text-right">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-emerald-900/40">
              {daftar.map((pb) => (
                <tr
                  key={pb.payment_id}
                  className="hover:bg-stone-50/80 dark:hover:bg-emerald-950/30"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold whitespace-nowrap">
                    {pb.nomor_invoice}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {labelTahapBayar(pb.tahap_pembayaran)} ·{' '}
                    {labelMetodeBayar(pb.metode_pembayaran)}
                  </td>
                  <td className="py-3.5 px-4">{pb.bank_pengirim_tujuan}</td>
                  <td className="py-3.5 px-4 text-right font-semibold angka-tabular whitespace-nowrap">
                    {formatRupiah(pb.nominal_dibayar_idr)}
                  </td>
                  <td className="py-3.5 px-4 text-right angka-tabular whitespace-nowrap">
                    {formatUsd(pb.nominal_usd)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                    <span
                      className={
                        pb.status_pembayaran === 'Lunas'
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : pb.status_pembayaran === 'Gagal'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-700 dark:text-amber-300'
                      }
                    >
                      {pb.status_pembayaran}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#53665c] dark:text-emerald-200/75 whitespace-nowrap angka-tabular">
                    {formatTanggalWaktu(pb.tanggal_bayar || pb.batas_waktu_bayar)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => unduhPdf(pb.payment_id, pb.kode_transaksi_bank)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14452F] dark:text-emerald-300 hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
