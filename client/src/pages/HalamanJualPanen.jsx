import { useCallback, useEffect, useState } from 'react';
import { panggilApi } from '../api/klienApi.js';
import GambarKomoditas from '../components/GambarKomoditas.jsx';
import { KeadaanKosong, MemuatHalaman, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatRupiah, formatUsd } from '../utils/format.js';

export default function HalamanJualPanen() {
  const { toastSukses, toastGalat } = useToast();
  const [produkSaya, setProdukSaya] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [sukses, setSukses] = useState('');

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    sektor: 'Pertanian',
    nama_komoditas: '',
    grade_kualitas: 'Grade A',
    satuan: 'kg',
    harga_idr: '',
    harga_usd: '',
    stok_tersedia: '',
  });
  const [foto, setFoto] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const muatProduk = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/produk/saya');
      setProdukSaya(res.produk || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatProduk();
  }, [muatProduk]);

  const resetForm = () => {
    setEditId(null);
    setForm({
      sektor: 'Pertanian',
      nama_komoditas: '',
      grade_kualitas: 'Grade A',
      satuan: 'kg',
      harga_idr: '',
      harga_usd: '',
      stok_tersedia: '',
    });
    setFoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGalat('');
    setSukses('');
    setMenyimpan(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (String(v).trim() !== '') fd.append(k, String(v).trim());
      });
      if (foto) fd.append('gambar', foto);

      if (editId) {
        const res = await panggilApi(`/produk/${editId}`, { method: 'PUT', body: fd });
        setSukses(res.pesan);
        toastSukses(res.pesan);
      } else {
        const res = await panggilApi('/produk', { method: 'POST', body: fd });
        setSukses(res.pesan);
        toastSukses(res.pesan);
      }
      resetForm();
      await muatProduk();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMenyimpan(false);
    }
  };

  const toggleStatus = async (item) => {
    const statusBaru = item.status_produk === 'Aktif' ? 'Nonaktif' : 'Aktif';
    try {
      await panggilApi(`/produk/${item.produk_id}`, {
        method: 'PUT',
        body: { status_produk: statusBaru },
      });
      toastSukses(`Status ${item.nama_komoditas} diubah menjadi ${statusBaru}.`);
      await muatProduk();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const mulaiEdit = (item) => {
    setEditId(item.produk_id);
    setForm({
      sektor: item.sektor,
      nama_komoditas: item.nama_komoditas,
      grade_kualitas: item.grade_kualitas,
      satuan: item.satuan,
      harga_idr: String(item.harga_idr),
      harga_usd: String(item.harga_usd),
      stok_tersedia: String(item.stok_tersedia),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Jual Hasil Panen</h1>
        <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
          Tambahkan komoditas baru dengan foto asli atau perbarui stok dan harga produk Anda.
        </p>
      </div>

      <PesanGalat pesan={galat} />

      {sukses && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-900 dark:text-emerald-200">
          {sukses}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 space-y-4"
        >
          <h2 className="text-lg font-bold">
            {editId ? 'Ubah Data Komoditas' : 'Formulir Tambah Komoditas'}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="sektor" className="block text-sm font-medium">
                Sektor
              </label>
              <select
                id="sektor"
                value={form.sektor}
                onChange={(e) => setForm((f) => ({ ...f, sektor: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
              >
                <option value="Pertanian">Pertanian</option>
                <option value="Perikanan">Perikanan</option>
                <option value="Peternakan">Peternakan</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="satuan" className="block text-sm font-medium">
                Satuan
              </label>
              <input
                id="satuan"
                type="text"
                required
                value={form.satuan}
                onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))}
                placeholder="kg / ton / boks"
                className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nama_komoditas" className="block text-sm font-medium">
              Nama Komoditas
            </label>
            <input
              id="nama_komoditas"
              type="text"
              required
              value={form.nama_komoditas}
              onChange={(e) => setForm((f) => ({ ...f, nama_komoditas: e.target.value }))}
              placeholder="Contoh: Kopi Arabika Gayo Washed"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="grade_kualitas" className="block text-sm font-medium">
                Grade Kualitas
              </label>
              <input
                id="grade_kualitas"
                type="text"
                required
                value={form.grade_kualitas}
                onChange={(e) => setForm((f) => ({ ...f, grade_kualitas: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stok_tersedia" className="block text-sm font-medium">
                Stok Tersedia
              </label>
              <input
                id="stok_tersedia"
                type="number"
                min="0"
                required
                value={form.stok_tersedia}
                onChange={(e) => setForm((f) => ({ ...f, stok_tersedia: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm angka-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="harga_idr" className="block text-sm font-medium">
                Harga IDR / {form.satuan}
              </label>
              <input
                id="harga_idr"
                type="number"
                min="1"
                required
                value={form.harga_idr}
                onChange={(e) => setForm((f) => ({ ...f, harga_idr: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm angka-tabular"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="harga_usd" className="block text-sm font-medium">
                Harga USD (opsional)
              </label>
              <input
                id="harga_usd"
                type="number"
                min="0"
                step="0.01"
                value={form.harga_usd}
                onChange={(e) => setForm((f) => ({ ...f, harga_usd: e.target.value }))}
                placeholder="Otomatis dari kurs"
                className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm angka-tabular"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="foto_komoditas" className="block text-sm font-medium">
              Foto Komoditas (JPG, PNG, WEBP maks. 3 MB)
            </label>
            <input
              id="foto_komoditas"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#14452F]/10 file:text-[#14452F] dark:file:bg-emerald-900/60 dark:file:text-emerald-200"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={menyimpan}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {menyimpan ? 'Menyimpan...' : editId ? 'Perbarui Komoditas' : 'Terbitkan ke Katalog'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="h-11 px-4 rounded-xl border border-stone-300 dark:border-emerald-800 text-sm cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {memuat ? (
            <MemuatHalaman teks="Memuat komoditas Anda..." />
          ) : produkSaya.length === 0 ? (
            <KeadaanKosong
              judul="Belum ada komoditas terdaftar"
              deskripsi="Gunakan formulir di sebelah kiri untuk mulai memasarkan hasil panen Anda."
            />
          ) : (
            produkSaya.map((item) => (
              <div
                key={item.produk_id}
                className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-24 aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <GambarKomoditas
                    src={item.url_gambar}
                    alt={item.nama_komoditas}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                    {item.sektor} · {item.grade_kualitas} ·{' '}
                    <span
                      className={
                        item.status_produk === 'Aktif'
                          ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {item.status_produk}
                    </span>
                  </p>
                  <h3 className="font-semibold truncate">{item.nama_komoditas}</h3>
                  <p className="text-xs angka-tabular">
                    {formatRupiah(item.harga_idr)} / {formatUsd(item.harga_usd)} per {item.satuan} ·
                    Stok {item.stok_tersedia}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => mulaiEdit(item)}
                    className="h-9 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold cursor-pointer"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className="h-9 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold cursor-pointer"
                  >
                    {item.status_produk === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
