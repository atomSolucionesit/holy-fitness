import Link from "next/link";
export const metadata = { title: "Mi cuenta", robots: { index: false } };
export default function Page() {
  return (<div className="mx-auto max-w-xl px-4 py-16"><h1 className="display text-4xl">Mi cuenta</h1>
    <p className="mt-4 text-muted">El ingreso con usuario y el historial de pedidos se activan al conectar Supabase Auth (próxima etapa). Por ahora podés guardar favoritos y consultar tu pedido con el link que recibís por email.</p>
    <Link href="/cuenta/favoritos" className="label mt-6 inline-block underline">Ver mis favoritos</Link></div>);
}
