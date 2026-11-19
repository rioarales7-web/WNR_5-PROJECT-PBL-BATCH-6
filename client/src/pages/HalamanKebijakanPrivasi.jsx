import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import KerangkaHalamanInfo, {
  BagianInfo,
  DaftarButir,
} from '../components/KerangkaHalamanInfo.jsx';
import { DATA_PERUSAHAAN, TANGGAL_PEMBARUAN_DOKUMEN } from '../utils/dataPerusahaan.js';

export default function HalamanKebijakanPrivasi() {
  const { legalitas, kontak } = DATA_PERUSAHAAN;

  return (
    <KerangkaHalamanInfo
      ikon={ShieldCheck}
      judul="Kebijakan Privasi"
      ringkasan="Data pribadi apa yang kami kumpulkan, untuk apa dipakai, dan apa hak Anda atasnya."
      diperbarui={TANGGAL_PEMBARUAN_DOKUMEN}
    >
      <BagianInfo id="pengendali" judul="1. Siapa kami">
        <p>
          {legalitas.pemegangHakCipta} ("kami") adalah pengendali data pribadi untuk platform Agro
          Maritim. Kebijakan ini disusun dengan mengacu pada Undang-Undang Nomor 27 Tahun 2022
          tentang Pelindungan Data Pribadi. Alamat kami: {kontak.alamat}.
        </p>
      </BagianInfo>

      <BagianInfo id="data" judul="2. Data yang kami kumpulkan">
        <DaftarButir
          butir={[
            'Data akun: nama lengkap, email, nomor telepon, peran (produsen atau pembeli), kota atau negara asal, dan kata sandi dalam bentuk terenkripsi satu arah (hash).',
            'Data usaha: nama perusahaan, bentuk badan usaha, NPWP atau Tax ID, serta dokumen legal dan kredensial produsen yang Anda unggah.',
            'Data transaksi: isi keranjang, pesanan, invoice, alamat atau pelabuhan tujuan, pembayaran, bukti transfer, dan status pengiriman.',
            'Data keuangan: nama bank, nomor rekening, dan atas nama rekening yang Anda daftarkan untuk pencairan dana.',
            'Data penggunaan: log aktivitas akun serta alamat IP yang diproses untuk pembatasan permintaan dan catatan server saat Anda mengakses layanan.',
            'Email langganan buletin, bila Anda mendaftarkannya lewat formulir di bagian bawah situs.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="tujuan" judul="3. Untuk apa data dipakai">
        <DaftarButir
          butir={[
            'Membuat dan mengelola akun, termasuk verifikasi legalitas pembeli dan produsen.',
            'Memproses pesanan, pembayaran, pencairan dana, dan pengiriman, termasuk kepengurusan dokumen ekspor.',
            'Menerbitkan invoice dan bukti pembayaran, serta memenuhi kewajiban perpajakan dan kepabeanan.',
            'Menjaga keamanan platform, mencegah penipuan, dan membatasi permintaan yang berlebihan.',
            'Menghubungi Anda terkait pesanan, dukungan, dan perubahan layanan.',
            'Mengirim buletin harga komoditas dan jadwal panen kepada yang berlangganan. Anda bisa berhenti kapan saja.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="berbagi" judul="4. Dengan siapa data dibagikan">
        <p>Kami tidak menjual data pribadi Anda. Data dibagikan hanya bila diperlukan untuk:</p>
        <DaftarButir
          butir={[
            'Pihak lawan transaksi: pembeli dan produsen saling menerima data yang perlu untuk pengiriman dan penagihan, seperti nama usaha, alamat tujuan, dan kontak.',
            'Bank dan penyedia pembayaran, untuk memproses dan mencocokkan transfer.',
            'Perusahaan pelayaran, ekspedisi, dan otoritas seperti Bea Cukai serta karantina, untuk pengurusan pengiriman dan dokumen ekspor.',
            'Penyedia hosting dan basis data yang menjalankan layanan kami, dengan kewajiban menjaga kerahasiaan.',
            'Instansi berwenang bila diwajibkan oleh peraturan perundang-undangan atau putusan pengadilan.',
          ]}
        />
        <p>
          Bagi importir, data Anda dapat diproses di server yang berada di Indonesia dan dikirim ke
          bank koresponden di luar negeri sebatas yang diperlukan untuk pembayaran.
        </p>
      </BagianInfo>

      <BagianInfo id="simpan" judul="5. Penyimpanan dan keamanan">
        <DaftarButir
          butir={[
            'Kata sandi disimpan sebagai hash, bukan teks asli. Akses ke fitur akun memakai token sesi yang berlaku terbatas.',
            'Peramban Anda menyimpan token sesi dan preferensi tema (terang atau gelap) di penyimpanan lokal. Kami tidak memakai cookie iklan.',
            'Data transaksi dan dokumen keuangan disimpan selama diperlukan untuk kewajiban pajak, pembukuan, dan penyelesaian sengketa, lalu dihapus atau dianonimkan.',
            'Tidak ada sistem yang sepenuhnya kebal. Bila terjadi kegagalan pelindungan data yang berdampak pada Anda, kami akan memberi tahu sesuai ketentuan yang berlaku.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="hak" judul="6. Hak Anda">
        <p>Sesuai UU Pelindungan Data Pribadi, Anda berhak untuk:</p>
        <DaftarButir
          butir={[
            'mengetahui dan meminta salinan data pribadi Anda yang kami simpan;',
            'melengkapi atau memperbarui data yang keliru, sebagian besar bisa dilakukan sendiri di halaman Profil;',
            'meminta penghapusan atau penghentian pemrosesan data, selama tidak bertentangan dengan kewajiban hukum kami;',
            'menarik persetujuan, termasuk berhenti menerima buletin;',
            'mengajukan keberatan atas pemrosesan tertentu.',
          ]}
        />
        <p>
          Ajukan permintaan melalui{' '}
          <a
            href={kontak.emailUmum.href}
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            {kontak.emailUmum.tampil}
          </a>{' '}
          dari alamat email yang terdaftar. Kami akan membalas dalam waktu yang wajar dan dapat
          meminta bukti identitas lebih dulu.
        </p>
      </BagianInfo>

      <BagianInfo id="anak" judul="7. Pengguna di bawah umur">
        <p>
          Layanan ini ditujukan bagi pelaku usaha dan tidak diperuntukkan bagi anak di bawah 18
          tahun. Bila kami mengetahui ada data anak yang terkumpul tanpa persetujuan wali, data
          tersebut akan kami hapus.
        </p>
      </BagianInfo>

      <BagianInfo id="perubahan" judul="8. Perubahan kebijakan">
        <p>
          Kebijakan ini dapat berubah mengikuti perkembangan layanan atau peraturan. Tanggal
          pembaruan terakhir tertera di bagian atas halaman. Ketentuan penggunaan layanan ada di{' '}
          <Link
            to="/syarat-ketentuan"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            Syarat dan Ketentuan
          </Link>
          .
        </p>
      </BagianInfo>
    </KerangkaHalamanInfo>
  );
}
