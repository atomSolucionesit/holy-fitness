"use client";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cart";
import { RETIRO, type ShippingOption } from "@/lib/shipping/types";

type Res = { key: string; options?: ShippingOption[]; error?: string };
/** Cotiza el envío del carrito actual y expone la opción seleccionada (derivada, siempre válida). */
export function useShipping() {
  const { lines, coupon, zip, shippingId } = useCart();
  const [res, setRes] = useState<Res | null>(null);
  const items = useMemo(() => lines.map((l) => ({ slug: l.slug, qty: l.qty })), [lines]);
  const valid = /^\d{4}$/.test(zip) && items.length > 0;
  const key = valid ? JSON.stringify([zip, items, coupon ?? ""]) : "";
  useEffect(() => {
    if (!valid) return;
    const c = new AbortController();
    const t = setTimeout(() => {
      fetch("/api/shipping/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ zip, items, coupon }), signal: c.signal })
        .then(async (r) => { const d = await r.json(); setRes(r.ok ? { key, options: d.options } : { key, error: d.error ?? "No pudimos cotizar" }); })
        .catch((e) => { if (e.name !== "AbortError") setRes({ key, error: "No pudimos cotizar el envío" }); });
    }, 250);
    return () => { clearTimeout(t); c.abort(); };
  }, [valid, key, zip, items, coupon]);
  const fresh = valid && res?.key === key ? res : null;
  const options = [...(fresh?.options ?? []), RETIRO].sort((a, b) => a.price - b.price);
  const loading = valid && !fresh;
  const selected = options.find((o) => o.id === shippingId) ?? (fresh?.options?.length ? fresh.options[0]! : RETIRO);
  return { options, selected, loading, error: fresh?.error, zip, valid };
}
