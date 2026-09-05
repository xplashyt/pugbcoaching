import { FieldGlyph } from "@/components/FieldGlyph";
import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";

export function Footer() {
  return (
    <footer className="bg-ink py-14 text-white">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-9 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><div className="flex items-center gap-3"><FieldGlyph name="canopy" className="h-8 w-8 text-ochre" /><strong className="font-display text-2xl">cota segura.</strong></div><a href={`mailto:${CORREO_CONTACTO}`} className="mt-6 inline-block border-b border-ochre pb-1 text-ochre">{CORREO_CONTACTO}</a><p className="mt-2 text-sm text-white/50">Contacto en máximo {HORAS_DE_ENTREGA} horas hábiles.</p></div><div className="space-y-5 text-sm leading-7 text-white/52"><p>Se vende contenido educativo en video y acompañamiento; no equipos, cuentas, monedas, licencias, rangos ni resultados garantizados. Los pagos los procesa Wompi. Las compras de menores requieren autorización de padre, madre o tutor.</p><p>Servicio independiente de entrenamiento. No está afiliado, patrocinado ni aprobado por KRAFTON, Inc. PUBG y PUBG: BATTLEGROUNDS son marcas registradas o marcas de servicio de KRAFTON, Inc. No usamos logos, mapas, capturas, personajes, armas ni interfaz oficial.</p></div></div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/12 pt-7 text-[11px] uppercase tracking-[.14em] text-white/35 sm:flex-row sm:justify-between"><span>© 2026 Cota Segura · CTS</span><span>PC · PS5 · Xbox Series X|S · No PUBG Mobile</span></div>
      </div>
    </footer>
  );
}
