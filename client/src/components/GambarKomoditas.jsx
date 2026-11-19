import { useState } from 'react';
import { Sprout } from 'lucide-react';

export default function GambarKomoditas({ src, alt, className = '', sektor = 'Pertanian' }) {
  const [gagal, setGagal] = useState(false);

  if (!src || gagal) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#14452F]/10 dark:bg-[#14452F]/30 text-[#14452F] dark:text-emerald-300 ${className}`}
        role="img"
        aria-label={alt || 'Gambar komoditas'}
      >
        <Sprout className="w-8 h-8 mb-2 opacity-75" />
        <span className="text-xs font-medium px-3 text-center line-clamp-2">{alt || sektor}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setGagal(true)}
      className={className}
    />
  );
}
