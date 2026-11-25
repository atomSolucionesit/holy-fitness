import "server-only";
import type { Order } from "@/lib/domain/types";
import { nexusCreateMercadoPagoCheckout } from "@/lib/providers/nexus";

export interface PaymentResult { redirectUrl: string }
export interface PaymentProvider { start(order: Order, siteUrl: string): Promise<PaymentResult> }

/**
 * Mercado Pago Checkout Pro administrado desde Nexus (`/integrations/wallets`).
 * Usa las credenciales y reglas de cuotas que la empresa conectó en su cuenta de Nexus.
 */
const nexusMercadoPago: PaymentProvider = {
  async start(o, site) {
    return nexusCreateMercadoPagoCheckout(o, site);
  },
};

export function paymentFor(method: Order["paymentMethod"]): PaymentProvider | null {
  if (method !== "mercadopago") return null;
  return nexusMercadoPago;
}
