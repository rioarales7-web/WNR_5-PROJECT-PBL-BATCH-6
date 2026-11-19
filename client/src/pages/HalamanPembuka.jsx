import { Navigate } from 'react-router-dom';
import FormMasuk from '../components/FormMasuk.jsx';
import SliderKomoditasUnggulan from '../components/SliderKomoditasUnggulan.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function HalamanPembuka() {
  const { pengguna } = useAuth();

  if (pengguna) {
    return <Navigate to="/beranda" replace />;
  }

  return (
    <SliderKomoditasUnggulan>
      <FormMasuk className="rounded-3xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)]/95 text-[var(--warna-teks)] backdrop-blur-md p-7 sm:p-9 shadow-2xl space-y-6" />
    </SliderKomoditasUnggulan>
  );
}
