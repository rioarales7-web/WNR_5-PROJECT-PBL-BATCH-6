import { createContext, useContext, useEffect, useState } from 'react';

const KUNCI_KERANJANG = 'agromaritim_keranjang';
const KeranjangContext = createContext(null);

export function KeranjangProvider({ children }) {
  const [itemKeranjang, setItemKeranjang] = useState(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_KERANJANG);
      return tersimpan ? JSON.parse(tersimpan) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(itemKeranjang));
  }, [itemKeranjang]);

  const tambahItem = (produk, kuantitas) => {
    const qty = Number(kuantitas);
    if (!qty || qty <= 0) return;

    setItemKeranjang((sebelum) => {
      const ada = sebelum.find((it) => it.produk_id === produk.produk_id);
      if (ada) {
        return sebelum.map((it) =>
          it.produk_id === produk.produk_id
            ? {
                ...it,
                kuantitas: Math.min(Number(produk.stok_tersedia), it.kuantitas + qty),
              }
            : it
        );
      }
      return [
        ...sebelum,
        {
          produk_id: produk.produk_id,
          nama_komoditas: produk.nama_komoditas,
          satuan: produk.satuan,
          harga_idr: Number(produk.harga_idr),
          harga_usd: Number(produk.harga_usd),
          stok_tersedia: Number(produk.stok_tersedia),
          url_gambar: produk.url_gambar,
          kota_produsen: produk.kota_produsen,
          kuantitas: Math.min(Number(produk.stok_tersedia), qty),
        },
      ];
    });
  };

  const ubahKuantitas = (produkId, kuantitas) => {
    const qty = Number(kuantitas);
    if (!Number.isFinite(qty) || qty <= 0) {
      hapusItem(produkId);
      return;
    }
    setItemKeranjang((sebelum) =>
      sebelum.map((it) =>
        it.produk_id === produkId
          ? { ...it, kuantitas: Math.min(Number(it.stok_tersedia), qty) }
          : it
      )
    );
  };

  const hapusItem = (produkId) => {
    setItemKeranjang((sebelum) => sebelum.filter((it) => it.produk_id !== produkId));
  };

  const kosongkanKeranjang = () => {
    setItemKeranjang([]);
  };

  return (
    <KeranjangContext.Provider
      value={{
        itemKeranjang,
        jumlahItem: itemKeranjang.length,
        tambahItem,
        ubahKuantitas,
        hapusItem,
        kosongkanKeranjang,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const ctx = useContext(KeranjangContext);
  if (!ctx) throw new Error('useKeranjang harus dipakai di dalam KeranjangProvider.');
  return ctx;
}
