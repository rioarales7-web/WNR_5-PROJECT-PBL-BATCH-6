import KotakPencarian from './KotakPencarian.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Anchor,
  CircleAlert,
  CircleCheck,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { panggilApi } from '../api/klienApi.js';
import { DATA_PERUSAHAAN } from '../utils/dataPerusahaan.js';

const IKON_SOSIAL = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
};

export default function Footer() {
  const lokasi = useLocation();
  const terpasangRef = useRef(true);
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [sedangMengirim, setSedangMengirim] = useState(false);
  const [status, setStatus] = useState(null);
  const [notifikasiTerlihat, setNotifikasiTerlihat] = useState(false);

  useEffect(() => {
    terpasangRef.current = true;
    return () => {
      terpasangRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!status) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setNotifikasiTerlihat(true);
    });

    let timerSembunyi;
    let timerHapus;

    if (status.tipe === 'sukses') {
      timerSembunyi = setTimeout(() => {
        setNotifikasiTerlihat(false);
        timerHapus = setTimeout(() => {
          setStatus(null);
        }, 200);
      }, 5000);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timerSembunyi) {
        clearTimeout(timerSembunyi);
      }
      if (timerHapus) {
        clearTimeout(timerHapus);
      }
    };
  }, [status]);

  function apakahTautanAktif(tujuan) {
    const [pathTujuan, queryTujuan] = tujuan.split('?');
    if (queryTujuan) {
      return lokasi.pathname === pathTujuan && lokasi.search === `?${queryTujuan}`;
    }
    if (pathTujuan === '/') {
      return (lokasi.pathname === '/' || lokasi.pathname === '/beranda') && !lokasi.search;
    }
    return lokasi.pathname === pathTujuan && !lokasi.search;
  }

  function kelasTautan(tujuan) {
    const dasar = 'inline-block text-sm leading-relaxed transition-colors duration-150';
    if (apakahTautanAktif(tujuan)) {
      return `${dasar} font-medium text-orange-400`;
    }
    return `${dasar} text-[#93aea1] hover:text-[#edf5f0]`;
  }

  function resetInputEmail() {
    setEmailNewsletter('');
  }

  function tanganiUbahEmail(e) {
    setEmailNewsletter(e.target.value);
    if (status) {
      setNotifikasiTerlihat(false);
      setStatus(null);
    }
  }

  function tanganiTekanTombol(e) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      tanganiLangganan(e);
    }
  }

  async function tanganiLangganan(e) {
    e.preventDefault();
    if (sedangMengirim) {
      return;
    }

    const emailBersih = emailNewsletter.trim();
    const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setNotifikasiTerlihat(false);

    if (!polaEmail.test(emailBersih)) {
      setStatus({
        tipe: 'gagal',
        pesan: DATA_PERUSAHAAN.newsletter.pesanEmailTidakValid,
      });
      return;
    }

    setSedangMengirim(true);
    setStatus(null);

    try {
      await panggilApi('/newsletter', {
        method: 'POST',
        body: { email: emailBersih },
      });

      if (!terpasangRef.current) {
        return;
      }

      setStatus({
        tipe: 'sukses',
        pesan: `${DATA_PERUSAHAAN.newsletter.pesanSukses} ${emailBersih}.`,
      });
      resetInputEmail();
    } catch (err) {
      if (!terpasangRef.current) {
        return;
      }

      setStatus({
        tipe: 'gagal',
        pesan: err?.status ? err.message : DATA_PERUSAHAAN.newsletter.pesanGagal,
      });
    } finally {
      if (terpasangRef.current) {
        setSedangMengirim(false);
      }
    }
  }

  return (
    <footer className="border-t border-[#17362a] bg-[#06130e] text-[#dbe8e1]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-[#f2f7f4] transition-colors duration-150 hover:text-cyan-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1b3d2f] bg-[#0c2119] text-cyan-400">
                <Anchor className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold tracking-tight">
                {DATA_PERUSAHAAN.merek.nama}
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-[#93aea1]">
              {DATA_PERUSAHAAN.merek.deskripsi}
            </p>

            <div className="pt-1">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {DATA_PERUSAHAAN.newsletter.judul}
              </p>
              <p className="mb-2.5 text-xs leading-relaxed text-[#93aea1]">
                {DATA_PERUSAHAAN.newsletter.keterangan}
              </p>

              <form onSubmit={tanganiLangganan} noValidate className="space-y-2.5">
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  {DATA_PERUSAHAAN.newsletter.placeholder}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={emailNewsletter}
                    onChange={tanganiUbahEmail}
                    onKeyDown={tanganiTekanTombol}
                    disabled={sedangMengirim}
                    placeholder={DATA_PERUSAHAAN.newsletter.placeholder}
                    autoComplete="email"
                    className="min-w-0 flex-1 rounded-lg border border-[#17362a] bg-[#0b1d16] px-3 py-2 text-sm text-[#edf5f0] placeholder:text-[#6f8b7e] transition-colors duration-150 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    onKeyDown={tanganiTekanTombol}
                    disabled={sedangMengirim}
                    aria-busy={sedangMengirim}
                    aria-label={
                      sedangMengirim
                        ? DATA_PERUSAHAAN.newsletter.labelMengirim
                        : DATA_PERUSAHAAN.newsletter.labelTombol
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-orange-400 px-3.5 py-2 text-sm font-medium text-[#06130e] transition-colors duration-150 hover:bg-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:bg-orange-400"
                  >
                    <span>
                      {sedangMengirim
                        ? DATA_PERUSAHAAN.newsletter.labelMengirim
                        : DATA_PERUSAHAAN.newsletter.labelTombol}
                    </span>
                    {!sedangMengirim ? <Send className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </button>
                </div>

                {status ? (
                  <div
                    role={status.tipe === 'gagal' ? 'alert' : 'status'}
                    aria-live="polite"
                    className={`flex items-start gap-2 rounded-lg border bg-[#0b1d16] px-3 py-2 text-xs leading-relaxed transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                      notifikasiTerlihat ? 'opacity-100' : 'opacity-0'
                    } ${
                      status.tipe === 'sukses'
                        ? 'border-cyan-400/35 text-cyan-300'
                        : 'border-orange-400/35 text-orange-300'
                    }`}
                  >
                    {status.tipe === 'sukses' ? (
                      <CircleCheck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <CircleAlert
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400"
                        aria-hidden="true"
                      />
                    )}
                    <span>{status.pesan}</span>
                  </div>
                ) : null}
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {DATA_PERUSAHAAN.sosialMedia.map((item) => {
                const Ikon = IKON_SOSIAL[item.id];
                return (
                  <a
                    key={item.id}
                    href={item.tautan}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#17362a] bg-[#0b1d16] text-[#93aea1] transition-colors duration-150 hover:border-[#245240] hover:text-[#f2f7f4]"
                  >
                    <Ikon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <nav aria-label="Navigasi footer" className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Navigasi
            </h2>
            <ul className="space-y-2">
              {DATA_PERUSAHAAN.navigasiUtama.map((item) => (
                <li key={item.tujuan}>
                  <Link to={item.tujuan} className={kelasTautan(item.tujuan)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#143025] pt-2.5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cyan-400/80">
                Kategori
              </p>
              <ul className="space-y-2">
                {DATA_PERUSAHAAN.navigasiKategori.map((item) => (
                  <li key={item.tujuan}>
                    <Link to={item.tujuan} className={kelasTautan(item.tujuan)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <nav aria-label="Bantuan dan informasi legal" className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Bantuan &amp; Legal
            </h2>
            <ul className="space-y-2">
              {DATA_PERUSAHAAN.bantuanDanLegal.map((item) => (
                <li key={item.tujuan}>
                  <Link to={item.tujuan} className={kelasTautan(item.tujuan)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Kontak</h2>
            <div className="space-y-2.5 text-sm text-[#93aea1]">
              <address className="flex items-start gap-2.5 not-italic leading-relaxed">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <span>{DATA_PERUSAHAAN.kontak.alamat}</span>
              </address>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <a
                  href={DATA_PERUSAHAAN.kontak.telepon.href}
                  className="transition-colors duration-150 hover:text-[#edf5f0]"
                >
                  {DATA_PERUSAHAAN.kontak.telepon.tampil}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <a
                  href={DATA_PERUSAHAAN.kontak.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-150 hover:text-[#edf5f0]"
                >
                  WhatsApp: {DATA_PERUSAHAAN.kontak.whatsapp.tampil}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <a
                  href={DATA_PERUSAHAAN.kontak.emailUmum.href}
                  className="min-w-0 break-all transition-colors duration-150 hover:text-[#edf5f0]"
                >
                  {DATA_PERUSAHAAN.kontak.emailUmum.tampil}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <a
                  href={DATA_PERUSAHAAN.kontak.emailEkspor.href}
                  className="min-w-0 break-all transition-colors duration-150 hover:text-[#edf5f0]"
                >
                  Ekspor: {DATA_PERUSAHAAN.kontak.emailEkspor.tampil}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <span>{DATA_PERUSAHAAN.kontak.jamOperasional}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#17362a] pt-6 text-xs text-[#7c998b] md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {DATA_PERUSAHAAN.legalitas.tahun} {DATA_PERUSAHAAN.legalitas.pemegangHakCipta}.
            Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>NIB: {DATA_PERUSAHAAN.legalitas.nib}</span>
            <span>NPWP: {DATA_PERUSAHAAN.legalitas.npwp}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
