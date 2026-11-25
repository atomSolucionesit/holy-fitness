"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, cartSubtotal } from "@/store/cart";
import { orderTotals } from "@/lib/domain/rules";
import { ShippingPicker } from "@/components/cart/ShippingPicker";
import { useShipping } from "@/components/cart/useShipping";
import { Button } from "@/components/ui";
import { formatMoney } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/domain/types";

interface PaymentMethodUI {
  method: PaymentMethod;
  enabled: boolean;
  label: string;
  discountPercent: number;
  description?: string;
  onlyPickup?: boolean;
}

const DEFAULT_METHODS: PaymentMethodUI[] = [
  { method: "mercadopago", enabled: true, label: "Mercado Pago (tarjetas, hasta 3 cuotas sin interés)", discountPercent: 0 },
  { method: "transferencia", enabled: true, label: "Transferencia bancaria", discountPercent: 0 },
  { method: "local", enabled: true, label: "Pago en el local (solo con retiro)", discountPercent: 0, onlyPickup: true },
];

const input = "h-12 w-full border border-line px-3 text-sm focus:border-ink";
export function CheckoutForm() {
  const { lines, coupon, couponDiscount, setCoupon, clear } = useCart();
  const { selected, loading: quoting, zip } = useShipping();
  const retiro = selected.id === "retiro";
  const [methods, setMethods] = useState<PaymentMethodUI[]>(DEFAULT_METHODS);
  const [pay, setPay] = useState<PaymentMethod>("mercadopago");
  const [code, setCode] = useState(coupon ?? "");
  const [couponMsg, setCouponMsg] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [prefill, setPrefill] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated && data.customer) {
          const fullName = [data.customer.name, data.customer.lastName].filter(Boolean).join(" ").trim();
          setPrefill({
            name: fullName,
            email: data.customer.email || "",
            phone: data.customer.phone || "",
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.methods)) {
          setMethods(data.methods);
          const enabledList = (data.methods as PaymentMethodUI[]).filter(
            (m) => m.enabled && !(m.onlyPickup && !retiro),
          );
          if (enabledList.length > 0 && !enabledList.some((m) => m.method === pay)) {
            setPay(enabledList[0]!.method);
          }
        }
      })
      .catch(() => undefined);
  }, [retiro, pay]);

  const visibleMethods = methods.filter((m) => m.enabled);
  const activeMethodCfg = visibleMethods.find((m) => m.method === pay);
  const subtotal = cartSubtotal(lines);
  const baseCouponDiscount = coupon ? (couponDiscount ?? 0) : 0;
  const subAfterCoupon = Math.max(0, subtotal - baseCouponDiscount);
  const payDiscountAmount =
    activeMethodCfg && activeMethodCfg.discountPercent > 0
      ? Math.round((subAfterCoupon * activeMethodCfg.discountPercent) / 100)
      : 0;
  const combinedDiscount =
    coupon || payDiscountAmount > 0 ? baseCouponDiscount + payDiscountAmount : undefined;

  const t = orderTotals(
    lines.map((l) => ({ unitPrice: l.price, qty: l.qty })),
    coupon,
    selected.price,
    combinedDiscount,
  );

  const applyCoupon = async () => {
    const c = code.trim().toUpperCase();
    if (!c) {
      setCoupon(undefined, undefined);
      setCouponMsg("");
      return;
    }
    setCheckingCoupon(true);
    setErr("");
    setCouponMsg("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: c,
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.valid) {
        setCoupon(undefined, undefined);
        setErr(data.error ?? "Cupón inválido o inactivo");
      } else {
        setCoupon(data.code, Number(data.discount || 0));
        setCode(data.code);
        setCouponMsg(data.message || "Cupón aplicado");
      }
    } catch {
      setErr("No pudimos validar el cupón. Probá de nuevo.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(undefined, undefined);
    setCode("");
    setCouponMsg("");
    setErr("");
  };

  if (lines.length === 0) return <div className="py-20 text-center"><p className="display text-3xl">Tu carrito está vacío</p><div className="mt-6"><Button href="/">Ir a la tienda</Button></div></div>;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    if (!retiro && !/^\d{4}$/.test(zip)) { setErr("Ingresá tu código postal y elegí un envío"); return; }
    if (pay === "local" && !retiro) { setErr("El pago en el local es solo con retiro"); return; }
    setBusy(true);
    const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) ?? "");
    const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      items: lines.map((l) => ({ variantId: l.variantId, slug: l.slug, qty: l.qty })), coupon,
      customer: { name: g("name"), email: g("email"), phone: g("phone") }, shippingId: selected.id, zip: retiro ? undefined : zip, paymentMethod: pay,
      address: retiro ? undefined : { street: g("street") || undefined, city: g("city"), province: g("province") } }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "No pudimos procesar tu pedido"); setBusy(false); return; }
    clear(); window.location.href = data.redirectUrl;
  }
  const sec = "mb-8"; const h = "label mb-3 text-sm";
  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div>
        <section className={sec}><h2 className={h}>1. Contacto</h2><div className="grid gap-3 md:grid-cols-2"><input name="name" required placeholder="Nombre y apellido" autoComplete="name" defaultValue={prefill.name} key={`n-${prefill.name}`} className={input} /><input name="email" type="email" required placeholder="Email" autoComplete="email" defaultValue={prefill.email} key={`e-${prefill.email}`} className={input} /><input name="phone" required placeholder="Teléfono" autoComplete="tel" defaultValue={prefill.phone} key={`p-${prefill.phone}`} className={input} /></div></section>
        <section className={sec}><h2 className={h}>2. Envío</h2>
          <ShippingPicker />
          {!retiro && <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selected.service === "domicilio" && <input name="street" required placeholder="Calle y número" autoComplete="street-address" className={`${input} md:col-span-2`} />}
            <input name="city" required placeholder="Ciudad" autoComplete="address-level2" className={input} />
            <input name="province" required placeholder="Provincia" autoComplete="address-level1" className={input} />
            {selected.service === "sucursal" && <p className="text-xs text-muted md:col-span-2">Retirás en la sucursal de {selected.carrierName} más cercana. Te avisamos cuando llegue.</p>}
          </div>}</section>
        <section className={sec}><h2 className={h}>3. Pago</h2>
          <div className="grid gap-2">
            {visibleMethods.map((m) => {
              const off = (m.onlyPickup || m.method === "local") && !retiro;
              return (
                <label key={m.method} className={`flex items-center gap-3 border border-line p-4 ${off ? "opacity-40" : ""}`}>
                  <input type="radio" name="pay" disabled={off} checked={pay === m.method} onChange={() => setPay(m.method)} className="accent-black" />
                  <span className="flex-1">
                    <span className="block">{m.label}</span>
                    {m.description && <span className="block text-xs text-muted">{m.description}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>
      <aside className="h-fit border border-line p-5 lg:sticky lg:top-6">
        <h2 className="label mb-4">Resumen</h2>
        <ul className="divide-y divide-line">{lines.map((l) => <li key={l.variantId} className="flex gap-3 py-3 text-sm"><div className="relative h-20 w-16 bg-surface"><Image src={l.image} alt="" fill className="object-cover" /></div><div className="flex-1"><p className="font-semibold">{l.name}</p><p className="text-muted">{l.color} / {l.size} × {l.qty}</p></div><p>{formatMoney(l.price * l.qty)}</p></li>)}</ul>
        <div className="mt-4 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Cupón de descuento" aria-label="Cupón" className={input} />
          {coupon ? (
            <button type="button" onClick={removeCoupon} className="label border border-line px-4 text-xs hover:border-ink">Quitar</button>
          ) : (
            <button type="button" disabled={checkingCoupon} onClick={applyCoupon} className="label border border-ink px-4 disabled:opacity-50">{checkingCoupon ? "…" : "Aplicar"}</button>
          )}
        </div>
        {couponMsg && <p className="mt-1.5 text-xs text-ink">{couponMsg} ({coupon})</p>}
        <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
          {baseCouponDiscount > 0 && <div className="flex justify-between"><dt>Cupón {coupon}</dt><dd>-{formatMoney(baseCouponDiscount)}</dd></div>}
          {payDiscountAmount > 0 && <div className="flex justify-between"><dt>Descuento por medio de pago ({activeMethodCfg?.discountPercent}%)</dt><dd>-{formatMoney(payDiscountAmount)}</dd></div>}
          <div className="flex justify-between"><dt>Envío{!retiro ? ` · ${selected.carrierName}` : ""}</dt><dd>{quoting ? "Cotizando…" : t.shipping ? formatMoney(t.shipping) : "Gratis"}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatMoney(t.total)}</dd></div></dl>
        {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
        <div className="mt-4"><Button full disabled={busy || quoting} type="submit">{busy ? "Procesando…" : "Confirmar pedido"}</Button></div>
        <p className="mt-3 text-xs text-muted">Al confirmar aceptás los <Link href="/legales/terminos" className="underline">términos y condiciones</Link>.</p>
      </aside>
    </form>
  );
}
