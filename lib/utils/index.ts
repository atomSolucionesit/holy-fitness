import clsx, { type ClassValue } from "clsx";
export const cn = (...i: ClassValue[]) => clsx(i);
const fmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
export const formatMoney = (n: number) => `$ ${fmt.format(n)}`;
export const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export const discountPct = (price: number, compare?: number) => compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;
export const placeholder = (label: string, tone = "e9e9e9", ratio: "p" | "l" | "v" = "p", n = 1) =>
  `/api/placeholder?l=${encodeURIComponent(label)}&t=${tone}&r=${ratio}&n=${n}`;
