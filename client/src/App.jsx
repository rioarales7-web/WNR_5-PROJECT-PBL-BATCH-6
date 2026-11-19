import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MemuatHalaman } from './components/KeadaanHalaman.jsx';
import TataLetak from './components/TataLetak.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { KeranjangProvider } from './context/KeranjangContext.jsx';
import { TemaProvider } from './context/TemaContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import HalamanAdmin from './pages/HalamanAdmin.jsx';
import HalamanAktivitas from './pages/HalamanAktivitas.jsx';
import HalamanBeranda from './pages/HalamanBeranda.jsx';
import HalamanDaftar from './pages/HalamanDaftar.jsx';
import HalamanDetailProduk from './pages/HalamanDetailProduk.jsx';
import HalamanFaq from './pages/HalamanFaq.jsx';
import HalamanJualPanen from './pages/HalamanJualPanen.jsx';
import HalamanKatalog from './pages/HalamanKatalog.jsx';
import HalamanKebijakanPrivasi from './pages/HalamanKebijakanPrivasi.jsx';
import HalamanKeranjang from './pages/HalamanKeranjang.jsx';
import HalamanLupaSandi from './pages/HalamanLupaSandi.jsx';
import HalamanMasuk from './pages/HalamanMasuk.jsx';
import HalamanMetodePembayaran from './pages/HalamanMetodePembayaran.jsx';
import HalamanPanduanEkspor from './pages/HalamanPanduanEkspor.jsx';
import HalamanPanduanPemesanan from './pages/HalamanPanduanPemesanan.jsx';
import HalamanPembayaran from './pages/HalamanPembayaran.jsx';
import HalamanPembuka from './pages/HalamanPembuka.jsx';
import HalamanPesanan from './pages/HalamanPesanan.jsx';
import HalamanProfil from './pages/HalamanProfil.jsx';
import HalamanRekening from './pages/HalamanRekening.jsx';
import HalamanRiwayatPembayaran from './pages/HalamanRiwayatPembayaran.jsx';
import HalamanSyaratKetentuan from './pages/HalamanSyaratKetentuan.jsx';

function RuteTerlindung({ children, peranDiizinkan }) {
  const { pengguna, memuatSesi } = useAuth();

  if (memuatSesi) {
    return <MemuatHalaman teks="Memeriksa sesi akun..." />;
  }
  if (!pengguna) {
    return <Navigate to="/masuk" replace />;
  }
  if (peranDiizinkan && !peranDiizinkan.includes(pengguna.role_user)) {
    return <Navigate to="/beranda" replace />;
  }
  return children;
}

function RuteAplikasi() {
  return (
    <TataLetak>
      <Routes>
        <Route path="/" element={<HalamanPembuka />} />
        <Route path="/masuk" element={<HalamanMasuk />} />
        <Route path="/daftar" element={<HalamanDaftar />} />
        <Route path="/lupa-kata-sandi" element={<HalamanLupaSandi />} />

        <Route path="/faq" element={<HalamanFaq />} />
        <Route path="/panduan-pemesanan" element={<HalamanPanduanPemesanan />} />
        <Route path="/metode-pembayaran" element={<HalamanMetodePembayaran />} />
        <Route path="/panduan-ekspor" element={<HalamanPanduanEkspor />} />
        <Route path="/syarat-ketentuan" element={<HalamanSyaratKetentuan />} />
        <Route path="/kebijakan-privasi" element={<HalamanKebijakanPrivasi />} />

        <Route
          path="/katalog"
          element={
            <RuteTerlindung>
              <HalamanKatalog />
            </RuteTerlindung>
          }
        />
        <Route
          path="/produk/:id"
          element={
            <RuteTerlindung>
              <HalamanDetailProduk />
            </RuteTerlindung>
          }
        />
        <Route
          path="/beranda"
          element={
            <RuteTerlindung>
              <HalamanBeranda />
            </RuteTerlindung>
          }
        />
        <Route
          path="/keranjang"
          element={
            <RuteTerlindung peranDiizinkan={['Buyer_PT_Lokal', 'Buyer_Internasional', 'Admin']}>
              <HalamanKeranjang />
            </RuteTerlindung>
          }
        />
        <Route
          path="/pembayaran/:orderId"
          element={
            <RuteTerlindung>
              <HalamanPembayaran />
            </RuteTerlindung>
          }
        />
        <Route
          path="/riwayat-pembayaran"
          element={
            <RuteTerlindung>
              <HalamanRiwayatPembayaran />
            </RuteTerlindung>
          }
        />
        <Route
          path="/pesanan"
          element={
            <RuteTerlindung>
              <HalamanPesanan />
            </RuteTerlindung>
          }
        />
        <Route
          path="/rekening"
          element={
            <RuteTerlindung>
              <HalamanRekening />
            </RuteTerlindung>
          }
        />
        <Route
          path="/jual-panen"
          element={
            <RuteTerlindung peranDiizinkan={['Petani', 'Nelayan', 'Peternak', 'Admin']}>
              <HalamanJualPanen />
            </RuteTerlindung>
          }
        />
        <Route
          path="/profil"
          element={
            <RuteTerlindung>
              <HalamanProfil />
            </RuteTerlindung>
          }
        />
        <Route
          path="/aktivitas"
          element={
            <RuteTerlindung>
              <HalamanAktivitas />
            </RuteTerlindung>
          }
        />
        <Route
          path="/admin"
          element={
            <RuteTerlindung peranDiizinkan={['Admin']}>
              <HalamanAdmin />
            </RuteTerlindung>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TataLetak>
  );
}

export default function App() {
  return (
    <TemaProvider>
      <ToastProvider>
        <AuthProvider>
          <KeranjangProvider>
            <BrowserRouter>
              <RuteAplikasi />
            </BrowserRouter>
          </KeranjangProvider>
        </AuthProvider>
      </ToastProvider>
    </TemaProvider>
  );
}
