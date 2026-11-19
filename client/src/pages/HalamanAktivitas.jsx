import { useCallback, useEffect, useState } from 'react';
import { panggilApi } from '../api/klienApi.js';
import { KeadaanKosong, MemuatHalaman, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { formatTanggalWaktu } from '../utils/format.js';

export default function HalamanAktivitas() {
  const [aktivitas, setAktivitas] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  const muatAktivitas = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/profil/aktivitas');
      setAktivitas(res.aktivitas || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatAktivitas();
  }, [muatAktivitas]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Riwayat Aktivitas</h1>
        <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
          Catatan waktu masuk, keluar, dan perubahan keamanan akun Anda.
        </p>
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatAktivitas} />

      {memuat ? (
        <MemuatHalaman teks="Memuat riwayat aktivitas..." />
      ) : aktivitas.length === 0 ? (
        <KeadaanKosong
          judul="Belum ada catatan aktivitas"
          deskripsi="Riwayat masuk dan keluar sesi Anda akan muncul di halaman ini."
        />
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-emerald-900/60 text-xs text-[#53665c] dark:text-emerald-200/70">
                <th className="py-3.5 px-5 font-semibold">Aktivitas</th>
                <th className="py-3.5 px-5 font-semibold text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-emerald-900/40">
              {aktivitas.map((item) => (
                <tr key={item.log_id}>
                  <td className="py-3.5 px-5 font-medium">{item.aksi}</td>
                  <td className="py-3.5 px-5 text-right text-xs text-[#53665c] dark:text-emerald-200/75 angka-tabular">
                    {formatTanggalWaktu(item.waktu)}
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
