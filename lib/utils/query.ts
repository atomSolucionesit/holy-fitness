import type { Gender, ProductQuery } from "@/lib/domain/types";
type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined) => (v ? (Array.isArray(v) ? v : v.split(",")).filter(Boolean) : undefined);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
export const GENDERS: Gender[] = ["mujer", "zapatillas", "accesorios"];
export function parseQuery(sp: SP, base: ProductQuery = {}): ProductQuery {
  const num = (k: string) => { const n = parseInt(one(sp[k]) ?? "", 10); return Number.isNaN(n) ? undefined : n; };
  return {
    ...base,
    sizes: arr(sp.talle), colors: arr(sp.color), fits: arr(sp.fit), minPrice: num("min"), maxPrice: num("max"),
    activity: one(sp.actividad), onSale: one(sp.oferta) === "1" || undefined, q: one(sp.q),
    sort: (one(sp.orden) as ProductQuery["sort"]) ?? undefined,
    limit: Math.min(num("limite") ?? 24, 96),
  };
}
