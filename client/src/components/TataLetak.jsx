import {
  Anchor,
  Home,
  LayoutGrid,
  Moon,
  Package,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  Sun,
  User,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useKeranjang } from '../context/KeranjangContext.jsx';
import { useTema } from '../context/TemaContext.jsx';
import { PERAN_PRODUSEN } from '../utils/format.js';
import Footer from './Footer.jsx';
import KotakPencarian from './KotakPencarian.jsx';

export default function TataLetak({ children }) {
  const { pengguna } = useAuth();
  const { jumlahItem } = useKeranjang();
  const { gelap, gantiTema } = useTema();
  const navigasi = useNavigate();
  const { pathname } = useLocation();

  const adalahHalamanAwalPenuh = !pengguna && pathname === '/';

  const adalahProdusen = pengguna && PERAN_PRODUSEN.includes(pengguna.role_user);
  const adalahAdmin = pengguna && pengguna.role_user === 'Admin';

  const tautanDesktop = pengguna
    ? [
        { to: '/beranda', label: 'Beranda' },
        { to: '/katalog', label: 'Katalog' },
        { to: '/pesanan', label: 'Pesanan' },
        ...(adalahProdusen
          ? [{ to: '/jual-panen', label: 'Jual Panen' }]
          : [{ to: '/riwayat-pembayaran', label: 'Pembayaran' }]),
        ...(adalahAdmin ? [{ to: '/admin', label: 'Panel Admin' }] : []),
      ]
    : [];

  const kelasTautan = ({ isActive }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors pb-1 border-b-2 ${
      isActive
        ? 'text-[#14452F] dark:text-emerald-300 border-[#ea580c]'
        : 'text-[#53665c] dark:text-emerald-100/70 border-transparent hover:text-[#102119] dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--warna-krem)] text-[var(--warna-teks)]">
      <header className="sticky top-0 z-30 border-b border-[var(--warna-garis)] bg-[var(--warna-krem)]/95 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <Link
            to={pengguna ? '/beranda' : '/'}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--warna-hijau-tua)] dark:text-emerald-300 whitespace-nowrap shrink-0 tombol-halus"
          >
            <span className="w-8 h-8 rounded-lg gradasi-maritim flex items-center justify-center text-white">
              <Anchor className="w-4 h-4" />
            </span>
            <span>Agro Maritim</span>
          </Link>

          {tautanDesktop.length > 0 && (
            <nav className="hidden md:flex items-center gap-7" aria-label="Navigasi utama">
              {tautanDesktop.map((item) => (
                <NavLink key={item.to} to={item.to} className={kelasTautan}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {pengguna && <KotakPencarian />}

            <button
              type="button"
              onClick={gantiTema}
              aria-label={gelap ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              title={gelap ? 'Mode Terang' : 'Mode Gelap'}
              className="h-10 px-3 rounded-xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] text-[var(--warna-teks-redup)] hover:text-[var(--warna-teks)] flex items-center gap-2 text-xs font-semibold tombol-halus cursor-pointer"
            >
              {gelap ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{gelap ? 'Terang' : 'Gelap'}</span>
            </button>

            {pengguna && !adalahProdusen && !adalahAdmin && (
              <button
                type="button"
                onClick={() => navigasi('/keranjang')}
                aria-label="Buka keranjang belanja"
                className="relative h-10 px-3.5 rounded-xl border border-stone-200 dark:border-emerald-900/70 bg-white dark:bg-[#12201b] flex items-center gap-2 text-sm font-medium text-[#102119] dark:text-emerald-100 hover:bg-stone-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-[#14452F] dark:text-emerald-300" />
                <span className="hidden sm:inline">Keranjang</span>
                {jumlahItem > 0 && (
                  <span className="text-xs font-bold text-[#ea580c] angka-tabular">
                    ({jumlahItem})
                  </span>
                )}
              </button>
            )}

            {pengguna && (
              <Link
                to="/profil"
                className="h-10 px-4 rounded-xl text-sm font-semibold text-white bg-[#14452F] hover:bg-[#0d3322] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[130px] truncate">{pengguna.nama_lengkap}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main
        className={
          adalahHalamanAwalPenuh
            ? 'flex-1 w-full'
            : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12'
        }
      >
        {children}
      </main>

      <div className={pengguna ? 'bg-[#06130e] pb-16 md:pb-0' : ''}>
        <Footer />
      </div>

      {pengguna && (
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-stone-200 dark:border-emerald-900/70 bg-white/95 dark:bg-[#0e1915]/95 backdrop-blur-sm grid grid-cols-5"
        >
          <NavLink
            to="/beranda"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Beranda</span>
          </NavLink>

          <NavLink
            to="/katalog"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
              }`
            }
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Katalog</span>
          </NavLink>

          <NavLink
            to="/pesanan"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
              }`
            }
          >
            <Package className="w-5 h-5" />
            <span>Pesanan</span>
          </NavLink>

          {adalahProdusen ? (
            <NavLink
              to="/jual-panen"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
                }`
              }
            >
              <PlusCircle className="w-5 h-5" />
              <span>Jual</span>
            </NavLink>
          ) : adalahAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
                }`
              }
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </NavLink>
          ) : (
            <NavLink
              to="/keranjang"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
                }`
              }
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Keranjang</span>
            </NavLink>
          )}

          <NavLink
            to="/profil"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive ? 'text-[#ea580c]' : 'text-[#53665c] dark:text-emerald-200/70'
              }`
            }
          >
            <User className="w-5 h-5" />
            <span>Akun</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
}