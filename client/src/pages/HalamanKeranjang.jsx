import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import GambarKomoditas from '../components/GambarKomoditas.jsx';
import { KeadaanKosong, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useKeranjang } from '../context/KeranjangContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatRupiah, formatUsd } from '../utils/format.js';

export default function HalamanKeranjang() {
  const { pengguna } = useAuth();
  const { itemKeranjang, ubahKuantitas, hapusItem, kosongkanKeranjang } = useKeranjang();
  const { toastSukses, toastGalat, toastInfo } = useToast();
  const navigasi = useNavigate();

  const defaultPasar = pengguna?.role_user === 'Buyer_Internasional' ? 'Ekspor' : 'Lokal';
  const [tipePasar, setTipePasar] = useState(defaultPasar);
  const [incoterms, setIncoterms] = useState(defaultPasar === 'Ekspor' ? 'FOB' : 'Lokal_Franco');
  const [tujuan, setTujuan] = useState(pengguna?.alamat_kantor_pelabuhan || '');

  const [ringkasanServer, setRingkasanServer] = useState(null);
  const [memuatHitung, setMemuatHitung] = useState(false);
  const [memuatKirim, setMemuatKirim] = useState(false);
  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (itemKeranjang.length === 0) {
      setRingkasanServer(null);
      return;
    }

    let aktif = true;
    setMemuatHitung(true);
    setGalat('');

    panggilApi('/order/pratinjau', {
      method: 'POST',
      body: {
        tipe_pasar: tipePasar,
        incoterms,
        items: itemKeranjang.map((it) => ({
          produk_id: it.produk_id,
          kuantitas: it.kuantitas,
        })),
      },
    })
      .then((res) => {
        if (aktif) setRingkasanServer(res.ringkasan);
      })
      .catch((err) => {
        if (aktif) setGalat(err.message);
      })
      .finally(() => {
        if (aktif) setMemuatHitung(false);
      });

    return () => {
      aktif = false;
    };
  }, [itemKeranjang, tipePasar, incoterms]);

  const gantiPasar = (pasarBaru) => {
    setTipePasar(pasarBaru);
    setIncoterms(pasarBaru === 'Ekspor' ? 'FOB' : 'Lokal_Franco');
  };

  const handleBuatPesanan = async (e) => {
    e.preventDefault();
    setGalat('');
    setMemuatKirim(true);
    try {
      const res = await panggilApi('/order', {
        method: 'POST',
        body: {
          tipe_pasar: tipePasar,
          incoterms,
          pelabuhan_tujuan: tujuan,
          items: itemKeranjang.map((it) => ({
            produk_id: it.produk_id,
            kuantitas: it.kuantitas,
          })),
        },
      });
      kosongkanKeranjang();
      toastSukses(
        `Pesanan ${res.order?.nomor_invoice || ''} berhasil dibuat. Silakan lanjutkan pembayaran.`
      );
      navigasi(`/pembayaran/${res.order.orderId}`);
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMemuatKirim(false);
    }
  };

  if (itemKeranjang.length === 0) {
    return (
      <KeadaanKosong
        judul="Keranjang masih kosong"
        deskripsi="Pilih hasil panen dari katalog terlebih dahulu sebelum membuat pesanan."
        aksiLabel="Buka Katalog"
        onAksi={() => navigasi('/katalog')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Keranjang &amp; Checkout</h1>
        <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
          Tentukan pasar, ketentuan Incoterms, dan tujuan pengiriman. Seluruh biaya dihitung oleh
          server.
        </p>
      </div>

      <PesanGalat pesan={galat} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          {itemKeranjang.map((item) => (
            <div
              key={item.produk_id}
              className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-4 flex items-center gap-4"
            >
              <div className="w-24 aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <GambarKomoditas
                  src={item.url_gambar}
                  alt={item.nama_komoditas}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm sm:text-base truncate">
                  {item.nama_komoditas}
                </h2>
                <p className="text-xs text-[#53665c] dark:text-emerald-200/70 angka-tabular">
                  {formatRupiah(item.harga_idr)} / {item.satuan}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={item.stok_tersedia}
                  value={item.kuantitas}
                  onChange={(e) => ubahKuantitas(item.produk_id, e.target.value)}
                  aria-label={`Jumlah ${item.nama_komoditas}`}
                  className="w-20 h-10 px-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm text-right angka-tabular"
                />
                <button
                  type="button"
                  onClick={() => {
                    hapusItem(item.produk_id);
                    toastInfo(`${item.nama_komoditas} dihapus dari keranjang.`);
                  }}
                  aria-label={`Hapus ${item.nama_komoditas}`}
                  className="w-10 h-10 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleBuatPesanan}
          className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 space-y-5"
        >
          <h2 className="text-lg font-bold">Pengaturan Pengiriman &amp; Tagihan</h2>

          <div className="space-y-1.5">
            <span className="block text-sm font-medium">Tipe Pasar</span>
            <div className="grid grid-cols-2 gap-2.5">
              {['Lokal', 'Ekspor'].map((opsi) => (
                <button
                  key={opsi}
                  type="button"
                  onClick={() => gantiPasar(opsi)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                    tipePasar === opsi
                      ? 'border-[#14452F] bg-[#14452F] text-white'
                      : 'border-stone-300 dark:border-emerald-800'
                  }`}
                >
                  {opsi === 'Lokal' ? 'Pasar Lokal (PT)' : 'Ekspor Internasional'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="incoterms" className="block text-sm font-medium">
              Ketentuan Incoterms
            </label>
            <select
              id="incoterms"
              value={incoterms}
              onChange={(e) => setIncoterms(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
            >
              {tipePasar === 'Lokal' && <option value="Lokal_Franco">Lokal Franco Gudang</option>}
              <option value="EXW">EXW (Ex Works)</option>
              <option value="FOB">FOB (Free On Board)</option>
              <option value="CIF">CIF (Cost, Insurance &amp; Freight)</option>
              <option value="DDP">DDP (Delivered Duty Paid)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tujuan" className="block text-sm font-medium">
              {tipePasar === 'Ekspor' ? 'Pelabuhan Tujuan Ekspor' : 'Alamat Gudang Penerima'}
            </label>
            <textarea
              id="tujuan"
              rows={2}
              required
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              placeholder={
                tipePasar === 'Ekspor'
                  ? 'Contoh: Port of Singapore (PSA) / Port of Yokohama'
                  : 'Contoh: Kawasan Industri Jababeka Blok C-12, Cikarang'
              }
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-emerald-900/60 space-y-2.5 text-sm">
            {memuatHitung || !ringkasanServer ? (
              <p className="text-[#53665c] dark:text-emerald-200/75">
                Menghitung rincian tagihan di server...
              </p>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#53665c] dark:text-emerald-200/75">Subtotal Produk</span>
                  <span className="font-medium angka-tabular">
                    {formatRupiah(ringkasanServer.subtotal_produk_idr)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#53665c] dark:text-emerald-200/75">
                    Logistik ({incoterms.replace('_', ' ')})
                  </span>
                  <span className="font-medium angka-tabular">
                    {formatRupiah(ringkasanServer.biaya_logistik_ekspor_idr)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#53665c] dark:text-emerald-200/75">
                    {tipePasar === 'Ekspor' ? 'Bea & Dokumen Ekspor' : 'PPN (11%)'}
                  </span>
                  <span className="font-medium angka-tabular">
                    {formatRupiah(ringkasanServer.pajak_bea_idr)}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-stone-200 dark:border-emerald-900/60 flex justify-between items-baseline">
                  <span className="font-bold">Total Tagihan</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
                      {formatRupiah(ringkasanServer.total_tagihan_idr)}
                    </p>
                    <p className="text-xs text-[#0f5c6e] dark:text-cyan-300 angka-tabular">
                      {formatUsd(ringkasanServer.total_tagihan_usd)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={memuatKirim || memuatHitung || !ringkasanServer}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {memuatKirim ? 'Membuat Pesanan...' : 'Buat Pesanan & Lanjut Bayar'}
          </button>
        </form>
      </div>
    </div>
  );
}
