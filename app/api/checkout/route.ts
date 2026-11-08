import { z } from "zod";
import { catalog, orders } from "@/lib/providers";
import { inventory } from "@/lib/providers";
import { orderTotals } from "@/lib/domain/rules";
import { quoteForCart } from "@/lib/shipping/cart";
import { etaText } from "@/lib/shipping/types";
import { paymentFor } from "@/lib/payments";

const schema = z.object({
  items: z.array(z.object({ variantId: z.string().max(120), slug: z.string().max(120), qty: z.number().int().min(1).max(20) })).min(1).max(50),
  coupon: z.string().max(30).optional(),
  customer: z.object({ name: z.string().trim().min(2, "Ingresá tu nombre"), email: z.string().email("Email inválido"), phone: z.string().trim().min(6, "Teléfono inválido") }),
  shippingId: z.string().max(60),
  zip: z.string().regex(/^\d{4}$/, "Código postal de 4 dígitos").optional(),
  paymentMethod: z.enum(["mercadopago", "transferencia", "local"]),
  address: z.object({ street: z.string().trim().max(120).optional(), city: z.string().trim().min(2, "Ingresá la ciudad"), province: z.string().trim().min(2, "Ingresá la provincia") }).optional(),
});

const hits = new Map<string, number[]>();
function limited(ip: string) { const now = Date.now(); const a = (hits.get(ip) ?? []).filter((t) => now - t < 60000); a.push(now); hits.set(ip, a); return a.length > 10; }

export async function POST(req: Request) {
  if (limited(req.headers.get("x-forwarded-for") ?? "local")) return Response.json({ error: "Demasiados intentos. Probá en un minuto." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  const d = parsed.data;
  const retiro = d.shippingId === "retiro";
  if (!retiro && (!d.zip || !d.address)) return Response.json({ error: "Completá los datos de envío" }, { status: 400 });
  if (!retiro && d.shippingId.endsWith("-domicilio") && !(d.address?.street && d.address.street.length >= 3)) return Response.json({ error: "Ingresá calle y número" }, { status: 400 });
  if (d.paymentMethod === "local" && !retiro) return Response.json({ error: "El pago en el local es solo con retiro" }, { status: 400 });

  // El servidor recalcula precios y verifica stock: nunca se confía en el cliente.
  const products = await catalog.getProducts([...new Set(d.items.map((i) => i.slug))]);
  const stock = await inventory.getStock(d.items.map((i) => i.variantId));
  const items = [];
  for (const it of d.items) {
    const p = products.find((x) => x.slug === it.slug);
    const v = p?.variants.find((x) => x.id === it.variantId);
    if (!p || !v) return Response.json({ error: "Un producto de tu carrito ya no está disponible" }, { status: 409 });
    if ((stock[v.id] ?? 0) < it.qty) return Response.json({ error: `Sin stock suficiente de ${p.name} (${v.color} / ${v.size})` }, { status: 409 });
    items.push({ variantId: v.id, productSlug: p.slug, name: p.name, color: v.color, size: v.size, unitPrice: p.price, qty: it.qty });
  }
  let option: { id: string; carrierName: string; service: string; label: string; eta: string; price: number } | undefined;
  if (!retiro) {
    try {
      const q = await quoteForCart(d.items, d.zip!, d.coupon);
      const o = q.options.find((x) => x.id === d.shippingId);
      if (!o) return Response.json({ error: "La opción de envío elegida ya no está disponible" }, { status: 409 });
      option = { id: o.id, carrierName: o.carrierName, service: o.service, label: o.label, eta: etaText(o), price: o.price };
    } catch { return Response.json({ error: "No pudimos cotizar el envío. Probá de nuevo." }, { status: 502 }); }
  }
  const totals = orderTotals(items, d.coupon, option?.price ?? 0);
  const order = await orders.createOrder({
    items, ...totals, couponCode: d.coupon, shippingMethod: retiro ? "retiro" : "envio", paymentMethod: d.paymentMethod, customer: d.customer,
    shippingOption: option && { id: option.id, carrierName: option.carrierName, service: option.service, label: option.label, eta: option.eta },
    address: retiro ? undefined : { ...d.address!, zip: d.zip! },
  });
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const pay = paymentFor(d.paymentMethod);
  try {
    const redirectUrl = pay ? (await pay.start(order, site)).redirectUrl : `${site}/pedido/${order.id}`;
    return Response.json({ orderId: order.id, redirectUrl });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Error al iniciar el pago" }, { status: 502 });
  }
}
