import { FieldGlyph } from "@/components/FieldGlyph";

export function FlightSeam() {
  return (
    <div className="overflow-hidden bg-sky py-8 text-forest" aria-hidden="true">
      <div className="relative mx-auto flex max-w-[1500px] items-center px-5 sm:px-9 lg:px-14">
        <span className="h-px flex-1 border-t border-dashed border-forest/60" />
        <span className="mx-5 grid h-14 w-14 rotate-6 place-items-center rounded-full bg-chalk"><FieldGlyph name="plane" className="h-7 w-7" /></span>
        <span className="h-px flex-1 border-t border-dashed border-forest/60" />
        <span className="ml-5 h-3 w-3 rounded-full bg-beacon ring-8 ring-beacon/15" />
      </div>
    </div>
  );
}
