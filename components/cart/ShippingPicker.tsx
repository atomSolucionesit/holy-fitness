"use client";
import { useCart } from "@/store/cart";
import { useShipping } from "./useShipping";
import { etaText } from "@/lib/shipping/types";
import { cn, formatMoney } from "@/lib/utils";

export function ShippingPicker() {
  const { zip, setZip, setShippingId } = useCart();
  const { options, selected, loading, error, valid } = useShipping();
  return (
    <fieldset>
      <legend className="label mb-2">Envío</legend>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="cp">Código postal</label>
        <input id="cp" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="postal-code" placeholder="Código postal (ej. 1425)" className="h-11 w-full border border-line px-3 text-sm focus:border-ink" />
      </div>
      {!valid && zip.length > 0 && zip.length < 4 && <p className="mt-2 text-xs text-muted">Ingresá los 4 dígitos para cotizar.</p>}
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
      <div className="mt-3 space-y-2" role="radiogroup" aria-label="Opciones de envío" aria-busy={loading}>
        {loading && <p className="text-sm text-muted">Cotizando…</p>}
        {!loading && options.map((o) => (
          <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 border p-3 text-sm", selected.id === o.id ? "border-ink" : "border-line")}>
            <input type="radio" name="shipping" className="accent-black" checked={selected.id === o.id} onChange={() => setShippingId(o.id)} />
            <span className="flex-1"><span className="block font-semibold">{o.label}</span><span className="text-xs text-muted">{etaText(o)}</span></span>
            <span className="font-semibold">{o.price === 0 ? "Gratis" : formatMoney(o.price)}</span>
          </label>
        ))}
      </div>
      {valid && !loading && !error && <p className="mt-2 text-[11px] text-muted">Cotización estimada según código postal y peso.</p>}
    </fieldset>
  );
}
