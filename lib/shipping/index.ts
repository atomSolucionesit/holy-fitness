import "server-only";
import { CARRIERS, tariff, zoneOf, type Carrier, type Service } from "./tariffs";
import type { ShippingOption } from "./types";

export interface QuoteInput { zip: string; weightGrams: number }
export interface ShippingProvider { quote(i: QuoteInput): Promise<ShippingOption[]> }

/** Cotizador de demo basado en el tarifario estimado. */
const estimado: ShippingProvider = {
  async quote({ zip, weightGrams }) {
    const zone = zoneOf(zip);
    if (!zone) return [];
    const out: ShippingOption[] = [];
    for (const carrier of Object.keys(CARRIERS) as Carrier[]) {
      for (const service of ["domicilio", "sucursal"] as Service[]) {
        const t = tariff(carrier, service, zone, weightGrams);
        out.push({ id: `${carrier}-${service}`, carrier, carrierName: CARRIERS[carrier].name, service, label: `${CARRIERS[carrier].name} · ${service === "domicilio" ? "A domicilio" : "A sucursal"}`, price: t.price, etaMin: t.etaMin, etaMax: t.etaMax });
      }
    }
    return out.sort((a, b) => a.price - b.price);
  },
};

// TODO(envios): adaptadores reales (Correo Argentino / Vía Cargo) cuando tengamos credenciales y documentación.
const real: ShippingProvider = { async quote() { throw new Error("Cotizador real de envíos pendiente de implementación"); } };

export const shipping: ShippingProvider = process.env.SHIPPING_SOURCE === "real" ? real : estimado;
