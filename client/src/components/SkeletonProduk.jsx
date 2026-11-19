export function SkeletonKartuProduk() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] overflow-hidden"
    >
      <div className="aspect-[4/3] w-full bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />

      <div className="p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-16 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
            <div className="h-3.5 w-14 rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
          </div>
          <div className="h-3.5 w-12 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
        </div>

        <div className="h-5 w-4/5 rounded-md bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />

        <div className="pt-1 flex items-baseline justify-between gap-2">
          <div className="space-y-1.5">
            <div className="h-5 w-28 rounded-md bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
          </div>
          <div className="h-3.5 w-16 rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
        </div>

        <div className="pt-2 border-t border-[var(--warna-garis)]/70">
          <div className="h-3.5 w-3/5 rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonKisiProduk({
  jumlah = 6,
  kolomKelas = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6',
  label = 'Memuat daftar komoditas...',
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className={kolomKelas}>
        {Array.from({ length: jumlah }, (_, idx) => (
          <SkeletonKartuProduk key={idx} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonBeranda({ label = 'Memuat ringkasan dan komoditas beranda...' }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-8">
      <span className="sr-only">{label}</span>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-6 w-52 rounded-lg bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
          <div className="h-9 w-44 rounded-xl bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              aria-hidden="true"
              className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-6 space-y-3"
            >
              <div className="h-3.5 w-36 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 rounded-lg bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
          <div className="h-4 w-36 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => (
            <SkeletonKartuProduk key={idx} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-64 rounded-lg bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              aria-hidden="true"
              className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] overflow-hidden"
            >
              <div className="aspect-[16/10] w-full bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-20 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
                <div className="h-3 w-full rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SkeletonDaftarBaris({ jumlah = 4, label = 'Memuat daftar data...' }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: jumlah }, (_, idx) => (
        <div
          key={idx}
          aria-hidden="true"
          className="rounded-2xl border border-[var(--warna-garis)] bg-[var(--warna-permukaan)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-48 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
            <div className="h-5 w-36 rounded bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
            <div className="h-3.5 w-64 max-w-full rounded bg-[var(--warna-permukaan-sekunder)]/80 motion-safe:animate-pulse" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-24 rounded-xl bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-[var(--warna-permukaan-sekunder)] motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
