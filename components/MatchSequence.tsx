import { FieldGlyph } from "@/components/FieldGlyph";

const moments = [
  { stage: "salto", title: "El lugar no es el plan.", text: "La ruta de vuelo, la presencia de otros jugadores y la primera cobertura cambian el aterrizaje. Practicamos una prioridad, no una coordenada memorizada.", icon: "plane" as const },
  { stage: "saqueo", title: "Recoger también consume tiempo.", text: "Un inventario sirve cuando responde a distancia, función y salida. Aprendes a dejar de buscar para llegar con margen a la siguiente decisión.", icon: "canopy" as const },
  { stage: "rotación", title: "La zona marca un límite, no una ruta.", text: "Leemos terreno, información, vehículo y plan alterno. El objetivo es llegar a una posición defendible sin regalar un cruce abierto.", icon: "terrain" as const },
  { stage: "contacto", title: "La pelea empieza con información.", text: "Sonido, cobertura, colocación de mira y utilidad explican más que la última bala. Separamos la causa para practicarla con intención.", icon: "smoke" as const },
  { stage: "cierre", title: "Conserva una salida.", text: "En las últimas zonas, cada humo, cambio de cobertura y reanimación compite por tiempo. Revisamos qué opción desapareció primero.", icon: "shield" as const },
];

export function MatchSequence() {
  return (
    <section id="partida" className="relative overflow-hidden bg-forest py-24 text-white lg:py-36">
      <div className="contour-ink pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-9 lg:px-14">
        <div className="mb-20 grid gap-7 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-ochre">Una partida, cinco decisiones</p>
          <h2 className="font-display text-[clamp(2.8rem,6vw,6.4rem)] font-semibold leading-[.94] tracking-[-.055em]">La eliminación solo muestra dónde terminó la historia.</h2>
        </div>
        <ol className="match-thread">
          {moments.map((moment, index) => (
            <li key={moment.stage} className={`relative grid gap-5 py-12 sm:grid-cols-[130px_1fr] lg:w-[72%] lg:grid-cols-[150px_1fr] ${index % 2 ? "lg:ml-auto" : ""}`}>
              <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-chalk text-forest"><FieldGlyph name={moment.icon} /></span><span className="pt-3 text-xs font-bold uppercase tracking-[.18em] text-ochre">{moment.stage}</span></div>
              <div><h3 className="font-display text-3xl font-semibold tracking-[-.04em] sm:text-5xl">{moment.title}</h3><p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">{moment.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
