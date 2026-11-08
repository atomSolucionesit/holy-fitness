import type { Order, OrderItem, Product } from "./types";

export const FREE_SHIPPING_FROM = 120000;
export const WELCOME_COUPON = { code: "BIENVENIDA10", pct: 10 };
export const COUPONS: Record<string, number> = { BIENVENIDA10: 10, HOLY15: 15 };

export function couponDiscount(code: string | undefined, subtotal: number) {
  if (!code) return 0;
  const pct = COUPONS[code.toUpperCase()];
  return pct ? Math.round((subtotal * pct) / 100) : 0;
}
export function orderTotals(items: Pick<OrderItem, "unitPrice" | "qty">[], coupon: string | undefined, shipping: number) {
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const discount = couponDiscount(coupon, subtotal);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
export const installments = (price: number, n = 3) => Math.round(price / n);
export const stockOf = (p: Product, color?: string, size?: string) =>
  p.variants.filter((v) => (!color || v.color === color) && (!size || v.size === size)).reduce((a, v) => a + v.stock, 0);
export type { Order };
