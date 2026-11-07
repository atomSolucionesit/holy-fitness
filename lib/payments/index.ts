import "server-only";
import type { Order } from "@/lib/domain/types";

export interface PaymentResult { redirectUrl: string }
export interface PaymentProvider { start(order: Order, siteUrl: string): Promise<PaymentResult> }

/** Modo desarrollo: "paga" al instante yendo directo a la confirmación. */
const simulado: PaymentProvider = { async start(o, site) { return { redirectUrl: `${site}/pedido/${o.id}?pago=simulado` }; } };

/** Mercado Pago Checkout Pro (preferencia). Requiere MERCADOPAGO_ACCESS_TOKEN. */
const mercadopago: PaymentProvider = {
  async start(o, site) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({
        items: o.items.map((i) => ({ title: `${i.name} - ${i.color} / ${i.size}`, quantity: i.qty, unit_price: i.unitPrice, currency_id: "ARS" })),
        external_reference: o.id, payer: { email: o.customer.email },
        back_urls: { success: `${site}/pedido/${o.id}`, failure: `${site}/pedido/${o.id}`, pending: `${site}/pedido/${o.id}` },
        auto_return: "approved", notification_url: `${site}/api/payments/mercadopago/webhook`,
      }),
    });
    if (!res.ok) throw new Error("No se pudo iniciar el pago con Mercado Pago");
    const data = (await res.json()) as { init_point: string };
    return { redirectUrl: data.init_point };
  },
};
// TODO: webhook /api/payments/mercadopago/webhook (verificar firma x-signature y consultar el pago antes de marcar "pagado").

export function paymentFor(method: Order["paymentMethod"]): PaymentProvider | null {
  if (method !== "mercadopago") return null;
  return process.env.PAYMENTS_MODE === "mercadopago" ? mercadopago : simulado;
}
