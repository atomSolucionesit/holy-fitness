import Link from "next/link";
import { Suspense } from "react";
import { catalog } from "@/lib/providers";
import type { ProductQuery } from "@/lib/domain/types";
import { ProductGrid } from "./ProductCard";
import { Filters, SortBar } from "./Filters";
import { Button } from "@/components/ui";

export async function PLP({ title, subtitle, crumbs, query, basePath, searchParams }: { title: string; subtitle?: string; crumbs: [string, string?][]; query: ProductQuery; basePath: string; searchParams: Record<string, string | string[] | undefined> }) {
  const r = await catalog.listProducts(query);
  const limit = query.limit ?? 24;
  const sp = new URLSearchParams(Object.entries(searchParams).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
  sp.set("limite", String(limit + 24));
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-8 lg:px-8">
      <nav aria-label="Breadcrumb" className="py-4 text-xs text-muted"><ol className="flex flex-wrap gap-2">{[["Inicio", "/"] as [string, string?], ...crumbs].map(([l, h], i, a) => <li key={l}>{h && i < a.length - 1 ? <Link href={h} className="hover:underline">{l}</Link> : <span className="text-ink">{l}</span>}{i < a.length - 1 && " /"}</li>)}</ol></nav>
      <header className="mb-8"><h1 className="display h-section">{title}</h1>{subtitle && <p className="mt-2 max-w-xl text-muted">{subtitle}</p>}</header>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense><Filters facets={r.facets} total={r.total} shown={r.items.length} /></Suspense>
        <div>
          <Suspense><SortBar total={r.total} shown={r.items.length} /></Suspense>
          {r.items.length === 0 ? <p className="py-20 text-center text-muted">No encontramos productos con esos filtros.</p> : <ProductGrid items={r.items} />}
          <div className="mt-12 text-center"><p className="mb-3 text-sm text-muted">Mostrando {r.items.length} de {r.total}</p>
            {r.items.length < r.total && <Button variant="outline" href={`${basePath}?${sp}`}>Cargar más</Button>}</div>
        </div>
      </div>
    </div>
  );
}
