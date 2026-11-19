import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const PILIHAN_PERAN = [
  { nilai: 'Petani', label: 'Petani', kategori: 'Produsen' },
  { nilai: 'Nelayan', label: 'Nelayan', kategori: 'Produsen' },
  { nilai: 'Peternak', label: 'Peternak', kategori: 'Produsen' },
  { nilai: 'Buyer_PT_Lokal', label: 'Pembeli PT Lokal', kategori: 'Pembeli' },
  { nilai: 'Buyer_Internasional', label: 'Importir Internasional', kategori: 'Pembeli' },
];

export default function HalamanDaftar() {
  const { daftar } = useAuth();
  const { toastSukses, toastGalat } = useToast();
  const navigasi = useNavigate();

  const [form, setForm] = useState({
    role_user: 'Petani',
    nama_lengkap: '',
    email: '',
    password: '',
    no_hp: '',
    kota_wilayah: '',
    asal_negara: 'Indonesia',
    nama_perusahaan: '',
    nomor_izin_npwp_taxid: '',
    alamat_kantor_pelabuhan: '',
  });
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState('');

  const adalahPtLokal = form.role_user === 'Buyer_PT_Lokal';
  const adalahInternasional = form.role_user === 'Buyer_Internasional';
  const adalahProdusen = ['Petani', 'Nelayan', 'Peternak'].includes(form.role_user);

  const ubahField = (kunci, nilai) => {
    setForm((prev) => ({
      ...prev,
      [kunci]: nilai,
      ...(kunci === 'role_user' && nilai !== 'Buyer_Internasional'
        ? { asal_negara: 'Indonesia' }
        : {}),
      ...(kunci === 'role_user' && nilai === 'Buyer_Internasional' ? { asal_negara: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGalat('');
    setMemuat(true);
    try {
      await daftar(form);
      toastSukses('Akun berhasil didaftarkan. Selamat datang di Agro Maritim.');
      navigasi('/beranda');
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-7 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Daftar Akun Agro Maritim</h1>
          <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
            Pilih peran usaha Anda dan lengkapi data verifikasi awal.
          </p>
        </div>

        <PesanGalat pesan={galat} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <span className="block text-sm font-medium">Peran Pengguna</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PILIHAN_PERAN.map((item) => {
                const aktif = form.role_user === item.nilai;
                return (
                  <button
                    key={item.nilai}
                    type="button"
                    onClick={() => ubahField('role_user', item.nilai)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      aktif
                        ? 'border-[#14452F] bg-[#14452F]/10 dark:border-emerald-400 dark:bg-emerald-900/40'
                        : 'border-stone-200 dark:border-emerald-900/60 hover:bg-stone-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <div className="text-xs text-[#53665c] dark:text-emerald-200/70">
                      {item.kategori}
                    </div>
                    <div className="text-sm font-semibold mt-0.5">{item.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="nama_lengkap" className="block text-sm font-medium">
                Nama Lengkap / PIC
              </label>
              <input
                id="nama_lengkap"
                type="text"
                required
                value={form.nama_lengkap}
                onChange={(e) => ubahField('nama_lengkap', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="no_hp" className="block text-sm font-medium">
                Nomor HP / WhatsApp
              </label>
              <input
                id="no_hp"
                type="tel"
                required
                value={form.no_hp}
                onChange={(e) => ubahField('no_hp', e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email_daftar" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email_daftar"
                type="email"
                required
                value={form.email}
                onChange={(e) => ubahField('email', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password_daftar" className="block text-sm font-medium">
                Kata Sandi (min. 8 karakter)
              </label>
              <input
                id="password_daftar"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => ubahField('password', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="kota_wilayah" className="block text-sm font-medium">
                {adalahProdusen ? 'Kota / Wilayah Produksi' : 'Kota / Wilayah'}
              </label>
              <input
                id="kota_wilayah"
                type="text"
                required
                value={form.kota_wilayah}
                onChange={(e) => ubahField('kota_wilayah', e.target.value)}
                placeholder="Contoh: Takengon, Makassar, Surabaya"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="asal_negara" className="block text-sm font-medium">
                Asal Negara
              </label>
              <input
                id="asal_negara"
                type="text"
                required
                value={form.asal_negara}
                onChange={(e) => ubahField('asal_negara', e.target.value)}
                placeholder={adalahInternasional ? 'Contoh: Singapura, Jepang' : 'Indonesia'}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>
          </div>

          {(adalahPtLokal || adalahInternasional) && (
            <div className="pt-3 border-t border-stone-200 dark:border-emerald-900/60 space-y-4">
              <h2 className="text-sm font-semibold text-[#14452F] dark:text-emerald-300">
                Data Legalitas {adalahPtLokal ? 'PT Lokal' : 'Importir Internasional'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="nama_perusahaan" className="block text-sm font-medium">
                    Nama Perusahaan
                  </label>
                  <input
                    id="nama_perusahaan"
                    type="text"
                    required
                    value={form.nama_perusahaan}
                    onChange={(e) => ubahField('nama_perusahaan', e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nomor_izin" className="block text-sm font-medium">
                    {adalahPtLokal ? 'Nomor NPWP Perusahaan' : 'Tax ID / Nomor Izin Impor'}
                  </label>
                  <input
                    id="nomor_izin"
                    type="text"
                    required
                    value={form.nomor_izin_npwp_taxid}
                    onChange={(e) => ubahField('nomor_izin_npwp_taxid', e.target.value)}
                    placeholder={adalahPtLokal ? '01.234.567.8-901.000' : 'TAX-SG-998811'}
                    className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="alamat_kantor" className="block text-sm font-medium">
                  {adalahPtLokal ? 'Alamat Kantor / Gudang Penerima' : 'Alamat Pelabuhan Tujuan'}
                </label>
                <textarea
                  id="alamat_kantor"
                  rows={2}
                  required
                  value={form.alamat_kantor_pelabuhan}
                  onChange={(e) => ubahField('alamat_kantor_pelabuhan', e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={memuat}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {memuat ? 'Mendaftarkan...' : 'Buat Akun'}
          </button>
        </form>

        <p className="text-center text-sm text-[#53665c] dark:text-emerald-200/75">
          Sudah punya akun?{' '}
          <Link
            to="/"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
