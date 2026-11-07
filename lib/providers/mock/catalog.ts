import { CATEGORIES, COLLECTIONS, PRODUCTS } from "@/data/seed";
import type { Product, ProductQuery } from "@/lib/domain/types";
import { normalize } from "@/lib/utils";
import type { CatalogProvider, InventoryProvider } from "../ports";

function matches(p: Product, q: ProductQuery, skip?: "sizes" | "colors" | "fits" | "category") {
  if (q.gender && p.gender !== q.gender) return false;
  if (q.category && skip !== "category" && p.category !== q.category) return false;
  if (q.collection && !p.collections.includes(q.collection)) return false;
  if (q.activity && !p.activities.includes(q.activity)) return false;
  if (q.badge && !p.badges.includes(q.badge)) return false;
  if (q.onSale && !p.compareAtPrice) return false;
  if (q.minPrice && p.price < q.minPrice) return false;
  if (q.maxPrice && p.price > q.maxPrice) return false;
  if (q.fits?.length && skip !== "fits" && !q.fits.includes(p.fit)) return false;
  if (q.colors?.length && skip !== "colors" && !p.colors.some((c) => q.colors!.includes(c.name))) return false;
  if (q.sizes?.length && skip !== "sizes" && !p.variants.some((v) => v.stock > 0 && q.sizes!.includes(v.size))) return false;
  if (q.q) { const t = normalize(q.q); if (!normalize(`${p.name} ${p.category} ${p.fit} ${p.colors.map((c) => c.name).join(" ")}`).includes(t)) return false; }
  return true;
}
const count = (arr: string[]) => arr.reduce<Record<string, number>>((a, k) => ((a[k] = (a[k] ?? 0) + 1), a), {});

export const mockCatalog: CatalogProvider = {
  async listProducts(q) {
    const items = PRODUCTS.filter((p) => matches(p, q));
    const sorted = [...items];
    switch (q.sort) {
      case "novedades": sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case "precio-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "precio-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "mas-vendidos": sorted.sort((a, b) => b.sales - a.sales); break;
      default: sorted.sort((a, b) => b.sales * b.rating - a.sales * a.rating);
    }
    const facets = {
      sizes: count(PRODUCTS.filter((p) => matches(p, q, "sizes")).flatMap((p) => [...new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.size))])),
      colors: count(PRODUCTS.filter((p) => matches(p, q, "colors")).flatMap((p) => p.colors.map((c) => c.name))),
      fits: count(PRODUCTS.filter((p) => matches(p, q, "fits")).map((p) => p.fit)),
      categories: count(PRODUCTS.filter((p) => matches(p, q, "category")).map((p) => p.category)),
    };
    const off = q.offset ?? 0;
    return { items: sorted.slice(off, off + (q.limit ?? 24)), total: sorted.length, facets };
  },
  async getProduct(slug) { return PRODUCTS.find((p) => p.slug === slug) ?? null; },
  async getProducts(slugs) { return slugs.map((s) => PRODUCTS.find((p) => p.slug === s)).filter((p): p is Product => !!p); },
  async listCategories() { return CATEGORIES; },
  async listCollections() { return COLLECTIONS; },
  async getCollection(slug) { return COLLECTIONS.find((c) => c.slug === slug) ?? null; },
  async search(term, limit = 6) {
    const t = normalize(term.trim());
    if (!t) return { products: [], categories: [] };
    return {
      products: PRODUCTS.filter((p) => matches(p, { q: term })).slice(0, limit),
      categories: CATEGORIES.filter((c) => normalize(c.name).includes(t)).slice(0, 4),
    };
  },
};

export const mockInventory: InventoryProvider = {
  async getStock(ids) {
    const all = new Map(PRODUCTS.flatMap((p) => p.variants).map((v) => [v.id, v.stock]));
    return Object.fromEntries(ids.map((id) => [id, all.get(id) ?? 0]));
  },
};
