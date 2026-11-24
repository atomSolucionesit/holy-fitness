import { redirect } from "next/navigation";
import { Button } from "@/components/ui";
import { nexusSyncMercadoPagoReturn, resolveOrderIdByExternalReference } from "@/lib/providers/nexus";

export const metadata = { title: "Estado de tu pago", robots: { index: false } };

/**
 * Ruta de retorno fija (`/pedido`) para configurar en Nexus (`backUrlSuccess`,
 * `backUrlFailure`, `backUrlPending`) cuando Mercado Pago redirige de vuelta
 * con `payment_id`, `status` y `external_reference`.
 */
export default async function MercadoPagoReturnPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment_id?: string;
    collection_id?: string;
    status?: string;
    collection_status?: string;
    external_reference?: string;
  }>;
}) {
  const sp = await searchParams;
  const paymentId = sp.payment_id || sp.collection_id;
  const rawStatus = (sp.status || sp.collection_status || "").toLowerCase();
  const externalRef = sp.external_reference;

  const orderId = resolveOrderIdByExternalReference(externalRef);
  if (orderId) {
    const qs = new URLSearchParams();
    if (paymentId) qs.set("payment_id", paymentId);
    if (rawStatus) qs.set("status", rawStatus);
    if (externalRef) qs.set("external_reference", externalRef);
    redirect(`/pedido/${encodeURIComponent(orderId)}?${qs.toString()}`);
  }

  // Si el servidor se reinició entre el checkout y el retorno de MP, sincronizamos igual contra Nexus.
  const synced = await nexusSyncMercadoPagoReturn(externalRef || "mp-return", {
    paymentId,
    status: rawStatus,
    externalReference: externalRef,
  }).catch(() => null);

  const isRejected =
    synced === "cancelado" || ["rejected", "cancelled", "canceled", "failure", "null"].includes(rawStatus);
  const isApproved = synced === "pagado" || rawStatus === "approved";

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="display text-4xl">
        {isRejected
          ? "Pago rechazado o cancelado"
          : isApproved
            ? "¡Pago acreditado!"
            : "Pago en proceso"}
      </h1>
      <p className="mt-3 text-muted">
        {isRejected
          ? "El pago no pudo completarse y el pedido fue anulado. Podés volver a intentar cuando quieras."
          : isApproved
            ? "Recibimos tu pago correctamente y ya estamos preparando tu pedido. Te enviamos los detalles por email."
            : "Tu pago está siendo procesado por Mercado Pago. Te avisaremos por email apenas se acredite."}
      </p>
      {externalRef && (
        <p className="mt-4 border border-line p-3 text-sm">
          Referencia de operación: <b>{externalRef}</b>
          {paymentId ? ` · Pago #${paymentId}` : ""}
        </p>
      )}
      <div className="mt-8">
        <Button href="/">Volver a la tienda</Button>
      </div>
    </div>
  );
}
