"use client";
import { useRef } from "react";
export function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0 [&>*]:w-[44%] [&>*]:shrink-0 [&>*]:snap-start lg:[&>*]:w-[calc(25%-12px)]">{children}</div>
      <button onClick={() => go(-1)} aria-label="Anterior" className="absolute -left-4 top-1/3 hidden h-12 w-12 bg-white shadow lg:block">‹</button>
      <button onClick={() => go(1)} aria-label="Siguiente" className="absolute -right-4 top-1/3 hidden h-12 w-12 bg-white shadow lg:block">›</button>
    </div>
  );
}
