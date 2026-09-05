export interface Plan {
  id: string;
  name: string;
  priceCOP: number;
  modules: number;
  summary: string;
  includes: string[];
  popular?: boolean;
  duration: string;
  drills: number;
  platform: string;
  perspective: string;
  deliverable: string;
}

export const plans: Plan[] = [
  {
    id: "cts-punto-caida",
    name: "Punto de caída",
    priceCOP: 4000,
    modules: 1,
    summary: "Ordena salto, aterrizaje y primera cobertura sin memorizar una ruta fija de mapa.",
    includes: ["Lectura de ruta de vuelo", "Elección de zona de aterrizaje", "Prioridad de cobertura al tocar suelo", "Tres repeticiones de salto"],
    duration: "25 min",
    drills: 3,
    platform: "PC o consola",
    perspective: "FPP / TPP",
    deliverable: "Lista de aterrizaje",
  },
  {
    id: "cts-saqueo-salida",
    name: "Saqueo con salida",
    priceCOP: 10000,
    modules: 2,
    summary: "Define qué recoger, cuándo dejar de buscar y por dónde abandonar el compound.",
    includes: ["Inventario por función y distancia", "Prioridad entre curativos, munición y utilidad", "Criterio para cerrar el saqueo", "Cinco prácticas con salida definida"],
    duration: "50 min",
    drills: 5,
    platform: "PC o consola",
    perspective: "FPP / TPP",
    deliverable: "Hoja de prioridades",
  },
  {
    id: "cts-retroceso-metodo",
    name: "Retroceso con método",
    priceCOP: 25000,
    modules: 3,
    summary: "Separa colocación de mira, ráfaga y control vertical antes de cambiar cada ajuste.",
    includes: ["Diagnóstico de colocación inicial", "Rutina para retroceso vertical", "Práctica de ráfaga por distancia", "Ajuste distinto para mando o ratón", "Ocho repeticiones medibles"],
    duration: "1 h 20",
    drills: 8,
    platform: "PC, PS5 o Xbox Series",
    perspective: "FPP / TPP",
    deliverable: "Rutina de campo",
  },
  {
    id: "cts-partida-completa",
    name: "Partida de principio a fin",
    priceCOP: 69900,
    modules: 6,
    summary: "Recorre aterrizaje, inventario, control, rotación, contacto y cierre como un solo sistema.",
    includes: ["Diagnóstico inicial", "Aterrizaje y saqueo con salida", "Control y colocación de mira", "Terreno, cobertura y rotación", "Arrojadizas, curación y reposición", "Hoja para revisar una partida completa"],
    popular: true,
    duration: "4 h 15",
    drills: 16,
    platform: "PC o consola actual",
    perspective: "FPP / TPP",
    deliverable: "Atlas de práctica",
  },
  {
    id: "cts-revision-dos-partidas",
    name: "Revisión de dos partidas",
    priceCOP: 100000,
    modules: 4,
    summary: "Localizamos la primera decisión que te dejó sin salida y la convertimos en práctica.",
    includes: ["Revisión de hasta dos VOD propios", "Línea de tiempo de decisiones", "Sesión individual de devolución", "Tres prioridades para siete días", "Resumen coordinado por correo"],
    duration: "90 min en vivo",
    drills: 7,
    platform: "PC o consola",
    perspective: "Según tu partida",
    deliverable: "Mapa de decisiones",
  },
  {
    id: "cts-escuadron-informacion",
    name: "Escuadrón con información",
    priceCOP: 150000,
    modules: 5,
    summary: "Ordena llamadas, movimiento por turnos, reanimaciones y uso de humo para hasta cuatro personas.",
    includes: ["Vocabulario breve de llamadas", "Reparto de información y funciones", "Cruces y cobertura por turnos", "Reanimación y recuperación del equipo", "Revisión de una partida del escuadrón"],
    duration: "2 h en vivo",
    drills: 10,
    platform: "Un mismo ecosistema",
    perspective: "FPP o TPP",
    deliverable: "Guion de escuadrón",
  },
  {
    id: "cts-ciclo-cuatro-semanas",
    name: "Ciclo de cuatro semanas",
    priceCOP: 494000,
    modules: 8,
    summary: "Seguimiento semanal para observar, practicar y ajustar sin prometer rango ni estadísticas.",
    includes: ["Diagnóstico de partida completa", "Seis sesiones individuales", "Revisión semanal de VOD", "Bloques de práctica entre sesiones", "Ajustes por plataforma y perspectiva", "Cierre con método para continuar solo"],
    duration: "4 semanas",
    drills: 24,
    platform: "PC o consola",
    perspective: "FPP / TPP",
    deliverable: "Cuaderno de seguimiento",
  },
];

export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function getPlan(planId: string) {
  return plans.find((plan) => plan.id === planId);
}
