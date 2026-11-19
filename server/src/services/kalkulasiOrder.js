const TARIF_LOGISTIK_INCOTERMS = {
  Lokal_Franco: 0.04,
  EXW: 0.02,
  FOB: 0.06,
  CIF: 0.11,
  DDP: 0.16,
};

const TARIF_PAJAK_BEA = {
  Lokal: 0.11,
  Ekspor: 0.035,
};

export function hitungRincianTagihan({ items, tipePasar, incoterms }) {
  const subtotalProdukIdr = items.reduce(
    (total, item) => total + Number(item.harga_idr) * Number(item.kuantitas),
    0
  );

  const rasioLogistik = TARIF_LOGISTIK_INCOTERMS[incoterms] ?? 0.05;
  const biayaLogistikEksporIdr = Math.round(subtotalProdukIdr * rasioLogistik);

  const rasioPajak = TARIF_PAJAK_BEA[tipePasar] ?? 0.11;
  const pajakBeaIdr = Math.round(subtotalProdukIdr * rasioPajak);

  const totalTagihanIdr = Math.round(subtotalProdukIdr + biayaLogistikEksporIdr + pajakBeaIdr);

  return {
    subtotal_produk_idr: Math.round(subtotalProdukIdr),
    biaya_logistik_ekspor_idr: biayaLogistikEksporIdr,
    pajak_bea_idr: pajakBeaIdr,
    total_tagihan_idr: totalTagihanIdr,
  };
}
