import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../utils/kesalahan.js';

const DATA_BANK_NASIONAL = {
  BCA: {
    kode: '014',
    prefixVa: '39014',
    rekeningEscrow: '014-8829-1045-22',
    swift: 'CENAIDJA',
    atasNama: 'PT Agro Maritim Nusantara',
  },
  Mandiri: {
    kode: '008',
    prefixVa: '88008',
    rekeningEscrow: '124-000-9918-221',
    swift: 'BMRIIDJA',
    atasNama: 'PT Agro Maritim Nusantara',
  },
  BNI: {
    kode: '009',
    prefixVa: '80009',
    rekeningEscrow: '098-112-4409-10',
    swift: 'BNINIDJA',
    atasNama: 'PT Agro Maritim Nusantara',
  },
  BRI: {
    kode: '002',
    prefixVa: '26002',
    rekeningEscrow: '0020-01-004829-30-9',
    swift: 'BRINIDJA',
    atasNama: 'PT Agro Maritim Nusantara',
  },
  'CIMB Niaga': {
    kode: '022',
    prefixVa: '59022',
    rekeningEscrow: '8001-4452-9100',
    swift: 'BNIAIDJA',
    atasNama: 'PT Agro Maritim Nusantara',
  },
  Permata: {
    kode: '013',
    prefixVa: '89013',
    rekeningEscrow: '411-9028-3341',
    swift: 'BBBAIDJA',
    atasNama: 'PT Agro Maritim Nusantara',
  },
};

const BANK_KORESPONDEN_EKSPOR = {
  'DBS Singapore': { swift: 'DBSSSGSG', negara: 'Singapura' },
  'HSBC Hong Kong': { swift: 'HSBCHKHHHKH', negara: 'Hong Kong' },
  'MUFG Tokyo': { swift: 'BOTKJPJT', negara: 'Jepang' },
  'Citibank New York': { swift: 'CITIUS33', negara: 'Amerika Serikat' },
  'Deutsche Bank Frankfurt': { swift: 'DEUTDEFF', negara: 'Jerman' },
};

export function daftarBankDidukung() {
  return {
    bankLokal: Object.entries(DATA_BANK_NASIONAL).map(([nama, info]) => ({
      nama,
      swift: info.swift,
      atasNama: info.atasNama,
    })),
    bankKoresponden: Object.entries(BANK_KORESPONDEN_EKSPOR).map(([nama, info]) => ({
      nama,
      swift: info.swift,
      negara: info.negara,
    })),
  };
}

export function hitungNominalTahap(totalTagihanIdr, tahapPembayaran, sudahDibayarIdr = 0) {
  const sisa = Math.max(0, Number(totalTagihanIdr) - Number(sudahDibayarIdr));
  if (sisa <= 0) {
    throw new AppError('Seluruh tagihan pesanan ini sudah lunas.', 400);
  }

  let nominalIdr;
  if (tahapPembayaran === 'DP_30') {
    nominalIdr = Math.round(Number(totalTagihanIdr) * 0.3);
  } else if (tahapPembayaran === 'DP_50') {
    nominalIdr = Math.round(Number(totalTagihanIdr) * 0.5);
  } else {
    nominalIdr = Math.round(sisa);
  }

  if (nominalIdr > sisa) {
    nominalIdr = Math.round(sisa);
  }

  const nominalUsd = Number((nominalIdr / env.kursUsd).toFixed(2));
  return { nominalIdr, nominalUsd };
}

/**
 * Antarmuka simulasi bank. Struktur respons disiapkan agar mudah diganti
 * dengan adaptor Midtrans, Xendit (lokal) maupun Swift API koresponden (ekspor).
 */
export async function buatInstruksiPembayaran({
  orderId,
  nomorInvoice,
  tahapPembayaran,
  metodePembayaran,
  namaBank,
  bankKoresponden,
  swiftKoresponden,
  nominalIdr,
  nominalUsd,
}) {
  const infoBank = DATA_BANK_NASIONAL[namaBank];
  if (!infoBank) {
    throw new AppError('Bank tujuan tidak terdaftar dalam jaringan Agro Maritim.', 400);
  }

  const acak = crypto.randomBytes(3).toString('hex').toUpperCase();
  const kodeTransaksiBank = `PAY-${orderId}-${Date.now().toString().slice(-6)}-${acak}`;
  const nomorVa = `${infoBank.prefixVa}${String(orderId).padStart(6, '0')}${Math.floor(100 + Math.random() * 900)}`;

  const batasWaktu = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const labelBank =
    metodePembayaran === 'T_T' || metodePembayaran === 'L_C'
      ? `${namaBank} (${infoBank.swift})${bankKoresponden ? ` via ${bankKoresponden}` : ''}${swiftKoresponden ? ` [${swiftKoresponden}]` : ''}`
      : `${namaBank} (${metodePembayaran === 'Virtual_Account' ? 'VA' : 'RTGS'})`;

  const instruksi = {
    kode_transaksi_bank: kodeTransaksiBank,
    nomor_invoice: nomorInvoice,
    tahap_pembayaran: tahapPembayaran,
    metode_pembayaran: metodePembayaran,
    nama_bank: namaBank,
    atas_nama: infoBank.atasNama,
    nomor_tujuan: metodePembayaran === 'Virtual_Account' ? nomorVa : infoBank.rekeningEscrow,
    swift_bank_indonesia: infoBank.swift,
    bank_koresponden: bankKoresponden || null,
    swift_koresponden: swiftKoresponden || null,
    nominal_idr: nominalIdr,
    nominal_usd: nominalUsd,
    batas_waktu_bayar: batasWaktu,
    bank_pengirim_tujuan: labelBank,
  };

  return instruksi;
}

export function verifikasiTandaTanganWebhook(rawBody, signatureHeader) {
  if (!signatureHeader) {
    return false;
  }
  const expected = crypto
    .createHmac('sha256', env.paymentWebhookSecret)
    .update(rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(String(signatureHeader), 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(sigBuf, expBuf);
}
