import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ambilToken, panggilApi, simpanToken } from '../api/klienApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [pengguna, setPengguna] = useState(null);
  const [memuatSesi, setMemuatSesi] = useState(true);

  const muatUlangSesi = useCallback(async () => {
    const token = ambilToken();
    if (!token) {
      setPengguna(null);
      setMemuatSesi(false);
      return;
    }
    try {
      const data = await panggilApi('/auth/saya');
      setPengguna(data.pengguna);
    } catch {
      simpanToken('');
      setPengguna(null);
    } finally {
      setMemuatSesi(false);
    }
  }, []);

  useEffect(() => {
    muatUlangSesi();
  }, [muatUlangSesi]);

  const masuk = async (identitas, password) => {
    const data = await panggilApi('/auth/masuk', {
      method: 'POST',
      body: { identitas, password },
    });
    simpanToken(data.token);
    setPengguna(data.pengguna);
    return data.pengguna;
  };

  const daftar = async (payload) => {
    const data = await panggilApi('/auth/daftar', {
      method: 'POST',
      body: payload,
    });
    simpanToken(data.token);
    setPengguna(data.pengguna);
    return data.pengguna;
  };

  const keluar = async () => {
    try {
      if (ambilToken()) {
        await panggilApi('/auth/keluar', { method: 'POST' });
      }
    } catch {
      // Tetap lanjutkan pembersihan sesi lokal meski server tidak terjangkau
    } finally {
      simpanToken('');
      setPengguna(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        pengguna,
        memuatSesi,
        masuk,
        daftar,
        keluar,
        muatUlangSesi,
        setPengguna,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider.');
  return ctx;
}
