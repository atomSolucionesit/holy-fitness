"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, cartSubtotal } from "@/store/cart";
import { orderTotals } from "@/lib/domain/rules";
import { Button } from "@/components/ui";
import { formatMoney } from "@/lib/utils";

const input = "h-12 w-full border border-line px-3 text-sm focus:border-ink";
export function CheckoutForm() {
  const { lines, coupon, setCoupon, clear } = useCart();
  const [ship, setShip] = useState<"domicilio" | "retiro">("domicilio");
  const [pay, setPay] = useState<"mercadopago" | "transferencia" | "local">("mercadopago");
  const [zip, setZip] = useState(""); const [code, setCode] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const t = orderTotals(lines.map((l) => ({ unitPrice: l.price, qty: l.qty })), coupon, ship, zip);
  const applyCoupon = () => { const c = code.trim().toUpperCase(); if (["BIENVENIDA10", "HOLY15"].includes(c)) { setCoupon(c); setErr(""); } else setErr("Cupón inválido"); };
  if (lines.length === 0) return <div className="py-20 text-center"><p className="display text-3xl">Tu carrito está vacío</p><div className="mt-6"><Button href="/">Ir a la tienda</Button></div></div>;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget); const g = (k: string) => String(f.get(k) ?? "");
    const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      items: lines.map((l) => ({ variantId: l.variantId, slug: l.slug, qty: l.qty })), coupon,
      customer: { name: g("name"), email: g("email"), phone: g("phone") }, shippingMethod: ship, paymentMethod: pay,
      address: ship === "domicilio" ? { street: g("street"), city: g("city"), province: g("province"), zip } : undefined }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(data.error ?? "No pudimos procesar tu pedido"); setBusy(false); return; }
    clear(); window.location.href = data.redirectUrl;
  }
  const sec = "mb-8"; const h = "label mb-3 text-sm";
  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div>
        <section className={sec}><h2 className={h}>1. Contacto</h2><div className="grid gap-3 md:grid-cols-2"><input name="name" required placeholder="Nombre y apellido" autoComplete="name" className={input} /><input name="email" type="email" required placeholder="Email" autoComplete="email" className={input} /><input name="phone" required placeholder="Teléfono" autoComplete="tel" className={input} /></div></section>
        <section className={sec}><h2 className={h}>2. Envío</h2>
          <div className="grid gap-2">{([["domicilio", "Envío a domicilio"], ["retiro", "Retiro en el local (gratis)"]] as const).map(([v, l]) => <label key={v} className="flex items-center gap-3 border border-line p-4"><input type="radio" name="ship" checked={ship === v} onChange={() => setShip(v)} className="accent-black" />{l}</label>)}</div>
          {ship === "domicilio" && <div className="mt-3 grid gap-3 md:grid-cols-2"><input name="street" required placeholder="Calle y número" className={`${input} md:col-span-2`} /><input name="city" required placeholder="Ciudad" className={input} /><input name="province" required placeholder="Provincia" className={input} /><input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 4))} required inputMode="numeric" placeholder="Código postal (4 dígitos)" className={input} /></div>}</section>
        <section className={sec}><h2 className={h}>3. Pago</h2>
          <div className="grid gap-2">{([["mercadopago", "Mercado Pago (tarjetas, hasta 3 cuotas sin interés)"], ["transferencia", "Transferencia bancaria"], ["local", "Pago en el local (solo con retiro)"]] as const).map(([v, l]) => {
            const off = v === "local" && ship !== "retiro";
            return <label key={v} className={`flex items-center gap-3 border border-line p-4 ${off ? "opacity-40" : ""}`}><input type="radio" name="pay" disabled={off} checked={pay === v} onChange={() => setPay(v)} className="accent-black" />{l}</label>; })}</div></section>
      </div>
      <aside className="h-fit border border-line p-5 lg:sticky lg:top-6">
        <h2 className="label mb-4">Resumen</h2>
        <ul className="divide-y divide-line">{lines.map((l) => <li key={l.variantId} className="flex gap-3 py-3 text-sm"><div className="relative h-20 w-16 bg-surface"><Image src={l.image} alt="" fill unoptimized className="object-cover" /></div><div className="flex-1"><p className="font-semibold">{l.name}</p><p className="text-muted">{l.color} / {l.size} × {l.qty}</p></div><p>{formatMoney(l.price * l.qty)}</p></li>)}</ul>
        <div className="mt-4 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Cupón" aria-label="Cupón" className={input} /><button type="button" onClick={applyCoupon} className="label border border-ink px-4">Aplicar</button></div>
        <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(cartSubtotal(lines))}</dd></div>
          {t.discount > 0 && <div className="flex justify-between"><dt>Cupón {coupon}</dt><dd>-{formatMoney(t.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Envío</dt><dd>{t.shipping ? formatMoney(t.shipping) : "Gratis"}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatMoney(t.total)}</dd></div></dl>
        {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
        <div className="mt-4"><Button full disabled={busy} type="submit">{busy ? "Procesando…" : "Confirmar pedido"}</Button></div>
        <p className="mt-3 text-xs text-muted">Al confirmar aceptás los <Link href="/legales/terminos" className="underline">términos y condiciones</Link>.</p>
      </aside>
    </form>
  );
}
