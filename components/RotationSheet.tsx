import { rotationCues } from "@/lib/rotation";
import { FieldGlyph } from "@/components/FieldGlyph";

export function RotationSheet() {
  return (
    <section id="hoja" className="bg-sky py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-9 lg:grid-cols-[.52fr_1.48fr] lg:px-14">
        <div className="lg:sticky lg:top-10 lg:self-start"><FieldGlyph name="terrain" className="h-12 w-12 text-forest" /><p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-forest">Hoja de bolsillo</p><h2 className="mt-4 font-display text-5xl font-semibold leading-[.96] tracking-[-.055em] sm:text-6xl">Antes de mover, deja una salida.</h2><p className="mt-6 max-w-md leading-7 text-ink/65">Seis señales para revisar una rotación. No reemplazan el mapa ni el parche actual: sirven para que tu decisión tenga información, margen y plan alterno.</p><button type="button" onClick={() => window.print()} className="mt-8 rounded-full border border-forest px-6 py-3 text-sm font-bold text-forest">Imprimir hoja</button></div>
        <div className="min-w-0 overflow-x-auto rounded-[34px] bg-chalk p-3 shadow-[0_18px_0_rgba(52,74,56,.12)] sm:p-7">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead><tr className="text-[11px] uppercase tracking-[.14em] text-forest/60"><th className="px-4 py-5">Señal</th><th className="px-4 py-5">Pregunta</th><th className="px-4 py-5">Anota</th><th className="px-4 py-5">Decisión</th></tr></thead>
            <tbody>{rotationCues.map((cue) => <tr key={cue.signal} className="border-t border-dashed border-forest/25 align-top"><th className="px-4 py-6 font-display text-xl font-semibold text-beacon">{cue.signal}</th><td className="px-4 py-6 font-semibold">{cue.ask}</td><td className="px-4 py-6 text-sm leading-6 text-ink/58">{cue.record}</td><td className="px-4 py-6 text-sm leading-6 text-ink/72">{cue.decision}</td></tr>)}</tbody>
          </table>
          <div className="mt-5 grid min-w-[760px] grid-cols-[130px_1fr_1fr] gap-px overflow-hidden rounded-[22px] bg-forest/20 text-sm"><div className="bg-white/55 p-5 font-bold text-beacon">Tu rotación</div><div className="bg-white/55 p-5 text-ink/40">Evidencia: ____________________</div><div className="bg-white/55 p-5 text-ink/40">Plan B: ____________________</div></div>
        </div>
      </div>
    </section>
  );
}
