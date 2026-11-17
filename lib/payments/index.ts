import "server-only";
import type { Order } from "@/lib/domain/types";
import { nexusCreateMercadoPagoCheckout, nexusGetPaymentConfig } from "@/lib/providers/nexus";

export interface PaymentResult { redirectUrl: string }
export interface PaymentProvider { start(order: Order, siteUrl: string): Promise<PaymentResult> }

/** Modo desarrollo: "paga" al instante yendo directo a la confirmación. */
const simulado: PaymentProvider = {
  async start(o, site) {
    return { redirectUrl: `${site}/pedido/${o.id}?pago=simulado` };
  },
};

/**
 * Mercado Pago Checkout Pro administrado desde Nexus (`/integrations/wallets`).
 * Usa las credenciales y reglas de cuotas que la empresa conectó en su cuenta de Nexus.
 */
const nexusMercadoPago: PaymentProvider = {
  async start(o, site) {
    try {
      return await nexusCreateMercadoPagoCheckout(o, site);
    } catch (err) {
      // Solo hacemos fallback a simulado en desarrollo cuando la empresa aún no conectó
      // su cuenta de Mercado Pago en Nexus y PAYMENTS_MODE no fuerza "mercadopago".
      if (process.env.NODE_ENV !== "production" && process.env.PAYMENTS_MODE !== "mercadopago") {
        const cfg = await nexusGetPaymentConfig().catch(() => null);
        if (!cfg?.mpConnected) {
          return simulado.start(o, site);
        }
      }
      throw err;
    }
  },
};

/** Mercado Pago directo con MERCADOPAGO_ACCESS_TOKEN local (solo cuando no se usa Nexus). */
const mercadopagoDirecto: PaymentProvider = {
  async start(o, site) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({
        items: o.items.map((i) => ({
          title: `${i.name} - ${i.color} / ${i.size}`,
          quantity: i.qty,
          unit_price: i.unitPrice,
          currency_id: "ARS",
        })),
        external_reference: o.id,
        payer: { email: o.customer.email },
        back_urls: {
          success: `${site}/pedido/${o.id}`,
          failure: `${site}/pedido/${o.id}`,
          pending: `${site}/pedido/${o.id}`,
        },
        auto_return: "approved",
        notification_url: `${site}/api/payments/mercadopago/webhook`,
      }),
    });
    if (!res.ok) throw new Error("No se pudo iniciar el pago con Mercado Pago");
    const data = (await res.json()) as { init_point: string };
    return { redirectUrl: data.init_point };
  },
};

export function paymentFor(method: Order["paymentMethod"]): PaymentProvider | null {
  if (method !== "mercadopago") return null;
  const mode = process.env.PAYMENTS_MODE || "nexus";
  if (mode === "simulado") return simulado;
  if (mode === "nexus" || process.env.ORDERS_SOURCE === "nexus") {
    return nexusMercadoPago;
  }
  return mode === "mercadopago" ? mercadopagoDirecto : simulado;
}
