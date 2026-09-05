"use client";

import { useState } from "react";
import { CheckoutPouch } from "@/components/CheckoutPouch";
import { DeliveryPath } from "@/components/DeliveryPath";
import { FAQ } from "@/components/FAQ";
import { FlightFacts } from "@/components/FlightFacts";
import { FlightSeam } from "@/components/FlightSeam";
import { Footer } from "@/components/Footer";
import { MatchSequence } from "@/components/MatchSequence";
import { ParachuteAtlas } from "@/components/ParachuteAtlas";
import { RotationSheet } from "@/components/RotationSheet";
import { TrainingIndex } from "@/components/TrainingIndex";
import { plans, type Plan } from "@/lib/plans";

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <main className="min-h-screen overflow-hidden bg-chalk text-ink">
      <header className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-6 sm:px-9 lg:px-14">
        <a href="#inicio" className="font-display text-xl font-extrabold tracking-[-.04em]">cota segura<span className="text-beacon">.</span></a>
        <nav className="flex items-center gap-4 text-xs font-semibold sm:gap-9" aria-label="Navegación principal">
          <a href="#partida" className="hover:text-beacon">Partida</a>
          <a href="#entrenamientos" className="hover:text-beacon">Entrenamientos</a>
          <a href="#hoja" className="hidden hover:text-beacon sm:inline">Hoja de rotación</a>
        </nav>
      </header>

      <section id="inicio" className="contours mx-auto grid min-h-[790px] max-w-[1500px] items-center gap-8 px-5 pb-16 pt-10 sm:px-9 lg:grid-cols-[.82fr_1.18fr] lg:px-14">
        <div className="relative z-10 max-w-[610px]">
          <p className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-forest"><span className="h-px w-12 bg-forest" />Coaching independiente · PUBG: BATTLEGROUNDS</p>
          <h1 className="font-display text-[clamp(3.6rem,7.5vw,8.2rem)] font-semibold leading-[.85] tracking-[-.075em]">Sobrevivir empieza antes del primer disparo.</h1>
          <p className="mt-9 max-w-[540px] text-lg leading-8 text-ink/70">Revisamos aterrizaje, saqueo, control, rotación y cierre. Tú juegas siempre desde tu cuenta; nosotros convertimos una partida en decisiones que puedes practicar.</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a href="#partida" className="rounded-full bg-forest px-7 py-4 text-sm font-bold text-white transition-transform active:scale-[.98]">Leer una partida</a>
            <a href="#entrenamientos" className="border-b border-ink pb-1 text-sm font-semibold">Ver entrenamientos ↓</a>
          </div>
          <p className="mt-10 text-xs leading-5 text-ink/45">Para PC, PlayStation 5 y Xbox Series X|S · FPP o TPP · No incluye PUBG MOBILE.</p>
        </div>
        <ParachuteAtlas />
      </section>

      <FlightFacts />
      <MatchSequence />
      <FlightSeam />
      <TrainingIndex plans={plans} onSelect={setSelectedPlan} />
      <RotationSheet />
      <DeliveryPath />
      <FAQ />
      <Footer />
      <CheckoutPouch plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </main>
  );
}
