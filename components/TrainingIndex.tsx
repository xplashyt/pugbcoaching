"use client";

import { FieldGlyph } from "@/components/FieldGlyph";
import { formatCOP, type Plan } from "@/lib/plans";

export function TrainingIndex({ plans, onSelect }: { plans: Plan[]; onSelect: (plan: Plan) => void }) {
  return (
    <section id="entrenamientos" className="py-24 lg:py-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-9 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-beacon">Índice de entrenamiento</p><h2 className="mt-5 font-display text-[clamp(3rem,5.5vw,6rem)] font-semibold leading-[.92] tracking-[-.06em]">Elige el momento que quieres corregir.</h2></div>
          <p className="max-w-xl text-lg leading-8 text-ink/65 lg:justify-self-end">No son rangos ni membresías. Cada opción indica duración, prácticas, plataforma y entregable para que puedas comparar sin supuestas promociones.</p>
        </div>

        <div className="mt-20">
          {plans.map((plan, index) => (
            <article key={plan.id} className={`group relative border-b border-forest/25 py-8 ${index === 0 ? "border-t" : ""}`}>
              <div className="grid gap-5 md:grid-cols-[48px_minmax(0,1fr)_auto] md:items-center">
                <span className="font-display text-lg text-forest/45">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3"><h3 className="font-display text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{plan.name}</h3>{plan.popular && <span className="rounded-full bg-beacon px-3 py-1 text-[10px] font-bold uppercase tracking-[.13em] text-white">recorrido completo</span>}</div>
                  <p className="mt-2 max-w-3xl leading-7 text-ink/62">{plan.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-forest"><span>{plan.duration}</span><span>{plan.drills} prácticas</span><span>{plan.platform}</span></div>
                </div>
                <div className="flex items-center justify-between gap-5 md:justify-end">
                  <strong className="min-w-[132px] font-body text-2xl font-semibold tabular-nums text-forest">{formatCOP(plan.priceCOP)}</strong>
                  <button type="button" onClick={() => onSelect(plan)} className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white transition-transform hover:rotate-[-12deg]" aria-label={`Elegir ${plan.name}`}><FieldGlyph name="canopy" /></button>
                </div>
              </div>
              <details className="ml-0 mt-5 md:ml-[68px]"><summary className="w-fit cursor-pointer text-xs font-bold uppercase tracking-[.16em] text-beacon">Abrir contenido</summary><div className="mt-6 grid gap-8 rounded-[28px] bg-mist p-6 sm:grid-cols-[1fr_auto] sm:p-8"><ul className="grid gap-3 sm:grid-cols-2">{plan.includes.map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-beacon" />{item}</li>)}</ul><dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:min-w-[260px]"><div><dt className="text-xs uppercase tracking-[.12em] text-ink/45">Perspectiva</dt><dd className="mt-1 font-semibold">{plan.perspective}</dd></div><div><dt className="text-xs uppercase tracking-[.12em] text-ink/45">Bloques</dt><dd className="mt-1 font-semibold">{plan.modules}</dd></div><div className="col-span-2"><dt className="text-xs uppercase tracking-[.12em] text-ink/45">Entregable</dt><dd className="mt-1 font-semibold">{plan.deliverable}</dd></div></dl></div></details>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink/55">Valores en pesos colombianos. Cada entrenamiento corresponde a un pago único; el recorrido de $69.900 se identifica por su alcance, no por cifras de venta.</p>
      </div>
    </section>
  );
}
