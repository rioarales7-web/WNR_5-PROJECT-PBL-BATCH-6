import { Navigate } from 'react-router-dom';
import FormMasuk from '../components/FormMasuk.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function HalamanMasuk() {
  const { pengguna } = useAuth();

  if (pengguna) {
    return <Navigate to="/beranda" replace />;
  }

  return (
    <div className="max-w-md mx-auto py-6">
      <FormMasuk
        judul="Masuk ke Agro Maritim"
        subjudul="Gunakan email atau nomor handphone dan kata sandi akun Anda untuk mengakses dashboard niaga."
        gunakanHeadingUtama
        className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-7 sm:p-8 space-y-6"
      />
    </div>
  );
}
