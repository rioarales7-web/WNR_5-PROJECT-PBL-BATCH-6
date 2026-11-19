import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { AKUN_SIMULASI_PUBLIK, KATA_SANDI_SIMULASI } from '../utils/simulasiSandbox.js';
import {
  formatPesanGalatServer,
  validasiIdentitasLogin,
  validasiPasswordLogin,
} from '../utils/validasiForm.js';
import { PesanGalat } from './KeadaanHalaman.jsx';

export default function FormMasuk({
  judul = 'Masuk ke Akun Anda',
  subjudul = 'Masuk dengan email atau nomor handphone untuk mengakses beranda, katalog komoditas, dan transaksi.',
  gunakanHeadingUtama = false,
  className = '',
}) {
  const { masuk } = useAuth();
  const { toastSukses, toastGalat, toastInfo } = useToast();
  const navigasi = useNavigate();

  const [identitas, setIdentitas] = useState('');
  const [password, setPassword] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [bukaSimulasi, setBukaSimulasi] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [disentuh, setDisentuh] = useState({ identitas: false, password: false });
  const [galatField, setGalatField] = useState({ identitas: '', password: '' });
  const [galatServer, setGalatServer] = useState({ pesan: '', status: null });

  const periksaField = (nama, nilai) => {
    if (nama === 'identitas') {
      return validasiIdentitasLogin(nilai);
    }
    if (nama === 'password') {
      return validasiPasswordLogin(nilai);
    }
    return '';
  };

  const handleUbahIdentitas = (e) => {
    const nilai = e.target.value;
    setIdentitas(nilai);
    if (galatServer.pesan) {
      setGalatServer({ pesan: '', status: null });
    }
    if (disentuh.identitas) {
      setGalatField((prev) => ({ ...prev, identitas: periksaField('identitas', nilai) }));
    }
  };

  const handleUbahPassword = (e) => {
    const nilai = e.target.value;
    setPassword(nilai);
    if (galatServer.pesan) {
      setGalatServer({ pesan: '', status: null });
    }
    if (disentuh.password) {
      setGalatField((prev) => ({ ...prev, password: periksaField('password', nilai) }));
    }
  };

  const handleBlur = (nama, nilai) => {
    setDisentuh((prev) => ({ ...prev, [nama]: true }));
    setGalatField((prev) => ({ ...prev, [nama]: periksaField(nama, nilai) }));
  };

  const isiAkunSimulasi = (akun) => {
    setIdentitas(akun.email);
    setPassword(KATA_SANDI_SIMULASI);
    setDisentuh({ identitas: false, password: false });
    setGalatField({ identitas: '', password: '' });
    setGalatServer({ pesan: '', status: null });
    toastInfo(`Kredensial simulasi ${akun.label_peran} diisikan.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pesanIdentitas = validasiIdentitasLogin(identitas);
    const pesanPassword = validasiPasswordLogin(password);
    setDisentuh({ identitas: true, password: true });
    setGalatField({ identitas: pesanIdentitas, password: pesanPassword });
    setGalatServer({ pesan: '', status: null });

    if (pesanIdentitas || pesanPassword) {
      return;
    }

    setMemuat(true);
    try {
      const user = await masuk(identitas.trim(), password);
      toastSukses(`Selamat datang, ${user.nama_lengkap}.`);
      navigasi('/beranda');
    } catch (err) {
      const pesan = formatPesanGalatServer(
        err,
        'Gagal masuk ke akun. Periksa kembali kredensial Anda.'
      );
      const status = err?.status || null;

      if (status === 400 && err?.detail?.field === 'identitas') {
        setGalatField((prev) => ({ ...prev, identitas: pesan }));
      } else {
        setGalatServer({ pesan, status });
      }
      toastGalat(pesan);
    } finally {
      setMemuat(false);
    }
  };

  const kredensialSalah = galatServer.status === 401;

  return (
    <div className={className}>
      <div className="space-y-1.5">
        {gunakanHeadingUtama ? (
          <h1 className="text-2xl font-bold text-[var(--warna-teks)]">{judul}</h1>
        ) : (
          <h2 className="text-2xl font-bold text-[var(--warna-teks)]">{judul}</h2>
        )}
        <p className="text-sm text-[var(--warna-teks-redup)]">{subjudul}</p>
      </div>

      {galatServer.pesan && (
        <div className="space-y-2">
          <PesanGalat pesan={galatServer.pesan} />
          {kredensialSalah && (
            <p className="text-xs text-[var(--warna-teks-redup)]">
              Pastikan email/nomor handphone dan kata sandi benar, atau{' '}
              <Link
                to="/lupa-kata-sandi"
                className="font-semibold text-[#0f5c6e] dark:text-cyan-300 hover:underline"
              >
                atur ulang kata sandi di sini
              </Link>
              .
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="login-identitas"
            className="block text-sm font-medium text-[var(--warna-teks)]"
          >
            Email atau Nomor Handphone
          </label>
          <input
            id="login-identitas"
            type="text"
            autoComplete="username"
            aria-invalid={Boolean(galatField.identitas || kredensialSalah)}
            aria-describedby={galatField.identitas ? 'galat-login-identitas' : undefined}
            value={identitas}
            onChange={handleUbahIdentitas}
            onBlur={() => handleBlur('identitas', identitas)}
            placeholder="nama@perusahaan.co.id atau 0812xxxxxxxx"
            className={`w-full h-11 px-3.5 rounded-xl border bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 transition-shadow ${
              galatField.identitas || kredensialSalah
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40'
                : 'border-[var(--warna-garis)] focus:ring-[#14452F] dark:focus:ring-emerald-400'
            }`}
          />
          {galatField.identitas && (
            <p
              id="galat-login-identitas"
              role="alert"
              className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 pt-0.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{galatField.identitas}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-[var(--warna-teks)]"
            >
              Kata Sandi
            </label>
            <Link
              to="/lupa-kata-sandi"
              className="text-xs font-medium text-[#0f5c6e] dark:text-cyan-300 hover:underline tombol-halus"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <div className="relative">
            <input
              id="login-password"
              type={lihatSandi ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={Boolean(galatField.password || kredensialSalah)}
              aria-describedby={galatField.password ? 'galat-login-password' : undefined}
              value={password}
              onChange={handleUbahPassword}
              onBlur={() => handleBlur('password', password)}
              placeholder="Masukkan kata sandi"
              className={`w-full h-11 pl-3.5 pr-11 rounded-xl border bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 transition-shadow ${
                galatField.password || kredensialSalah
                  ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40'
                  : 'border-[var(--warna-garis)] focus:ring-[#14452F] dark:focus:ring-emerald-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setLihatSandi((tampil) => !tampil)}
              aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              className="w-9 h-9 rounded-lg text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {lihatSandi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {galatField.password && (
            <p
              id="galat-login-password"
              role="alert"
              className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 pt-0.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{galatField.password}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={memuat}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 tombol-halus cursor-pointer"
        >
          {memuat ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div className="pt-3 border-t border-[var(--warna-garis)] space-y-3">
        <p className="text-center text-sm text-[var(--warna-teks-redup)]">
          Belum terdaftar sebagai produsen atau pembeli?{' '}
          <Link
            to="/daftar"
            className="font-semibold text-[var(--warna-hijau-tua)] dark:text-emerald-300 hover:underline tombol-halus"
          >
            Daftar Akun
          </Link>
        </p>

        <div className="rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan-sekunder)]/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setBukaSimulasi((b) => !b)}
            aria-expanded={bukaSimulasi}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[var(--warna-teks)] hover:bg-[var(--warna-permukaan-sekunder)] cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#0f5c6e] dark:text-cyan-300" />
              <span>Akun Simulasi Pengujian (Email &amp; Password)</span>
            </span>
            {bukaSimulasi ? (
              <ChevronUp className="w-4 h-4 text-[var(--warna-teks-redup)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--warna-teks-redup)]" />
            )}
          </button>

          {bukaSimulasi && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-[var(--warna-garis)]">
              <p className="text-[11px] text-[var(--warna-teks-redup)]">
                Password semua akun simulasi:{' '}
                <code className="font-mono font-semibold text-[var(--warna-teks)]">
                  {KATA_SANDI_SIMULASI}
                </code>
              </p>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {AKUN_SIMULASI_PUBLIK.map((akun) => (
                  <div
                    key={akun.user_id}
                    className="rounded-lg border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--warna-teks)] truncate">
                        {akun.label_peran}
                      </p>
                      <p className="text-[11px] text-[var(--warna-teks-redup)] truncate">
                        {akun.email} · {akun.no_hp}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => isiAkunSimulasi(akun)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#14452F] text-white hover:bg-[#0d3322] shrink-0 tombol-halus cursor-pointer"
                    >
                      Isi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
