import { useEffect, useState } from 'react';

export function useDebounce(nilai, jedaMs = 350) {
  const [nilaiTertunda, setNilaiTertunda] = useState(nilai);

  useEffect(() => {
    const pengaturWaktu = setTimeout(() => {
      setNilaiTertunda(nilai);
    }, jedaMs);

    return () => clearTimeout(pengaturWaktu);
  }, [nilai, jedaMs]);

  return nilaiTertunda;
}
