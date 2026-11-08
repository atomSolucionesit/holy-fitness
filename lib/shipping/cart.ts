import "server-only";
import { catalog } from "@/lib/providers";
import { couponDiscount, FREE_SHIPPING_FROM } from "@/lib/domain/rules";
import { shipping } from "./index";
import { weightOfCategory } from "./tariffs";
import type { ShippingOption } from "./types";

export interface CartRef { slug: string; qty: number }
/** Cotiza el envío de un carrito: peso y subtotal salen del catálogo, nunca del cliente. */
export async function quoteForCart(items: CartRef[], zip: string, coupon?: string) {
  const products = await catalog.getProducts([...new Set(items.map((i) => i.slug))]);
  let subtotal = 0, weight = 0;
  for (const it of items) {
    const p = products.find((x) => x.slug === it.slug);
    if (!p) continue;
    subtotal += p.price * it.qty; weight += weightOfCategory(p.category) * it.qty;
  }
  const discount = couponDiscount(coupon, subtotal);
  let options: ShippingOption[] = await shipping.quote({ zip, weightGrams: weight });
  const free = subtotal - discount >= FREE_SHIPPING_FROM;
  if (free && options.length) {
    // Envío gratis: cubre la opción más económica; si elegís otra pagás la diferencia.
    const cheapest = Math.min(...options.map((o) => o.price));
    options = options.map((o) => ({ ...o, price: Math.max(0, o.price - cheapest) }));
  }
  return { options, subtotal, discount, weight, free };
}
