import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  FileCheck2,
  History,
  KeyRound,
  Landmark,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import KomponenKredensialProdusen from '../components/KomponenKredensialProdusen.jsx';
import { PesanGalat } from '../components/KeadaanHalaman.jsx';
import { SkeletonDaftarBaris } from '../components/SkeletonProduk.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { labelPeran, PERAN_PRODUSEN } from '../utils/format.js';

export default function HalamanProfil() {
  const { pengguna, setPengguna, keluar } = useAuth();
  const { toastSukses, toastGalat, toastInfo } = useToast();
  const navigasi = useNavigate();

  const adalahProdusen = PERAN_PRODUSEN.includes(pengguna?.role_user);
  const adalahAdmin = pengguna?.role_user === 'Admin';
  const dukungKredensial = adalahProdusen || adalahAdmin;

  const [tabAktif, setTabAktif] = useState(adalahProdusen ? 'kredensial' : 'akun');
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [sukses, setSukses] = useState('');

  const [profilForm, setProfilForm] = useState({
    nama_lengkap: '',
    no_hp: '',
    kota_wilayah: '',
    asal_negara: '',
  });

  const [perusahaanForm, setPerusahaanForm] = useState({
    nama_perusahaan: '',
    nomor_izin_npwp_taxid: '',
    alamat_kantor_pelabuhan: '',
    pic_kontak: '',
    status_verifikasi_legal: 'Menunggu',
  });

  const [kredensialProdusen, setKredensialProdusen] = useState(null);
  const [dokumenVerifikasi, setDokumenVerifikasi] = useState([]);

  const [sandiForm, setSandiForm] = useState({
    kata_sandi_lama: '',
    kata_sandi_baru: '',
  });

  useEffect(() => {
    if (adalahProdusen) {
      setTabAktif('kredensial');
    }
  }, [adalahProdusen]);

  const muatProfil = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const res = await panggilApi('/profil');
      setProfilForm({
        nama_lengkap: res.pengguna.nama_lengkap || '',
        no_hp: res.pengguna.no_hp || '',
        kota_wilayah: res.pengguna.kota_wilayah || '',
        asal_negara: res.pengguna.asal_negara || 'Indonesia',
      });
      if (res.perusahaan) {
        setPerusahaanForm({
          nama_perusahaan: res.perusahaan.nama_perusahaan || '',
          nomor_izin_npwp_taxid: res.perusahaan.nomor_izin_npwp_taxid || '',
          alamat_kantor_pelabuhan: res.perusahaan.alamat_kantor_pelabuhan || '',
          pic_kontak: res.perusahaan.pic_kontak || '',
          status_verifikasi_legal: res.perusahaan.status_verifikasi_legal || 'Menunggu',
        });
      }
      setKredensialProdusen(res.kredensial_produsen || null);
      setDokumenVerifikasi(res.dokumen_verifikasi || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatProfil();
  }, [muatProfil]);

  const daftarChecklist = useMemo(() => {
    const pribadiLengkap =
      Boolean(profilForm.nama_lengkap.trim()) &&
      Boolean(profilForm.no_hp.trim()) &&
      Boolean(profilForm.kota_wilayah.trim());
    const legalLengkap =
      Boolean(perusahaanForm.nama_perusahaan.trim()) &&
      Boolean(perusahaanForm.nomor_izin_npwp_taxid.trim()) &&
      Boolean(perusahaanForm.alamat_kantor_pelabuhan.trim());

    const langkah = [
      {
        id: 'pribadi',
        label: 'Data Pribadi',
        selesai: pribadiLengkap,
        tab: 'akun',
      },
      {
        id: 'legal',
        label: 'Legalitas Usaha',
        selesai: legalLengkap,
        tab: 'akun',
      },
    ];

    if (dukungKredensial) {
      langkah.push(
        {
          id: 'kredensial',
          label: 'Kredensial Sektor',
          selesai: Boolean(kredensialProdusen?.nomor_registrasi_sektor),
          tab: 'kredensial',
        },
        {
          id: 'dokumen',
          label: `Dokumen (${dokumenVerifikasi.length})`,
          selesai: dokumenVerifikasi.length > 0,
          tab: 'kredensial',
        }
      );
    }

    return langkah;
  }, [profilForm, perusahaanForm, dukungKredensial, kredensialProdusen, dokumenVerifikasi]);

  const jumlahSelesai = daftarChecklist.filter((l) => l.selesai).length;
  const persentaseSiap = Math.round((jumlahSelesai / daftarChecklist.length) * 100);

  const simpanProfil = async (e) => {
    e.preventDefault();
    setGalat('');
    setSukses('');
    try {
      const res = await panggilApi('/profil', { method: 'PUT', body: profilForm });
      setPengguna((prev) => ({ ...prev, ...res.pengguna }));
      setSukses(res.pesan);
      toastSukses(res.pesan);
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const simpanPerusahaan = async (e) => {
    e.preventDefault();
    setGalat('');
    setSukses('');
    try {
      const res = await panggilApi('/profil/perusahaan', { method: 'PUT', body: perusahaanForm });
      setPerusahaanForm((prev) => ({
        ...prev,
        status_verifikasi_legal: res.perusahaan.status_verifikasi_legal,
      }));
      setSukses(res.pesan);
      toastSukses(res.pesan);
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const simpanSandi = async (e) => {
    e.preventDefault();
    setGalat('');
    setSukses('');
    try {
      const res = await panggilApi('/profil/kata-sandi', { method: 'PUT', body: sandiForm });
      setSandiForm({ kata_sandi_lama: '', kata_sandi_baru: '' });
      setSukses(res.pesan);
      toastSukses(res.pesan);
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const handleKeluar = async () => {
    await keluar();
    toastInfo('Anda telah keluar dari akun.');
    navigasi('/');
  };

  const daftarTab = dukungKredensial
    ? [
        { id: 'kredensial', label: 'Kredensial Sektor & Dokumen', ikon: FileCheck2 },
        { id: 'akun', label: 'Data Pribadi & Legalitas', ikon: UserCheck },
        { id: 'keamanan', label: 'Keamanan Sandi', ikon: KeyRound },
      ]
    : [
        { id: 'akun', label: 'Data Pribadi & Legalitas', ikon: UserCheck },
        { id: 'keamanan', label: 'Keamanan Sandi', ikon: KeyRound },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--warna-teks-redup)]">
            <span>{labelPeran(pengguna?.role_user)}</span>
            <span aria-hidden="true">·</span>
            <span>{pengguna?.email}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#14452F] dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Legalitas: {perusahaanForm.status_verifikasi_legal}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--warna-teks)]">
            Pengaturan Profil &amp; Verifikasi Akun
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/rekening"
            className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[var(--warna-permukaan-sekunder)] whitespace-nowrap"
          >
            <Landmark className="w-4 h-4" />
            <span>Rekening Bank</span>
          </Link>
          <Link
            to="/aktivitas"
            className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[var(--warna-permukaan-sekunder)] whitespace-nowrap"
          >
            <History className="w-4 h-4" />
            <span>Riwayat Aktivitas</span>
          </Link>
          <button
            type="button"
            onClick={handleKeluar}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--warna-teks)]">
              Kelengkapan Profil &amp; Verifikasi
            </h2>
            <p className="text-xs text-[var(--warna-teks-redup)]">
              {dukungKredensial
                ? 'Lengkapi identitas usaha, sertifikasi sektor, dan dokumen pendukung untuk verifikasi penuh.'
                : 'Pastikan data akun dan legalitas perusahaan terisi akurat untuk kelancaran transaksi.'}
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-[#14452F] dark:text-emerald-300 angka-tabular">
            {jumlahSelesai} / {daftarChecklist.length} Tahap ({persentaseSiap}%)
          </span>
        </div>

        <div className="h-2 rounded-full bg-[var(--warna-permukaan-sekunder)] overflow-hidden">
          <div
            className="h-full bg-[#14452F] dark:bg-emerald-400 transition-all duration-300"
            style={{ width: `${persentaseSiap}%` }}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {daftarChecklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTabAktif(item.tab)}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--warna-garis)] hover:bg-[var(--warna-permukaan-sekunder)] text-left flex items-center gap-2 text-xs font-medium tombol-halus cursor-pointer"
            >
              {item.selesai ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-[var(--warna-teks-redup)] shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Bagian pengaturan profil"
        className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--warna-permukaan-sekunder)] border border-[var(--warna-garis)] w-fit"
      >
        {daftarTab.map((t) => {
          const Ikon = t.ikon;
          const aktif = tabAktif === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => setTabAktif(t.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 tombol-halus cursor-pointer whitespace-nowrap ${
                aktif
                  ? 'bg-[var(--warna-permukaan)] text-[var(--warna-teks)] shadow-sm'
                  : 'text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)]'
              }`}
            >
              <Ikon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatProfil} />

      {sukses && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-900 dark:text-emerald-200">
          {sukses}
        </div>
      )}

      {memuat ? (
        <SkeletonDaftarBaris jumlah={3} label="Memuat profil dan pengaturan..." />
      ) : tabAktif === 'kredensial' && dukungKredensial ? (
        <KomponenKredensialProdusen
          roleUser={pengguna?.role_user}
          kredensialAwal={kredensialProdusen}
          dokumenAwal={dokumenVerifikasi}
          onKredensialBerubah={setKredensialProdusen}
          onDokumenBerubah={setDokumenVerifikasi}
        />
      ) : tabAktif === 'keamanan' ? (
        <form
          onSubmit={simpanSandi}
          className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 sm:p-7 space-y-5 max-w-3xl"
        >
          <div className="space-y-1 pb-4 border-b border-[var(--warna-garis)]">
            <h2 className="text-lg font-bold">Ubah Kata Sandi Akun</h2>
            <p className="text-sm text-[var(--warna-teks-redup)]">
              Gunakan kombinasi minimal 8 karakter yang kuat dan tidak digunakan di layanan lain.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="s_lama" className="block text-sm font-medium">
                Kata Sandi Saat Ini
              </label>
              <input
                id="s_lama"
                type="password"
                required
                value={sandiForm.kata_sandi_lama}
                onChange={(e) => setSandiForm((f) => ({ ...f, kata_sandi_lama: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="s_baru" className="block text-sm font-medium">
                Kata Sandi Baru (min. 8 karakter)
              </label>
              <input
                id="s_baru"
                type="password"
                minLength={8}
                required
                value={sandiForm.kata_sandi_baru}
                onChange={(e) => setSandiForm((f) => ({ ...f, kata_sandi_baru: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] tombol-halus cursor-pointer"
          >
            Simpan Kata Sandi Baru
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <form
            onSubmit={simpanProfil}
            className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 space-y-4"
          >
            <h2 className="text-lg font-bold pb-3 border-b border-[var(--warna-garis)]">
              Data Pribadi
            </h2>
            <div className="space-y-1.5">
              <label htmlFor="p_nama" className="block text-sm font-medium">
                Nama Lengkap
              </label>
              <input
                id="p_nama"
                type="text"
                required
                value={profilForm.nama_lengkap}
                onChange={(e) => setProfilForm((f) => ({ ...f, nama_lengkap: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="p_hp" className="block text-sm font-medium">
                Nomor HP
              </label>
              <input
                id="p_hp"
                type="text"
                required
                value={profilForm.no_hp}
                onChange={(e) => setProfilForm((f) => ({ ...f, no_hp: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="p_kota" className="block text-sm font-medium">
                  Kota / Wilayah
                </label>
                <input
                  id="p_kota"
                  type="text"
                  required
                  value={profilForm.kota_wilayah}
                  onChange={(e) => setProfilForm((f) => ({ ...f, kota_wilayah: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="p_negara" className="block text-sm font-medium">
                  Asal Negara
                </label>
                <input
                  id="p_negara"
                  type="text"
                  required
                  value={profilForm.asal_negara}
                  onChange={(e) => setProfilForm((f) => ({ ...f, asal_negara: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] tombol-halus cursor-pointer"
            >
              Simpan Data Pribadi
            </button>
          </form>

          <form
            onSubmit={simpanPerusahaan}
            className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 space-y-4"
          >
            <h2 className="text-lg font-bold pb-3 border-b border-[var(--warna-garis)]">
              Legalitas Perusahaan / Usaha
            </h2>
            <div className="space-y-1.5">
              <label htmlFor="c_nama" className="block text-sm font-medium">
                Nama Perusahaan / Kelompok Tani
              </label>
              <input
                id="c_nama"
                type="text"
                required
                value={perusahaanForm.nama_perusahaan}
                onChange={(e) =>
                  setPerusahaanForm((f) => ({ ...f, nama_perusahaan: e.target.value }))
                }
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="c_izin" className="block text-sm font-medium">
                  NPWP / Tax ID / NIB
                </label>
                <input
                  id="c_izin"
                  type="text"
                  required
                  value={perusahaanForm.nomor_izin_npwp_taxid}
                  onChange={(e) =>
                    setPerusahaanForm((f) => ({ ...f, nomor_izin_npwp_taxid: e.target.value }))
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="c_pic" className="block text-sm font-medium">
                  PIC Kontak
                </label>
                <input
                  id="c_pic"
                  type="text"
                  required
                  value={perusahaanForm.pic_kontak}
                  onChange={(e) => setPerusahaanForm((f) => ({ ...f, pic_kontak: e.target.value }))}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="c_alamat" className="block text-sm font-medium">
                Alamat Kantor / Gudang / Pelabuhan
              </label>
              <textarea
                id="c_alamat"
                rows={2}
                required
                value={perusahaanForm.alamat_kantor_pelabuhan}
                onChange={(e) =>
                  setPerusahaanForm((f) => ({ ...f, alamat_kantor_pelabuhan: e.target.value }))
                }
                className="w-full p-3 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] tombol-halus cursor-pointer"
            >
              Perbarui Data Legalitas
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
