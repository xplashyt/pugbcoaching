import { FieldGlyph } from "@/components/FieldGlyph";

const facts = [
  { icon: "canopy" as const, label: "Una compra", value: "Pago único" },
  { icon: "card" as const, label: "En el sitio", value: "Tarjeta con Wompi" },
  { icon: "mail" as const, label: "Después", value: "Contacto por correo" },
];

export function FlightFacts() {
  return (
    <section aria-label="Datos de compra" className="bg-forest text-white">
      <div className="mx-auto grid max-w-[1500px] gap-px bg-white/20 sm:grid-cols-3">
        {facts.map((fact) => <div key={fact.value} className="flex items-center gap-4 bg-forest px-6 py-6 sm:px-9 lg:px-14"><FieldGlyph name={fact.icon} className="h-7 w-7 text-ochre" /><div><span className="block text-[11px] uppercase tracking-[.16em] text-white/55">{fact.label}</span><strong className="font-display text-base">{fact.value}</strong></div></div>)}
      </div>
    </section>
  );
}
