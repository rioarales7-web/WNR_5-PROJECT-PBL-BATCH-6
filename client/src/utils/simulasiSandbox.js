const KUNCI_DATA_SIMULASI = 'agromaritim_simulasi_state_v1';
const KURS_USD_SIMULASI = 16250;

export const KATA_SANDI_SIMULASI = 'AgroSimulasi2026!';

export const AKUN_SIMULASI_PUBLIK = [
  {
    user_id: 201,
    nama_lengkap: 'Budi Santoso',
    email: 'buyer.lokal@agromaritim.id',
    no_hp: '081210002001',
    role_user: 'Buyer_PT_Lokal',
    label_peran: 'Pembeli PT Lokal',
    asal_negara: 'Indonesia',
    kota_wilayah: 'Jakarta Utara',
    nama_perusahaan: 'PT Nusantara Pangan Sejahtera',
    tipe_entitas: 'PT_Lokal',
    nomor_izin_npwp_taxid: '01.345.678.9-012.000',
    alamat_kantor_pelabuhan: 'Kawasan Pelabuhan Tanjung Priok, Jakarta Utara',
    status_verifikasi_legal: 'Terverifikasi',
    keterangan: 'Memiliki pesanan Selesai siap diulas di Katalog/Detail Produk',
  },
  {
    user_id: 202,
    nama_lengkap: 'Elena Tan',
    email: 'importir@pacifictrade.sg',
    no_hp: '081210002002',
    role_user: 'Buyer_Internasional',
    label_peran: 'Importir Internasional',
    asal_negara: 'Singapura',
    kota_wilayah: 'Singapore Port',
    nama_perusahaan: 'Pacific Trade Maritime Pte Ltd',
    tipe_entitas: 'Importir_Internasional',
    nomor_izin_npwp_taxid: 'SG-TAX-9948201K',
    alamat_kantor_pelabuhan: 'Pasir Panjang Terminal Berth 14, Singapore',
    status_verifikasi_legal: 'Terverifikasi',
    keterangan: 'Simulasi transaksi ekspor FOB/CIF & pembayaran T/T atau L/C',
  },
  {
    user_id: 301,
    nama_lengkap: 'Hendra Wijaya',
    email: 'petani.gayo@agromaritim.id',
    no_hp: '081210003001',
    role_user: 'Petani',
    label_peran: 'Produsen (Petani)',
    asal_negara: 'Indonesia',
    kota_wilayah: 'Aceh Tengah',
    nama_perusahaan: 'Koperasi Tani Gayo Lestari',
    tipe_entitas: 'Kelompok_Produsen',
    nomor_izin_npwp_taxid: '31.902.114.2-101.000',
    alamat_kantor_pelabuhan: 'Takengon, Aceh Tengah',
    status_verifikasi_legal: 'Terverifikasi',
    keterangan: 'Kelola stok panen, unduh CSV penjualan, dan rekening bank',
  },
  {
    user_id: 101,
    nama_lengkap: 'Siti Rahmawati',
    email: 'admin@agromaritim.id',
    no_hp: '081210009001',
    role_user: 'Admin',
    label_peran: 'Admin Platform',
    asal_negara: 'Indonesia',
    kota_wilayah: 'Jakarta Pusat',
    nama_perusahaan: 'Agro Maritim Pusat',
    tipe_entitas: 'PT_Lokal',
    nomor_izin_npwp_taxid: '01.000.111.2-001.000',
    alamat_kantor_pelabuhan: 'Menara Maritim Lt. 8, Jakarta Pusat',
    status_verifikasi_legal: 'Terverifikasi',
    keterangan: 'Verifikasi legalitas, konfirmasi pembayaran, pengiriman, & FAQ',
  },
];

function buatStateAwal() {
  const users = AKUN_SIMULASI_PUBLIK.map((u) => ({
    ...u,
    status_akun: 'Aktif',
    password: KATA_SANDI_SIMULASI,
    created_at: '2026-01-10T08:00:00.000Z',
  }));

  const produk = [
    {
      produk_id: 1,
      produsen_id: 301,
      sektor: 'Pertanian',
      nama_komoditas: 'Kopi Arabika Gayo Specialty',
      grade_kualitas: 'Grade 1 Ekspor',
      satuan: 'kg',
      harga_idr: 118000,
      harga_usd: 7.26,
      stok_tersedia: 4500,
      gambar: '1.jpg',
      url_gambar: '/img/1.jpg',
      status_produk: 'Aktif',
      nama_produsen: 'Hendra Wijaya',
      kota_produsen: 'Aceh Tengah',
      negara_produsen: 'Indonesia',
      peran_produsen: 'Petani',
      status_verifikasi_legal: 'Terverifikasi',
    },
    {
      produk_id: 2,
      produsen_id: 301,
      sektor: 'Perikanan',
      nama_komoditas: 'Tuna Sirip Kuning Beku',
      grade_kualitas: 'Sashimi Grade',
      satuan: 'kg',
      harga_idr: 145000,
      harga_usd: 8.92,
      stok_tersedia: 3200,
      gambar: '2.jpg',
      url_gambar: '/img/2.jpg',
      status_produk: 'Aktif',
      nama_produsen: 'Nelayan Bitung Mandiri',
      kota_produsen: 'Bitung',
      negara_produsen: 'Indonesia',
      peran_produsen: 'Nelayan',
      status_verifikasi_legal: 'Terverifikasi',
    },
    {
      produk_id: 3,
      produsen_id: 301,
      sektor: 'Perikanan',
      nama_komoditas: 'Udang Vaname Segar Beku',
      grade_kualitas: 'Size 30 Ekspor',
      satuan: 'kg',
      harga_idr: 132000,
      harga_usd: 8.12,
      stok_tersedia: 2800,
      gambar: '3.jpg',
      url_gambar: '/img/3.jpg',
      status_produk: 'Aktif',
      nama_produsen: 'Tambak Lampung Jaya',
      kota_produsen: 'Lampung Selatan',
      negara_produsen: 'Indonesia',
      peran_produsen: 'Nelayan',
      status_verifikasi_legal: 'Terverifikasi',
    },
    {
      produk_id: 4,
      produsen_id: 301,
      sektor: 'Peternakan',
      nama_komoditas: 'Daging Sapi Karkas Dingin',
      grade_kualitas: 'Prime Cut',
      satuan: 'kg',
      harga_idr: 138000,
      harga_usd: 8.49,
      stok_tersedia: 1850,
      gambar: '4.jpg',
      url_gambar: '/img/4.jpg',
      status_produk: 'Aktif',
      nama_produsen: 'Sentra Ternak Boyolali',
      kota_produsen: 'Boyolali',
      negara_produsen: 'Indonesia',
      peran_produsen: 'Peternak',
      status_verifikasi_legal: 'Terverifikasi',
    },
    {
      produk_id: 5,
      produsen_id: 301,
      sektor: 'Pertanian',
      nama_komoditas: 'Lada Putih Muntok Asli',
      grade_kualitas: 'ASTA Grade',
      satuan: 'kg',
      harga_idr: 112000,
      harga_usd: 6.89,
      stok_tersedia: 2100,
      gambar: '5.jpg',
      url_gambar: '/img/5.jpg',
      status_produk: 'Aktif',
      nama_produsen: 'Koperasi Rempah Bangka',
      kota_produsen: 'Bangka Barat',
      negara_produsen: 'Indonesia',
      peran_produsen: 'Petani',
      status_verifikasi_legal: 'Terverifikasi',
    },
  ];

  const orders = [
    {
      order_id: 901,
      nomor_invoice: 'INV-AGM-20260115-901',
      buyer_id: 201,
      tipe_pasar: 'Lokal',
      incoterms: 'Lokal_Franco',
      mata_uang: 'IDR',
      subtotal_produk_idr: 23600000,
      biaya_logistik_ekspor_idr: 1450000,
      pajak_bea_idr: 2596000,
      total_tagihan_idr: 27646000,
      status_order: 'Selesai',
      tanggal_order: '2026-01-15T09:30:00.000Z',
      items: [
        {
          detail_id: 1,
          order_id: 901,
          produk_id: 1,
          nama_komoditas_snapshot: 'Kopi Arabika Gayo Specialty',
          kuantitas: 200,
          satuan: 'kg',
          harga_satuan_deal_idr: 118000,
          subtotal_idr: 23600000,
        },
      ],
      pengiriman: {
        pengiriman_id: 1,
        order_id: 901,
        jenis_armada: 'Truk Box Tertutup',
        nomor_kontainer_resi: 'RESI-JKT-88410',
        no_peb_beacukai: '-',
        sertifikat_pendukung: 'Surat Jalan & Uji Kadar Air',
        pelabuhan_asal: 'Gudang Aceh Tengah',
        pelabuhan_tujuan: 'Gudang Tanjung Priok, Jakarta Utara',
        status_pengiriman: 'Tiba_Di_Tujuan',
        estimasi_tiba: '2026-01-20',
      },
    },
    {
      order_id: 902,
      nomor_invoice: 'INV-AGM-20260204-902',
      buyer_id: 201,
      tipe_pasar: 'Lokal',
      incoterms: 'Lokal_Franco',
      mata_uang: 'IDR',
      subtotal_produk_idr: 13200000,
      biaya_logistik_ekspor_idr: 1200000,
      pajak_bea_idr: 1452000,
      total_tagihan_idr: 15852000,
      status_order: 'Selesai',
      tanggal_order: '2026-02-04T11:15:00.000Z',
      items: [
        {
          detail_id: 2,
          order_id: 902,
          produk_id: 3,
          nama_komoditas_snapshot: 'Udang Vaname Segar Beku',
          kuantitas: 100,
          satuan: 'kg',
          harga_satuan_deal_idr: 132000,
          subtotal_idr: 13200000,
        },
      ],
      pengiriman: {
        pengiriman_id: 2,
        order_id: 902,
        jenis_armada: 'Truk Pendingin Reefer',
        nomor_kontainer_resi: 'RESI-LPG-55219',
        no_peb_beacukai: '-',
        sertifikat_pendukung: 'HACCP & Rantai Dingin -18C',
        pelabuhan_asal: 'Pelabuhan Panjang, Lampung',
        pelabuhan_tujuan: 'Cold Storage Muara Baru, Jakarta',
        status_pengiriman: 'Tiba_Di_Tujuan',
        estimasi_tiba: '2026-02-06',
      },
    },
    {
      order_id: 903,
      nomor_invoice: 'INV-AGM-20260301-903',
      buyer_id: 202,
      tipe_pasar: 'Ekspor',
      incoterms: 'FOB',
      mata_uang: 'USD',
      subtotal_produk_idr: 72500000,
      biaya_logistik_ekspor_idr: 8500000,
      pajak_bea_idr: 3625000,
      total_tagihan_idr: 84625000,
      status_order: 'Selesai',
      tanggal_order: '2026-03-01T07:45:00.000Z',
      items: [
        {
          detail_id: 3,
          order_id: 903,
          produk_id: 2,
          nama_komoditas_snapshot: 'Tuna Sirip Kuning Beku',
          kuantitas: 500,
          satuan: 'kg',
          harga_satuan_deal_idr: 145000,
          subtotal_idr: 72500000,
        },
      ],
      pengiriman: {
        pengiriman_id: 3,
        order_id: 903,
        jenis_armada: 'Kontainer Reefer 20ft',
        nomor_kontainer_resi: 'MSCU-409281-4',
        no_peb_beacukai: 'PEB-2026-004918',
        sertifikat_pendukung: 'Health Certificate & Catch Certificate',
        pelabuhan_asal: 'Pelabuhan Bitung',
        pelabuhan_tujuan: 'Pasir Panjang Terminal, Singapore',
        status_pengiriman: 'Tiba_Di_Tujuan',
        estimasi_tiba: '2026-03-09',
      },
    },
  ];

  const pembayaran = [
    {
      payment_id: 501,
      order_id: 901,
      nomor_invoice: 'INV-AGM-20260115-901',
      kode_transaksi_bank: 'VA-BCA-20260115-501',
      tahap_pembayaran: 'Pelunasan',
      metode_pembayaran: 'Virtual_Account',
      nominal_dibayar_idr: 27646000,
      nominal_usd: 1701.29,
      bank_pengirim_tujuan: 'BCA',
      status_pembayaran: 'Lunas',
      bukti_transfer: '',
      batas_waktu_bayar: '2026-01-16T09:30:00.000Z',
      tanggal_bayar: '2026-01-15T10:12:00.000Z',
    },
    {
      payment_id: 502,
      order_id: 903,
      nomor_invoice: 'INV-AGM-20260301-903',
      kode_transaksi_bank: 'TT-OCBC-20260301-502',
      tahap_pembayaran: 'DP_50',
      metode_pembayaran: 'T_T',
      nominal_dibayar_idr: 42312500,
      nominal_usd: 2603.85,
      bank_pengirim_tujuan: 'Mandiri · SWIFT BMRIIDJA',
      status_pembayaran: 'Menunggu',
      bukti_transfer: '',
      batas_waktu_bayar: '2026-03-05T07:45:00.000Z',
      tanggal_bayar: null,
    },
  ];

  const ulasan = [
    {
      review_id: 1,
      produk_id: 2,
      order_id: 903,
      buyer_id: 202,
      rating: 5,
      komentar:
        'Suhu reefer stabil sepanjang pelayaran ke Singapura dan kualitas daging tuna sesuai standar sashimi ekspor.',
      created_at: '2026-03-10T10:00:00.000Z',
      nama_pembeli: 'Elena Tan',
      kota_pembeli: 'Singapore Port',
      nama_perusahaan: 'Pacific Trade Maritime Pte Ltd',
      nomor_invoice: 'INV-AGM-20260301-903',
    },
    {
      review_id: 2,
      produk_id: 3,
      order_id: 902,
      buyer_id: 201,
      rating: 4,
      komentar:
        'Ukuran udang seragam dan pengemasan rapi dalam cold box, pengiriman tiba sesuai jadwal di Muara Baru.',
      created_at: '2026-02-07T14:20:00.000Z',
      nama_pembeli: 'Budi Santoso',
      kota_pembeli: 'Jakarta Utara',
      nama_perusahaan: 'PT Nusantara Pangan Sejahtera',
      nomor_invoice: 'INV-AGM-20260204-902',
    },
  ];

  const rekening = [
    {
      rekening_id: 1,
      user_id: 301,
      nama_bank: 'Mandiri',
      nomor_rekening: '1580004920183',
      atas_nama: 'Koperasi Tani Gayo Lestari',
      swift_code: 'BMRIIDJA',
      is_utama: 1,
    },
  ];

  const faq = [
    {
      faq_id: 1,
      kategori: 'Pemesanan',
      pertanyaan: 'Bagaimana alur pemesanan hasil panen untuk pembeli PT lokal dan importir?',
      jawaban:
        'Pembeli dapat memilih komoditas dari katalog, menentukan kuantitas, lalu memilih tipe pasar (Lokal atau Ekspor) beserta ketentuan Incoterms (EXW, FOB, CIF, DDP, atau Lokal Franco) saat checkout.',
      urutan: 1,
      status_aktif: 1,
    },
    {
      faq_id: 2,
      kategori: 'Pembayaran',
      pertanyaan: 'Metode dan tahapan pembayaran apa saja yang tersedia di Agro Maritim?',
      jawaban:
        'Platform mendukung DP 30%, DP 50%, maupun Pelunasan menggunakan Virtual Account, Transfer Bank/RTGS, serta T/T dan L/C dengan bank koresponden SWIFT untuk transaksi ekspor.',
      urutan: 2,
      status_aktif: 1,
    },
    {
      faq_id: 3,
      kategori: 'Ulasan & Mutu',
      pertanyaan: 'Kapan pembeli dapat memberikan rating dan ulasan produk?',
      jawaban:
        'Pembeli dapat menulis ulasan bintang 1–5 dan komentar pada halaman detail produk segera setelah status transaksi pesanannya berubah menjadi Selesai.',
      urutan: 3,
      status_aktif: 1,
    },
  ];

  const aktivitas = [
    {
      log_id: 1,
      user_id: 201,
      aksi: 'Pesanan INV-AGM-20260115-901 selesai dikirim',
      waktu: '2026-01-20T15:00:00.000Z',
    },
    {
      log_id: 2,
      user_id: 301,
      aksi: 'Mengunggah dokumen Sertifikat GAP & Indikasi Geografis Kopi Gayo',
      waktu: '2026-02-12T08:30:00.000Z',
    },
  ];

  const kredensialProdusen = [
    {
      kredensial_id: 1,
      user_id: 301,
      sektor: 'Pertanian',
      nomor_registrasi_sektor: 'GAP-IND-1104-2026',
      lembaga_penerbit: 'Kementerian Pertanian RI & MPIG Kopi Arabika Gayo',
      luas_kapasitas: '18,5 Hektar · Kapasitas 14 Ton/Tahun',
      lokasi_sentra: 'Kec. Bebesen & Kebayakan, Kab. Aceh Tengah',
      tanggal_berlaku: '2028-06-30',
      detail_sektor: {
        jenis_sertifikasi_lahan: 'GAP / IndoGAP & Indikasi Geografis',
        status_kepemilikan_lahan: 'Koperasi / Plasma Binaan',
        sistem_irigasi: 'Tadah Hujan Dataran Tinggi (1.450 mdpl)',
      },
      catatan_tambahan: 'Lahan kopi terdata dalam sistem registrasi kebun binaan ekspor.',
      status_verifikasi: 'Terverifikasi',
      updated_at: '2026-02-12T08:35:00.000Z',
    },
  ];

  const dokumenVerifikasi = [
    {
      dokumen_id: 1001,
      user_id: 301,
      jenis_dokumen: 'Sertifikat Lahan / GAP',
      nomor_dokumen: 'GAP-IND-1104-2026',
      nama_file_asli: 'sertifikat-gap-koperasi-gayo.pdf',
      path_file: '/img/slide-pertanian.jpg',
      ukuran_byte: 428190,
      mime_type: 'application/pdf',
      status_dokumen: 'Terverifikasi',
      diunggah_pada: '2026-02-12T08:30:00.000Z',
    },
    {
      dokumen_id: 1002,
      user_id: 301,
      jenis_dokumen: 'Foto Lokasi Sentra / Kebun',
      nomor_dokumen: 'FOTO-KEBUN-ACEH-01',
      nama_file_asli: 'dokumentasi-kebun-gayo.jpg',
      path_file: '/img/slide-pertanian.jpg',
      ukuran_byte: 984200,
      mime_type: 'image/jpeg',
      status_dokumen: 'Terverifikasi',
      diunggah_pada: '2026-02-12T08:32:00.000Z',
    },
  ];

  return {
    users,
    produk,
    orders,
    pembayaran,
    ulasan,
    rekening,
    faq,
    aktivitas,
    kredensialProdusen,
    dokumenVerifikasi,
  };
}

function bacaState() {
  try {
    const mentah = localStorage.getItem(KUNCI_DATA_SIMULASI);
    if (mentah) {
      const parsed = JSON.parse(mentah);
      const awal = buatStateAwal();
      return {
        ...awal,
        ...parsed,
        kredensialProdusen: parsed.kredensialProdusen || awal.kredensialProdusen,
        dokumenVerifikasi: parsed.dokumenVerifikasi || awal.dokumenVerifikasi,
      };
    }
  } catch {
    // Abaikan kegagalan parsing storage
  }
  const awal = buatStateAwal();
  simpanState(awal);
  return awal;
}

function simpanState(state) {
  try {
    localStorage.setItem(KUNCI_DATA_SIMULASI, JSON.stringify(state));
  } catch {
    // Abaikan kuota penuh
  }
}

function buatErrorSimulasi(pesan, status = 400, detail = null) {
  const err = new Error(pesan);
  err.status = status;
  err.detail = detail;
  return err;
}

function bersihkanNoHp(nilai) {
  return String(nilai || '').replace(/[\s()-]/g, '');
}

function sanitasiUser(user) {
  const { password: _hapus, ...bersih } = user;
  return bersih;
}

function hitungRatingProduk(state, produkId) {
  const daftar = state.ulasan.filter((u) => Number(u.produk_id) === Number(produkId));
  const jumlah = daftar.length;
  const rata =
    jumlah > 0
      ? Number((daftar.reduce((acc, u) => acc + Number(u.rating), 0) / jumlah).toFixed(1))
      : 0;
  return { rata_rating: rata, jumlah_ulasan: jumlah };
}

function perkayaProduk(state, item) {
  const rating = hitungRatingProduk(state, item.produk_id);
  return {
    ...item,
    ...rating,
    url_gambar: item.url_gambar || `/img/${item.gambar || `${item.produk_id}.jpg`}`,
  };
}

function ambilUserDariToken(state, token) {
  if (!token || !token.startsWith('simulasi_')) return null;
  const userId = Number(token.replace('simulasi_', ''));
  return state.users.find((u) => u.user_id === userId) || null;
}

export function adalahTokenSimulasi(token) {
  return Boolean(token && String(token).startsWith('simulasi_'));
}

export async function tanganiSimulasiApi(jalur, opsi = {}, token = '') {
  const state = bacaState();
  const [pathUtama, qs = ''] = jalur.split('?');
  const metode = (opsi.method || 'GET').toUpperCase();
  const params = new URLSearchParams(qs);
  const body =
    opsi.body instanceof FormData ? Object.fromEntries(opsi.body.entries()) : opsi.body || {};
  const userAktif = ambilUserDariToken(state, token);

  // AUTH
  if (pathUtama === '/auth/masuk' && metode === 'POST') {
    const identitas = String(body.identitas || body.email || '').trim();
    const password = String(body.password || '');
    const user = state.users.find(
      (u) =>
        u.email.toLowerCase() === identitas.toLowerCase() ||
        bersihkanNoHp(u.no_hp) === bersihkanNoHp(identitas)
    );
    if (!user || user.password !== password) {
      throw buatErrorSimulasi(
        'Email / nomor HP atau kata sandi tidak sesuai. Periksa kembali kredensial Anda.',
        401,
        { kode: 'KREDENSIAL_SALAH' }
      );
    }
    state.aktivitas.unshift({
      log_id: Date.now(),
      user_id: user.user_id,
      aksi: 'Masuk ke aplikasi (Simulasi)',
      waktu: new Date().toISOString(),
    });
    simpanState(state);
    return {
      sukses: true,
      pesan: 'Berhasil masuk (Mode Simulasi).',
      token: `simulasi_${user.user_id}`,
      pengguna: sanitasiUser(user),
    };
  }

  if (pathUtama === '/auth/daftar' && metode === 'POST') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      throw buatErrorSimulasi('Email sudah terdaftar.', 409);
    }
    const baru = {
      user_id: Date.now(),
      nama_lengkap: String(body.nama_lengkap || '').trim(),
      email,
      no_hp: String(body.no_hp || '').trim(),
      password: String(body.password || KATA_SANDI_SIMULASI),
      role_user: body.role_user || 'Buyer_PT_Lokal',
      asal_negara: body.asal_negara || 'Indonesia',
      kota_wilayah: body.kota_wilayah || '',
      nama_perusahaan: body.nama_perusahaan || body.nama_lengkap || '',
      tipe_entitas:
        body.role_user === 'Buyer_Internasional' ? 'Importir_Internasional' : 'PT_Lokal',
      nomor_izin_npwp_taxid: body.nomor_izin_npwp_taxid || '',
      alamat_kantor_pelabuhan: body.alamat_kantor_pelabuhan || '',
      status_verifikasi_legal: 'Menunggu',
      status_akun: 'Aktif',
      created_at: new Date().toISOString(),
    };
    state.users.push(baru);
    simpanState(state);
    return {
      sukses: true,
      pesan: 'Pendaftaran berhasil (Mode Simulasi).',
      token: `simulasi_${baru.user_id}`,
      pengguna: sanitasiUser(baru),
    };
  }

  if (pathUtama === '/auth/lupa-kata-sandi' && metode === 'POST') {
    const identitas = String(body.identitas || body.email || '').trim();
    const user = state.users.find(
      (u) =>
        u.email.toLowerCase() === identitas.toLowerCase() ||
        bersihkanNoHp(u.no_hp) === bersihkanNoHp(identitas)
    );
    return {
      sukses: true,
      pesan:
        'Permintaan pengaturan ulang kata sandi diproses (Mode Simulasi). Lanjutkan membuat kata sandi baru.',
      token_reset: user ? `SIMULASI-RESET-${user.user_id}` : `SIMULASI-RESET-0`,
    };
  }

  if (pathUtama === '/auth/reset-kata-sandi' && metode === 'POST') {
    const tokenReset = String(body.token || '');
    if (!tokenReset.startsWith('SIMULASI-RESET-')) {
      throw buatErrorSimulasi('Token reset tidak valid atau kedaluwarsa.', 400, { field: 'token' });
    }
    const userId = Number(tokenReset.replace('SIMULASI-RESET-', ''));
    const user = state.users.find((u) => u.user_id === userId);
    if (user && body.password_baru) {
      user.password = body.password_baru;
      simpanState(state);
    }
    return {
      sukses: true,
      pesan: 'Kata sandi baru berhasil disimpan (Mode Simulasi). Silakan masuk kembali.',
    };
  }

  if (pathUtama === '/auth/keluar' && metode === 'POST') {
    return { sukses: true, pesan: 'Sesi ditutup.' };
  }

  if (pathUtama === '/auth/saya' && metode === 'GET') {
    if (!userAktif) throw buatErrorSimulasi('Sesi tidak ditemukan.', 401);
    return { sukses: true, pengguna: sanitasiUser(userAktif) };
  }

  // FAQ
  if (pathUtama === '/faq' && metode === 'GET') {
    return { sukses: true, faq: state.faq.filter((f) => f.status_aktif) };
  }

  // NEWSLETTER
  if (pathUtama === '/newsletter' && metode === 'POST') {
    const emailBaru = String(body.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailBaru)) {
      throw buatErrorSimulasi('Format email tidak valid.', 400);
    }
    return { sukses: true, pesan: 'Berhasil berlangganan.' };
  }

  // PRODUK & ULASAN
  if (pathUtama === '/produk' && metode === 'GET') {
    let hasil = state.produk.filter((p) => p.status_produk === 'Aktif');
    const sektor = params.get('sektor');
    if (sektor) {
      const daftar = sektor.split(',').map((s) => s.trim());
      hasil = hasil.filter((p) => daftar.includes(p.sektor));
    }
    const cari = (params.get('cari') || '').trim().toLowerCase();
    if (cari) {
      hasil = hasil.filter((p) => {
        const pemilik = state.users.find((u) => u.user_id === p.produsen_id);
        return (
          p.nama_komoditas.toLowerCase().includes(cari) ||
          p.sektor.toLowerCase().includes(cari) ||
          p.kota_produsen.toLowerCase().includes(cari) ||
          (p.negara_produsen || '').toLowerCase().includes(cari) ||
          p.nama_produsen.toLowerCase().includes(cari) ||
          (pemilik?.nama_perusahaan || '').toLowerCase().includes(cari)
        );
      });
    }
    const lokasi = (params.get('lokasi') || '').trim().toLowerCase();
    if (lokasi) {
      hasil = hasil.filter((p) => {
        const pemilik = state.users.find((u) => u.user_id === p.produsen_id);
        return (
          p.kota_produsen.toLowerCase().includes(lokasi) ||
          (p.negara_produsen || '').toLowerCase().includes(lokasi) ||
          (pemilik?.alamat_kantor_pelabuhan || '').toLowerCase().includes(lokasi)
        );
      });
    }
    const grade = (params.get('grade') || '').trim().toLowerCase();
    if (grade) {
      hasil = hasil.filter((p) => p.grade_kualitas.toLowerCase().includes(grade));
    }
    const pasar = params.get('pasar');
    if (pasar === 'Ekspor') {
      hasil = hasil.filter((p) => Number(p.harga_usd) > 0);
    } else if (pasar === 'Lokal') {
      hasil = hasil.filter((p) => Number(p.harga_idr) > 0);
    }
    const hargaMax = params.get('harga_max');
    if (hargaMax) {
      hasil = hasil.filter((p) => Number(p.harga_idr) <= Number(hargaMax));
    }
    return { sukses: true, produk: hasil.map((p) => perkayaProduk(state, p)) };
  }

  if (pathUtama === '/produk/saya' && metode === 'GET') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    const milik =
      userAktif.role_user === 'Admin'
        ? state.produk
        : state.produk.filter((p) => p.produsen_id === userAktif.user_id);
    return { sukses: true, produk: milik.map((p) => perkayaProduk(state, p)) };
  }

  const cocokUlasan = pathUtama.match(/^\/produk\/(\d+)\/ulasan$/);
  if (cocokUlasan) {
    const produkId = Number(cocokUlasan[1]);
    if (metode === 'POST') {
      if (!userAktif) throw buatErrorSimulasi('Silakan masuk untuk mengirim ulasan.', 401);
      const orderId = Number(body.order_id);
      const rating = Number(body.rating);
      const komentar = String(body.komentar || '').trim();
      const order = state.orders.find(
        (o) => o.order_id === orderId && o.buyer_id === userAktif.user_id
      );
      if (!order || order.status_order !== 'Selesai') {
        throw buatErrorSimulasi('Ulasan hanya berlaku untuk transaksi berstatus Selesai.', 400);
      }
      if (
        state.ulasan.some(
          (u) =>
            u.order_id === orderId && u.produk_id === produkId && u.buyer_id === userAktif.user_id
        )
      ) {
        throw buatErrorSimulasi('Pesanan ini sudah Anda ulas sebelumnya.', 409);
      }
      state.ulasan.unshift({
        review_id: Date.now(),
        produk_id: produkId,
        order_id: orderId,
        buyer_id: userAktif.user_id,
        rating,
        komentar,
        created_at: new Date().toISOString(),
        nama_pembeli: userAktif.nama_lengkap,
        kota_pembeli: userAktif.kota_wilayah,
        nama_perusahaan: userAktif.nama_perusahaan,
        nomor_invoice: order.nomor_invoice,
      });
      simpanState(state);
    }

    const daftarUlasan = state.ulasan.filter((u) => Number(u.produk_id) === produkId);
    const distribusi = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    daftarUlasan.forEach((u) => {
      distribusi[u.rating] = (distribusi[u.rating] || 0) + 1;
    });
    const ratingInfo = hitungRatingProduk(state, produkId);
    const pesananDapatDiulas = userAktif
      ? state.orders
          .filter(
            (o) =>
              o.buyer_id === userAktif.user_id &&
              o.status_order === 'Selesai' &&
              o.items.some((it) => Number(it.produk_id) === produkId) &&
              !state.ulasan.some(
                (u) =>
                  Number(u.order_id) === o.order_id &&
                  Number(u.produk_id) === produkId &&
                  u.buyer_id === userAktif.user_id
              )
          )
          .map((o) => {
            const it = o.items.find((x) => Number(x.produk_id) === produkId);
            return {
              order_id: o.order_id,
              nomor_invoice: o.nomor_invoice,
              tanggal_order: o.tanggal_order,
              kuantitas: it?.kuantitas || 1,
              satuan: it?.satuan || 'kg',
            };
          })
      : [];

    return {
      sukses: true,
      pesan: metode === 'POST' ? 'Ulasan Anda berhasil disimpan (Simulasi).' : undefined,
      ringkasan: { ...ratingInfo, distribusi },
      ulasan: daftarUlasan,
      pesanan_dapat_diulas: pesananDapatDiulas,
    };
  }

  const cocokDetailProduk = pathUtama.match(/^\/produk\/(\d+)$/);
  if (cocokDetailProduk) {
    const produkId = Number(cocokDetailProduk[1]);
    if (metode === 'GET') {
      const item = state.produk.find((p) => p.produk_id === produkId);
      if (!item) throw buatErrorSimulasi('Produk tidak ditemukan.', 404);
      return { sukses: true, produk: perkayaProduk(state, item) };
    }
    if (metode === 'PUT') {
      const idx = state.produk.findIndex((p) => p.produk_id === produkId);
      if (idx === -1) throw buatErrorSimulasi('Produk tidak ditemukan.', 404);
      state.produk[idx] = {
        ...state.produk[idx],
        ...body,
        harga_idr: body.harga_idr ? Number(body.harga_idr) : state.produk[idx].harga_idr,
        stok_tersedia:
          body.stok_tersedia !== undefined
            ? Number(body.stok_tersedia)
            : state.produk[idx].stok_tersedia,
      };
      simpanState(state);
      return {
        sukses: true,
        pesan: 'Produk diperbarui.',
        produk: perkayaProduk(state, state.produk[idx]),
      };
    }
  }

  if (pathUtama === '/produk' && metode === 'POST') {
    const hargaIdr = Number(body.harga_idr) || 50000;
    const baru = {
      produk_id: Date.now(),
      produsen_id: userAktif?.user_id || 301,
      sektor: body.sektor || 'Pertanian',
      nama_komoditas: body.nama_komoditas || 'Komoditas Baru',
      grade_kualitas: body.grade_kualitas || 'Grade A',
      satuan: body.satuan || 'kg',
      harga_idr: hargaIdr,
      harga_usd: Number((hargaIdr / KURS_USD_SIMULASI).toFixed(2)),
      stok_tersedia: Number(body.stok_tersedia) || 100,
      gambar: '1.jpg',
      url_gambar: '/img/1.jpg',
      status_produk: 'Aktif',
      nama_produsen: userAktif?.nama_lengkap || 'Produsen',
      kota_produsen: userAktif?.kota_wilayah || 'Indonesia',
      negara_produsen: 'Indonesia',
      status_verifikasi_legal: 'Terverifikasi',
    };
    state.produk.unshift(baru);
    simpanState(state);
    return {
      sukses: true,
      pesan: 'Komoditas berhasil ditambahkan.',
      produk: perkayaProduk(state, baru),
    };
  }

  // ORDER & BERANDA
  if (pathUtama === '/order/beranda' && metode === 'GET') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    const komoditas = state.produk.slice(0, 6).map((p) => perkayaProduk(state, p));
    if (['Petani', 'Nelayan', 'Peternak'].includes(userAktif.role_user)) {
      const milik = state.produk.filter((p) => p.produsen_id === userAktif.user_id);
      return {
        sukses: true,
        ringkasan: {
          kategori: 'Produsen',
          total_produk: milik.length,
          total_stok: milik.reduce((a, b) => a + Number(b.stok_tersedia), 0),
          pesanan_masuk: state.orders.length,
          total_pendapatan_idr: 36800000,
          komoditas_unggulan: komoditas,
        },
      };
    }
    if (userAktif.role_user === 'Admin') {
      return {
        sukses: true,
        ringkasan: {
          kategori: 'Admin',
          menunggu_verifikasi: state.users.filter((u) => u.status_verifikasi_legal === 'Menunggu')
            .length,
          menunggu_pembayaran: state.pembayaran.filter((p) => p.status_pembayaran === 'Menunggu')
            .length,
          total_pesanan: state.orders.length,
          komoditas_unggulan: komoditas,
        },
      };
    }
    const orderSaya = state.orders.filter((o) => o.buyer_id === userAktif.user_id);
    return {
      sukses: true,
      ringkasan: {
        kategori: 'Pembeli',
        pesanan_aktif: orderSaya.length,
        total_belanja_idr: orderSaya.reduce((a, b) => a + Number(b.total_tagihan_idr), 0),
        komoditas_unggulan: komoditas,
      },
    };
  }

  if (
    pathUtama === '/order/laporan-penjualan-csv' ||
    pathUtama === '/order/laporan-transaksi-csv'
  ) {
    const daftar =
      userAktif?.role_user === 'Admin' ||
      ['Petani', 'Nelayan', 'Peternak'].includes(userAktif?.role_user)
        ? state.orders
        : state.orders.filter((o) => o.buyer_id === userAktif?.user_id);
    const header =
      'Nomor Invoice,Tanggal,Tipe Pasar,Incoterms,Total Tagihan (IDR),Status Order,Tujuan\r\n';
    const baris = daftar
      .map(
        (o) =>
          `"${o.nomor_invoice}","${String(o.tanggal_order || '').slice(0, 10)}","${o.tipe_pasar}","${o.incoterms}",${o.total_tagihan_idr},"${o.status_order}","${o.pengiriman?.pelabuhan_tujuan || '-'}"`
      )
      .join('\r\n');
    return new Blob([`\uFEFF${header}${baris}`], { type: 'text/csv;charset=utf-8' });
  }

  if (pathUtama === '/order/pratinjau' && metode === 'POST') {
    const items = (body.items || []).map((it) => {
      const p = state.produk.find((x) => x.produk_id === Number(it.produk_id)) || state.produk[0];
      const sub = Number(p.harga_idr) * Number(it.kuantitas || 1);
      return {
        produk_id: p.produk_id,
        nama_komoditas: p.nama_komoditas,
        kuantitas: Number(it.kuantitas || 1),
        satuan: p.satuan,
        harga_satuan_idr: p.harga_idr,
        subtotal_idr: sub,
      };
    });
    const subtotal = items.reduce((a, b) => a + b.subtotal_idr, 0);
    const logistik = body.tipe_pasar === 'Ekspor' ? Math.round(subtotal * 0.12) : 1200000;
    const pajak =
      body.tipe_pasar === 'Ekspor' ? Math.round(subtotal * 0.05) : Math.round(subtotal * 0.11);
    const total = subtotal + logistik + pajak;
    return {
      sukses: true,
      ringkasan: {
        items,
        subtotal_produk_idr: subtotal,
        biaya_logistik_ekspor_idr: logistik,
        pajak_bea_idr: pajak,
        total_tagihan_idr: total,
        mata_uang: body.tipe_pasar === 'Ekspor' ? 'USD' : 'IDR',
        total_tagihan_usd: Number((total / KURS_USD_SIMULASI).toFixed(2)),
        kurs_usd: KURS_USD_SIMULASI,
      },
    };
  }

  if (pathUtama === '/order' && metode === 'POST') {
    const pratinjau = await tanganiSimulasiApi('/order/pratinjau', { method: 'POST', body }, token);
    const r = pratinjau.ringkasan;
    const orderId = Date.now();
    const orderBaru = {
      order_id: orderId,
      nomor_invoice: `INV-AGM-SIM-${String(orderId).slice(-5)}`,
      buyer_id: userAktif?.user_id || 201,
      tipe_pasar: body.tipe_pasar || 'Lokal',
      incoterms: body.incoterms || 'Lokal_Franco',
      mata_uang: r.mata_uang,
      subtotal_produk_idr: r.subtotal_produk_idr,
      biaya_logistik_ekspor_idr: r.biaya_logistik_ekspor_idr,
      pajak_bea_idr: r.pajak_bea_idr,
      total_tagihan_idr: r.total_tagihan_idr,
      status_order: 'Menunggu_DP',
      tanggal_order: new Date().toISOString(),
      items: r.items.map((x, idx) => ({
        detail_id: idx + 1,
        order_id: orderId,
        produk_id: x.produk_id,
        nama_komoditas_snapshot: x.nama_komoditas,
        kuantitas: x.kuantitas,
        satuan: x.satuan,
        harga_satuan_deal_idr: x.harga_satuan_idr,
        subtotal_idr: x.subtotal_idr,
      })),
      pengiriman: {
        pengiriman_id: orderId,
        order_id: orderId,
        jenis_armada:
          body.tipe_pasar === 'Ekspor' ? 'Kontainer Kapal Laut' : 'Truk Pendingin Darat',
        nomor_kontainer_resi: `SIM-${String(orderId).slice(-6)}`,
        no_peb_beacukai: body.tipe_pasar === 'Ekspor' ? 'Menunggu PEB' : '-',
        sertifikat_pendukung: 'Dokumen Simulasi',
        pelabuhan_asal: 'Sentra Produksi Indonesia',
        pelabuhan_tujuan: body.pelabuhan_tujuan || 'Jakarta',
        status_pengiriman: 'Persiapan_Dokumen',
        estimasi_tiba: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      },
    };
    state.orders.unshift(orderBaru);
    simpanState(state);
    return { sukses: true, pesan: 'Pesanan simulasi berhasil dibuat.', order: orderBaru };
  }

  if (pathUtama === '/order' && metode === 'GET') {
    const daftar =
      userAktif?.role_user === 'Admin' ||
      ['Petani', 'Nelayan', 'Peternak'].includes(userAktif?.role_user)
        ? state.orders
        : state.orders.filter((o) => o.buyer_id === userAktif?.user_id);
    return { sukses: true, orders: daftar };
  }

  const cocokOrder = pathUtama.match(/^\/order\/(\d+)$/);
  if (cocokOrder && metode === 'GET') {
    const orderId = Number(cocokOrder[1]);
    const ord = state.orders.find((o) => o.order_id === orderId);
    if (!ord) throw buatErrorSimulasi('Pesanan tidak ditemukan.', 404);
    const bayar = state.pembayaran.filter((p) => p.order_id === orderId);
    const lunas = bayar
      .filter((p) => p.status_pembayaran === 'Lunas')
      .reduce((a, b) => a + b.nominal_dibayar_idr, 0);
    return {
      sukses: true,
      order: {
        ...ord,
        total_lunas_idr: lunas,
        sisa_tagihan_idr: Math.max(0, ord.total_tagihan_idr - lunas),
        pembayaran: bayar,
      },
    };
  }

  // PEMBAYARAN
  if (pathUtama === '/pembayaran/bank') {
    return {
      sukses: true,
      bankLokal: ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata'],
      bankKoresponden: [
        { nama: 'DBS Bank Singapore', swift: 'DBSSSGSG' },
        { nama: 'Standard Chartered HK', swift: 'SCBLHKHH' },
      ],
    };
  }

  if (pathUtama === '/pembayaran/riwayat') {
    return { sukses: true, pembayaran: state.pembayaran };
  }

  if (pathUtama === '/pembayaran' && metode === 'POST') {
    const ord = state.orders.find((o) => o.order_id === Number(body.order_id));
    if (!ord) throw buatErrorSimulasi('Pesanan tidak ditemukan.', 404);
    const rasio =
      body.tahap_pembayaran === 'DP_30' ? 0.3 : body.tahap_pembayaran === 'DP_50' ? 0.5 : 1;
    const nominal = Math.round(ord.total_tagihan_idr * rasio);
    const instruksi = {
      payment_id: Date.now(),
      order_id: ord.order_id,
      nomor_invoice: ord.nomor_invoice,
      kode_transaksi_bank: `SIM-VA-${String(Date.now()).slice(-6)}`,
      tahap_pembayaran: body.tahap_pembayaran || 'DP_30',
      metode_pembayaran: body.metode_pembayaran || 'Virtual_Account',
      nominal_dibayar_idr: nominal,
      nominal_usd: Number((nominal / KURS_USD_SIMULASI).toFixed(2)),
      bank_pengirim_tujuan: body.nama_bank || 'BCA',
      status_pembayaran: 'Menunggu',
      batas_waktu_bayar: new Date(Date.now() + 86400000).toISOString(),
      nomor_va_tujuan: '880102938475612',
    };
    state.pembayaran.unshift(instruksi);
    simpanState(state);
    return { sukses: true, instruksi };
  }

  if (/^\/pembayaran\/\d+\/bukti$/.test(pathUtama) && metode === 'POST') {
    return { sukses: true, pesan: 'Bukti pembayaran simulasi diterima.' };
  }

  if (/^\/pembayaran\/\d+\/pdf$/.test(pathUtama)) {
    return new Blob(['Bukti Pembayaran Simulasi Agro Maritim'], { type: 'application/pdf' });
  }

  // REKENING
  if (pathUtama === '/rekening' && metode === 'GET') {
    return {
      sukses: true,
      rekening: state.rekening.filter((r) => r.user_id === (userAktif?.user_id || 301)),
    };
  }
  if (pathUtama === '/rekening' && metode === 'POST') {
    const baru = {
      rekening_id: Date.now(),
      user_id: userAktif?.user_id || 301,
      ...body,
      is_utama: state.rekening.length === 0 ? 1 : 0,
    };
    state.rekening.push(baru);
    simpanState(state);
    return { sukses: true, pesan: 'Rekening ditambahkan.', rekening: baru };
  }
  const cocokRek = pathUtama.match(/^\/rekening\/(\d+)(\/utama)?$/);
  if (cocokRek) {
    const id = Number(cocokRek[1]);
    if (metode === 'DELETE') {
      state.rekening = state.rekening.filter((r) => r.rekening_id !== id);
      simpanState(state);
      return { sukses: true, pesan: 'Rekening dihapus.' };
    }
    if (cocokRek[2] === '/utama') {
      state.rekening = state.rekening.map((r) => ({
        ...r,
        is_utama: r.rekening_id === id ? 1 : 0,
      }));
      simpanState(state);
      return { sukses: true, pesan: 'Rekening utama diperbarui.' };
    }
    state.rekening = state.rekening.map((r) => (r.rekening_id === id ? { ...r, ...body } : r));
    simpanState(state);
    return { sukses: true, pesan: 'Rekening diperbarui.' };
  }

  // PROFIL & AKTIVITAS
  if (pathUtama === '/profil' && metode === 'GET') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    const kredensial = (state.kredensialProdusen || []).find(
      (k) => k.user_id === userAktif.user_id
    );
    const dokumen = (state.dokumenVerifikasi || []).filter((d) => d.user_id === userAktif.user_id);
    return {
      sukses: true,
      pengguna: sanitasiUser(userAktif),
      perusahaan: {
        nama_perusahaan: userAktif.nama_perusahaan,
        nomor_izin_npwp_taxid: userAktif.nomor_izin_npwp_taxid,
        alamat_kantor_pelabuhan: userAktif.alamat_kantor_pelabuhan,
        pic_kontak: userAktif.nama_lengkap,
        status_verifikasi_legal: userAktif.status_verifikasi_legal,
      },
      kredensial_produsen: kredensial || null,
      dokumen_verifikasi: dokumen,
    };
  }
  if (pathUtama === '/profil' && metode === 'PUT') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    Object.assign(userAktif, body);
    simpanState(state);
    return { sukses: true, pesan: 'Profil diperbarui.', pengguna: sanitasiUser(userAktif) };
  }
  if (pathUtama === '/profil/perusahaan' && metode === 'PUT') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    Object.assign(userAktif, body);
    simpanState(state);
    return {
      sukses: true,
      pesan: 'Data perusahaan diperbarui.',
      perusahaan: {
        nama_perusahaan: userAktif.nama_perusahaan,
        nomor_izin_npwp_taxid: userAktif.nomor_izin_npwp_taxid,
        alamat_kantor_pelabuhan: userAktif.alamat_kantor_pelabuhan,
        pic_kontak: userAktif.nama_lengkap,
        status_verifikasi_legal: userAktif.status_verifikasi_legal,
      },
    };
  }
  if (pathUtama === '/profil/kredensial-produsen' && metode === 'PUT') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    const daftar = state.kredensialProdusen || [];
    const idx = daftar.findIndex((k) => k.user_id === userAktif.user_id);
    const entriBaru = {
      kredensial_id: idx >= 0 ? daftar[idx].kredensial_id : Date.now(),
      user_id: userAktif.user_id,
      sektor: body.sektor || 'Pertanian',
      nomor_registrasi_sektor: body.nomor_registrasi_sektor || '',
      lembaga_penerbit: body.lembaga_penerbit || '',
      luas_kapasitas: body.luas_kapasitas || '',
      lokasi_sentra: body.lokasi_sentra || '',
      tanggal_berlaku: body.tanggal_berlaku || null,
      detail_sektor: body.detail_sektor || {},
      catatan_tambahan: body.catatan_tambahan || '',
      status_verifikasi: 'Menunggu',
      updated_at: new Date().toISOString(),
    };
    if (idx >= 0) {
      daftar[idx] = entriBaru;
    } else {
      daftar.push(entriBaru);
    }
    state.kredensialProdusen = daftar;
    state.aktivitas.unshift({
      log_id: Date.now(),
      user_id: userAktif.user_id,
      aksi: `Memperbarui kredensial sektor ${entriBaru.sektor}`,
      waktu: new Date().toISOString(),
    });
    simpanState(state);
    return {
      sukses: true,
      pesan: `Kredensial sektor ${entriBaru.sektor} berhasil disimpan untuk peninjauan verifikasi.`,
      kredensial_produsen: entriBaru,
    };
  }
  if (pathUtama === '/profil/dokumen-verifikasi' && metode === 'POST') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    const berkas = body.berkas_dokumen;
    const namaAsli =
      berkas && typeof berkas === 'object' && berkas.name ? berkas.name : 'dokumen-verifikasi.pdf';
    const ukuranByte = berkas && typeof berkas === 'object' && berkas.size ? berkas.size : 245760;
    const mimeType =
      berkas && typeof berkas === 'object' && berkas.type ? berkas.type : 'application/pdf';
    const jenisDokumen = body.jenis_dokumen || 'Dokumen Legalitas Produsen';
    const dokBaru = {
      dokumen_id: Date.now(),
      user_id: userAktif.user_id,
      jenis_dokumen: jenisDokumen,
      nomor_dokumen: body.nomor_dokumen || '',
      nama_file_asli: namaAsli,
      path_file: mimeType.startsWith('image/') ? '/img/slide-pertanian.jpg' : '',
      ukuran_byte: ukuranByte,
      mime_type: mimeType,
      status_dokumen: 'Menunggu',
      diunggah_pada: new Date().toISOString(),
    };
    state.dokumenVerifikasi = [dokBaru, ...(state.dokumenVerifikasi || [])];
    state.aktivitas.unshift({
      log_id: Date.now() + 1,
      user_id: userAktif.user_id,
      aksi: `Mengunggah dokumen verifikasi: ${jenisDokumen}`,
      waktu: new Date().toISOString(),
    });
    simpanState(state);
    return {
      sukses: true,
      pesan: `Dokumen "${jenisDokumen}" berhasil diunggah untuk verifikasi.`,
      dokumen: dokBaru,
    };
  }
  if (/^\/profil\/dokumen-verifikasi\/\d+$/.test(pathUtama) && metode === 'DELETE') {
    if (!userAktif) throw buatErrorSimulasi('Autentikasi diperlukan.', 401);
    const dokumenId = Number(pathUtama.split('/').pop());
    state.dokumenVerifikasi = (state.dokumenVerifikasi || []).filter(
      (d) => !(d.dokumen_id === dokumenId && d.user_id === userAktif.user_id)
    );
    simpanState(state);
    return { sukses: true, pesan: 'Dokumen verifikasi berhasil dihapus.' };
  }
  if (pathUtama === '/profil/kata-sandi' && metode === 'PUT') {
    return { sukses: true, pesan: 'Kata sandi diperbarui (Simulasi).' };
  }
  if (pathUtama === '/profil/aktivitas' && metode === 'GET') {
    return {
      sukses: true,
      aktivitas: state.aktivitas.filter((a) => a.user_id === userAktif?.user_id),
    };
  }

  // ADMIN
  if (pathUtama === '/admin/legal') {
    return {
      sukses: true,
      daftar: state.users.map((u) => ({
        profil_id: u.user_id,
        user_id: u.user_id,
        nama_lengkap: u.nama_lengkap,
        email: u.email,
        role_user: u.role_user,
        nama_perusahaan: u.nama_perusahaan,
        tipe_entitas: u.tipe_entitas,
        nomor_izin_npwp_taxid: u.nomor_izin_npwp_taxid,
        status_verifikasi_legal: u.status_verifikasi_legal,
        alamat_kantor_pelabuhan: u.alamat_kantor_pelabuhan,
        kredensial_produsen:
          (state.kredensialProdusen || []).find((k) => k.user_id === u.user_id) || null,
        dokumen_verifikasi: (state.dokumenVerifikasi || []).filter((d) => d.user_id === u.user_id),
      })),
    };
  }
  if (/^\/admin\/legal\/\d+$/.test(pathUtama) && metode === 'PATCH') {
    const uid = Number(pathUtama.split('/').pop());
    const statusBaru = body.status_verifikasi_legal || 'Terverifikasi';
    const target = state.users.find((u) => u.user_id === uid);
    if (target) target.status_verifikasi_legal = statusBaru;
    state.kredensialProdusen = (state.kredensialProdusen || []).map((k) =>
      k.user_id === uid ? { ...k, status_verifikasi: statusBaru } : k
    );
    state.dokumenVerifikasi = (state.dokumenVerifikasi || []).map((d) =>
      d.user_id === uid ? { ...d, status_dokumen: statusBaru } : d
    );
    simpanState(state);
    return { sukses: true, pesan: 'Status verifikasi diperbarui.' };
  }
  if (pathUtama === '/admin/pembayaran') {
    return { sukses: true, pembayaran: state.pembayaran };
  }
  if (/^\/admin\/pembayaran\/\d+$/.test(pathUtama) && metode === 'PATCH') {
    const pid = Number(pathUtama.split('/').pop());
    const target = state.pembayaran.find((p) => p.payment_id === pid);
    if (target) target.status_pembayaran = body.status_pembayaran || 'Lunas';
    simpanState(state);
    return { sukses: true, pesan: 'Status pembayaran diperbarui.' };
  }
  if (pathUtama === '/pengiriman') {
    return {
      sukses: true,
      pengiriman: state.orders.map((o) => ({
        ...o.pengiriman,
        nomor_invoice: o.nomor_invoice,
        status_order: o.status_order,
      })),
    };
  }
  if (/^\/admin\/pengiriman\/\d+$/.test(pathUtama) && metode === 'PUT') {
    const oid = Number(pathUtama.split('/').pop());
    const target = state.orders.find((o) => o.order_id === oid);
    if (target && target.pengiriman) {
      target.pengiriman.status_pengiriman =
        body.status_pengiriman || target.pengiriman.status_pengiriman;
      if (body.status_pengiriman === 'Tiba_Di_Tujuan') target.status_order = 'Selesai';
    }
    simpanState(state);
    return { sukses: true, pesan: 'Status pengiriman diperbarui.' };
  }
  if (pathUtama === '/admin/faq' && metode === 'GET') {
    return { sukses: true, faq: state.faq };
  }
  if (pathUtama === '/admin/faq' && metode === 'POST') {
    const baru = { faq_id: Date.now(), ...body, status_aktif: body.status_aktif ? 1 : 0 };
    state.faq.push(baru);
    simpanState(state);
    return { sukses: true, pesan: 'FAQ ditambahkan.', faq: baru };
  }
  if (/^\/admin\/faq\/\d+$/.test(pathUtama)) {
    const fid = Number(pathUtama.split('/').pop());
    if (metode === 'DELETE') {
      state.faq = state.faq.filter((f) => f.faq_id !== fid);
      simpanState(state);
      return { sukses: true, pesan: 'FAQ dihapus.' };
    }
    state.faq = state.faq.map((f) => (f.faq_id === fid ? { ...f, ...body } : f));
    simpanState(state);
    return { sukses: true, pesan: 'FAQ diperbarui.' };
  }

  return { sukses: true };
}
