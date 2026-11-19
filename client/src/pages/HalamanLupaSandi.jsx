import { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { panggilApi } from '../api/klienApi.js';
import { PesanGalat } from '../components/KeadaanHalaman.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatPesanGalatServer,
  validasiIdentitasLogin,
  validasiKataSandiBaru,
} from '../utils/validasiForm.js';

export default function HalamanLupaSandi() {
  const [searchParams] = useSearchParams();
  const tokenDariUrl = searchParams.get('token') || '';
  const { toastSukses, toastGalat } = useToast();

  const [tahap, setTahap] = useState(tokenDariUrl ? 'reset' : 'minta');
  const [identitas, setIdentitas] = useState('');
  const [tokenReset, setTokenReset] = useState(tokenDariUrl);
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [lihatSandiBaru, setLihatSandiBaru] = useState(false);

  const [memuat, setMemuat] = useState(false);
  const [pesanInfo, setPesanInfo] = useState('');
  const [galatServer, setGalatServer] = useState('');
  const [galatField, setGalatField] = useState({
    identitas: '',
    token: '',
    password_baru: '',
    konfirmasi_password: '',
  });

  const handleMintaReset = async (e) => {
    e.preventDefault();
    const pesanIdentitas = validasiIdentitasLogin(identitas);
    setGalatField((prev) => ({ ...prev, identitas: pesanIdentitas }));
    setGalatServer('');
    setPesanInfo('');

    if (pesanIdentitas) return;

    setMemuat(true);
    try {
      const res = await panggilApi('/auth/lupa-kata-sandi', {
        method: 'POST',
        body: { identitas: identitas.trim() },
      });
      setPesanInfo(res.pesan);
      toastSukses('Permintaan pengaturan ulang kata sandi diproses.');

      if (res.token_reset) {
        setTokenReset(res.token_reset);
        setTahap('reset');
      }
    } catch (err) {
      const pesan = formatPesanGalatServer(err, 'Gagal memproses permintaan lupa kata sandi.');
      setGalatServer(pesan);
      toastGalat(pesan);
    } finally {
      setMemuat(false);
    }
  };

  const handleSimpanSandiBaru = async (e) => {
    e.preventDefault();
    const pesanToken = !tokenReset.trim() ? 'Token reset kata sandi wajib diisi.' : '';
    const pesanSandi = validasiKataSandiBaru(passwordBaru);
    const pesanKonfirmasi =
      konfirmasiPassword !== passwordBaru ? 'Konfirmasi kata sandi baru tidak cocok.' : '';

    setGalatField((prev) => ({
      ...prev,
      token: pesanToken,
      password_baru: pesanSandi,
      konfirmasi_password: pesanKonfirmasi,
    }));
    setGalatServer('');

    if (pesanToken || pesanSandi || pesanKonfirmasi) return;

    setMemuat(true);
    try {
      const res = await panggilApi('/auth/reset-kata-sandi', {
        method: 'POST',
        body: {
          token: tokenReset.trim(),
          password_baru: passwordBaru,
          konfirmasi_password: konfirmasiPassword,
        },
      });
      setPesanInfo(res.pesan);
      setTahap('selesai');
      toastSukses('Kata sandi baru berhasil disimpan.');
    } catch (err) {
      const pesan = formatPesanGalatServer(err, 'Gagal mengatur ulang kata sandi.');
      if (
        err?.detail?.field &&
        Object.prototype.hasOwnProperty.call(galatField, err.detail.field)
      ) {
        setGalatField((prev) => ({ ...prev, [err.detail.field]: pesan }));
      } else {
        setGalatServer(pesan);
      }
      toastGalat(pesan);
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-7 space-y-5">
        <div className="space-y-1.5">
          <div className="w-10 h-10 rounded-xl gradasi-maritim text-white flex items-center justify-center mb-2">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--warna-teks)]">
            {tahap === 'selesai'
              ? 'Kata Sandi Diperbarui'
              : tahap === 'reset'
                ? 'Atur Kata Sandi Baru'
                : 'Lupa Kata Sandi'}
          </h1>
          <p className="text-sm text-[var(--warna-teks-redup)]">
            {tahap === 'selesai'
              ? 'Akun Anda kini siap diakses dengan kata sandi baru.'
              : tahap === 'reset'
                ? 'Masukkan kata sandi baru minimal 8 karakter untuk menyelesaikan pemulihan akun.'
                : 'Masukkan email atau nomor handphone terdaftar untuk memulihkan akses akun Anda.'}
          </p>
        </div>

        <PesanGalat pesan={galatServer} />

        {pesanInfo && tahap !== 'selesai' && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-900 dark:text-emerald-200">
            {pesanInfo}
          </div>
        )}

        {tahap === 'minta' && (
          <form onSubmit={handleMintaReset} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="identitas_reset"
                className="block text-sm font-medium text-[var(--warna-teks)]"
              >
                Email atau Nomor Handphone
              </label>
              <input
                id="identitas_reset"
                type="text"
                value={identitas}
                onChange={(e) => {
                  setIdentitas(e.target.value);
                  if (galatField.identitas) {
                    setGalatField((prev) => ({
                      ...prev,
                      identitas: validasiIdentitasLogin(e.target.value),
                    }));
                  }
                }}
                onBlur={() =>
                  setGalatField((prev) => ({
                    ...prev,
                    identitas: validasiIdentitasLogin(identitas),
                  }))
                }
                placeholder="nama@perusahaan.co.id atau 0812xxxxxxxx"
                className={`w-full h-11 px-3.5 rounded-xl border bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 ${
                  galatField.identitas
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40'
                    : 'border-[var(--warna-garis)] focus:ring-[#14452F] dark:focus:ring-emerald-400'
                }`}
              />
              {galatField.identitas && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 pt-0.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{galatField.identitas}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={memuat}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] disabled:opacity-60 tombol-halus cursor-pointer"
            >
              {memuat ? 'Memproses...' : 'Kirim Permintaan Reset'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setTahap('reset')}
                className="text-xs font-medium text-[#0f5c6e] dark:text-cyan-300 hover:underline cursor-pointer"
              >
                Sudah memiliki token reset? Masukkan di sini
              </button>
            </div>
          </form>
        )}

        {tahap === 'reset' && (
          <form onSubmit={handleSimpanSandiBaru} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="token_reset"
                className="block text-sm font-medium text-[var(--warna-teks)]"
              >
                Token Verifikasi Reset
              </label>
              <input
                id="token_reset"
                type="text"
                value={tokenReset}
                onChange={(e) => {
                  setTokenReset(e.target.value);
                  if (galatField.token) setGalatField((prev) => ({ ...prev, token: '' }));
                }}
                placeholder="Tempel token reset kata sandi"
                className={`w-full h-11 px-3.5 rounded-xl border bg-transparent text-xs font-mono text-[var(--warna-teks)] focus:outline-none focus:ring-2 ${
                  galatField.token
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40'
                    : 'border-[var(--warna-garis)] focus:ring-[#14452F]'
                }`}
              />
              {galatField.token && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{galatField.token}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sandi_baru"
                className="block text-sm font-medium text-[var(--warna-teks)]"
              >
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="sandi_baru"
                  type={lihatSandiBaru ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={passwordBaru}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPasswordBaru(val);
                    if (galatField.password_baru) {
                      setGalatField((prev) => ({
                        ...prev,
                        password_baru: validasiKataSandiBaru(val),
                      }));
                    }
                  }}
                  placeholder="Minimal 8 karakter"
                  className={`w-full h-11 pl-3.5 pr-11 rounded-xl border bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 ${
                    galatField.password_baru
                      ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40'
                      : 'border-[var(--warna-garis)] focus:ring-[#14452F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setLihatSandiBaru((s) => !s)}
                  aria-label={lihatSandiBaru ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="w-9 h-9 rounded-lg text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {lihatSandiBaru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {galatField.password_baru && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{galatField.password_baru}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="konfirmasi_sandi_baru"
                className="block text-sm font-medium text-[var(--warna-teks)]"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                id="konfirmasi_sandi_baru"
                type={lihatSandiBaru ? 'text' : 'password'}
                autoComplete="new-password"
                value={konfirmasiPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setKonfirmasiPassword(val);
                  if (galatField.konfirmasi_password) {
                    setGalatField((prev) => ({
                      ...prev,
                      konfirmasi_password:
                        val !== passwordBaru ? 'Konfirmasi kata sandi baru tidak cocok.' : '',
                    }));
                  }
                }}
                placeholder="Ulangi kata sandi baru"
                className={`w-full h-11 px-3.5 rounded-xl border bg-transparent text-sm text-[var(--warna-teks)] focus:outline-none focus:ring-2 ${
                  galatField.konfirmasi_password
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500/40'
                    : 'border-[var(--warna-garis)] focus:ring-[#14452F]'
                }`}
              />
              {galatField.konfirmasi_password && (
                <p
                  role="alert"
                  className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{galatField.konfirmasi_password}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={memuat}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 tombol-halus cursor-pointer"
              >
                {memuat ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTahap('minta');
                  setGalatServer('');
                }}
                className="text-xs font-medium text-[var(--warna-teks-redup)] hover:underline py-1 cursor-pointer"
              >
                Ajukan ulang permintaan token
              </button>
            </div>
          </form>
        )}

        {tahap === 'selesai' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{pesanInfo}</span>
            </div>

            <Link
              to="/masuk"
              className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] flex items-center justify-center tombol-halus"
            >
              Masuk dengan Kata Sandi Baru
            </Link>
          </div>
        )}

        {tahap !== 'selesai' && (
          <p className="text-center text-sm pt-2 border-t border-[var(--warna-garis)]">
            <Link
              to="/"
              className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline tombol-halus"
            >
              Kembali ke halaman masuk
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
