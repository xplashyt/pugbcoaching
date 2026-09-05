import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";

const questions = [
  ["¿Sirve para PUBG MOBILE?", "No. Esta oferta está diseñada para PUBG: BATTLEGROUNDS en PC, PlayStation 5 y Xbox Series X|S. PUBG MOBILE requiere una línea de coaching distinta."],
  ["¿Garantizan rango, bajas o índice B/M?", "No. Entregamos análisis, ejercicios y seguimiento. No prometemos rango, estadísticas, victorias ni una fecha de ascenso."],
  ["¿Necesitan entrar a mi cuenta?", "Nunca. Tú controlas tu propia cuenta y tus partidas. No pedimos usuario, contraseña, códigos ni acceso remoto."],
  ["¿Puedo trabajar FPP o TPP?", "Sí. Ajustamos lectura de información, exposición y práctica a la perspectiva de la partida y a tu plataforma."],
  ["¿Qué envío para una revisión?", "Una grabación propia donde se vea la partida completa o el tramo acordado. Coordina primero el formato y evita compartir credenciales o datos innecesarios."],
  ["Pagué y todavía no me contactan, ¿qué hago?", `La coordinación es manual y puede tomar hasta ${HORAS_DE_ENTREGA} horas hábiles. Escribe a ${CORREO_CONTACTO} con tu referencia o comprobante.`],
  ["¿Qué pasa si Wompi rechaza el pago?", "Verás el mensaje exacto de la pasarela y cualquier detalle adicional. Podrás corregir los datos o intentar una sola vez con otra tarjeta."],
];

export function FAQ() {
  return (
    <section id="preguntas" className="pb-24 lg:pb-36">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-9 lg:grid-cols-[.58fr_1.42fr] lg:px-14"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-beacon">Antes de caer</p><h2 className="mt-4 font-display text-5xl font-semibold leading-none tracking-[-.055em]">Preguntas sin letra pequeña.</h2></div><div>{questions.map(([question, answer]) => <details key={question} className="border-b border-forest/25 py-6 first:border-t"><summary className="cursor-pointer list-none pr-10 font-display text-xl font-semibold marker:hidden">{question}<span className="float-right text-beacon">＋</span></summary><p className="mt-4 max-w-2xl leading-7 text-ink/62">{answer}</p></details>)}</div></div>
    </section>
  );
}
