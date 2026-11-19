import { ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import KerangkaHalamanInfo, {
  BagianInfo,
  DaftarButir,
} from '../components/KerangkaHalamanInfo.jsx';
import { DATA_PERUSAHAAN, TANGGAL_PEMBARUAN_DOKUMEN } from '../utils/dataPerusahaan.js';

export default function HalamanSyaratKetentuan() {
  const { legalitas, kontak } = DATA_PERUSAHAAN;

  return (
    <KerangkaHalamanInfo
      ikon={ScrollText}
      judul="Syarat dan Ketentuan"
      ringkasan="Aturan penggunaan platform Agro Maritim bagi pembeli dan produsen. Harap dibaca sebelum mendaftar."
      diperbarui={TANGGAL_PEMBARUAN_DOKUMEN}
    >
      <BagianInfo id="pendahuluan" judul="1. Pendahuluan">
        <p>
          Agro Maritim dioperasikan oleh {legalitas.pemegangHakCipta} (NIB {legalitas.nib}),
          berkedudukan di {kontak.alamat}. Dengan mendaftar atau menggunakan platform ini, Anda
          menyatakan telah membaca dan menyetujui ketentuan di halaman ini beserta{' '}
          <Link
            to="/kebijakan-privasi"
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            Kebijakan Privasi
          </Link>
          .
        </p>
      </BagianInfo>

      <BagianInfo id="definisi" judul="2. Pengertian">
        <DaftarButir
          butir={[
            'Platform: situs dan layanan Agro Maritim yang mempertemukan produsen komoditas dengan pembeli.',
            'Produsen: petani, nelayan, atau peternak yang mencantumkan komoditas untuk dijual.',
            'Pembeli: perusahaan lokal (PT) atau importir internasional yang memesan komoditas.',
            'Pesanan: permintaan pembelian yang telah dibuat melalui platform dan memiliki nomor invoice.',
            'Incoterms: ketentuan perdagangan internasional yang membagi biaya dan risiko pengiriman antara penjual dan pembeli.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="akun" judul="3. Akun dan verifikasi">
        <DaftarButir
          butir={[
            'Anda wajib memberikan data yang benar dan terkini, termasuk identitas usaha, NPWP atau Tax ID, dan rekening bank.',
            'Anda bertanggung jawab atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di akun Anda.',
            'Kami berhak meminta dokumen tambahan untuk verifikasi, serta menangguhkan atau menonaktifkan akun yang datanya tidak sesuai, disalahgunakan, atau terkait penipuan.',
            'Satu akun hanya untuk satu pengguna atau satu badan usaha.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="produsen" judul="4. Ketentuan bagi produsen">
        <DaftarButir
          butir={[
            'Komoditas yang ditawarkan harus benar-benar dimiliki atau dikuasai produsen dan sesuai deskripsi, mutu, jumlah, serta foto yang dicantumkan.',
            'Produsen wajib memperbarui stok dan harga. Pesanan yang sudah dibuat tetap mengikuti harga saat pesanan dibuat.',
            'Komoditas yang dilarang diperdagangkan menurut hukum Indonesia, atau yang tidak memenuhi syarat karantina, kesehatan, dan keamanan pangan, tidak boleh dicantumkan.',
            'Pencairan dana dilakukan ke rekening utama atas nama produsen atau badan usahanya yang terdaftar di platform.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="pemesanan" judul="5. Pemesanan dan harga">
        <DaftarButir
          butir={[
            'Harga tertera dalam rupiah dan dolar AS. Pesanan lokal ditagih dalam rupiah, pesanan ekspor dalam dolar AS dengan kurs referensi platform pada saat instruksi pembayaran dibuat.',
            'Biaya logistik serta pajak atau bea dihitung oleh sistem berdasarkan tipe pasar dan Incoterms yang Anda pilih, lalu tercantum pada invoice.',
            'Pesanan dianggap dibuat saat sistem menerbitkan nomor invoice. Stok dikurangi pada saat itu.',
            'Kesalahan harga yang nyata, misalnya akibat gangguan sistem, dapat kami koreksi. Kami akan menghubungi Anda sebelum pesanan dilanjutkan.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="pembayaran" judul="6. Pembayaran">
        <DaftarButir
          butir={[
            'Pembayaran dapat dilakukan bertahap (DP 30%, DP 50%, pelunasan) melalui metode yang tersedia di halaman Metode Pembayaran.',
            'Instruksi pembayaran berlaku 24 jam. Dana yang diterima setelah batas waktu atau dengan nominal berbeda dapat tertunda proses pencocokannya.',
            'Anda wajib membayar hanya ke nomor Virtual Account atau rekening yang tampil di akun Anda. Kami tidak bertanggung jawab atas transfer ke rekening lain.',
            'Biaya yang dipungut bank pengirim, bank perantara, atau bank koresponden menjadi tanggungan pengirim dana, kecuali disepakati lain secara tertulis.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="pengiriman" judul="7. Pengiriman dan peralihan risiko">
        <DaftarButir
          butir={[
            'Pembagian biaya dan risiko pengiriman mengikuti Incoterms pada pesanan Anda.',
            'Estimasi tanggal tiba bersifat perkiraan. Keterlambatan akibat cuaca, kepadatan pelabuhan, pemeriksaan otoritas, atau keadaan di luar kendali kami tidak dianggap pelanggaran.',
            'Pembeli ekspor bertanggung jawab memenuhi persyaratan impor di negara tujuan, sejauh Incoterms yang dipilih membebankannya kepada pembeli.',
            'Pembeli wajib memeriksa barang saat diterima dan melaporkan kerusakan atau ketidaksesuaian sesegera mungkin, disertai foto dan dokumen pendukung.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="pembatalan" judul="8. Pembatalan dan keluhan">
        <DaftarButir
          butir={[
            'Pembatalan diajukan ke tim kami dengan menyebut nomor invoice. Pesanan yang dibatalkan tidak dapat dibayar lagi.',
            'Pembatalan atau perubahan setelah pembayaran diterima bergantung pada tahap pesanan dan persetujuan produsen.',
            'Keluhan mutu atau jumlah diajukan melalui kontak resmi dengan menyebut nomor invoice. Kami akan membantu menengahi antara pembeli dan produsen.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="larangan" judul="9. Penggunaan yang dilarang">
        <DaftarButir
          butir={[
            'Memberikan data palsu, menggunakan identitas orang lain, atau membuat akun ganda untuk menghindari penangguhan.',
            'Mengganggu keamanan atau kinerja platform, termasuk mencoba mengakses data pengguna lain tanpa hak.',
            'Menggunakan platform untuk pencucian uang, penipuan, atau perdagangan yang melanggar hukum.',
            'Mengambil data platform secara massal tanpa izin tertulis.',
          ]}
        />
      </BagianInfo>

      <BagianInfo id="tanggung-jawab" judul="10. Batas tanggung jawab">
        <p>
          Kami berupaya menjaga platform tetap tersedia dan akurat, tetapi tidak menjamin layanan
          bebas gangguan. Sejauh diizinkan hukum, tanggung jawab kami atas suatu pesanan dibatasi
          pada nilai pesanan tersebut dan tidak mencakup kerugian tidak langsung seperti hilangnya
          keuntungan atau peluang usaha. Ketentuan ini tidak menghapus hak Anda sebagai konsumen
          atau pihak yang dilindungi undang-undang.
        </p>
      </BagianInfo>

      <BagianInfo id="hak-kekayaan" judul="11. Hak kekayaan intelektual">
        <p>
          Merek, logo, tampilan, dan perangkat lunak platform adalah milik{' '}
          {legalitas.pemegangHakCipta}. Foto dan deskripsi yang diunggah produsen tetap menjadi
          milik produsen, dan produsen memberi kami izin menampilkannya di platform untuk keperluan
          penjualan.
        </p>
      </BagianInfo>

      <BagianInfo id="perubahan" judul="12. Perubahan ketentuan">
        <p>
          Kami dapat memperbarui ketentuan ini. Tanggal pembaruan terakhir tertera di bagian atas
          halaman. Bila perubahan berdampak besar, kami akan memberi tahu melalui email atau
          pemberitahuan di platform. Penggunaan layanan setelah perubahan berlaku berarti Anda
          menyetujuinya.
        </p>
      </BagianInfo>

      <BagianInfo id="hukum" judul="13. Hukum yang berlaku dan penyelesaian sengketa">
        <p>
          Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa diupayakan selesai lebih dulu
          melalui musyawarah. Bila tidak tercapai kesepakatan, para pihak memilih Pengadilan Negeri
          Bandung sebagai tempat penyelesaian, tanpa mengurangi hak pihak yang dilindungi peraturan
          perlindungan konsumen.
        </p>
        <p>
          Pertanyaan tentang ketentuan ini dapat dikirim ke{' '}
          <a
            href={kontak.emailUmum.href}
            className="font-semibold text-[#14452F] dark:text-emerald-300 hover:underline"
          >
            {kontak.emailUmum.tampil}
          </a>
          .
        </p>
      </BagianInfo>
    </KerangkaHalamanInfo>
  );
}
