import "server-only";
import type {
  Badge,
  Category,
  Collection,
  ColorOption,
  Gender,
  Order,
  OrderStatus,
  Product,
  ProductQuery,
  Variant,
} from "@/lib/domain/types";
import { COLLECTIONS as DEFAULT_COLLECTIONS } from "@/data/seed";
import { couponDiscount, FREE_SHIPPING_FROM } from "@/lib/domain/rules";
import { CARRIERS, tariff, zoneOf, type Carrier, type Service } from "@/lib/shipping/tariffs";
import type { ShippingOption } from "@/lib/shipping/types";
import { normalize, slugify } from "@/lib/utils";
import type { CatalogProvider, InventoryProvider, NewOrder, OrderProvider } from "../ports";
import { getNexusConfig, nexusAuthFetch, nexusFetch, nexusWebhookSend, resolveNexusAssetUrl } from "./client";

// ---------------------------------------------------------------------------
// Tipos crudos devueltos por GET /api/products/ecommerce/:companyId en Nexus
// ---------------------------------------------------------------------------

interface NexusImage {
  id: string;
  url: string;
  position?: number | null;
}

interface NexusCategory {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
}

interface NexusCategoryProduct {
  categoryId: string;
  category?: NexusCategory | null;
}

interface NexusVariantOption {
  id: string;
  groupId: string;
  name: string;
  colorHex?: string | null;
  imageUrl?: string | null;
  imageUrls?: unknown;
  position?: number;
  isActive?: boolean;
  price?: number;
}

interface NexusVariantGroup {
  id: string;
  name: string;
  kind?: "COLOR" | "SIZE" | "CUSTOM" | string;
  position?: number;
  isActive?: boolean;
  options?: NexusVariantOption[];
}

interface NexusVariantOptionLink {
  id: string;
  variantId: string;
  groupId: string;
  optionId: string;
  group?: { id: string; name: string; kind?: string } | null;
  option?: NexusVariantOption | null;
}

interface NexusVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  stock?: number | null;
  isActive?: boolean;
  optionLinks?: NexusVariantOptionLink[];
}

interface NexusProductRaw {
  id: string;
  name: string;
  color?: string | null;
  talle?: string | null;
  stock?: number | null;
  price?: number | null;
  sellingPrice?: number | null;
  purchasePrice?: number | null;
  originalPrice?: number | null;
  sku?: string | null;
  published?: boolean;
  outstanding?: boolean;
  outstandingDescription?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  hasVariants?: boolean;
  images?: NexusImage[];
  CategoryProduct?: NexusCategoryProduct[];
  variants?: NexusVariant[];
  variantGroups?: NexusVariantGroup[];
  rating?: number;
  reviews?: number;
  specifications?: { color?: string; talle?: string };
}

interface NexusEcommerceResponse {
  status: number;
  message: string;
  info: {
    data: NexusProductRaw[];
    meta: {
      total: number;
      page: number;
      size: number;
      pages: number;
    };
  };
}

// ---------------------------------------------------------------------------
// Diccionarios de colores, fotos de respaldo y clasificación de categorías
// ---------------------------------------------------------------------------

const COLOR_HEX_MAP: Record<string, string> = {
  negro: "#111111",
  black: "#111111",
  blanco: "#f5f5f5",
  white: "#f5f5f5",
  offwhite: "#f5f2eb",
  crudo: "#f2eadf",
  arena: "#d6c3a5",
  beige: "#d8c8b0",
  nude: "#dcbba8",
  camel: "#b68b5e",
  marron: "#5c4033",
  chocolate: "#4a2c1d",
  gris: "#8a8a8a",
  grey: "#8a8a8a",
  melange: "#9e9e9e",
  plata: "#c0c0c0",
  oliva: "#5b6b46",
  verde: "#3b6e4c",
  esmeralda: "#1f6f54",
  militar: "#4b5320",
  bordo: "#6d1f2b",
  borgona: "#6d1f2b",
  vino: "#5e1924",
  rojo: "#b91c1c",
  coral: "#e06d53",
  rosa: "#e39bb6",
  fucsia: "#c92a76",
  lila: "#b9a4d6",
  lavanda: "#c4b5fd",
  violeta: "#6d28d9",
  morado: "#5b21b6",
  azul: "#1c2a4a",
  "azul noche": "#1c2a4a",
  marino: "#172554",
  celeste: "#7dd3fc",
  turquesa: "#2dd4bf",
  petroleo: "#134e4a",
  amarillo: "#eab308",
  mostaza: "#ca8a04",
  naranja: "#ea580c",
  unico: "#111111",
};

function resolveColorHex(colorName: string, rawHex?: string | null): string {
  if (rawHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(rawHex.trim())) {
    return rawHex.trim();
  }
  const key = normalize(colorName).trim();
  if (COLOR_HEX_MAP[key]) return COLOR_HEX_MAP[key]!;
  for (const [k, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (key.includes(k)) return hex;
  }
  return "#111111";
}

const FALLBACK_PHOTOS: Record<string, string> = {
  "mujer/calzas": "/img/m-calzas.jpg",
  "mujer/tops": "/img/m-tops.jpg",
  "mujer/remeras": "/img/m-remeras.jpg",
  "mujer/shorts": "/img/m-shorts.jpg",
  "mujer/buzos": "/img/m-buzos.jpg",
  "mujer/camperas": "/img/m-camperas.jpg",
  "mujer/joggers": "/img/m-conjuntos.jpg",
  "mujer/conjuntos": "/img/m-conjuntos.jpg",
  "zapatillas/running": "/img/z-running.jpg",
  "zapatillas/training": "/img/z-training.jpg",
  "zapatillas/urbanas": "/img/z-urbanas.jpg",
  "accesorios/gorras": "/img/a-gorras.jpg",
  "accesorios/mochilas": "/img/a-mochilas.jpg",
  "accesorios/botellas": "/img/a-botellas.jpg",
  "accesorios/medias": "/img/a-medias.jpg",
  "accesorios/gym": "/img/a-gym.jpg",
};

function fallbackImageFor(gender: Gender, category: string): string {
  return (
    FALLBACK_PHOTOS[`${gender}/${category}`] ??
    (gender === "zapatillas"
      ? "/img/z-running.jpg"
      : gender === "accesorios"
        ? "/img/a-gym.jpg"
        : "/img/m-calzas.jpg")
  );
}

const KNOWN_COLLECTIONS = new Set(["sculpt", "flow", "impact", "essentials", "invierno", "verano", "capsula"]);
const KNOWN_ACTIVITIES = new Set([
  "lifting",
  "running",
  "hiit",
  "pilates",
  "yoga",
  "descanso",
  "rest-day",
  "training",
  "funcional",
  "crossfit",
  "gym",
]);
const KNOWN_FITS = new Set([
  "soporte-alto",
  "soporte-medio",
  "soporte-ligero",
  "soporte-bajo",
  "sin-costuras",
  "seamless",
  "ajuste-cenido",
  "termica",
  "termico",
  "boxy",
  "oversized",
  "slim-fit",
  "slim",
  "regular-fit",
  "liviano",
  "liviana",
  "relajado",
  "oxford",
  "flare",
  "tiro-alto",
  "cintura-alta",
  "con-short-interno",
  "compresion",
]);
const SHOE_CATEGORIES = new Set(["zapatillas", "zapatilla", "calzado", "urbanas", "sneakers"]);
const ACCESSORY_CATEGORIES = new Set([
  "accesorios",
  "accesorio",
  "gorras",
  "gorra",
  "mochilas",
  "mochila",
  "bolsos",
  "bolso",
  "botellas",
  "botella",
  "shakers",
  "shaker",
  "medias",
  "media",
  "soquetes",
  "straps",
  "bandas",
  "mats",
  "mat",
  "colchonetas",
  "rinoneras",
]);
const KNOWN_SIZES = new Set([
  "xxs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "2xl",
  "3xl",
  "unico",
  "talle unico",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "35-38",
  "38-41",
  "1",
  "2",
  "3",
  "4",
]);

function inferFromProductName(name: string): { gender: Gender; category: string } {
  const n = normalize(name);
  if (/\bzapatilla|\bcalzado|\bsneaker/.test(n)) {
    if (/\btraining|\blift|\bhiit|\bstudio|\bflex/.test(n)) return { gender: "zapatillas", category: "training" };
    if (/\burban|\bclassic|\bplatform|\bknit|\bsuede/.test(n)) return { gender: "zapatillas", category: "urbanas" };
    return { gender: "zapatillas", category: "running" };
  }
  if (/\bgorra|\bhat|\bvisera/.test(n)) return { gender: "accesorios", category: "gorras" };
  if (/\bmochila|\bbolso|\bduffle|\briñonera|\brinonera/.test(n)) return { gender: "accesorios", category: "mochilas" };
  if (/\bbotella|\bshaker|\btermo|\bvaso/.test(n)) return { gender: "accesorios", category: "botellas" };
  if (/\bmedias?\b|\bsoquetes?\b|\bcrew\b/.test(n)) return { gender: "accesorios", category: "medias" };
  if (/\bstrap|\bbanda|\bmat\b|\byoga|\bguante|\bcinto|\btoalla/.test(n)) return { gender: "accesorios", category: "gym" };

  if (/\bcalza|\bbiker|\blegging|\bflare/.test(n)) return { gender: "mujer", category: "calzas" };
  if (/\btop\b|\bcorpiño|\bcorpino|\bbrassier|\bbandeau/.test(n)) return { gender: "mujer", category: "tops" };
  if (/\bremera|\bmusculosa|\bcamiseta|\bcrop|\bt-shirt/.test(n)) return { gender: "mujer", category: "remeras" };
  if (/\bshort|\bpollera|\bfalda/.test(n)) return { gender: "mujer", category: "shorts" };
  if (/\bbuzo|\bhoodie|\bsweatshirt|\bfleece/.test(n)) return { gender: "mujer", category: "buzos" };
  if (/\bcampera|\bcortaviento|\bchaleco|\banorak|\bparka/.test(n)) return { gender: "mujer", category: "camperas" };
  if (/\bjogger|\bpantalon|\bcargo|\bbabucha/.test(n)) return { gender: "mujer", category: "joggers" };
  if (/\bconjunto|\bset\b|\benterito|\bbody|\bmono/.test(n)) return { gender: "mujer", category: "conjuntos" };

  return { gender: "mujer", category: "calzas" };
}

/**
 * Clasifica las categorías asignadas en Nexus en:
 * - gender ("mujer" | "zapatillas" | "accesorios")
 * - category (subcategoría de prenda/calzado/accesorio)
 * - fit (calce)
 * - activities (actividades deportivas)
 * - collections (colecciones)
 * - composition (si se cargó como categoría con prefijo "Composición:" / "Tela:")
 */
function classifyProductCategories(raw: NexusProductRaw) {
  const cats = (raw.CategoryProduct ?? [])
    .map((cp) => cp.category)
    .filter((c): c is NexusCategory => Boolean(c && c.name));

  const inferred = inferFromProductName(raw.name);
  let gender: Gender = inferred.gender;
  let primaryCategory: string | null = null;
  let primaryCategoryLabel: string | null = null;
  let fit = (raw.outstandingDescription || "").trim();
  let composition = "";
  const activities = new Set<string>();
  const collections = new Set<string>();

  // Primero detectar si hay alguna categoría que defina el género/sección explícitamente
  for (const cat of cats) {
    const slug = slugify(cat.slug || cat.name);
    if (SHOE_CATEGORIES.has(slug)) gender = "zapatillas";
    else if (ACCESSORY_CATEGORIES.has(slug)) gender = "accesorios";
    else if (slug === "mujer" || slug === "ropa" || slug === "indumentaria") gender = "mujer";
  }

  for (const cat of cats) {
    const rawName = cat.name.trim();
    const lowerName = normalize(rawName);

    // 1. Prefijos explícitos opcionales ("Colección: Sculpt", "Calce: Oversized", "Actividad: Pilates", "Tela: ...")
    const prefixMatch = rawName.match(/^(colecci[oó]n|col|actividad|act|calce|fit|ajuste|composici[oó]n|tela|material)\s*:\s*(.+)$/i);
    if (prefixMatch) {
      const kind = normalize(prefixMatch[1]!);
      const val = prefixMatch[2]!.trim();
      const valSlug = slugify(val);
      if (kind.startsWith("col")) collections.add(valSlug);
      else if (kind.startsWith("act")) activities.add(valSlug === "rest-day" ? "descanso" : valSlug);
      else if (kind === "calce" || kind === "fit" || kind === "ajuste") fit = val.toLowerCase();
      else composition = val;
      continue;
    }

    const slug = slugify(cat.slug || rawName);

    // 2. Colecciones
    if (KNOWN_COLLECTIONS.has(slug)) {
      collections.add(slug);
      continue;
    }

    // 3. Calce / Fit
    if (KNOWN_FITS.has(slug)) {
      if (!fit) fit = rawName.toLowerCase();
      continue;
    }

    // 4. Actividades (teniendo en cuenta que "running", "training" y "gym" también pueden ser subcategorías de zapatillas/accesorios)
    if (KNOWN_ACTIVITIES.has(slug)) {
      const actSlug = slug === "rest-day" ? "descanso" : slug;
      activities.add(actSlug);
      if (gender === "zapatillas" && (slug === "running" || slug === "training") && !primaryCategory) {
        primaryCategory = slug;
        primaryCategoryLabel = rawName;
      } else if (gender === "accesorios" && slug === "gym" && !primaryCategory) {
        primaryCategory = "gym";
        primaryCategoryLabel = rawName;
      }
      continue;
    }

    // 5. Raíces de sección
    if (slug === "mujer" || slug === "zapatillas" || slug === "calzado" || slug === "accesorios" || slug === "ropa" || slug === "indumentaria") {
      continue;
    }

    // 6. Cualquier otra categoría creada en Nexus es la categoría de prenda/producto
    if (!primaryCategory) {
      primaryCategory = slug;
      primaryCategoryLabel = rawName;
      if (ACCESSORY_CATEGORIES.has(slug)) gender = "accesorios";
      else if (SHOE_CATEGORIES.has(slug)) gender = "zapatillas";
    } else if (lowerName.includes("coleccion")) {
      collections.add(slug);
    }
  }

  const category = primaryCategory || inferred.category;
  if (!fit) {
    fit = gender === "zapatillas" ? "calce técnico" : gender === "accesorios" ? "uso deportivo" : "calce clásico";
  }
  if (collections.size === 0) {
    collections.add("essentials");
  }
  if (activities.size === 0) {
    if (category === "running") activities.add("running");
    else if (category === "calzas" || category === "tops" || category === "shorts") activities.add("lifting");
    else activities.add("descanso");
  }

  return {
    gender,
    category,
    categoryLabel: primaryCategoryLabel || category.charAt(0).toUpperCase() + category.slice(1),
    fit,
    activities: Array.from(activities),
    collections: Array.from(collections),
    composition,
  };
}

// ---------------------------------------------------------------------------
// Metadatos internos de variantes para enviar pedidos a Nexus sin perder el vínculo
// ---------------------------------------------------------------------------

interface VariantNexusMeta {
  productId: string;
  productName: string;
  productSku: string | null;
  variantId: string;
  variantSku: string | null;
  nexusVariantName: string | null;
  color: string;
  size: string;
  price: number;
}

interface CatalogSnapshot {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  expiresAt: number;
}

const CATALOG_TTL_MS = 5_000;

const g = globalThis as unknown as {
  __nexusVariantMeta?: Map<string, VariantNexusMeta>;
  __nexusProductCategories?: Map<string, string[]>;
  __nexusOrders?: Map<string, Order>;
  __nexusSaleIds?: Map<string, string>;
  __nexusCatalogCache?: CatalogSnapshot | null;
  __nexusCatalogInFlight?: Promise<CatalogSnapshot> | null;
};
const variantMetaStore = (g.__nexusVariantMeta ??= new Map<string, VariantNexusMeta>());
const productCategoriesStore = (g.__nexusProductCategories ??= new Map<string, string[]>());
const orderStore = (g.__nexusOrders ??= new Map<string, Order>());
const saleIdByOrderStore = (g.__nexusSaleIds ??= new Map<string, string>());

export function invalidateNexusCatalogCache() {
  g.__nexusCatalogCache = null;
  g.__nexusCatalogInFlight = null;
}

function extractOptionUrls(opt?: NexusVariantOption | null): string[] {
  if (!opt) return [];
  const urls: string[] = [];
  if (Array.isArray(opt.imageUrls)) {
    for (const u of opt.imageUrls) {
      const resolved = resolveNexusAssetUrl(typeof u === "string" ? u : null);
      if (resolved) urls.push(resolved);
    }
  } else if (typeof opt.imageUrls === "string" && opt.imageUrls.trim()) {
    try {
      const parsed = JSON.parse(opt.imageUrls);
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          const resolved = resolveNexusAssetUrl(typeof u === "string" ? u : null);
          if (resolved) urls.push(resolved);
        }
      }
    } catch {
      const resolved = resolveNexusAssetUrl(opt.imageUrls);
      if (resolved) urls.push(resolved);
    }
  }
  if (opt.imageUrl) {
    const resolved = resolveNexusAssetUrl(opt.imageUrl);
    if (resolved && !urls.includes(resolved)) urls.push(resolved);
  }
  return urls;
}

function deterministicStats(id: string): { rating: number; reviewCount: number; sales: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const rating = Math.round((4.3 + ((hash % 65) / 100)) * 10) / 10;
  const reviewCount = 12 + (hash % 180);
  const sales = 25 + (hash % 600);
  return { rating, reviewCount, sales };
}

function mapNexusProduct(raw: NexusProductRaw): { product: Product; categoryLabel: string } {
  const classified = classifyProductCategories(raw);
  const slug = `${slugify(raw.name)}-${raw.id.slice(0, 6)}`;
  const price = Math.max(0, Number(raw.sellingPrice ?? raw.price ?? 0));

  // Imágenes generales del producto ordenadas por posición
  const productImages = (raw.images ?? [])
    .slice()
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map((img) => resolveNexusAssetUrl(img.url))
    .filter((u): u is string => Boolean(u));

  const fallbackImg = fallbackImageFor(classified.gender, classified.category);
  const defaultImages = productImages.length > 0 ? productImages : [fallbackImg];

  // Grupos de variantes (COLOR / SIZE / CUSTOM)
  const groups = (raw.variantGroups ?? []).filter((vg) => vg.isActive !== false);
  const colorGroup = groups.find(
    (vg) => vg.kind === "COLOR" || /color|tono/i.test(vg.name),
  );
  const sizeGroup = groups.find(
    (vg) => vg.kind === "SIZE" || /tall[ea]|size|medida|n[uú]mero/i.test(vg.name),
  );

  const colorMap = new Map<string, ColorOption>();
  if (colorGroup?.options?.length) {
    for (const opt of colorGroup.options.filter((o) => o.isActive !== false)) {
      const optName = opt.name.trim();
      if (!optName) continue;
      const optImgs = extractOptionUrls(opt);
      colorMap.set(normalize(optName), {
        name: optName,
        hex: resolveColorHex(optName, opt.colorHex),
        images: optImgs.length > 0 ? optImgs : defaultImages,
      });
    }
  }

  const activeVariants = (raw.variants ?? []).filter((v) => v.isActive !== false);
  const mappedVariants: Variant[] = [];

  if (raw.hasVariants && activeVariants.length > 0) {
    for (const v of activeVariants) {
      const links = v.optionLinks ?? [];
      let colorName = "";
      let colorHex: string | null = null;
      let colorImgs: string[] = [];
      let sizeName = "";

      for (const link of links) {
        const gKind = link.group?.kind || "";
        const gName = link.group?.name || "";
        const optName = link.option?.name?.trim() || "";
        if (!optName) continue;

        if (
          gKind === "COLOR" ||
          (colorGroup && link.groupId === colorGroup.id) ||
          /color|tono/i.test(gName)
        ) {
          colorName = optName;
          colorHex = link.option?.colorHex ?? null;
          colorImgs = extractOptionUrls(link.option);
        } else if (
          gKind === "SIZE" ||
          (sizeGroup && link.groupId === sizeGroup.id) ||
          /tall[ea]|size|medida|n[uú]mero/i.test(gName)
        ) {
          sizeName = optName;
        }
      }

      // Si las opciones estaban en grupos CUSTOM sin etiqueta COLOR/SIZE clara:
      if (!colorName && !sizeName && links.length > 0) {
        if (links.length >= 2) {
          const first = links[0]?.option?.name?.trim() || "";
          const second = links[1]?.option?.name?.trim() || "";
          if (KNOWN_SIZES.has(normalize(first)) && !KNOWN_SIZES.has(normalize(second))) {
            sizeName = first;
            colorName = second;
            colorHex = links[1]?.option?.colorHex ?? null;
            colorImgs = extractOptionUrls(links[1]?.option);
          } else {
            colorName = first;
            colorHex = links[0]?.option?.colorHex ?? null;
            colorImgs = extractOptionUrls(links[0]?.option);
            sizeName = second;
          }
        } else {
          const only = links[0]?.option?.name?.trim() || "";
          if (KNOWN_SIZES.has(normalize(only))) {
            sizeName = only;
            colorName = raw.color?.trim() || raw.specifications?.color?.trim() || "Único";
          } else {
            colorName = only;
            colorHex = links[0]?.option?.colorHex ?? null;
            colorImgs = extractOptionUrls(links[0]?.option);
            sizeName = raw.talle?.trim() || raw.specifications?.talle?.trim() || "Único";
          }
        }
      }

      // Si la variante no tenía optionLinks sino solo name ("Negro / M" o "M")
      if (!colorName && !sizeName && v.name) {
        const parts = v.name.split(/\s*[\/|-]\s*/).map((s) => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (KNOWN_SIZES.has(normalize(parts[0]!)) && !KNOWN_SIZES.has(normalize(parts[1]!))) {
            sizeName = parts[0]!;
            colorName = parts.slice(1).join(" ");
          } else {
            colorName = parts[0]!;
            sizeName = parts.slice(1).join(" ");
          }
        } else if (parts.length === 1) {
          const single = parts[0]!;
          if (KNOWN_SIZES.has(normalize(single))) {
            sizeName = single;
            colorName = raw.color?.trim() || "Único";
          } else {
            colorName = single;
            sizeName = raw.talle?.trim() || "Único";
          }
        }
      }

      if (!colorName) colorName = raw.color?.trim() || "Único";
      if (!sizeName) sizeName = raw.talle?.trim() || "Único";

      const colorKey = normalize(colorName);
      const existingColor = colorMap.get(colorKey);
      if (!existingColor) {
        colorMap.set(colorKey, {
          name: colorName,
          hex: resolveColorHex(colorName, colorHex),
          images: colorImgs.length > 0 ? colorImgs : defaultImages,
        });
      } else {
        colorName = existingColor.name;
        if (colorImgs.length > 0 && existingColor.images === defaultImages) {
          existingColor.images = colorImgs;
        }
      }

      const stock = Math.max(0, Math.trunc(Number(v.stock ?? 0)));
      const sku = (v.sku && v.sku.trim()) || (raw.sku ? `${raw.sku}-${slugify(colorName)}-${slugify(sizeName)}` : v.id);

      mappedVariants.push({
        id: v.id,
        sku,
        color: colorName,
        size: sizeName,
        stock,
      });

      variantMetaStore.set(v.id, {
        productId: raw.id,
        productName: raw.name,
        productSku: raw.sku?.trim() || null,
        variantId: v.id,
        variantSku: v.sku?.trim() || null,
        nexusVariantName: v.name?.trim() || null,
        color: colorName,
        size: sizeName,
        price,
      });
    }
  } else {
    // Producto sin variantes en Nexus -> 1 color y 1 talle para que se pueda comprar en la web
    const colorName = raw.color?.trim() || raw.specifications?.color?.trim() || "Único";
    const sizeName = raw.talle?.trim() || raw.specifications?.talle?.trim() || "Único";
    const stock = Math.max(0, Math.trunc(Number(raw.stock ?? 0)));
    const sku = raw.sku?.trim() || raw.id;

    colorMap.set(normalize(colorName), {
      name: colorName,
      hex: resolveColorHex(colorName),
      images: defaultImages,
    });

    mappedVariants.push({
      id: raw.id,
      sku,
      color: colorName,
      size: sizeName,
      stock,
    });

    variantMetaStore.set(raw.id, {
      productId: raw.id,
      productName: raw.name,
      productSku: raw.sku?.trim() || null,
      variantId: raw.id,
      variantSku: null,
      nexusVariantName: null,
      color: colorName,
      size: sizeName,
      price,
    });
  }

  const colors = Array.from(colorMap.values());
  if (colors.length === 0) {
    colors.push({ name: "Único", hex: "#111111", images: defaultImages });
  }

  const totalStock = mappedVariants.reduce((sum, v) => sum + v.stock, 0);
  const badges: Badge[] = [];
  if (raw.outstanding) badges.push("MÁS VENDIDO");
  const createdMs = raw.createdAt ? new Date(raw.createdAt).getTime() : 0;
  if (createdMs && Date.now() - createdMs < 30 * 86400_000) {
    badges.push("NUEVO");
  }
  if (totalStock > 0 && totalStock <= 5 && !badges.includes("ÚLTIMAS UNIDADES")) {
    badges.push("ÚLTIMAS UNIDADES");
  }

  const stats = deterministicStats(raw.id);
  const description =
    raw.description?.trim() ||
    `${raw.name}. Diseñada para acompañarte en cada entrenamiento con máximo confort y ajuste.`;
  const composition =
    classified.composition ||
    (classified.gender === "zapatillas"
      ? "Capellada técnica respirable, plantilla de EVA y suela de caucho antideslizante. Limpiar con paño húmedo."
      : "Tejido técnico deportivo de secado rápido (poliamida / elastano). Lavar con agua fría, no usar blanqueador.");

  const rawCategoryNames = Array.from(
    new Set(
      [
        ...(raw.CategoryProduct ?? [])
          .flatMap((cp) => [cp.category?.name, cp.category?.slug, cp.category?.id])
          .filter((x): x is string => Boolean(x && x.trim())),
        classified.category,
        classified.categoryLabel,
        ...classified.collections,
        ...classified.activities,
      ].map((x) => x.trim()),
    ),
  );
  productCategoriesStore.set(slug, rawCategoryNames);
  productCategoriesStore.set(raw.id, rawCategoryNames);

  return {
    categoryLabel: classified.categoryLabel,
    product: {
      id: raw.id,
      slug,
      name: raw.name,
      fit: classified.fit,
      description,
      gender: classified.gender,
      category: classified.category,
      activities: classified.activities,
      collections: classified.collections,
      price,
      // No usamos raw.originalPrice porque en Nexus equivale a purchasePrice (costo)
      compareAtPrice: undefined,
      badges,
      colors,
      variants: mappedVariants,
      composition,
      rating: stats.rating,
      reviewCount: typeof raw.reviews === "number" && raw.reviews > 0 ? raw.reviews : stats.reviewCount,
      createdAt: raw.createdAt || new Date().toISOString(),
      sales: raw.outstanding ? stats.sales + 500 : stats.sales,
    },
  };
}

// ---------------------------------------------------------------------------
// Carga y filtrado del catálogo publicado en Nexus
// ---------------------------------------------------------------------------

async function fetchAllPublishedFromNexus(noStore = false): Promise<{
  products: Product[];
  categories: Category[];
  collections: Collection[];
}> {
  const now = Date.now();
  if (!noStore && g.__nexusCatalogCache && g.__nexusCatalogCache.expiresAt > now) {
    return g.__nexusCatalogCache;
  }
  if (!noStore && g.__nexusCatalogInFlight) {
    return g.__nexusCatalogInFlight;
  }

  const loadPromise = (async (): Promise<CatalogSnapshot> => {
    const { companyId } = getNexusConfig();
    const pageSize = 100;
    const [firstPage, categoriesRes] = await Promise.all([
      nexusFetch<NexusEcommerceResponse>(
        `/products/ecommerce/${companyId}?page=1&size=${pageSize}`,
        { cache: "no-store" },
      ),
      nexusAuthFetch<{
        info?: NexusCategory[] | { data?: NexusCategory[] };
        data?: NexusCategory[];
      }>("/categories?page=1&size=100", { cache: "no-store" }).catch(() => null),
    ]);

    const rawList: NexusProductRaw[] = [...(firstPage?.info?.data ?? [])];
    const totalPages = Math.min(10, Number(firstPage?.info?.meta?.pages ?? 1));

    if (totalPages > 1) {
      const restPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          nexusFetch<NexusEcommerceResponse>(
            `/products/ecommerce/${companyId}?page=${i + 2}&size=${pageSize}`,
            { cache: "no-store" },
          ),
        ),
      );
      for (const pageRes of restPages) {
        if (pageRes?.info?.data) rawList.push(...pageRes.info.data);
      }
    }

    const nexusCategoriesRaw: NexusCategory[] = Array.isArray(categoriesRes?.info)
      ? categoriesRes.info
      : Array.isArray(categoriesRes?.info?.data)
        ? categoriesRes.info.data
        : Array.isArray(categoriesRes?.data)
          ? categoriesRes.data
          : [];

    // Mapa auxiliar con la imagen real de cada categoría cargada en Nexus
    const nexusCategoryImageByKey = new Map<string, string>();
    for (const nc of nexusCategoriesRaw) {
      const imgUrl = resolveNexusAssetUrl(nc.image);
      if (imgUrl) {
        if (nc.slug) nexusCategoryImageByKey.set(slugify(nc.slug), imgUrl);
        nexusCategoryImageByKey.set(slugify(nc.name), imgUrl);
      }
    }
    for (const raw of rawList) {
      if (raw.published === false) continue;
      for (const cp of raw.CategoryProduct ?? []) {
        const nc = cp.category;
        if (!nc) continue;
        const imgUrl = resolveNexusAssetUrl(nc.image);
        if (imgUrl) {
          if (nc.slug) nexusCategoryImageByKey.set(slugify(nc.slug), imgUrl);
          nexusCategoryImageByKey.set(slugify(nc.name), imgUrl);
        }
      }
    }

    const categoryMap = new Map<string, Category>();
    const collectionSet = new Set<string>();
    const products: Product[] = [];

    for (const raw of rawList) {
      if (raw.published === false) continue;
      const { product, categoryLabel } = mapNexusProduct(raw);
      products.push(product);

      const catKey = slugify(product.category);
      if (!categoryMap.has(catKey)) {
        const nexusImg =
          nexusCategoryImageByKey.get(catKey) ||
          nexusCategoryImageByKey.get(slugify(categoryLabel)) ||
          undefined;
        categoryMap.set(catKey, {
          slug: product.category,
          name: categoryLabel,
          gender: product.gender,
          image: nexusImg,
        });
      }
      for (const col of product.collections) {
        collectionSet.add(col);
      }
    }

    // Incluir también categorías de Nexus (con su imagen) que aún no estén en el mapa
    for (const nc of nexusCategoriesRaw) {
      const trimmed = nc.name?.trim();
      if (!trimmed) continue;
      if (/^(colecci[oó]n|actividad|calce|fit|composici[oó]n|tela)\s*:/i.test(trimmed)) continue;
      const catSlug = slugify(nc.slug || trimmed);
      if (!catSlug || categoryMap.has(catSlug)) continue;
      const resolvedGender: Gender = SHOE_CATEGORIES.has(catSlug)
        ? "zapatillas"
        : ACCESSORY_CATEGORIES.has(catSlug)
          ? "accesorios"
          : "mujer";
      const nexusImg =
        resolveNexusAssetUrl(nc.image) ||
        nexusCategoryImageByKey.get(catSlug) ||
        undefined;
      categoryMap.set(catSlug, {
        slug: catSlug,
        name: trimmed,
        gender: resolvedGender,
        image: nexusImg,
      });
    }

    // Combinar las colecciones base con cualquier colección nueva creada en Nexus
    const collectionsMap = new Map<string, Collection>(
      DEFAULT_COLLECTIONS.map((c) => [c.slug, c]),
    );
    for (const colSlug of collectionSet) {
      if (!collectionsMap.has(colSlug)) {
        const sampleProd = products.find((p) => p.collections.includes(colSlug));
        collectionsMap.set(colSlug, {
          slug: colSlug,
          name: colSlug.charAt(0).toUpperCase() + colSlug.slice(1).replace(/-/g, " "),
          tagline: `Colección ${colSlug.charAt(0).toUpperCase() + colSlug.slice(1)} de Holy Fitness.`,
          image: sampleProd?.colors[0]?.images[0] || "/img/m-calzas.jpg",
        });
      }
    }

    const snapshot: CatalogSnapshot = {
      products,
      categories: Array.from(categoryMap.values()),
      collections: Array.from(collectionsMap.values()),
      expiresAt: Date.now() + CATALOG_TTL_MS,
    };
    g.__nexusCatalogCache = snapshot;
    return snapshot;
  })();

  if (!noStore) {
    g.__nexusCatalogInFlight = loadPromise;
    loadPromise.finally(() => {
      if (g.__nexusCatalogInFlight === loadPromise) {
        g.__nexusCatalogInFlight = null;
      }
    });
  }

  return loadPromise;
}

function matchesQuery(
  p: Product,
  q: ProductQuery,
  skip?: "sizes" | "colors" | "fits" | "category",
): boolean {
  if (q.gender && p.gender !== q.gender) return false;
  if (skip !== "category") {
    const requestedCats = [
      ...(q.category ? [q.category] : []),
      ...(q.categories ?? []),
    ]
      .map((c) => slugify(c))
      .filter(Boolean);
    if (requestedCats.length > 0) {
      const productCats = new Set([
        slugify(p.category),
        ...(productCategoriesStore.get(p.slug) ?? []).map((c) => slugify(c)),
      ]);
      if (!requestedCats.some((c) => productCats.has(c))) return false;
    }
  }
  if (q.collection && !p.collections.includes(q.collection)) return false;
  if (q.activity && !p.activities.includes(q.activity)) return false;
  if (q.badge && !p.badges.includes(q.badge)) return false;
  if (q.onSale && !p.compareAtPrice) return false;
  if (q.minPrice && p.price < q.minPrice) return false;
  if (q.maxPrice && p.price > q.maxPrice) return false;
  if (q.fits?.length && skip !== "fits" && !q.fits.some((f) => normalize(f) === normalize(p.fit))) return false;
  if (
    q.colors?.length &&
    skip !== "colors" &&
    !p.colors.some((c) => q.colors!.some((qc) => normalize(qc) === normalize(c.name)))
  ) {
    return false;
  }
  if (
    q.sizes?.length &&
    skip !== "sizes" &&
    !p.variants.some((v) => v.stock > 0 && q.sizes!.some((qs) => normalize(qs) === normalize(v.size)))
  ) {
    return false;
  }
  if (q.q) {
    const t = normalize(q.q);
    const haystack = normalize(
      `${p.name} ${p.category} ${p.fit} ${p.description} ${p.colors.map((c) => c.name).join(" ")}`,
    );
    if (!haystack.includes(t)) return false;
  }
  return true;
}

const countFacet = (arr: string[]) =>
  arr.reduce<Record<string, number>>((acc, k) => ((acc[k] = (acc[k] ?? 0) + 1), acc), {});

function findProductBySlugOrId(products: Product[], slugOrId: string): Product | null {
  const direct = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (direct) return direct;
  // Permitir coincidencia por slug sin el sufijo corto de id si el nombre es único
  return products.find((p) => slugify(p.name) === slugOrId) ?? null;
}

// ---------------------------------------------------------------------------
// Implementaciones de CatalogProvider, InventoryProvider y OrderProvider
// ---------------------------------------------------------------------------

export const nexusCatalog: CatalogProvider = {
  async listProducts(q) {
    const { products } = await fetchAllPublishedFromNexus();
    const items = products.filter((p) => matchesQuery(p, q));
    const sorted = [...items];
    switch (q.sort) {
      case "novedades":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "precio-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "mas-vendidos":
        sorted.sort((a, b) => b.sales - a.sales);
        break;
      default:
        sorted.sort((a, b) => b.sales * b.rating - a.sales * a.rating);
    }

    const facets = {
      sizes: countFacet(
        products
          .filter((p) => matchesQuery(p, q, "sizes"))
          .flatMap((p) => [...new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.size))]),
      ),
      colors: countFacet(
        products
          .filter((p) => matchesQuery(p, q, "colors"))
          .flatMap((p) => p.colors.map((c) => c.name)),
      ),
      fits: countFacet(
        products
          .filter((p) => matchesQuery(p, q, "fits"))
          .map((p) => p.fit)
          .filter(Boolean),
      ),
      categories: countFacet(
        products
          .filter((p) => matchesQuery(p, q, "category"))
          .map((p) => p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, " ")),
      ),
    };

    const off = q.offset ?? 0;
    const limit = q.limit ?? 24;
    return {
      items: sorted.slice(off, off + limit),
      total: sorted.length,
      facets,
    };
  },

  async getProduct(slug) {
    const { products } = await fetchAllPublishedFromNexus();
    return findProductBySlugOrId(products, slug);
  },

  async getProducts(slugs) {
    const { products } = await fetchAllPublishedFromNexus();
    return slugs
      .map((s) => findProductBySlugOrId(products, s))
      .filter((p): p is Product => Boolean(p));
  },

  async listCategories() {
    const { categories } = await fetchAllPublishedFromNexus();
    return categories;
  },

  async listCollections() {
    const { collections } = await fetchAllPublishedFromNexus();
    return collections;
  },

  async getCollection(slug) {
    const { collections } = await fetchAllPublishedFromNexus();
    return collections.find((c) => c.slug === slug) ?? null;
  },

  async search(term, limit = 6) {
    const t = normalize(term.trim());
    if (!t) return { products: [], categories: [] };
    const { products, categories } = await fetchAllPublishedFromNexus();
    return {
      products: products.filter((p) => matchesQuery(p, { q: term })).slice(0, limit),
      categories: categories.filter((c) => normalize(c.name).includes(t)).slice(0, 4),
    };
  },
};

export const nexusInventory: InventoryProvider = {
  async getStock(variantIds) {
    if (variantIds.length === 0) return {};
    // Consultar catálogo en tiempo real (sin caché) para validar stock exacto antes de comprar
    const { products } = await fetchAllPublishedFromNexus(true);
    const stockById = new Map<string, number>();
    for (const p of products) {
      for (const v of p.variants) {
        stockById.set(v.id, v.stock);
        stockById.set(v.sku, v.stock);
      }
    }
    return Object.fromEntries(variantIds.map((id) => [id, stockById.get(id) ?? 0]));
  },
};

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  mercadopago: "Mercado Pago",
  transferencia: "Transferencia bancaria",
  local: "Pago en el local",
};

export const nexusOrders: OrderProvider = {
  async createOrder(o: NewOrder): Promise<Order> {
    const id = `HF-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

    // Asegurar que tenemos los metadatos de SKU/variante de Nexus cargados
    if (o.items.some((it) => !variantMetaStore.has(it.variantId))) {
      await fetchAllPublishedFromNexus(true);
    }

    const webhookItems = o.items.map((item) => {
      const meta = variantMetaStore.get(item.variantId);
      const fallbackVariantLabel = [item.color, item.size]
        .filter((x) => x && x !== "Único")
        .join(" / ");
      const variantLabel = meta?.nexusVariantName || fallbackVariantLabel || item.size || item.color;

      return {
        name: item.name,
        sku: meta?.productSku || meta?.variantSku || undefined,
        variantSku: meta?.variantSku || undefined,
        variant: variantLabel || undefined,
        price: item.unitPrice,
        quantity: item.qty,
      };
    });

    const addressText =
      o.shippingMethod === "retiro"
        ? "Retiro en el local"
        : [o.address?.street, o.address?.city, o.address?.province, o.address?.zip ? `CP ${o.address.zip}` : ""]
            .filter(Boolean)
            .join(", ");

    const notesParts = [
      o.shippingOption
        ? `Envío: ${o.shippingOption.label} (${o.shippingOption.eta})`
        : o.shippingMethod === "retiro"
          ? "Entrega: Retiro en el local"
          : "",
      o.couponCode ? `Cupón aplicado: ${o.couponCode} (-$${o.discount})` : "",
    ].filter(Boolean);

    // Enviar el pedido al historial de ventas de Nexus vía Webhook autenticado y firmado
    const webhookRes = await nexusWebhookSend<{
      success: boolean;
      saleId?: string;
      correlative?: string;
      status?: string;
    }>({
      event: "order.created",
      order_id: id,
      status: "pending",
      customer: {
        name: o.customer.name,
        email: o.customer.email,
        phone: o.customer.phone,
        address: addressText,
        city: o.address?.city || "",
      },
      shipping_address: o.address
        ? {
            street: o.address.street || "",
            city: o.address.city,
            province: o.address.province,
            zip: o.address.zip,
          }
        : undefined,
      items: webhookItems,
      shipping_cost: o.shipping,
      discount_total: o.discount,
      total: o.total,
      payment_method: PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod,
      notes: notesParts.join(" · "),
    });

    const order: Order = {
      ...o,
      id: webhookRes?.correlative || id,
      createdAt: new Date().toISOString(),
      status: "pendiente",
    };

    orderStore.set(order.id, order);
    orderStore.set(id, order);
    if (webhookRes?.saleId) {
      saleIdByOrderStore.set(order.id, webhookRes.saleId);
      saleIdByOrderStore.set(id, webhookRes.saleId);
    }
    invalidateNexusCatalogCache();
    return order;
  },

  async getOrder(id) {
    return orderStore.get(id) ?? null;
  },

  async listOrdersByEmail(email) {
    const target = email.trim().toLowerCase();
    const seen = new Set<string>();
    const result: Order[] = [];
    for (const o of orderStore.values()) {
      if (!seen.has(o.id) && o.customer.email.toLowerCase() === target) {
        seen.add(o.id);
        result.push(o);
      }
    }
    return result.reverse();
  },

  async updateStatus(id, status: OrderStatus) {
    const existing = orderStore.get(id);
    if (existing) {
      existing.status = status;
    }
    // Si el pedido se cancela, avisar a Nexus para anular la venta y devolver el stock de la variante
    if (status === "cancelado") {
      const externalOrderId = id.replace(/^ECOMM-(WC|SH|WH)-/, "");
      await nexusWebhookSend({
        event: "order.updated",
        order_id: externalOrderId,
        status: "cancelled",
      }).catch(() => undefined);
      invalidateNexusCatalogCache();
    }
  },
};

interface NexusPublicShippingOption {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  time?: string | null;
  isActive?: boolean;
}

interface NexusCouponValidateResponse {
  message?: string;
  total?: number;
  descuento?: number;
  type?: string;
  value?: number;
  isValid?: boolean;
}

export interface NexusCouponValidation {
  isValid: boolean;
  code: string;
  discount: number;
  message: string;
  type?: string;
  value?: number;
}

/**
 * Valida un cupón contra el módulo de Cupones de Nexus (`POST /api/coupon/validate-coupon-public`).
 * Soporta cupones por porcentaje, monto fijo, restricciones por categoría, fecha de expiración y límite de usos.
 */
export async function nexusValidateCoupon(
  rawCode: string | undefined,
  cartItems: { slug: string; qty: number }[],
  consume = false,
): Promise<NexusCouponValidation> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code || cartItems.length === 0) {
    return { isValid: false, code, discount: 0, message: "Ingresá un cupón" };
  }

  const { companyId } = getNexusConfig();
  const { products } = await fetchAllPublishedFromNexus();

  const productos: Array<{
    cantidad: number;
    precio: number;
    categoria: string;
    categorias: string[];
  }> = [];

  for (const item of cartItems) {
    const prod = findProductBySlugOrId(products, item.slug);
    if (!prod) continue;
    const cats = productCategoriesStore.get(prod.slug) || [prod.category, ...prod.collections];
    productos.push({
      cantidad: item.qty,
      precio: prod.price,
      categoria: cats[0] || prod.category,
      categorias: cats,
    });
  }

  if (productos.length === 0) {
    return { isValid: false, code, discount: 0, message: "El carrito está vacío" };
  }

  try {
    const res = await nexusFetch<NexusCouponValidateResponse>("/coupon/validate-coupon-public", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        codigoDescuento: code,
        consume,
        productos,
      }),
    });

    if (res?.isValid) {
      return {
        isValid: true,
        code,
        discount: Math.max(0, Math.round(Number(res.descuento || 0))),
        message: res.message || "Cupón aplicado exitosamente",
        type: res.type,
        value: res.value,
      };
    }

    return {
      isValid: false,
      code,
      discount: 0,
      message: res?.message || "Cupón inválido o inactivo",
    };
  } catch {
    const subtotal = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
    const fallback = couponDiscount(code, subtotal);
    if (fallback > 0) {
      return { isValid: true, code, discount: fallback, message: "Cupón aplicado" };
    }
    return { isValid: false, code, discount: 0, message: "No se pudo validar el cupón" };
  }
}

function estimateByZipAndWeight(zip: string, weightGrams: number): ShippingOption[] {
  const zone = zoneOf(zip);
  if (!zone) return [];
  const out: ShippingOption[] = [];
  for (const carrier of Object.keys(CARRIERS) as Carrier[]) {
    for (const service of ["domicilio", "sucursal"] as Service[]) {
      const t = tariff(carrier, service, zone, weightGrams);
      out.push({
        id: `${carrier}-${service}`,
        carrier,
        carrierName: CARRIERS[carrier].name,
        service,
        label: `${CARRIERS[carrier].name} · ${service === "domicilio" ? "A domicilio" : "A sucursal"}`,
        price: t.price,
        etaMin: t.etaMin,
        etaMax: t.etaMax,
      });
    }
  }
  return out.sort((a, b) => a.price - b.price);
}

export const nexusShipping = {
  async quote({ zip, weightGrams }: { zip: string; weightGrams: number }): Promise<ShippingOption[]> {
    const zone = zoneOf(zip);
    if (!zone) return [];

    const { companyId } = getNexusConfig();
    const list = await nexusFetch<NexusPublicShippingOption[]>(`/shipping/public-options/${companyId}`, {
      cache: "no-store",
    }).catch(() => []);

    const activeNexusOptions = Array.isArray(list)
      ? list.filter((opt) => opt.isActive !== false)
      : [];

    if (activeNexusOptions.length > 0) {
      return activeNexusOptions.map((opt) => {
        const isSucursal = /sucursal/i.test(`${opt.name} ${opt.description ?? ""}`);
        return {
          id: `nexus-${opt.id}`,
          carrier: slugify(opt.name) || `nexus-${opt.id}`,
          carrierName: opt.name,
          service: isSucursal ? ("sucursal" as const) : ("domicilio" as const),
          label: opt.description ? `${opt.name} · ${opt.description}` : opt.name,
          price: Math.max(0, Number(opt.price || 0)),
          etaMin: 2,
          etaMax: 6,
        };
      });
    }

    // Si no se cargaron tarifas manuales en public-options de Nexus, cotizar Correo Argentino / Vía Cargo por CP y peso
    return estimateByZipAndWeight(zip, weightGrams);
  },
  async freeShippingFrom(): Promise<number> {
    return FREE_SHIPPING_FROM;
  },
};

// ---------------------------------------------------------------------------
// Medios de Pago, Descuentos y Mercado Pago Checkout Pro administrados en Nexus
// ---------------------------------------------------------------------------

interface NexusPaymentTypeRow {
  id: number;
  name: string;
  code?: string | null;
  isActive?: boolean;
}

interface NexusPaymentDiscountRow {
  id: number;
  paymentTypeId: number;
  paymentTypeName: string;
  percentage: number;
  description?: string | null;
  isActive: boolean;
  isEcommerceEnabled: boolean;
}

export interface InstallmentRule {
  minAmount: number;
  maxInstallments: number;
}

export interface EcommercePaymentMethodConfig {
  method: Order["paymentMethod"];
  enabled: boolean;
  label: string;
  discountPercent: number;
  description?: string;
  onlyPickup?: boolean;
}

export interface EcommercePaymentConfig {
  methods: EcommercePaymentMethodConfig[];
  installmentRules: InstallmentRule[];
  mpConnected: boolean;
}

function classifyPaymentMethod(name: string, code?: string | null): Order["paymentMethod"] | null {
  const text = normalize(`${name} ${code ?? ""}`);
  if (/mercado\s*pago|\bmp\b|checkout\s*pro|billetera/.test(text)) return "mercadopago";
  if (/transf|banco|bancaria|cbu|alias|cvu/.test(text)) return "transferencia";
  if (/efectivo|cash|local|contado|mostrador|sucursal/.test(text)) return "local";
  return null;
}

export function resolveInstallmentsForAmount(amount: number, rules: InstallmentRule[]): number {
  if (!rules || rules.length === 0) return 3;
  const sorted = [...rules].sort((a, b) => b.minAmount - a.minAmount);
  const matched = sorted.find((r) => amount >= r.minAmount);
  return matched ? Math.max(1, matched.maxInstallments) : 1;
}

export async function nexusGetPaymentConfig(): Promise<EcommercePaymentConfig> {
  const { companyId } = getNexusConfig();

  const [paymentTypesRes, discountsRes, mpCredsRes] = await Promise.all([
    nexusAuthFetch<{ status?: number; info?: NexusPaymentTypeRow[] }>("/payment-type").catch(() => null),
    nexusFetch<{ success?: boolean; info?: NexusPaymentDiscountRow[] }>(
      `/payment/discounts/ecommerce/${companyId}`,
    ).catch(() => null),
    nexusAuthFetch<{
      accessToken?: string;
      installmentRules?: InstallmentRule[];
    }>("/payment-integrations/MERCADOPAGO/credentials").catch(() => null),
  ]);

  const paymentTypes = Array.isArray(paymentTypesRes?.info)
    ? paymentTypesRes!.info.filter((pt) => pt.isActive !== false)
    : [];
  const discounts = Array.isArray(discountsRes?.info)
    ? discountsRes!.info.filter((d) => d.isActive && d.isEcommerceEnabled)
    : [];

  const mpConnected = Boolean(mpCredsRes?.accessToken);
  const installmentRules: InstallmentRule[] =
    Array.isArray(mpCredsRes?.installmentRules) && mpCredsRes!.installmentRules.length > 0
      ? mpCredsRes!.installmentRules
      : [{ minAmount: 0, maxInstallments: 3 }];

  // Si la empresa ya creó tipos de pago en Nexus, habilitamos exactamente los que estén activos y soportados.
  // Si todavía no cargó ninguno en Nexus (0 registros), dejamos los 3 habilitados por defecto.
  const matchedMethods = new Set<Order["paymentMethod"]>();
  for (const pt of paymentTypes) {
    const m = classifyPaymentMethod(pt.name, pt.code);
    if (m) matchedMethods.add(m);
  }
  const hasConfiguredTypes = matchedMethods.size > 0;

  const discountByMethod = new Map<Order["paymentMethod"], { pct: number; desc?: string }>();
  for (const d of discounts) {
    const m = classifyPaymentMethod(d.paymentTypeName);
    if (m) {
      discountByMethod.set(m, {
        pct: Number(d.percentage || 0),
        desc: d.description?.trim() || undefined,
      });
    }
  }

  const maxCuotas = Math.max(...installmentRules.map((r) => r.maxInstallments), 1);
  const mpLabel =
    maxCuotas > 1
      ? `Mercado Pago (tarjetas, hasta ${maxCuotas} cuotas sin interés)`
      : "Mercado Pago (tarjetas, débito y dinero en cuenta)";

  const buildMethod = (
    method: Order["paymentMethod"],
    baseLabel: string,
    onlyPickup = false,
  ): EcommercePaymentMethodConfig => {
    const disc = discountByMethod.get(method);
    const pct = disc?.pct ?? 0;
    const suffix = pct > 0 ? ` · ${pct}% OFF` : pct < 0 ? ` · ${Math.abs(pct)}% recargo` : "";
    return {
      method,
      enabled: hasConfiguredTypes ? matchedMethods.has(method) : true,
      label: `${baseLabel}${suffix}`,
      discountPercent: pct,
      description: disc?.desc,
      onlyPickup,
    };
  };

  return {
    methods: [
      buildMethod("mercadopago", mpLabel, false),
      buildMethod("transferencia", "Transferencia bancaria", false),
      buildMethod("local", "Pago en el local (solo con retiro)", true),
    ],
    installmentRules,
    mpConnected,
  };
}

/**
 * Solicita a Nexus que cree la preferencia de Mercado Pago Checkout Pro usando
 * las credenciales y reglas de cuotas que la empresa conectó en Nexus (`/integrations/wallets`).
 */
export async function nexusCreateMercadoPagoCheckout(
  order: Order,
  siteUrl: string,
): Promise<{ redirectUrl: string }> {
  const saleId = saleIdByOrderStore.get(order.id);
  if (!saleId) {
    throw new Error("No se encontró el identificador de venta en Nexus para iniciar el pago");
  }

  const res = await nexusAuthFetch<{ redirectUrl?: string; status?: number }>("/mercadopago/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      externalReference: `order-${saleId}`,
      total: order.total,
      product: [
        {
          id: saleId,
          name: `Pedido ${order.id}`,
          quantity: 1,
          price: order.total,
        },
      ],
      client: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
    }),
  });

  if (!res?.redirectUrl) {
    throw new Error("Nexus no devolvió la URL de pago de Mercado Pago");
  }

  return { redirectUrl: res.redirectUrl };
}

/**
 * Sincroniza en Nexus el retorno de Mercado Pago Checkout Pro.
 */
export async function nexusSyncMercadoPagoReturn(
  orderId: string,
  params: { paymentId?: string; status?: string; externalReference?: string },
): Promise<OrderStatus | null> {
  const rawStatus = (params.status || "").toLowerCase();
  const saleId =
    saleIdByOrderStore.get(orderId) ||
    (params.externalReference?.startsWith("order-") ? params.externalReference.slice(6) : undefined);

  if (params.paymentId && (params.externalReference || saleId)) {
    const extRef = params.externalReference || `order-${saleId}`;
    const ret = await nexusFetch<{ success?: boolean; data?: { status?: string } }>("/payment/mercadopago/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_id: String(params.paymentId),
        external_reference: extRef,
      }),
    }).catch(() => null);

    if (ret?.success || ret?.data?.status === "approved" || rawStatus === "approved") {
      await nexusOrders.updateStatus(orderId, "pagado");
      return "pagado";
    }
  } else if (saleId && rawStatus === "approved") {
    const sync = await nexusAuthFetch<{ status?: number; data?: { status?: string } }>(
      `/mercadopago/payment/${saleId}/sync`,
      { method: "POST" },
    ).catch(() => null);
    if (sync?.data?.status === "approved") {
      await nexusOrders.updateStatus(orderId, "pagado");
      return "pagado";
    }
  }

  if (["rejected", "cancelled", "canceled", "failure", "null"].includes(rawStatus)) {
    await nexusOrders.updateStatus(orderId, "cancelado");
    return "cancelado";
  }

  return null;
}

/**
 * Resuelve el `orderId` (correlativo) en memoria a partir del `external_reference`
 * (`order-<saleId>`) devuelto por Mercado Pago Checkout Pro.
 */
export function resolveOrderIdByExternalReference(externalReference?: string): string | null {
  if (!externalReference) return null;
  const saleId = externalReference.startsWith("order-")
    ? externalReference.slice(6)
    : externalReference;
  for (const [orderId, sId] of saleIdByOrderStore.entries()) {
    if (sId === saleId && orderStore.has(orderId)) {
      return orderStore.get(orderId)!.id;
    }
  }
  return null;
}

