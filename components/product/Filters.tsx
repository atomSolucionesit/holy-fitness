"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Facets = { sizes: Record<string, number>; colors: Record<string, number>; fits: Record<string, number> };
const SORTS = [["", "Destacados"], ["novedades", "Novedades"], ["mas-vendidos", "Más vendidos"], ["precio-asc", "Precio: menor a mayor"], ["precio-desc", "Precio: mayor a menor"]];
const PRICES = [["", "Todos"], ["0-30000", "Hasta $ 30.000"], ["30000-60000", "$ 30.000 a $ 60.000"], ["60000-", "Más de $ 60.000"]];

export function Filters({ facets, total, shown }: { facets: Facets; total: number; shown: number }) {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const set = (k: string, v: string | null) => { const n = new URLSearchParams(sp.toString()); n.delete("limite"); if (v) n.set(k, v); else n.delete(k); router.replace(`${path}?${n}`, { scroll: false }); };
  const toggle = (k: string, v: string) => { const cur = sp.get(k)?.split(",").filter(Boolean) ?? []; const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]; set(k, next.join(",") || null); };
  const has = (k: string, v: string) => sp.get(k)?.split(",").includes(v) ?? false;
  const active = [...["talle", "color", "fit"].flatMap((k) => (sp.get(k)?.split(",").filter(Boolean) ?? []).map((v) => [k, v] as const))];
  const priceVal = sp.get("min") || sp.get("max") ? `${sp.get("min") ?? ""}-${sp.get("max") ?? ""}` : "";
  const setPrice = (v: string) => { const n = new URLSearchParams(sp.toString()); n.delete("limite"); n.delete("min"); n.delete("max"); if (v) { const [a, b] = v.split("-"); if (a) n.set("min", a); if (b) n.set("max", b); } router.replace(`${path}?${n}`, { scroll: false }); };
  const group = (title: string, k: string, data: Record<string, number>) => (
    <fieldset className="border-b border-line py-4"><legend className="label mb-3">{title}</legend>
      <div className="flex flex-wrap gap-2 lg:block lg:space-y-2">{Object.entries(data).sort().map(([v, c]) => (
        <label key={v} className={cn("flex cursor-pointer items-center gap-2 text-sm max-lg:border max-lg:px-3 max-lg:py-2", has(k, v) && "max-lg:border-ink")}><input type="checkbox" checked={has(k, v)} onChange={() => toggle(k, v)} className="accent-black" />{v}<span className="text-muted">({c})</span></label>))}</div></fieldset>
  );
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button className="label h-10 border border-ink px-4 lg:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>Filtrar</button>
        <p className="hidden text-sm text-muted lg:block">Mostrando {shown} de {total}</p>
        <label className="flex items-center gap-2 text-sm"><span className="label">Ordenar</span>
          <select className="h-10 border border-line px-2" value={sp.get("orden") ?? ""} onChange={(e) => set("orden", e.target.value || null)}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      </div>
      {active.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">{active.map(([k, v]) => <button key={k + v} onClick={() => toggle(k, v)} className="label border border-ink px-3 py-1.5 text-[11px]">{v} ✕</button>)}
          <button className="label underline" onClick={() => router.replace(path, { scroll: false })}>Limpiar todo</button></div>
      )}
      <div className={cn("lg:block", open ? "block" : "hidden")}>
        {group("Talle", "talle", facets.sizes)}{group("Color", "color", facets.colors)}{group("Fit", "fit", facets.fits)}
        <fieldset className="py-4"><legend className="label mb-3">Precio</legend>
          <select className="h-10 w-full border border-line px-2" value={priceVal} onChange={(e) => setPrice(e.target.value)}>{PRICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></fieldset>
      </div>
    </div>
  );
}
