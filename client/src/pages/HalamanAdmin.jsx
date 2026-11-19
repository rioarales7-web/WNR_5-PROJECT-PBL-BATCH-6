import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import { KeadaanKosong, MemuatHalaman, PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatRupiah, labelMetodeBayar, labelStatusPengiriman } from '../utils/format.js';

const TAB_VALID = ['legal', 'pembayaran', 'pengiriman', 'faq'];

export default function HalamanAdmin() {
  const { toastSukses, toastGalat, toastInfo } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabAwal = TAB_VALID.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'legal';
  const [tab, setTab] = useState(tabAwal);
  const [legalList, setLegalList] = useState([]);
  const [bayarList, setBayarList] = useState([]);
  const [kirimList, setKirimList] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [pesan, setPesan] = useState('');

  const [editFaqId, setEditFaqId] = useState(null);
  const [menyimpanFaq, setMenyimpanFaq] = useState(false);
  const [formFaq, setFormFaq] = useState({
    kategori: 'Umum',
    pertanyaan: '',
    jawaban: '',
    urutan: 1,
    status_aktif: true,
  });

  const muatSemua = useCallback(async () => {
    setMemuat(true);
    setGalat('');
    try {
      const [resLegal, resBayar, resKirim, resFaq] = await Promise.all([
        panggilApi('/admin/legal'),
        panggilApi('/admin/pembayaran'),
        panggilApi('/pengiriman'),
        panggilApi('/admin/faq'),
      ]);
      setLegalList(resLegal.daftar || []);
      setBayarList(resBayar.pembayaran || []);
      setKirimList(resKirim.pengiriman || []);
      setFaqList(resFaq.faq || []);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatSemua();
  }, [muatSemua]);

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab && TAB_VALID.includes(paramTab)) {
      setTab(paramTab);
    }
  }, [searchParams]);

  const pilihTab = (kunci) => {
    setTab(kunci);
    setSearchParams({ tab: kunci }, { replace: true });
  };

  const verifikasiLegal = async (profilId, status) => {
    setPesan('');
    try {
      const res = await panggilApi(`/admin/legal/${profilId}`, {
        method: 'PATCH',
        body: { status_verifikasi_legal: status },
      });
      setPesan(res.pesan);
      toastSukses(res.pesan);
      await muatSemua();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const konfirmasiBayar = async (paymentId, status) => {
    setPesan('');
    try {
      const res = await panggilApi(`/admin/pembayaran/${paymentId}`, {
        method: 'PATCH',
        body: { status_pembayaran: status },
      });
      setPesan(res.pesan);
      toastSukses(res.pesan);
      await muatSemua();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const perbaruiPengiriman = async (orderId, statusPengiriman) => {
    setPesan('');
    try {
      const res = await panggilApi(`/admin/pengiriman/${orderId}`, {
        method: 'PUT',
        body: { status_pengiriman: statusPengiriman },
      });
      setPesan(res.pesan);
      toastSukses(res.pesan);
      await muatSemua();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const resetFormFaq = () => {
    setEditFaqId(null);
    setFormFaq({
      kategori: 'Umum',
      pertanyaan: '',
      jawaban: '',
      urutan: faqList.length + 1,
      status_aktif: true,
    });
  };

  const mulaiEditFaq = (item) => {
    setEditFaqId(item.faq_id);
    setFormFaq({
      kategori: item.kategori || 'Umum',
      pertanyaan: item.pertanyaan || '',
      jawaban: item.jawaban || '',
      urutan: Number(item.urutan) || 0,
      status_aktif: Boolean(item.status_aktif),
    });
  };

  const simpanFaq = async (e) => {
    e.preventDefault();
    setPesan('');
    setGalat('');
    setMenyimpanFaq(true);
    try {
      const payload = {
        ...formFaq,
        urutan: Number(formFaq.urutan) || 0,
      };
      if (editFaqId) {
        const res = await panggilApi(`/admin/faq/${editFaqId}`, {
          method: 'PUT',
          body: payload,
        });
        setPesan(res.pesan);
        toastSukses(res.pesan);
      } else {
        const res = await panggilApi('/admin/faq', {
          method: 'POST',
          body: payload,
        });
        setPesan(res.pesan);
        toastSukses(res.pesan);
      }
      resetFormFaq();
      await muatSemua();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    } finally {
      setMenyimpanFaq(false);
    }
  };

  const toggleStatusFaq = async (item) => {
    setPesan('');
    setGalat('');
    const aktifBaru = !item.status_aktif;
    try {
      const res = await panggilApi(`/admin/faq/${item.faq_id}`, {
        method: 'PUT',
        body: { status_aktif: aktifBaru },
      });
      setPesan(res.pesan);
      toastSukses(aktifBaru ? 'FAQ diaktifkan di beranda.' : 'FAQ disembunyikan dari beranda.');
      await muatSemua();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  const hapusFaq = async (faqId) => {
    setPesan('');
    setGalat('');
    try {
      const res = await panggilApi(`/admin/faq/${faqId}`, { method: 'DELETE' });
      setPesan(res.pesan);
      toastInfo(res.pesan);
      if (editFaqId === faqId) {
        resetFormFaq();
      }
      await muatSemua();
    } catch (err) {
      setGalat(err.message);
      toastGalat(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Panel Administrator</h1>
        <p className="text-sm text-[#53665c] dark:text-emerald-200/75">
          Verifikasi legalitas entitas usaha, konfirmasi pembayaran L/C dan T/T, perbarui status
          kargo, serta kelola FAQ beranda.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-stone-200/70 dark:bg-emerald-950/60 w-fit">
        {[
          { kunci: 'legal', label: 'Verifikasi Legalitas' },
          { kunci: 'pembayaran', label: 'Konfirmasi Pembayaran' },
          { kunci: 'pengiriman', label: 'Status Pengiriman' },
          { kunci: 'faq', label: 'Kelola FAQ' },
        ].map((item) => (
          <button
            key={item.kunci}
            type="button"
            onClick={() => pilihTab(item.kunci)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              tab === item.kunci
                ? 'bg-white dark:bg-[#12201b] text-[#102119] dark:text-white shadow-sm'
                : 'text-[#53665c] dark:text-emerald-200/75'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <PesanGalat pesan={galat} onCobaLagi={muatSemua} />

      {pesan && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-900 dark:text-emerald-200">
          {pesan}
        </div>
      )}

      {memuat ? (
        <MemuatHalaman teks="Memuat data panel admin..." />
      ) : tab === 'legal' ? (
        legalList.length === 0 ? (
          <KeadaanKosong
            judul="Tidak ada data perusahaan"
            deskripsi="Belum ada entitas terdaftar."
          />
        ) : (
          <div className="space-y-3">
            {legalList.map((item) => (
              <div
                key={item.profil_id}
                className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                    {item.role_user} · Status:{' '}
                    <span className="font-semibold text-[#14452F] dark:text-emerald-300">
                      {item.status_verifikasi_legal}
                    </span>
                  </p>
                  <h2 className="font-bold">
                    {item.nama_perusahaan} ({item.nama_lengkap})
                  </h2>
                  <p className="text-xs font-mono">
                    NPWP / Tax ID: {item.nomor_izin_npwp_taxid || '-'}
                  </p>
                  <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                    {item.alamat_kantor_pelabuhan}
                  </p>
                  {item.kredensial_produsen && (
                    <p className="text-xs text-[#0f5c6e] dark:text-cyan-300 font-medium pt-1">
                      Kredensial {item.kredensial_produsen.sektor}:{' '}
                      <span className="font-mono">
                        {item.kredensial_produsen.nomor_registrasi_sektor}
                      </span>{' '}
                      · {item.kredensial_produsen.luas_kapasitas}
                    </p>
                  )}
                  {Array.isArray(item.dokumen_verifikasi) && item.dokumen_verifikasi.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <span className="text-[#53665c] dark:text-emerald-200/75">
                        Dokumen ({item.dokumen_verifikasi.length}):
                      </span>
                      {item.dokumen_verifikasi.map((dok) =>
                        dok.path_file ? (
                          <a
                            key={dok.dokumen_id}
                            href={dok.path_file}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[#14452F] dark:text-emerald-300 underline"
                          >
                            {dok.jenis_dokumen}
                          </a>
                        ) : (
                          <span key={dok.dokumen_id} className="text-[var(--warna-teks)]">
                            {dok.jenis_dokumen}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => verifikasiLegal(item.profil_id, 'Terverifikasi')}
                    className="h-10 px-4 rounded-xl text-xs font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] cursor-pointer"
                  >
                    Verifikasi
                  </button>
                  <button
                    type="button"
                    onClick={() => verifikasiLegal(item.profil_id, 'Ditolak')}
                    className="h-10 px-4 rounded-xl text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'pembayaran' ? (
        bayarList.length === 0 ? (
          <KeadaanKosong
            judul="Belum ada transaksi pembayaran"
            deskripsi="Data pembayaran kosong."
          />
        ) : (
          <div className="space-y-3">
            {bayarList.map((pb) => (
              <div
                key={pb.payment_id}
                className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono text-[#53665c] dark:text-emerald-200/75">
                    {pb.nomor_invoice} · {pb.kode_transaksi_bank} · {pb.status_pembayaran}
                  </p>
                  <h2 className="font-bold angka-tabular">
                    {formatRupiah(pb.nominal_dibayar_idr)} —{' '}
                    {labelMetodeBayar(pb.metode_pembayaran)}
                  </h2>
                  <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                    Pembeli: {pb.nama_buyer} · Bank: {pb.bank_pengirim_tujuan}
                  </p>
                  {pb.bukti_transfer && (
                    <a
                      href={pb.bukti_transfer}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-semibold text-[#0f5c6e] dark:text-cyan-300 underline"
                    >
                      Lihat Bukti Transfer
                    </a>
                  )}
                </div>

                {pb.status_pembayaran === 'Menunggu' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => konfirmasiBayar(pb.payment_id, 'Lunas')}
                      className="h-10 px-4 rounded-xl text-xs font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] cursor-pointer"
                    >
                      Konfirmasi Lunas
                    </button>
                    <button
                      type="button"
                      onClick={() => konfirmasiBayar(pb.payment_id, 'Gagal')}
                      className="h-10 px-4 rounded-xl text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Tandai Gagal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : tab === 'pengiriman' ? (
        kirimList.length === 0 ? (
          <KeadaanKosong judul="Belum ada data pengiriman" deskripsi="Belum ada kargo aktif." />
        ) : (
          <div className="space-y-3">
            {kirimList.map((pg) => (
              <div
                key={pg.pengiriman_id}
                className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono text-[#53665c] dark:text-emerald-200/75">
                    {pg.nomor_invoice} · {pg.nomor_kontainer_resi}
                  </p>
                  <h2 className="font-bold">
                    {pg.pelabuhan_asal} → {pg.pelabuhan_tujuan}
                  </h2>
                  <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                    Status Saat Ini: {labelStatusPengiriman(pg.status_pengiriman)}
                  </p>
                </div>

                <select
                  aria-label={`Ubah status pengiriman ${pg.nomor_invoice}`}
                  value={pg.status_pengiriman}
                  onChange={(e) => perbaruiPengiriman(pg.order_id, e.target.value)}
                  className="h-10 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-xs font-semibold"
                >
                  <option value="Persiapan_Dokumen">Persiapan Dokumen</option>
                  <option value="Muat_Kargo">Muat Kargo</option>
                  <option value="Bea_Cukai">Pemeriksaan Bea Cukai</option>
                  <option value="Dalam_Perjalanan">Dalam Perjalanan</option>
                  <option value="Tiba_Di_Tujuan">Tiba di Tujuan</option>
                </select>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={simpanFaq}
            className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-6 space-y-4"
          >
            <h2 className="text-lg font-bold">
              {editFaqId ? 'Perbarui Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ'}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="faq-kategori" className="block text-sm font-medium">
                  Kategori
                </label>
                <select
                  id="faq-kategori"
                  value={formFaq.kategori}
                  onChange={(e) => setFormFaq((f) => ({ ...f, kategori: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#12201b] text-sm"
                >
                  <option value="Umum">Umum</option>
                  <option value="Pemesanan">Pemesanan</option>
                  <option value="Pembayaran">Pembayaran</option>
                  <option value="Pengiriman Ekspor">Pengiriman Ekspor</option>
                  <option value="Produsen">Produsen</option>
                  <option value="Legalitas">Legalitas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="faq-urutan" className="block text-sm font-medium">
                  Urutan Tampil
                </label>
                <input
                  id="faq-urutan"
                  type="number"
                  min="0"
                  value={formFaq.urutan}
                  onChange={(e) => setFormFaq((f) => ({ ...f, urutan: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm angka-tabular"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="faq-pertanyaan" className="block text-sm font-medium">
                Pertanyaan
              </label>
              <input
                id="faq-pertanyaan"
                type="text"
                required
                value={formFaq.pertanyaan}
                onChange={(e) => setFormFaq((f) => ({ ...f, pertanyaan: e.target.value }))}
                placeholder="Tuliskan pertanyaan yang sering diajukan..."
                className="w-full h-11 px-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="faq-jawaban" className="block text-sm font-medium">
                Jawaban
              </label>
              <textarea
                id="faq-jawaban"
                rows={4}
                required
                value={formFaq.jawaban}
                onChange={(e) => setFormFaq((f) => ({ ...f, jawaban: e.target.value }))}
                placeholder="Tuliskan penjelasan lengkap..."
                className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-transparent text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formFaq.status_aktif}
                onChange={(e) => setFormFaq((f) => ({ ...f, status_aktif: e.target.checked }))}
                className="w-4 h-4 accent-[#14452F]"
              />
              <span>Tampilkan di halaman Beranda</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={menyimpanFaq}
                className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 transition-colors cursor-pointer"
              >
                {menyimpanFaq ? 'Menyimpan...' : editFaqId ? 'Simpan Perubahan FAQ' : 'Tambah FAQ'}
              </button>
              {editFaqId && (
                <button
                  type="button"
                  onClick={resetFormFaq}
                  className="h-11 px-4 rounded-xl border border-stone-300 dark:border-emerald-800 text-sm cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {faqList.length === 0 ? (
              <KeadaanKosong
                judul="Belum ada item FAQ"
                deskripsi="Gunakan formulir di sebelah kiri untuk menambahkan pertanyaan dan jawaban baru."
              />
            ) : (
              faqList.map((item) => (
                <div
                  key={item.faq_id}
                  className="rounded-2xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#12201b] p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs text-[#53665c] dark:text-emerald-200/75">
                        Urutan #{item.urutan} · {item.kategori} ·{' '}
                        <span
                          className={
                            item.status_aktif
                              ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'text-red-600 dark:text-red-400 font-semibold'
                          }
                        >
                          {item.status_aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </p>
                      <h3 className="font-bold text-sm sm:text-base">{item.pertanyaan}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleStatusFaq(item)}
                        className="h-9 px-3 rounded-xl border border-stone-300 dark:border-emerald-800 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                      >
                        {item.status_aktif ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => mulaiEditFaq(item)}
                        aria-label={`Ubah FAQ ${item.pertanyaan}`}
                        className="w-9 h-9 rounded-xl border border-stone-300 dark:border-emerald-800 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => hapusFaq(item.faq_id)}
                        aria-label={`Hapus FAQ ${item.pertanyaan}`}
                        className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#53665c] dark:text-emerald-100/80 leading-relaxed">
                    {item.jawaban}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
