import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KUNCI_TEMA = 'agromaritim_tema';
const TemaContext = createContext(null);

function deteksiTemaAwal() {
  try {
    const tersimpan = localStorage.getItem(KUNCI_TEMA);
    if (tersimpan === 'gelap') return true;
    if (tersimpan === 'terang') return false;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch {
    return false;
  }
  return false;
}

export function TemaProvider({ children }) {
  const [gelap, setGelap] = useState(deteksiTemaAwal);

  useEffect(() => {
    const root = document.documentElement;
    if (gelap) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem(KUNCI_TEMA, 'gelap');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem(KUNCI_TEMA, 'terang');
    }
  }, [gelap]);

  const gantiTema = useCallback(() => {
    setGelap((g) => !g);
  }, []);

  const aturTema = useCallback((mode) => {
    setGelap(mode === 'gelap');
  }, []);

  return (
    <TemaContext.Provider
      value={{
        gelap,
        tema: gelap ? 'gelap' : 'terang',
        gantiTema,
        aturTema,
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema harus dipakai di dalam TemaProvider.');
  return ctx;
}
