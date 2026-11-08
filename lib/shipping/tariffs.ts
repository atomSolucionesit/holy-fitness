/**
 * Tarifario ESTIMADO (demo) por zona y peso. Reemplazable por las APIs reales de cada correo
 * (ver docs/ENVIOS.md). Valores en ARS.
 */
export type Carrier = "correo-argentino" | "via-cargo";
export type Zone = "caba" | "gba" | "centro" | "litoral" | "noa" | "interior" | "patagonia";
export type Service = "domicilio" | "sucursal";

export const CARRIERS: Record<Carrier, { name: string }> = {
  "correo-argentino": { name: "Correo Argentino" },
  "via-cargo": { name: "Vía Cargo" },
};

export function zoneOf(zip: string): Zone | null {
  const n = parseInt(zip.replace(/\D/g, "").slice(0, 4), 10);
  if (!/^\d{4}$/.test(zip) || Number.isNaN(n) || n < 1000) return null;
  if (n <= 1499) return "caba";
  if (n <= 1999) return "gba";
  if (n <= 2999) return "centro";
  if (n <= 3999) return "litoral";
  if (n <= 4999) return "noa";
  if (n <= 5999) return "centro";
  if (n <= 7999) return "interior";
  return "patagonia";
}

// Precio base (hasta 1 kg) a domicilio por zona.
const BASE: Record<Carrier, Record<Zone, number>> = {
  "correo-argentino": { caba: 5200, gba: 6100, centro: 7800, litoral: 8600, noa: 9400, interior: 8200, patagonia: 11800 },
  "via-cargo": { caba: 5900, gba: 6600, centro: 7200, litoral: 8100, noa: 9900, interior: 7600, patagonia: 12600 },
};
const PER_KG: Record<Carrier, number> = { "correo-argentino": 900, "via-cargo": 800 };
const SUCURSAL_FACTOR: Record<Carrier, number> = { "correo-argentino": 0.7, "via-cargo": 0.75 };
// Plazo en días hábiles [min, max] por zona.
const ETA: Record<Carrier, Record<Zone, [number, number]>> = {
  "correo-argentino": { caba: [2, 4], gba: [2, 4], centro: [3, 6], litoral: [4, 7], noa: [5, 8], interior: [4, 7], patagonia: [6, 10] },
  "via-cargo": { caba: [1, 3], gba: [2, 3], centro: [2, 4], litoral: [3, 5], noa: [4, 7], interior: [3, 5], patagonia: [5, 8] },
};

export function tariff(carrier: Carrier, service: Service, zone: Zone, weightGrams: number) {
  const kg = Math.max(1, Math.ceil(weightGrams / 1000));
  const domicilio = BASE[carrier][zone] + (kg - 1) * PER_KG[carrier];
  const price = service === "sucursal" ? Math.round((domicilio * SUCURSAL_FACTOR[carrier]) / 10) * 10 : domicilio;
  const [etaMin, etaMax] = ETA[carrier][zone];
  return { price, etaMin: service === "sucursal" ? etaMin : etaMin + 0, etaMax };
}

// Peso estimado por prenda (gramos), por categoría.
export const WEIGHTS: Record<string, number> = {
  calzas: 350, tops: 200, remeras: 250, shorts: 250, buzos: 700, camperas: 900, joggers: 600, conjuntos: 800,
  gorras: 120, mochilas: 800, botellas: 400, medias: 150, gym: 500,
};
export const weightOfCategory = (c: string) => WEIGHTS[c] ?? 400;
