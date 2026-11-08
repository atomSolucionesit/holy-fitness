"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine { variantId: string; slug: string; name: string; color: string; size: string; price: number; image: string; qty: number; max: number }
interface CartState {
  lines: CartLine[]; coupon?: string; open: boolean; zip: string; shippingId?: string;
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void; remove: (id: string) => void;
  setZip: (z: string) => void; setShippingId: (id?: string) => void;
  setCoupon: (c?: string) => void; clear: () => void; setOpen: (o: boolean) => void;
}
export const useCart = create<CartState>()(persist((set) => ({
  lines: [], open: false, zip: "",
  add: (l, qty = 1) => set((s) => {
    const ex = s.lines.find((x) => x.variantId === l.variantId);
    const lines = ex ? s.lines.map((x) => x.variantId === l.variantId ? { ...x, qty: Math.min(x.qty + qty, l.max) } : x) : [...s.lines, { ...l, qty: Math.min(qty, l.max) }];
    return { lines, open: true };
  }),
  setQty: (id, qty) => set((s) => ({ lines: s.lines.map((x) => x.variantId === id ? { ...x, qty: Math.max(1, Math.min(qty, x.max)) } : x) })),
  remove: (id) => set((s) => ({ lines: s.lines.filter((x) => x.variantId !== id) })),
  setZip: (zip) => set({ zip }), setShippingId: (shippingId) => set({ shippingId }),
  setCoupon: (coupon) => set({ coupon }), clear: () => set({ lines: [], coupon: undefined }), setOpen: (open) => set({ open }),
}), { name: "hf-cart", partialize: (s) => ({ lines: s.lines, coupon: s.coupon, zip: s.zip, shippingId: s.shippingId }) }));

export const cartCount = (l: CartLine[]) => l.reduce((a, x) => a + x.qty, 0);
export const cartSubtotal = (l: CartLine[]) => l.reduce((a, x) => a + x.qty * x.price, 0);
