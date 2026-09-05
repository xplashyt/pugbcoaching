export function ParachuteAtlas() {
  const heights = [128, 166, 194, 208, 194, 166, 128];
  return (
    <figure className="relative mx-auto h-[430px] w-full max-w-[650px]" aria-label="Diagrama original de un paracaídas abierto sobre un punto de caída">
      <div className="absolute inset-x-0 top-4 flex items-end justify-center gap-1.5">
        {heights.map((height, index) => (
          <span key={`${height}-${index}`} className={`canopy-cell block w-[12%] border-2 border-ink ${index === 3 ? "bg-beacon" : index % 2 ? "bg-sky" : "bg-chalk"}`} style={{ height, borderRadius: `${index < 3 ? 80 - index * 12 : index > 3 ? 32 + index * 12 : 28}px ${index < 3 ? 24 + index * 10 : index > 3 ? 104 - index * 10 : 28}px 8px 8px` }} />
        ))}
      </div>
      {[10, 23, 36, 50, 64, 77, 90].map((left, index) => (
        <span key={left} className="absolute top-[214px] h-[166px] w-px origin-top bg-forest/55" style={{ left: `${left}%`, transform: `rotate(${(index - 3) * -11}deg)` }} />
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <span className="mx-auto block h-4 w-4 rounded-full bg-beacon ring-[12px] ring-beacon/15" />
        <figcaption className="mt-7 font-body text-xs font-semibold uppercase tracking-[.22em] text-forest">punto de caída · decisión inicial</figcaption>
      </div>
    </figure>
  );
}
