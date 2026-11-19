import { useCallback, useEffect, useState } from 'react';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { panggilApi } from '../api/klienApi.js';
import { KeadaanKosong, MemuatHalaman, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function HalamanRekening() {
  const { toastSukses, toastGalat, toastInfo } = useToast();
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nama_bank: 'BCA',
    nomor_rekening: '',
    atas_nama: '',
    swift_code: '',
    is_utama: false,
  });
  const [menyimpan, setMenyimpan] = useState(false);

  const muatRekening = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/rekening');
      setDaftar(res.rekening || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatRekening();
  }, [muatRekening]);

  const resetForm = () => {
    setEditId(null);
    setForm({
      nama_bank: 'BCA',
      nomor_rekening: '',
      atas_nama: '',
      swift_code: '',
      is_utama: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGalat('');
    setMenyimpan(true);
    try {
      if (editId) {
        await panggilApi(`/rekening/${editId}`, { method: 'PUT', body: form });
        toastSukses('Data rekening bank berhasil diperbarui.');
      } else {
        await panggilApi('/rekening', { method: 'POST', body: form });
        toastSukses('Rekening bank baru berhasil disimpan.');
      }
      resetForm();
      await muatRekening();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMenyimpan(false);
    }
  };

  const mulaiEdit = (rk) => {
    setEditId(rk.rekening_id);
    setForm({
      nama_bank: rk.nama_bank,
      nomor_rekening: rk.nomor_rekening,
      atas_nama: rk.atas_nama,
      swift_code: rk.swift_code || '',
      is_utama: Boolean(rk.is_utama),
    });
  };

  const handleUtama = async (id) => {
    try {
      await panggilApi(`/rekening/${id}/utama`, { method: 'PATCH' });
      toastSukses('Rekening utama berhasil diperbarui.');
      await muatRekening();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const handleHapus = async (id) => {
    try {
      await panggilApi(`/rekening/${id}`, { method: 'DELETE' });
      toastInfo('Rekening bank dihapus.');
      await muatRekening();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Rekening Bank Saya</h1>
        <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
          Kelola rekening pencairan dana hasil panen dan tandai rekening utama Anda.
        </p>
      </div>

      <PesanGalat pesan={galat} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 space-y-4"
        >
          <h2 className="text-lg font-bold">
            {editId ? 'Ubah Rekening Bank' : 'Tambah Rekening Baru'}
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="nama_bank" className="block text-sm font-medium">
              Nama Bank
            </label>
            <select
              id="nama_bank"
              value={form.nama_bank}
              onChange={(e) => setForm((f) => ({ ...f, nama_bank: e.target.value }))}
              className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
            >
              <option value="BCA">BCA</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="CIMB Niaga">CIMB Niaga</option>
              <option value="Permata">Permata</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nomor_rekening" className="block text-sm font-medium">
              Nomor Rekening
            </label>
            <input
              id="nomor_rekening"
              type="text"
              required
              value={form.nomor_rekening}
              onChange={(e) => setForm((f) => ({ ...f, nomor_rekening: e.target.value }))}
              className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="atas_nama" className="block text-sm font-medium">
              Atas Nama
            </label>
            <input
              id="atas_nama"
              type="text"
              required
              value={form.atas_nama}
              onChange={(e) => setForm((f) => ({ ...f, atas_nama: e.target.value }))}
              className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="swift_code" className="block text-sm font-medium">
              SWIFT Code (opsional untuk ekspor)
            </label>
            <input
              id="swift_code"
              type="text"
              value={form.swift_code}
              onChange={(e) => setForm((f) => ({ ...f, swift_code: e.target.value.toUpperCase() }))}
              placeholder="Contoh: CENAIDJA"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm font-mono"
            />
          </div>

          {!editId && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_utama}
                onChange={(e) => setForm((f) => ({ ...f, is_utama: e.target.checked }))}
                className="w-4 h-4 accent-[#14452F]"
              />
              <span>Jadikan rekening utama pencairan</span>
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={menyimpan}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] transition-colors cursor-pointer"
            >
              {menyimpan ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan Rekening'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="h-11 px-4 rounded-xl border border-stone-300 dark:border-emerald-800 text-sm font-medium cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {memuat ? (
            <MemuatHalaman teks="Memuat daftar rekening..." />
          ) : daftar.length === 0 ? (
            <KeadaanKosong
              judul="Belum ada rekening bank"
              deskripsi="Tambahkan rekening bank Anda melalui formulir di samping."
            />
          ) : (
            daftar.map((rk) => (
              <div
                key={rk.rekening_id}
                className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{rk.nama_bank}</span>
                    {Boolean(rk.is_utama) && (
                      <span className="text-xs font-semibold text-[#14452F] dark:text-emerald-300 inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Rekening Utama
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm font-semibold">{rk.nomor_rekening}</p>
                  <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                    a.n. {rk.atas_nama}
                    {rk.swift_code ? ` · SWIFT ${rk.swift_code}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!rk.is_utama && (
                    <button
                      type="button"
                      onClick={() => handleUtama(rk.rekening_id)}
                      className="h-9 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                    >
                      Jadikan Utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => mulaiEdit(rk)}
                    aria-label="Ubah rekening"
                    className="w-9 h-9 rounded-xl border border-stone-300 dark:border-emerald-800 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHapus(rk.rekening_id)}
                    aria-label="Hapus rekening"
                    className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
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
