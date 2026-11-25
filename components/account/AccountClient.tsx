"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { signInWithGooglePopup } from "@/lib/firebase/client";
import { formatMoney } from "@/lib/utils";
import type { NexusCustomerOrder, NexusCustomerProfile } from "@/lib/providers/nexus/customer-session";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  SHIPPING_PENDING: "Pendiente de envío",
  PREPARING: "Preparando",
  SHIPPING_COMPLETED: "Enviado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELED: "Cancelado",
};

export function AccountClient({
  initialCustomer,
  initialOrders,
}: {
  initialCustomer: NexusCustomerProfile | null;
  initialOrders: NexusCustomerOrder[];
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState<NexusCustomerProfile | null>(initialCustomer);
  const [orders, setOrders] = useState<NexusCustomerOrder[]>(initialOrders);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setBusy(true);
    setError("");
    try {
      const idToken = await signInWithGooglePopup();
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No pudimos iniciar sesión con Google");
      }

      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = await meRes.json().catch(() => ({}));
      setCustomer(meData.customer ?? data.customer ?? null);
      setOrders(Array.isArray(meData.orders) ? meData.orders : []);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo completar el inicio de sesión";
      if (msg.includes("popup-closed-by-user")) {
        setError("Cerraste la ventana de Google antes de finalizar.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setCustomer(null);
    setOrders([]);
    setBusy(false);
    router.refresh();
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="display text-4xl">Mi cuenta</h1>
        <p className="mt-4 text-muted">
          Ingresá con tu cuenta de Google para ver tus pedidos realizados y agilizar tus próximas compras.
        </p>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleLogin}
            className="flex h-12 w-full max-w-xs items-center justify-center gap-3 border border-ink bg-white px-5 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            {busy ? "Conectando..." : "Continuar con Google"}
          </button>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <Link href="/cuenta/favoritos" className="label underline underline-offset-4">
            Ver mis favoritos
          </Link>
        </div>
      </div>
    );
  }

  const fullName = [customer.name, customer.lastName].filter(Boolean).join(" ").trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="label text-xs text-muted">Mi cuenta</p>
          <h1 className="display mt-1 text-4xl">{fullName || "Hola"}</h1>
          {customer.email && <p className="mt-1 text-sm text-muted">{customer.email}</p>}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cuenta/favoritos" className="label underline underline-offset-4">
            Favoritos
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={handleLogout}
            className="label border border-line px-4 py-2 hover:border-ink disabled:opacity-50 cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="display text-2xl">Mis pedidos</h2>
        {orders.length === 0 ? (
          <div className="mt-4 border border-line p-6">
            <p className="text-sm text-muted">Todavía no tenés pedidos registrados con este email.</p>
            <div className="mt-4">
              <Button href="/explorar" variant="outline">
                Explorar tienda
              </Button>
            </div>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((o) => {
              const dateStr = o.date
                ? new Date(o.date).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "";
              return (
                <li key={o.id} className="border border-line p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <p className="font-semibold">{o.correlative}</p>
                      {dateStr && <p className="text-xs text-muted">{dateStr}</p>}
                    </div>
                    <div className="text-right">
                      <span className="label border border-ink px-2.5 py-1 text-[11px]">
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                      <p className="mt-1 font-semibold">{formatMoney(Number(o.total || 0))}</p>
                    </div>
                  </div>
                  {Array.isArray(o.details) && o.details.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-muted">
                      {o.details.map((d, idx) => (
                        <li key={d.id ?? idx} className="flex justify-between gap-4">
                          <span>
                            {d.itemName || "Producto"}
                            {d.description ? ` (${d.description})` : ""} × {d.quantity}
                          </span>
                          <span>{formatMoney(Number(d.price || 0) * Number(d.quantity || 1))}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
