export function formatRupiah(nominal) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(nominal) || 0);
}

export function formatUsd(nominal) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(nominal) || 0);
}

export function formatTanggal(nilai) {
  if (!nilai) return '-';
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTanggalWaktu(nilai) {
  if (!nilai) return '-';
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function labelPeran(role) {
  const peta = {
    Petani: 'Petani',
    Nelayan: 'Nelayan',
    Peternak: 'Peternak',
    Buyer_PT_Lokal: 'Pembeli PT Lokal',
    Buyer_Internasional: 'Importir Internasional',
    Admin: 'Administrator',
  };
  return peta[role] || role;
}

export function labelStatusOrder(status) {
  const peta = {
    Menunggu_DP: 'Menunggu DP',
    Diproses: 'Diproses',
    Dikirim: 'Dikirim',
    Selesai: 'Selesai',
    Dibatalkan: 'Dibatalkan',
  };
  return peta[status] || status;
}

export function labelStatusPengiriman(status) {
  const peta = {
    Persiapan_Dokumen: 'Persiapan Dokumen',
    Muat_Kargo: 'Muat Kargo',
    Bea_Cukai: 'Pemeriksaan Bea Cukai',
    Dalam_Perjalanan: 'Dalam Perjalanan',
    Tiba_Di_Tujuan: 'Tiba di Tujuan',
  };
  return peta[status] || status;
}

export function labelTahapBayar(tahap) {
  const peta = {
    DP_30: 'DP 30%',
    DP_50: 'DP 50%',
    Pelunasan: 'Pelunasan',
  };
  return peta[tahap] || tahap;
}

export function labelMetodeBayar(metode) {
  const peta = {
    Virtual_Account: 'Virtual Account',
    Transfer_RTGS: 'Transfer Bank / RTGS',
    T_T: 'Telegraphic Transfer (T/T)',
    L_C: 'Letter of Credit (L/C)',
  };
  return peta[metode] || metode;
}

export const PERAN_PRODUSEN = ['Petani', 'Nelayan', 'Peternak'];
export const PERAN_PEMBELI = ['Buyer_PT_Lokal', 'Buyer_Internasional'];
