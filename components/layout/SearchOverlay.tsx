"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useUI } from "@/store/ui";
import { formatMoney } from "@/lib/utils";

interface SearchProduct {
  slug: string;
  name: string;
  price: number;
  image?: string;
  fit: string;
  category?: string;
}

interface SearchResponse {
  products: SearchProduct[];
  categories: { name: string; href: string }[];
}

export function SearchOverlay() {
  const { searchOpen, setSearch } = useUI();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [r, setR] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchOpen) return;
    const c = new AbortController();
    const delay = q.trim().length === 0 ? 0 : 120;
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: c.signal })
        .then((x) => x.json())
        .then((data: SearchResponse) => {
          setR(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, delay);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [q, searchOpen]);

  const trimmed = q.trim();
  const hasQuery = trimmed.length > 0;

  return (
    <Dialog.Root open={searchOpen} onOpenChange={setSearch}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-50 max-h-[90vh] overflow-y-auto border-b border-line bg-white shadow-xl"
        >
          <Dialog.Title className="sr-only">Buscar productos</Dialog.Title>
          <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!trimmed) return;
                setSearch(false);
                router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
              }}
              className="flex items-center gap-3 border-b-2 border-ink pb-3"
            >
              <svg
                className="h-5 w-5 shrink-0 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar calzas, tops, buzos..."
                aria-label="Buscar productos"
                className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted md:text-2xl"
              />
              {hasQuery && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="label shrink-0 text-xs text-muted hover:text-ink"
                >
                  Limpiar
                </button>
              )}
              <Dialog.Close className="label shrink-0 px-2 py-1 hover:bg-surface" aria-label="Cerrar búsqueda">
                ✕
              </Dialog.Close>
            </form>

            <div className="mt-6">
              {loading && !r ? (
                <p className="text-sm text-muted">Buscando sugerencias...</p>
              ) : r ? (
                <div className="space-y-6">
                  {r.categories.length > 0 && (
                    <div>
                      <p className="label mb-2.5 text-xs text-muted">
                        {hasQuery ? "Categorías relacionadas" : "Categorías sugeridas"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {r.categories.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={() => setSearch(false)}
                            className="border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:border-ink hover:bg-surface"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="label text-xs text-muted">
                        {hasQuery
                          ? `Sugerencias para "${trimmed}"`
                          : "Productos sugeridos"}
                      </p>
                      {hasQuery && r.products.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch(false);
                            router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
                          }}
                          className="label text-xs underline underline-offset-4"
                        >
                          Ver todos los resultados
                        </button>
                      )}
                    </div>

                    {r.products.length === 0 ? (
                      <p className="py-6 text-sm text-muted">
                        No encontramos productos para &ldquo;{trimmed}&rdquo;. Probá con otra palabra o categoría.
                      </p>
                    ) : (
                      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {r.products.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/producto/${p.slug}`}
                              onClick={() => setSearch(false)}
                              className="group flex items-center gap-3 border border-line p-2 transition-colors hover:border-ink hover:bg-surface"
                            >
                              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-surface">
                                {p.image && (
                                  <Image
                                    src={p.image}
                                    alt={p.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold group-hover:underline">
                                  {p.name}
                                </p>
                                {p.category && (
                                  <p className="truncate text-[11px] capitalize text-muted">
                                    {p.category}
                                  </p>
                                )}
                                <p className="mt-0.5 text-xs font-semibold">
                                  {formatMoney(p.price)}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
