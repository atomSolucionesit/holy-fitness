"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useUI } from "@/store/ui";
import { formatMoney } from "@/lib/utils";

interface R { products: { slug: string; name: string; price: number; image?: string; fit: string }[]; categories: { name: string; href: string }[] }
export function SearchOverlay() {
  const { searchOpen, setSearch } = useUI(); const router = useRouter();
  const [q, setQ] = useState(""); const [r, setR] = useState<R | null>(null);
  useEffect(() => {
    if (q.trim().length < 2) return;
    const c = new AbortController();
    const t = setTimeout(() => fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: c.signal }).then((x) => x.json()).then(setR).catch(() => {}), 200);
    return () => { clearTimeout(t); c.abort(); };
  }, [q]);
  return (
    <Dialog.Root open={searchOpen} onOpenChange={setSearch}>
      <Dialog.Portal>
        <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <Dialog.Title className="sr-only">Buscar</Dialog.Title>
          <div className="mx-auto max-w-5xl px-4 py-6">
            <form onSubmit={(e) => { e.preventDefault(); setSearch(false); router.push(`/buscar?q=${encodeURIComponent(q)}`); }} className="flex items-center gap-4 border-b-2 border-ink pb-3">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos" aria-label="Buscar productos" className="display w-full bg-transparent text-3xl outline-none md:text-5xl" />
              <Dialog.Close className="label" aria-label="Cerrar búsqueda">✕</Dialog.Close>
            </form>
            {r && q.trim().length >= 2 && (
              <div className="mt-8 grid gap-10 md:grid-cols-[200px_1fr]">
                <div><p className="label mb-3">Categorías</p>{r.categories.length ? r.categories.map((c) => <Link key={c.href} href={c.href} onClick={() => setSearch(false)} className="block py-1 hover:underline">{c.name}</Link>) : <p className="text-sm text-muted">Sin categorías</p>}</div>
                <div><p className="label mb-3">Productos</p>
                  {r.products.length === 0 && <p className="text-sm text-muted">No encontramos resultados para “{q}”.</p>}
                  <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">{r.products.map((p) => (
                    <li key={p.slug}><Link href={`/producto/${p.slug}`} onClick={() => setSearch(false)} className="block">
                      <div className="relative aspect-[4/5] bg-surface">{p.image && <Image src={p.image} alt="" fill unoptimized className="object-cover" />}</div>
                      <p className="mt-2 text-sm font-semibold">{p.name}</p><p className="text-sm">{formatMoney(p.price)}</p></Link></li>))}</ul>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
