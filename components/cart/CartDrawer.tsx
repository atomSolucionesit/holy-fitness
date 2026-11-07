"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart, cartSubtotal } from "@/store/cart";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui";
import { FREE_SHIPPING_FROM } from "@/lib/domain/rules";
import { formatMoney } from "@/lib/utils";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const sub = cartSubtotal(lines);
  const left = Math.max(0, FREE_SHIPPING_FROM - sub);
  return (
    <Drawer open={open} onOpenChange={setOpen} title="Tu carrito">
      <div className="border-b border-line px-5 py-3 text-sm">
        {left > 0 ? <p>Te faltan <b>{formatMoney(left)}</b> para el envío gratis</p> : <p><b>¡Tenés envío gratis!</b></p>}
        <div className="mt-2 h-1 bg-surface"><div className="h-full bg-ink transition-all" style={{ width: `${Math.min(100, (sub / FREE_SHIPPING_FROM) * 100)}%` }} /></div>
      </div>
      <div className="flex-1 overflow-y-auto px-5">
        {lines.length === 0 ? <p className="py-12 text-center text-muted">Tu carrito está vacío.</p> : lines.map((l) => (
          <div key={l.variantId} className="flex gap-3 border-b border-line py-4">
            <div className="relative h-28 w-22 shrink-0 bg-surface"><Image src={l.image} alt="" fill unoptimized className="object-cover" /></div>
            <div className="flex flex-1 flex-col text-sm">
              <Link href={`/producto/${l.slug}`} onClick={() => setOpen(false)} className="font-semibold">{l.name}</Link>
              <p className="text-muted">{l.color} / {l.size}</p>
              <p className="mt-1">{formatMoney(l.price)}</p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center border border-line">
                  <button className="h-8 w-8" aria-label="Menos" onClick={() => setQty(l.variantId, l.qty - 1)}>−</button>
                  <span className="w-8 text-center" aria-live="polite">{l.qty}</span>
                  <button className="h-8 w-8" aria-label="Más" disabled={l.qty >= l.max} onClick={() => setQty(l.variantId, l.qty + 1)}>+</button>
                </div>
                <button className="text-xs underline" onClick={() => remove(l.variantId)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {lines.length > 0 && (
        <div className="space-y-3 border-t border-line p-5">
          <div className="flex justify-between font-semibold"><span>Subtotal</span><span>{formatMoney(sub)}</span></div>
          <p className="text-xs text-muted">Envío y cupones se calculan en el checkout.</p>
          <Button full href="/checkout" onClick={() => setOpen(false)}>Finalizar compra</Button>
        </div>
      )}
    </Drawer>
  );
}
