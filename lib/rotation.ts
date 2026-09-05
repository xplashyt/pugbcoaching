export interface RotationCue {
  signal: string;
  ask: string;
  record: string;
  decision: string;
}

export const rotationCues: RotationCue[] = [
  { signal: "Zona", ask: "¿Qué borde tiene menos distancia?", record: "Lado corto / lado largo", decision: "Elegir por dónde entrar, no solo el destino" },
  { signal: "Tiempo", ask: "¿Cuánto tarda tu ruta real?", record: "Salida / llegada / margen", decision: "Salir con margen para una parada imprevista" },
  { signal: "Terreno", ask: "¿Dónde termina el vehículo?", record: "Altura / cobertura / salida", decision: "Llegar a terreno defendible, no al centro exacto" },
  { signal: "Información", ask: "¿Qué oíste o viste en el trayecto?", record: "Disparos / vehículos / bajas", decision: "Actualizar la ruta antes de cruzar abierto" },
  { signal: "Equipo", ask: "¿Quién cubre y quién se mueve?", record: "Primero / segundo / último", decision: "Cruzar por turnos y conservar intercambio" },
  { signal: "Salida", ask: "¿Qué haces si el lugar está ocupado?", record: "Plan B / humo / regreso", decision: "Decidir la alternativa antes de acercarte" },
];
