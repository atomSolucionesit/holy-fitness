import { notFound } from "next/navigation";
import { orders } from "@/lib/providers";
import { Button } from "@/components/ui";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Tu pedido", robots: { index: false } };
const STEPS = ["pendiente", "pagado", "preparando", "enviado", "entregado"];
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pago?: string }> }) {
  const { id } = await params; const { pago } = await searchParams;
  const o = await orders.getOrder(id); if (!o) notFound();
  if (pago === "simulado" && o.status === "pendiente") { await orders.updateStatus(id, "pagado"); o.status = "pagado"; }
  const step = STEPS.indexOf(o.status);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-4xl">¡Gracias por tu compra!</h1>
      <p className="mt-2 text-muted">Pedido <b className="text-ink">{o.id}</b> · te enviamos el detalle a {o.customer.email}.</p>
      <ol className="my-8 grid grid-cols-5 gap-1 text-center text-[11px]">{STEPS.map((s, i) => <li key={s} className={i <= step ? "border-t-4 border-ink pt-2 font-bold" : "border-t-4 border-line pt-2 text-muted"}>{s.toUpperCase()}</li>)}</ol>
      {o.paymentMethod === "transferencia" && <p className="mb-6 border border-line p-4 text-sm">Transferí <b>{formatMoney(o.total)}</b> a: Banco Ejemplo · CBU 0000000000000000000000 · Alias HOLY.FITNESS (datos de prueba) y enviá el comprobante por WhatsApp indicando tu número de pedido.</p>}
      {o.shippingMethod === "retiro" && <p className="mb-6 border border-line p-4 text-sm">Retirás en nuestro local. Te avisamos por email cuando esté listo.</p>}
      <ul className="divide-y divide-line border-y border-line">{o.items.map((i) => <li key={i.variantId} className="flex justify-between py-3 text-sm"><span>{i.name} · {i.color} / {i.size} × {i.qty}</span><span>{formatMoney(i.unitPrice * i.qty)}</span></li>)}</ul>
      <dl className="mt-4 space-y-1 text-sm"><div className="flex justify-between"><dt>Envío</dt><dd>{o.shipping ? formatMoney(o.shipping) : "Gratis"}</dd></div><div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatMoney(o.total)}</dd></div></dl>
      <div className="mt-8"><Button href="/">Volver a la tienda</Button></div>
    </div>
  );
}
