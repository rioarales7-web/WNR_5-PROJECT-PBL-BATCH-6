import { useEffect, useRef, useState } from 'react';
import {
  Anchor,
  Beef,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Leaf,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { panggilApi } from '../api/klienApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatTanggal } from '../utils/format.js';

const KONFIGURASI_SEKTOR = {
  Pertanian: {
    ikon: Leaf,
    judul: 'Sertifikasi Lahan & Mutu Pertanian',
    deskripsi:
      'Lengkapi registrasi kebun, sertifikasi GAP/Organik, serta status kepemilikan lahan panen.',
    labelRegistrasi: 'Nomor Sertifikat Lahan / Register GAP',
    contohRegistrasi: 'GAP-IND-1104-2026',
    contohLembaga: 'Kementerian Pertanian RI / Lembaga Sertifikasi Organik',
    labelKapasitas: 'Luas Lahan & Estimasi Panen',
    contohKapasitas: '18,5 Hektar · Kapasitas 14 Ton/Tahun',
    opsiDokumen: [
      'Sertifikat Lahan / GAP',
      'Sertifikat Organik SNI / Indikasi Geografis',
      'Surat Keterangan Kepemilikan / Sewa Lahan',
      'NIB / Akta Kelompok Tani',
      'Foto Lokasi Sentra / Kebun',
    ],
  },
  Perikanan: {
    ikon: Anchor,
    judul: 'Lisensi Perikanan & Rantai Dingin',
    deskripsi:
      'Cantumkan nomor SIUP/IUP perikanan, sertifikasi HACCP/SKP, serta kapasitas armada atau tambak.',
    labelRegistrasi: 'Nomor SIUP / IUP Perikanan',
    contohRegistrasi: 'SIUP-KKP-7301-2026',
    contohLembaga: 'Kementerian Kelautan dan Perikanan (KKP) / BKIPM',
    labelKapasitas: 'Armada Kapal / Luas Tambak & Cold Storage',
    contohKapasitas: '3 Kapal 30 GT · Cold Storage 25 Ton',
    opsiDokumen: [
      'SIUP / IUP Perikanan',
      'Sertifikat SKP / HACCP Rantai Dingin',
      'Sertifikat Cara Budidaya Ikan yang Baik (CBIB)',
      'Pas Besar / Dokumen Kapal Penangkapan',
      'Foto Tambak / Unit Pengolahan Ikan',
    ],
  },
  Peternakan: {
    ikon: Beef,
    judul: 'Sertifikasi Veteriner & Peternakan',
    deskripsi:
      'Daftarkan Nomor Kontrol Veteriner (NKV), sertifikasi halal, serta kapasitas kandang dan RPH.',
    labelRegistrasi: 'Nomor Kontrol Veteriner (NKV)',
    contohRegistrasi: 'NKV-3309-RPH-2026',
    contohLembaga: 'Dinas Peternakan & Kesehatan Hewan / BPJPH',
    labelKapasitas: 'Kapasitas Kandang / Produksi Ternak',
    contohKapasitas: '450 Ekor Sapi · RPH Berpendingin',
    opsiDokumen: [
      'Sertifikat Nomor Kontrol Veteriner (NKV)',
      'Sertifikat Halal BPJPH / MUI',
      'Surat Keterangan Kesehatan Hewan (SKKH)',
      'Izin Usaha Peternakan / Koperasi',
      'Foto Kandang / Fasilitas Pendingin',
    ],
  },
};

function sektorBawaanPeran(roleUser) {
  if (roleUser === 'Nelayan') return 'Perikanan';
  if (roleUser === 'Peternak') return 'Peternakan';
  return 'Pertanian';
}

function formatUkuranBerkas(byte) {
  const n = Number(byte) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function lencanaStatus(status) {
  if (status === 'Terverifikasi') {
    return {
      ikon: CheckCircle2,
      teks: 'Terverifikasi',
      kelas: 'text-emerald-700 dark:text-emerald-300',
    };
  }
  if (status === 'Ditolak') {
    return {
      ikon: XCircle,
      teks: 'Perlu Perbaikan',
      kelas: 'text-red-600 dark:text-red-400',
    };
  }
  return {
    ikon: Clock,
    teks: 'Menunggu Verifikasi',
    kelas: 'text-amber-700 dark:text-amber-300',
  };
}

export default function KomponenKredensialProdusen({
  roleUser,
  kredensialAwal,
  dokumenAwal = [],
  onKredensialBerubah,
  onDokumenBerubah,
}) {
  const { toastSukses, toastGalat, toastInfo } = useToast();
  const inputFileRef = useRef(null);

  const sektorDefault = kredensialAwal?.sektor || sektorBawaanPeran(roleUser);

  const [formKredensial, setFormKredensial] = useState({
    sektor: sektorDefault,
    nomor_registrasi_sektor: kredensialAwal?.nomor_registrasi_sektor || '',
    lembaga_penerbit: kredensialAwal?.lembaga_penerbit || '',
    luas_kapasitas: kredensialAwal?.luas_kapasitas || '',
    lokasi_sentra: kredensialAwal?.lokasi_sentra || '',
    tanggal_berlaku: kredensialAwal?.tanggal_berlaku
      ? String(kredensialAwal.tanggal_berlaku).slice(0, 10)
      : '',
    catatan_tambahan: kredensialAwal?.catatan_tambahan || '',
    detail_sektor: kredensialAwal?.detail_sektor || {},
  });

  const [statusVerifikasi, setStatusVerifikasi] = useState(
    kredensialAwal?.status_verifikasi || 'Belum_Lengkap'
  );
  const [menyimpanKredensial, setMenyimpanKredensial] = useState(false);

  const [dokumenList, setDokumenList] = useState(dokumenAwal);
  const [jenisDokumen, setJenisDokumen] = useState(
    KONFIGURASI_SEKTOR[sektorDefault].opsiDokumen[0]
  );
  const [nomorDokumen, setNomorDokumen] = useState('');
  const [berkasTerpilih, setBerkasTerpilih] = useState(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [menghapusId, setMenghapusId] = useState(null);

  useEffect(() => {
    const sek = kredensialAwal?.sektor || sektorBawaanPeran(roleUser);
    setFormKredensial({
      sektor: sek,
      nomor_registrasi_sektor: kredensialAwal?.nomor_registrasi_sektor || '',
      lembaga_penerbit: kredensialAwal?.lembaga_penerbit || '',
      luas_kapasitas: kredensialAwal?.luas_kapasitas || '',
      lokasi_sentra: kredensialAwal?.lokasi_sentra || '',
      tanggal_berlaku: kredensialAwal?.tanggal_berlaku
        ? String(kredensialAwal.tanggal_berlaku).slice(0, 10)
        : '',
      catatan_tambahan: kredensialAwal?.catatan_tambahan || '',
      detail_sektor: kredensialAwal?.detail_sektor || {},
    });
    setStatusVerifikasi(kredensialAwal?.status_verifikasi || 'Belum_Lengkap');
    setJenisDokumen(KONFIGURASI_SEKTOR[sek].opsiDokumen[0]);
  }, [kredensialAwal, roleUser]);

  useEffect(() => {
    setDokumenList(dokumenAwal || []);
  }, [dokumenAwal]);

  const konfigurasiAktif =
    KONFIGURASI_SEKTOR[formKredensial.sektor] || KONFIGURASI_SEKTOR.Pertanian;

  const gantiSektor = (sektorBaru) => {
    setFormKredensial((prev) => ({
      ...prev,
      sektor: sektorBaru,
    }));
    setJenisDokumen(KONFIGURASI_SEKTOR[sektorBaru].opsiDokumen[0]);
  };

  const ubahDetailSektor = (kunci, nilai) => {
    setFormKredensial((prev) => ({
      ...prev,
      detail_sektor: {
        ...(prev.detail_sektor || {}),
        [kunci]: nilai,
      },
    }));
  };

  const handleSimpanKredensial = async (e) => {
    e.preventDefault();
    setMenyimpanKredensial(true);
    try {
      const res = await panggilApi('/profil/kredensial-produsen', {
        method: 'PUT',
        body: formKredensial,
      });
      setStatusVerifikasi(res.kredensial_produsen?.status_verifikasi || 'Menunggu');
      if (onKredensialBerubah) onKredensialBerubah(res.kredensial_produsen);
      toastSukses(res.pesan);
    } catch (err) {
      toastGalat(err.message);
    } finally {
      setMenyimpanKredensial(false);
    }
  };

  const handlePilihBerkas = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tipeValid = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!tipeValid.includes(file.type)) {
      toastGalat('Format berkas hanya mendukung PDF, JPG, PNG, atau WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastGalat('Ukuran maksimal dokumen verifikasi adalah 5 MB.');
      e.target.value = '';
      return;
    }
    setBerkasTerpilih(file);
  };

  const handleUnggahDokumen = async (e) => {
    e.preventDefault();
    if (!berkasTerpilih) {
      toastGalat('Pilih berkas dokumen PDF atau gambar terlebih dahulu.');
      return;
    }
    setMengunggah(true);
    try {
      const fd = new FormData();
      fd.append('jenis_dokumen', jenisDokumen);
      fd.append('nomor_dokumen', nomorDokumen.trim());
      fd.append('berkas_dokumen', berkasTerpilih);

      const res = await panggilApi('/profil/dokumen-verifikasi', {
        method: 'POST',
        body: fd,
      });

      const daftarBaru = [res.dokumen, ...dokumenList];
      setDokumenList(daftarBaru);
      if (onDokumenBerubah) onDokumenBerubah(daftarBaru);

      setNomorDokumen('');
      setBerkasTerpilih(null);
      if (inputFileRef.current) inputFileRef.current.value = '';
      toastSukses(res.pesan);
    } catch (err) {
      toastGalat(err.message);
    } finally {
      setMengunggah(false);
    }
  };

  const handleHapusDokumen = async (dokumenId) => {
    setMenghapusId(dokumenId);
    try {
      const res = await panggilApi(`/profil/dokumen-verifikasi/${dokumenId}`, {
        method: 'DELETE',
      });
      const daftarBaru = dokumenList.filter((d) => d.dokumen_id !== dokumenId);
      setDokumenList(daftarBaru);
      if (onDokumenBerubah) onDokumenBerubah(daftarBaru);
      toastInfo(res.pesan);
    } catch (err) {
      toastGalat(err.message);
    } finally {
      setMenghapusId(null);
    }
  };

  const infoStatus = lencanaStatus(
    statusVerifikasi === 'Belum_Lengkap' ? 'Menunggu' : statusVerifikasi
  );
  const IkonStatus = infoStatus.ikon;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[var(--warna-garis)]">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--warna-teks)]">{konfigurasiAktif.judul}</h2>
            <p className="text-sm text-[var(--warna-teks-redup)] max-w-2xl">
              {konfigurasiAktif.deskripsi}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${infoStatus.kelas}`}
          >
            <IkonStatus className="w-4 h-4" />
            <span>
              {statusVerifikasi === 'Belum_Lengkap' ? 'Belum Dilengkapi' : infoStatus.teks}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--warna-teks-redup)]">
            Pilih Sektor Operasional Produsen
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.entries(KONFIGURASI_SEKTOR).map(([namaSektor, cfg]) => {
              const Ikon = cfg.ikon;
              const aktif = formKredensial.sektor === namaSektor;
              return (
                <button
                  key={namaSektor}
                  type="button"
                  onClick={() => gantiSektor(namaSektor)}
                  className={`px-4 py-3 rounded-xl border text-left flex items-center gap-3 tombol-halus cursor-pointer ${
                    aktif
                      ? 'border-[#14452F] dark:border-emerald-400 bg-[#14452F]/10 dark:bg-emerald-900/35 text-[#14452F] dark:text-emerald-200 font-semibold'
                      : 'border-[var(--warna-garis)] bg-transparent text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] hover:bg-[var(--warna-permukaan-sekunder)]'
                  }`}
                >
                  <Ikon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{namaSektor}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSimpanKredensial} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="kred_reg" className="block text-sm font-medium">
                {konfigurasiAktif.labelRegistrasi}
              </label>
              <input
                id="kred_reg"
                type="text"
                required
                value={formKredensial.nomor_registrasi_sektor}
                onChange={(e) =>
                  setFormKredensial((f) => ({ ...f, nomor_registrasi_sektor: e.target.value }))
                }
                placeholder={konfigurasiAktif.contohRegistrasi}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="kred_lembaga" className="block text-sm font-medium">
                Lembaga / Instansi Penerbit
              </label>
              <input
                id="kred_lembaga"
                type="text"
                required
                value={formKredensial.lembaga_penerbit}
                onChange={(e) =>
                  setFormKredensial((f) => ({ ...f, lembaga_penerbit: e.target.value }))
                }
                placeholder={konfigurasiAktif.contohLembaga}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="kred_kapasitas" className="block text-sm font-medium">
                {konfigurasiAktif.labelKapasitas}
              </label>
              <input
                id="kred_kapasitas"
                type="text"
                required
                value={formKredensial.luas_kapasitas}
                onChange={(e) =>
                  setFormKredensial((f) => ({ ...f, luas_kapasitas: e.target.value }))
                }
                placeholder={konfigurasiAktif.contohKapasitas}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="kred_berlaku" className="block text-sm font-medium">
                Masa Berlaku Sertifikat / Izin
              </label>
              <input
                id="kred_berlaku"
                type="date"
                value={formKredensial.tanggal_berlaku}
                onChange={(e) =>
                  setFormKredensial((f) => ({ ...f, tanggal_berlaku: e.target.value }))
                }
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm angka-tabular focus:outline-none focus:ring-2 focus:ring-[#14452F]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kred_lokasi" className="block text-sm font-medium">
              Lokasi Sentra Lahan / Pelabuhan / Kandang
            </label>
            <input
              id="kred_lokasi"
              type="text"
              required
              value={formKredensial.lokasi_sentra}
              onChange={(e) => setFormKredensial((f) => ({ ...f, lokasi_sentra: e.target.value }))}
              placeholder="Kecamatan, Kabupaten/Kota, Provinsi atau Nama Pelabuhan Pangkalan"
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
            />
          </div>

          {formKredensial.sektor === 'Pertanian' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[var(--warna-garis)]">
              <div className="space-y-1.5">
                <label htmlFor="tani_sertifikasi" className="block text-sm font-medium">
                  Standar Sertifikasi Lahan
                </label>
                <select
                  id="tani_sertifikasi"
                  value={formKredensial.detail_sektor?.jenis_sertifikasi_lahan || ''}
                  onChange={(e) => ubahDetailSektor('jenis_sertifikasi_lahan', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm"
                >
                  <option value="">Pilih Sertifikasi Lahan</option>
                  <option value="GAP / IndoGAP">GAP / IndoGAP</option>
                  <option value="GAP / IndoGAP & Indikasi Geografis">
                    GAP &amp; Indikasi Geografis (IG)
                  </option>
                  <option value="Organik Indonesia (SNI)">Organik Indonesia (SNI)</option>
                  <option value="Rainforest Alliance / UTZ">Rainforest Alliance / UTZ</option>
                  <option value="Prima 3 / Prima 2">Prima 3 / Prima 2</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="tani_kepemilikan" className="block text-sm font-medium">
                  Status Kepemilikan Lahan
                </label>
                <select
                  id="tani_kepemilikan"
                  value={formKredensial.detail_sektor?.status_kepemilikan_lahan || ''}
                  onChange={(e) => ubahDetailSektor('status_kepemilikan_lahan', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm"
                >
                  <option value="">Pilih Status Lahan</option>
                  <option value="Milik Sendiri (SHM)">Milik Sendiri (SHM)</option>
                  <option value="Koperasi / Plasma Binaan">Koperasi / Plasma Binaan</option>
                  <option value="Hak Guna Usaha (HGU)">Hak Guna Usaha (HGU)</option>
                  <option value="Sewa Lahan Pertanian">Sewa Lahan Pertanian</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="tani_irigasi" className="block text-sm font-medium">
                  Sistem Irigasi &amp; Ketinggian
                </label>
                <input
                  id="tani_irigasi"
                  type="text"
                  value={formKredensial.detail_sektor?.sistem_irigasi || ''}
                  onChange={(e) => ubahDetailSektor('sistem_irigasi', e.target.value)}
                  placeholder="Contoh: Irigasi Teknis / 1.400 mdpl"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
                />
              </div>
            </div>
          )}

          {formKredensial.sektor === 'Perikanan' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[var(--warna-garis)]">
              <div className="space-y-1.5">
                <label htmlFor="ikan_metode" className="block text-sm font-medium">
                  Metode Penangkapan / Budidaya
                </label>
                <select
                  id="ikan_metode"
                  value={formKredensial.detail_sektor?.metode_produksi || ''}
                  onChange={(e) => ubahDetailSektor('metode_produksi', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm"
                >
                  <option value="">Pilih Metode</option>
                  <option value="Penangkapan Laut Dalam">Penangkapan Laut Dalam</option>
                  <option value="Budidaya Tambak Intensif">Budidaya Tambak Intensif</option>
                  <option value="Keramba Jaring Apung">Keramba Jaring Apung</option>
                  <option value="Unit Pengolahan Ikan (UPI)">Unit Pengolahan Ikan (UPI)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ikan_haccp" className="block text-sm font-medium">
                  Nomor Sertifikat HACCP / SKP
                </label>
                <input
                  id="ikan_haccp"
                  type="text"
                  value={formKredensial.detail_sektor?.nomor_skp_haccp || ''}
                  onChange={(e) => ubahDetailSektor('nomor_skp_haccp', e.target.value)}
                  placeholder="SKP-HACCP-8821-ID"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ikan_rantai_dingin" className="block text-sm font-medium">
                  Fasilitas Rantai Dingin
                </label>
                <input
                  id="ikan_rantai_dingin"
                  type="text"
                  value={formKredensial.detail_sektor?.fasilitas_rantai_dingin || ''}
                  onChange={(e) => ubahDetailSektor('fasilitas_rantai_dingin', e.target.value)}
                  placeholder="ABF -35°C & Reefer Kontainer"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
                />
              </div>
            </div>
          )}

          {formKredensial.sektor === 'Peternakan' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[var(--warna-garis)]">
              <div className="space-y-1.5">
                <label htmlFor="ternak_jenis" className="block text-sm font-medium">
                  Komoditas Ternak Utama
                </label>
                <select
                  id="ternak_jenis"
                  value={formKredensial.detail_sektor?.jenis_ternak_utama || ''}
                  onChange={(e) => ubahDetailSektor('jenis_ternak_utama', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm"
                >
                  <option value="">Pilih Komoditas Ternak</option>
                  <option value="Sapi Potong & Karkas">Sapi Potong &amp; Karkas</option>
                  <option value="Sapi Perah & Susu Segar">Sapi Perah &amp; Susu Segar</option>
                  <option value="Unggas & Telur Konsumsi">Unggas &amp; Telur Konsumsi</option>
                  <option value="Kambing & Domba">Kambing &amp; Domba</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ternak_halal" className="block text-sm font-medium">
                  Nomor Sertifikat Halal
                </label>
                <input
                  id="ternak_halal"
                  type="text"
                  value={formKredensial.detail_sektor?.sertifikat_halal || ''}
                  onChange={(e) => ubahDetailSektor('sertifikat_halal', e.target.value)}
                  placeholder="ID331100049201826"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="ternak_fasilitas" className="block text-sm font-medium">
                  Fasilitas RPH &amp; Chiller
                </label>
                <input
                  id="ternak_fasilitas"
                  type="text"
                  value={formKredensial.detail_sektor?.fasilitas_rph || ''}
                  onChange={(e) => ubahDetailSektor('fasilitas_rph', e.target.value)}
                  placeholder="RPH Terstandar & Chiller 0–4°C"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="kred_catatan" className="block text-sm font-medium">
              Catatan Tambahan Kurasi &amp; Operasional
            </label>
            <textarea
              id="kred_catatan"
              rows={2}
              value={formKredensial.catatan_tambahan}
              onChange={(e) =>
                setFormKredensial((f) => ({ ...f, catatan_tambahan: e.target.value }))
              }
              placeholder="Informasi jadwal panen musiman, kapasitas muat pelabuhan terdekat, atau standar mutu..."
              className="w-full p-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#14452F]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-[var(--warna-teks-redup)]">
              Perubahan kredensial sektor akan ditinjau oleh tim verifikasi admin platform.
            </p>
            <button
              type="submit"
              disabled={menyimpanKredensial}
              className="h-11 px-6 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] disabled:opacity-60 tombol-halus cursor-pointer whitespace-nowrap"
            >
              {menyimpanKredensial ? 'Menyimpan Kredensial...' : 'Simpan Kredensial Sektor'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 sm:p-7 space-y-6">
        <div className="space-y-1 pb-4 border-b border-[var(--warna-garis)]">
          <h2 className="text-lg font-bold text-[var(--warna-teks)]">Unggah Dokumen Verifikasi</h2>
          <p className="text-sm text-[var(--warna-teks-redup)]">
            Lampirkan salinan sertifikat sektor, izin usaha, atau dokumentasi sentra produksi dalam
            format PDF, JPG, PNG, atau WEBP (maks. 5 MB).
          </p>
        </div>

        <form onSubmit={handleUnggahDokumen} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="dok_jenis" className="block text-sm font-medium">
                Jenis Dokumen
              </label>
              <select
                id="dok_jenis"
                value={jenisDokumen}
                onChange={(e) => setJenisDokumen(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-sm"
              >
                {konfigurasiAktif.opsiDokumen.map((opsi) => (
                  <option key={opsi} value={opsi}>
                    {opsi}
                  </option>
                ))}
                <option value="Dokumen Legalitas Lainnya">Dokumen Legalitas Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dok_nomor" className="block text-sm font-medium">
                Nomor Dokumen (Opsional)
              </label>
              <input
                id="dok_nomor"
                type="text"
                value={nomorDokumen}
                onChange={(e) => setNomorDokumen(e.target.value)}
                placeholder="Contoh: SK-2026-0419"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--warna-garis)] bg-transparent text-sm font-mono"
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-[var(--warna-garis)] bg-[var(--warna-permukaan-sekunder)]/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--warna-teks)]">
                {berkasTerpilih ? berkasTerpilih.name : 'Pilih berkas dokumen dari perangkat Anda'}
              </p>
              <p className="text-xs text-[var(--warna-teks-redup)] angka-tabular">
                {berkasTerpilih
                  ? `Ukuran: ${formatUkuranBerkas(berkasTerpilih.size)} · Siap diunggah`
                  : 'Mendukung PDF, JPG, PNG, atau WEBP hingga 5 MB'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <input
                ref={inputFileRef}
                id="dok_file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handlePilihBerkas}
                className="sr-only"
              />
              <label
                htmlFor="dok_file"
                className="h-10 px-4 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-xs font-semibold text-[var(--warna-teks)] hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{berkasTerpilih ? 'Ganti Berkas' : 'Pilih Berkas'}</span>
              </label>

              <button
                type="submit"
                disabled={mengunggah || !berkasTerpilih}
                className="h-10 px-5 rounded-xl text-xs font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 tombol-halus cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{mengunggah ? 'Mengunggah...' : 'Unggah Dokumen'}</span>
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--warna-teks)]">
              Daftar Dokumen Terunggah ({dokumenList.length})
            </h3>
          </div>

          {dokumenList.length === 0 ? (
            <div className="rounded-xl border border-[var(--warna-garis)] p-6 text-center text-sm text-[var(--warna-teks-redup)]">
              Belum ada dokumen verifikasi yang diunggah. Unggah minimal 1 sertifikat atau izin
              usaha untuk mempercepat proses verifikasi produsen.
            </div>
          ) : (
            <div className="divide-y divide-[var(--warna-garis)] rounded-xl border border-[var(--warna-garis)] overflow-hidden">
              {dokumenList.map((dok) => {
                const st = lencanaStatus(dok.status_dokumen);
                const IkonSt = st.ikon;
                const adalahGambar = String(dok.mime_type || '').startsWith('image/');
                return (
                  <div
                    key={dok.dokumen_id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--warna-permukaan)] hover:bg-[var(--warna-permukaan-sekunder)]/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan-sekunder)] flex items-center justify-center shrink-0 text-[#14452F] dark:text-emerald-300">
                        {adalahGambar ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-[var(--warna-teks)] truncate">
                          {dok.jenis_dokumen}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--warna-teks-redup)]">
                          <span className="truncate max-w-[240px]">{dok.nama_file_asli}</span>
                          {dok.nomor_dokumen && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{dok.nomor_dokumen}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="angka-tabular">
                            {formatUkuranBerkas(dok.ukuran_byte)}
                          </span>
                          {dok.diunggah_pada && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="angka-tabular">
                                {formatTanggal(dok.diunggah_pada)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${st.kelas}`}
                      >
                        <IkonSt className="w-3.5 h-3.5" />
                        <span>{st.teks}</span>
                      </span>

                      {dok.path_file && (
                        <a
                          href={dok.path_file}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 px-3 rounded-lg border border-[var(--warna-garis)] text-xs font-semibold text-[#0f5c6e] dark:text-cyan-300 hover:bg-[var(--warna-permukaan-sekunder)] inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </a>
                      )}

                      <button
                        type="button"
                        disabled={menghapusId === dok.dokumen_id}
                        onClick={() => handleHapusDokumen(dok.dokumen_id)}
                        aria-label={`Hapus dokumen ${dok.jenis_dokumen}`}
                        className="w-9 h-9 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
