import { adalahTokenSimulasi, tanganiSimulasiApi } from '../utils/simulasiSandbox.js';

const KUNCI_TOKEN = 'agromaritim_token';

// Data simulasi hanya aktif saat `npm run dev` tanpa backend.
// Build production selalu memakai API asli; paksa lewat VITE_PAKAI_SIMULASI=true/false.
const PAKAI_SIMULASI =
  (import.meta.env.VITE_PAKAI_SIMULASI ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true';

export function ambilToken() {
  return localStorage.getItem(KUNCI_TOKEN) || '';
}

export function simpanToken(token) {
  if (token) {
    localStorage.setItem(KUNCI_TOKEN, token);
  } else {
    localStorage.removeItem(KUNCI_TOKEN);
  }
}

export async function panggilApi(jalur, opsi = {}) {
  const token = ambilToken();
  const adalahFormData = opsi.body instanceof FormData;

  // Mode simulasi: langsung ke data simulasi, backend dilewati
  if (PAKAI_SIMULASI || adalahTokenSimulasi(token)) {
    return tanganiSimulasiApi(jalur, opsi, token);
  }

  const headers = {
    ...(adalahFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opsi.headers || {}),
  };

  let respons;
  try {
    respons = await fetch(`/api${jalur}`, {
      method: opsi.method || 'GET',
      headers,
      signal: opsi.signal,
      body: adalahFormData
        ? opsi.body
        : opsi.body !== undefined
          ? JSON.stringify(opsi.body)
          : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }

  if (opsi.responBlob) {
    if (!respons.ok) {
      let pesan = 'Gagal mengunduh berkas.';
      try {
        const jsonErr = await respons.json();
        pesan = jsonErr.pesan || pesan;
      } catch {
        // Biarkan pesan baku jika respons bukan JSON
      }
      const err = new Error(pesan);
      err.status = respons.status;
      throw err;
    }
    return respons.blob();
  }

  let data = {};
  try {
    data = await respons.json();
  } catch {
    data = {};
  }

  if (!respons.ok) {
    const err = new Error(data.pesan || 'Permintaan ke server gagal diproses.');
    err.status = respons.status;
    err.detail = data.detail || null;
    throw err;
  }

  return data;
}
