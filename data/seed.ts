import type { Badge, Category, Collection, ColorOption, Gender, Product, Variant } from "@/lib/domain/types";
import { slugify } from "@/lib/utils";

const C = {
  negro: { name: "Negro", hex: "#111111", tone: "d9d9d9" },
  blanco: { name: "Blanco", hex: "#f5f5f5", tone: "efefef" },
  gris: { name: "Gris", hex: "#8a8a8a", tone: "cfcfcf" },
  arena: { name: "Arena", hex: "#d6c3a5", tone: "e6dccb" },
  oliva: { name: "Oliva", hex: "#5b6b46", tone: "c9d0bd" },
  bordo: { name: "Bordó", hex: "#6d1f2b", tone: "dcc3c7" },
  lila: { name: "Lila", hex: "#b9a4d6", tone: "e3dbef" },
  azul: { name: "Azul noche", hex: "#1c2a4a", tone: "c5cbda" },
} as const;
type CK = keyof typeof C;

const CLOTHES = ["XS", "S", "M", "L", "XL"];
const ONE = ["Único"];
const SHOES = ["35", "36", "37", "38", "39", "40"];

type Seed = [name: string, gender: Gender, category: string, fit: string, price: number, colors: CK[], activities: string[], collections: string[], opts?: { off?: number; badges?: Badge[]; sizes?: string[] }];

const SEEDS: Seed[] = [
  ["Calza Sculpt Cintura Alta", "mujer", "calzas", "soporte alto", 52990, ["negro", "oliva", "bordo"], ["lifting", "hiit"], ["sculpt"], { badges: ["MÁS VENDIDO"] }],
  ["Calza Seamless Flow", "mujer", "calzas", "sin costuras", 48990, ["negro", "lila", "arena"], ["pilates", "lifting"], ["flow"], { badges: ["NUEVO"] }],
  ["Calza Biker Corta", "mujer", "calzas", "ajuste ceñido", 36990, ["negro", "gris", "azul"], ["hiit", "running"], ["sculpt"] ],
  ["Calza Oxford Térmica", "mujer", "calzas", "térmica", 57990, ["negro", "azul"], ["running"], ["invierno"], { off: 20 }],
  ["Top Sculpt Soporte Medio", "mujer", "tops", "soporte medio", 32990, ["negro", "oliva", "lila"], ["lifting", "pilates"], ["sculpt"], { badges: ["MÁS VENDIDO"] }],
  ["Top Impact Soporte Alto", "mujer", "tops", "soporte alto", 38990, ["negro", "bordo"], ["running", "hiit"], ["impact"], { badges: ["NUEVO"] }],
  ["Top Flow Bandeau", "mujer", "tops", "soporte ligero", 27990, ["blanco", "arena", "lila"], ["pilates"], ["flow"] ],
  ["Remera Crop Boxy", "mujer", "remeras", "boxy", 28990, ["blanco", "negro", "arena"], ["lifting"], ["essentials"] ],
  ["Remera Oversized Holy", "mujer", "remeras", "oversized", 31990, ["negro", "blanco", "gris"], ["lifting", "descanso"], ["essentials"], { badges: ["NUEVO"] }],
  ["Musculosa Racer Back", "mujer", "remeras", "slim fit", 24990, ["negro", "lila"], ["running", "hiit"], ["impact"], { off: 25 }],
  ["Short Ciclista Seamless", "mujer", "shorts", "ajuste ceñido", 29990, ["negro", "oliva", "azul"], ["hiit", "pilates"], ["flow"] ],
  ["Short Running Liviano", "mujer", "shorts", "liviano", 26990, ["negro", "lila"], ["running"], ["impact"] ],
  ["Buzo Crop Fleece", "mujer", "buzos", "relajado", 54990, ["gris", "arena", "bordo"], ["descanso"], ["invierno"], { badges: ["NUEVO"] }],
  ["Campera Cortaviento Pack", "mujer", "camperas", "liviana", 76990, ["negro", "lila"], ["running"], ["invierno"], { off: 15 }],
  ["Jogger Cargo Relax", "mujer", "joggers", "relajado", 49990, ["gris", "oliva", "negro"], ["descanso"], ["essentials"] ],
  ["Conjunto Lounge Set", "mujer", "conjuntos", "relajado", 69990, ["arena", "gris"], ["descanso", "pilates"], ["flow"], { badges: ["ÚLTIMAS UNIDADES"] }],
  ["Calza Flare Yoga", "mujer", "calzas", "oxford", 49990, ["negro", "gris", "bordo"], ["pilates", "descanso"], ["flow"], { badges: ["NUEVO"] }],
  ["Top Cruzado Pilates", "mujer", "tops", "soporte ligero", 29990, ["lila", "arena", "negro"], ["pilates"], ["flow"] ],
  ["Pollera Short Training", "mujer", "shorts", "con short interno", 32990, ["negro", "blanco", "lila"], ["running", "hiit"], ["impact"], { badges: ["NUEVO"] }],
  ["Zapatilla Running Cloud", "zapatillas", "running", "amortiguación alta", 119990, ["negro", "lila", "blanco"], ["running"], ["impact"], { sizes: SHOES, badges: ["MÁS VENDIDO"] }],
  ["Zapatilla Running Tempo", "zapatillas", "running", "liviana", 109990, ["negro", "bordo"], ["running", "hiit"], ["impact"], { sizes: SHOES, badges: ["NUEVO"] }],
  ["Zapatilla Trail Grip", "zapatillas", "running", "agarre extra", 129990, ["oliva", "negro"], ["running"], ["invierno"], { sizes: SHOES, off: 15 }],
  ["Zapatilla Training Lift", "zapatillas", "training", "suela plana", 99990, ["blanco", "negro", "arena"], ["lifting"], ["sculpt"], { sizes: SHOES, badges: ["MÁS VENDIDO"] }],
  ["Zapatilla Training HIIT", "zapatillas", "training", "estable", 104990, ["negro", "lila"], ["hiit", "lifting"], ["sculpt"], { sizes: SHOES }],
  ["Zapatilla Studio Flex", "zapatillas", "training", "flexible", 89990, ["arena", "lila", "blanco"], ["pilates"], ["flow"], { sizes: SHOES, badges: ["NUEVO"] }],
  ["Zapatilla Running Daily", "zapatillas", "running", "uso diario", 99990, ["gris", "lila"], ["running"], ["essentials"], { sizes: SHOES }],
  ["Zapatilla Urbana Platform", "zapatillas", "urbanas", "plataforma", 94990, ["blanco", "arena"], ["descanso"], ["essentials"], { sizes: SHOES, badges: ["NUEVO"] }],
  ["Zapatilla Urbana Classic", "zapatillas", "urbanas", "clásica", 84990, ["blanco", "negro", "gris"], ["descanso"], ["essentials"], { sizes: SHOES, off: 20 }],
  ["Zapatilla Urbana Knit", "zapatillas", "urbanas", "tejido elástico", 79990, ["negro", "gris", "lila"], ["descanso"], ["essentials"], { sizes: SHOES }],
  ["Zapatilla Urbana Suede", "zapatillas", "urbanas", "gamuza", 99990, ["arena", "bordo"], ["descanso"], ["invierno"], { sizes: SHOES, badges: ["ÚLTIMAS UNIDADES"] }],
  ["Gorra Holy Dad Hat", "accesorios", "gorras", "ajustable", 17990, ["negro", "arena", "blanco"], ["descanso"], ["essentials"], { sizes: ONE, badges: ["MÁS VENDIDO"] }],
  ["Gorra Running Mesh", "accesorios", "gorras", "liviana", 18990, ["negro", "lila"], ["running"], ["impact"], { sizes: ONE }],
  ["Mochila Gym 25L", "accesorios", "mochilas", "25 litros", 46990, ["negro", "oliva"], ["lifting"], ["essentials"], { sizes: ONE, badges: ["NUEVO"] }],
  ["Bolso Duffle 40L", "accesorios", "mochilas", "40 litros", 59990, ["negro", "gris"], ["lifting", "hiit"], ["essentials"], { sizes: ONE }],
  ["Botella Térmica 750ml", "accesorios", "botellas", "750 ml", 21990, ["negro", "blanco", "lila"], ["lifting", "running"], ["essentials"], { sizes: ONE }],
  ["Shaker Holy 600ml", "accesorios", "botellas", "600 ml", 12990, ["negro", "blanco"], ["lifting"], ["essentials"], { sizes: ONE, off: 20 }],
  ["Medias Crew x3", "accesorios", "medias", "pack x3", 14990, ["blanco", "negro", "gris"], ["running", "lifting"], ["essentials"], { sizes: ["35-38", "38-41"] }],
  ["Medias Invisibles x3", "accesorios", "medias", "pack x3", 12990, ["blanco", "negro"], ["running", "hiit"], ["essentials"], { sizes: ["35-38", "38-41"] }],
  ["Straps de Levantamiento", "accesorios", "gym", "agarre", 15990, ["negro"], ["lifting"], ["sculpt"], { sizes: ONE }],
  ["Banda Elástica Set x3", "accesorios", "gym", "resistencia", 19990, ["negro", "lila"], ["pilates", "hiit"], ["flow"], { sizes: ONE, badges: ["NUEVO"] }],
  ["Mat de Yoga Pilates 6mm", "accesorios", "gym", "6 mm", 28990, ["negro", "lila", "arena"], ["pilates"], ["flow"], { sizes: ONE }],
];

const PHOTOS: Record<string, string> = {
  "mujer/calzas": "m-calzas", "mujer/tops": "m-tops", "mujer/remeras": "m-remeras", "mujer/shorts": "m-shorts", "mujer/buzos": "m-buzos",
  "mujer/camperas": "m-camperas", "mujer/joggers": "m-conjuntos", "mujer/conjuntos": "m-conjuntos",
  "zapatillas/running": "z-running", "zapatillas/training": "z-training", "zapatillas/urbanas": "z-urbanas",
  "accesorios/gorras": "a-gorras", "accesorios/mochilas": "a-mochilas", "accesorios/botellas": "a-botellas", "accesorios/medias": "a-medias", "accesorios/gym": "a-gym",
};
const photoFor = (gender: string, category: string) => `/img/${PHOTOS[`${gender}/${category}`] ?? "m-calzas"}.jpg`;

function rnd(seed: number) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

export const PRODUCTS: Product[] = SEEDS.map(([name, gender, category, fit, price, colors, activities, collections, opts], idx) => {
  const r = rnd(idx + 7);
  const sizes = opts?.sizes ?? CLOTHES;
  const colorOpts: ColorOption[] = colors.map((c) => ({
    name: C[c].name, hex: C[c].hex,
    images: [photoFor(gender, category)],
  }));
  const variants: Variant[] = [];
  colors.forEach((c) => sizes.forEach((s) => {
    const roll = r();
    const stock = roll < 0.12 ? 0 : roll < 0.3 ? Math.ceil(r() * 3) : 5 + Math.floor(r() * 25);
    variants.push({ id: `${slugify(name)}-${slugify(C[c].name)}-${slugify(s)}`, sku: `HF-${String(idx + 1).padStart(3, "0")}-${c.slice(0, 3).toUpperCase()}-${s}`, color: C[c].name, size: s, stock });
  }));
  const off = opts?.off;
  const rating = Math.round((4.2 + r() * 0.75) * 10) / 10;
  return {
    id: `p${idx + 1}`, slug: slugify(name), name, fit, gender, category, activities, collections,
    price: off ? Math.round((price * (100 - off)) / 100 / 10) * 10 : price,
    compareAtPrice: off ? price : undefined,
    badges: opts?.badges ?? [],
    description: gender === "zapatillas"
      ? `${name}. Diseñada para el pie femenino, con horma más angosta en el talón, capellada respirable y una suela pensada para acompañarte en cada entrenamiento.`
      : `${name}. Diseñada en Argentina para acompañarte desde el primer set hasta el último. Tela de alto rendimiento, costuras planas y un calce pensado para moverte sin pensar en la ropa.`,
    composition: gender === "zapatillas"
      ? "Capellada de tejido técnico y sintético, plantilla removible de EVA, suela de caucho. Limpiar con paño húmedo; no lavar a máquina ni secar al sol directo."
      : "88% poliéster reciclado, 12% elastano. Lavar a máquina en frío, del revés. No usar blanqueador. No planchar sobre estampados.",
    colors: colorOpts, variants, rating, reviewCount: 8 + Math.floor(r() * 240),
    createdAt: new Date(Date.UTC(2026, 9, 28) - idx * 4 * 86400000).toISOString(), sales: Math.floor(r() * 900),
    };
});

export const CATEGORIES: Category[] = Array.from(new Map(PRODUCTS.map((p) => [`${p.gender}/${p.category}`, { slug: p.category, name: p.category.charAt(0).toUpperCase() + p.category.slice(1), gender: p.gender }])).values());

export const COLLECTIONS: Collection[] = [
  { slug: "sculpt", name: "Sculpt", tagline: "Prendas que marcan y sostienen cada repetición.", image: "/img/m-calzas.jpg" },
  { slug: "flow", name: "Flow", tagline: "Libertad de movimiento para pilates, yoga y descanso activo.", image: "/img/m-conjuntos.jpg" },
  { slug: "impact", name: "Impact", tagline: "Livianas, rápidas y listas para correr.", image: "/img/m-shorts.jpg" },
  { slug: "essentials", name: "Essentials", tagline: "Los básicos de todos los días.", image: "/img/m-remeras.jpg" },
  { slug: "invierno", name: "Invierno", tagline: "Abrigo técnico para entrenar con frío.", image: "/img/m-camperas.jpg" },
];

export const REVIEWS = [
  { author: "Camila R.", rating: 5, title: "Súper cómoda", body: "El calce es perfecto y no se transparenta. Ya pedí otra." },
  { author: "Lucía P.", rating: 5, title: "Excelente calidad", body: "La tela se siente premium y aguantó muy bien los lavados." },
  { author: "Sofía M.", rating: 4, title: "Muy buena", body: "Talla fiel. Me hubiera gustado que viniera en más colores." },
  { author: "Martina G.", rating: 5, title: "Llegó rapidísimo", body: "Compré online y en dos días lo tenía en casa. Recomendable." },
];
