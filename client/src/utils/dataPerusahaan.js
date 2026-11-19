export const DATA_PERUSAHAAN = {
  merek: {
    nama: 'Agro Maritim',
    deskripsi:
      'Platform niaga komoditas pertanian, perikanan, dan peternakan yang menghubungkan produsen lokal dengan pasar nasional dan ekspor.',
  },
  newsletter: {
    judul: 'Buletin Panen & Ekspor',
    keterangan: 'Dapatkan ringkasan harga komoditas dan jadwal panen mingguan.',
    placeholder: 'Alamat email Anda',
    labelTombol: 'Kirim',
    labelMengirim: 'Mengirim...',
    pesanSukses: 'Berhasil berlangganan. Pembaruan akan dikirim ke',
    pesanGagal: 'Gagal terhubung ke server. Silakan coba kirim ulang.',
    pesanEmailTidakValid: 'Masukkan alamat email yang valid terlebih dahulu.',
  },
  sosialMedia: [
    {
      id: 'instagram',
      label: 'Instagram Agro Maritim',
      tautan: 'https://instagram.com/agromaritim.id',
    },
    {
      id: 'facebook',
      label: 'Facebook Agro Maritim',
      tautan: 'https://facebook.com/agromaritim.id',
    },
    {
      id: 'youtube',
      label: 'YouTube Agro Maritim',
      tautan: 'https://youtube.com/@agromaritimid',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Agro Maritim',
      tautan: 'https://linkedin.com/company/agro-maritim-nusantara',
    },
  ],
  navigasiUtama: [
    { label: 'Beranda', tujuan: '/' },
    { label: 'Katalog', tujuan: '/katalog' },
    { label: 'Pesanan', tujuan: '/pesanan' },
    { label: 'Jual Panen', tujuan: '/jual-panen' },
  ],
  navigasiKategori: [
    { label: 'Pertanian', tujuan: '/katalog?kategori=pertanian' },
    { label: 'Perikanan', tujuan: '/katalog?kategori=perikanan' },
    { label: 'Peternakan', tujuan: '/katalog?kategori=peternakan' },
  ],
  bantuanDanLegal: [
    { label: 'FAQ', tujuan: '/faq' },
    { label: 'Panduan Pemesanan', tujuan: '/panduan-pemesanan' },
    { label: 'Metode Pembayaran', tujuan: '/metode-pembayaran' },
    {
      label: 'Panduan Ekspor (Incoterms & Dokumen Bea Cukai)',
      tujuan: '/panduan-ekspor',
    },
    { label: 'Syarat dan Ketentuan', tujuan: '/syarat-ketentuan' },
    { label: 'Kebijakan Privasi', tujuan: '/kebijakan-privasi' },
  ],
  kontak: {
    alamat:
      'Jl. Soekarno-Hatta No. 412, Kel. Batununggal, Kec. Bandung Kidul, Kota Bandung, Jawa Barat 40266',
    telepon: {
      tampil: '+62 22 7534 8190',
      href: 'tel:+622275348190',
    },
    whatsapp: {
      tampil: '+62 811-2204-8890',
      href: 'https://wa.me/6281122048890',
    },
    emailUmum: {
      tampil: 'halo@agromaritim.co.id',
      href: 'mailto:halo@agromaritim.co.id',
    },
    emailEkspor: {
      tampil: 'ekspor@agromaritim.co.id',
      href: 'mailto:ekspor@agromaritim.co.id',
    },
    jamOperasional: 'Senin – Jumat, 08.00 – 17.00 WIB',
  },
  legalitas: {
    pemegangHakCipta: 'PT Agro Maritim Nusantara',
    tahun: 2026,
    nib: '0220104829173',
    npwp: '94.281.530.7-423.000',
  },
};

export const TANGGAL_PEMBARUAN_DOKUMEN = '19 November 2026';
