function escapeSelCsv(nilai) {
  let teks = nilai === null || nilai === undefined ? '' : String(nilai);
  if (/^[=+\-@]/.test(teks)) {
    teks = `'${teks}`;
  }
  if (/[",\r\n]/.test(teks)) {
    return `"${teks.replace(/"/g, '""')}"`;
  }
  return teks;
}

export function unduhCsvLokal(namaFile, header, baris) {
  const barisCsv = [
    header.map(escapeSelCsv).join(','),
    ...baris.map((kolom) => kolom.map(escapeSelCsv).join(',')),
  ];
  const isi = `\uFEFF${barisCsv.join('\r\n')}`;
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement('a');
  tautan.href = url;
  tautan.download = namaFile.endsWith('.csv') ? namaFile : `${namaFile}.csv`;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();
  URL.revokeObjectURL(url);
}
