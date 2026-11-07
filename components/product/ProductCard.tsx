"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/domain/types";
import { Badge, Img, Price, Stars, Swatch } from "@/components/ui";
import { WishlistButton } from "./WishlistButton";
import { useCart } from "@/store/cart";
import { discountPct } from "@/lib/utils";

export function ProductCard({ p, priority }: { p: Product; priority?: boolean }) {
  const [ci, setCi] = useState(0);
  const [quick, setQuick] = useState(false);
  const add = useCart((s) => s.add);
  const color = p.colors[ci] ?? p.colors[0]!;
  const pct = discountPct(p.price, p.compareAtPrice);
  const sizes = p.variants.filter((v) => v.color === color.name);
  return (
    <article className="group relative" onMouseLeave={() => setQuick(false)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Link href={`/producto/${p.slug}?color=${encodeURIComponent(color.name)}`} aria-label={p.name}>
          <Img src={color.images[0]!} alt={`${p.name} ${color.name}`} priority={priority} sizes="(min-width:1024px) 25vw, 50vw" className="transition-opacity duration-300 group-hover:opacity-0" />
          <Img src={color.images[1] ?? color.images[0]!} alt="" sizes="(min-width:1024px) 25vw, 50vw" className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {pct > 0 && <Badge tone="accent">-{pct}%</Badge>}
          {p.badges.map((b) => <Badge key={b}>{b}</Badge>)}
        </div>
        <WishlistButton slug={p.slug} className="absolute right-1 top-1" />
        <div className="absolute inset-x-0 bottom-0 hidden bg-white/95 p-3 lg:block lg:translate-y-full lg:transition-transform lg:duration-200 lg:group-hover:translate-y-0 lg:group-focus-within:translate-y-0">
          <p className="label mb-2 text-[10px]">{quick ? "Elegí tu talle" : "Agregar rápido"}</p>
          <div className="flex flex-wrap gap-1">
            {sizes.map((v) => (
              <button key={v.id} disabled={v.stock === 0} onClick={() => { add({ variantId: v.id, slug: p.slug, name: p.name, color: v.color, size: v.size, price: p.price, image: color.images[0]!, max: v.stock }); }}
                className="h-8 min-w-8 border border-line px-2 text-xs hover:border-ink disabled:text-muted disabled:line-through" onFocus={() => setQuick(true)}>{v.size}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <Link href={`/producto/${p.slug}`} className="block text-sm font-semibold leading-tight hover:underline">{p.name}</Link>
        <p className="text-xs text-muted">{p.fit} · {color.name}</p>
        <div className="flex gap-1.5 py-1">{p.colors.map((c, i) => <Swatch key={c.name} hex={c.hex} label={c.name} active={i === ci} onClick={() => setCi(i)} />)}</div>
        <Price price={p.price} compare={p.compareAtPrice} className="text-sm" />
        <Stars rating={p.rating} count={p.reviewCount} />
      </div>
    </article>
  );
}

export const ProductGrid = ({ items }: { items: Product[] }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-4">{items.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}</div>
);
