import "server-only";
import { catalog } from "@/lib/providers";
import { couponDiscount, FREE_SHIPPING_FROM } from "@/lib/domain/rules";
import { nexusValidateCoupon } from "@/lib/providers/nexus";
import { shipping } from "./index";
import { weightOfCategory } from "./tariffs";
import type { ShippingOption } from "./types";

export interface CartRef { slug: string; qty: number }
/** Cotiza el envío de un carrito: peso, cupón y subtotal salen del servidor (Nexus), nunca del cliente. */
export async function quoteForCart(items: CartRef[], zip: string, coupon?: string) {
  const products = await catalog.getProducts([...new Set(items.map((i) => i.slug))]);
  let subtotal = 0, weight = 0;
  for (const it of items) {
    const p = products.find((x) => x.slug === it.slug);
    if (!p) continue;
    subtotal += p.price * it.qty; weight += weightOfCategory(p.category) * it.qty;
  }

  let discount = 0;
  if (coupon && coupon.trim()) {
    if (process.env.CATALOG_SOURCE === "nexus") {
      const couponRes = await nexusValidateCoupon(coupon, items, false);
      discount = couponRes.isValid ? Math.min(subtotal, couponRes.discount) : 0;
    } else {
      discount = couponDiscount(coupon, subtotal);
    }
  }

  const netSubtotal = Math.max(0, subtotal - discount);
  const [rawOptions, freeFrom] = await Promise.all([
    shipping.quote({ zip, weightGrams: weight, subtotal: netSubtotal, items }),
    shipping.freeShippingFrom ? shipping.freeShippingFrom() : Promise.resolve(FREE_SHIPPING_FROM),
  ]);
  let options: ShippingOption[] = rawOptions;
  const free = netSubtotal >= freeFrom;
  if (free && options.length) {
    // Envío gratis: cubre la opción más económica; si elegís otra pagás la diferencia.
    const cheapest = Math.min(...options.map((o) => o.price));
    options = options.map((o) => ({ ...o, price: Math.max(0, o.price - cheapest) }));
  }
  return { options, subtotal, discount, weight, free };
}
