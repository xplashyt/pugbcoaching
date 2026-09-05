type GlyphName = "plane" | "canopy" | "terrain" | "smoke" | "card" | "shield" | "mail";

export function FieldGlyph({ name, className = "h-6 w-6" }: { name: GlyphName; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {name === "plane" && <g {...common}><path d="M3 13 21 4l-5 15-4-5-5 3 1-6-5 2Z" /><path d="m8 11 4 3" /></g>}
      {name === "canopy" && <g {...common}><path d="M3 10c1-5 4-7 9-7s8 2 9 7c-3-2-6-2-9 0-3-2-6-2-9 0Z" /><path d="m4 10 8 11 8-11M12 10v11" /></g>}
      {name === "terrain" && <g {...common}><path d="m2 19 6-9 4 5 3-7 7 11H2Z" /><path d="M6 19c2-2 4-2 6 0M13 15c2-2 4-2 6 0" /></g>}
      {name === "smoke" && <g {...common}><path d="M8 21h8M10 21v-5h4v5" /><path d="M12 16c-4-2-3-5 0-6 4-2 1-5-1-6 5 1 7 5 4 8-1 1-2 2-3 4Z" /></g>}
      {name === "card" && <g {...common}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M3 10h18M6 15h5" /></g>}
      {name === "shield" && <g {...common}><path d="M12 2 20 5v6c0 5-3 8-8 11-5-3-8-6-8-11V5l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></g>}
      {name === "mail" && <g {...common}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3 7 9 7 9-7" /></g>}
    </svg>
  );
}
