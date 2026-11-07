"use client";
import { useEffect, useState } from "react";
import { useUI } from "@/store/ui";
import { ProductGrid } from "./ProductCard";
import type { Product } from "@/lib/domain/types";

export function WishlistPage() {
  const slugs = useUI((s) => s.wishlist); const [items, setItems] = useState<Product[]>([]);
  useEffect(() => { if (!slugs.length) return; fetch(`/api/products?slugs=${slugs.join(",")}`).then((r) => r.json()).then(setItems).catch(() => {}); }, [slugs]);
  return slugs.length === 0 ? <p className="py-16 text-muted">Todavía no guardaste favoritos. Tocá el ♡ en cualquier producto.</p> : <ProductGrid items={items.filter((p) => slugs.includes(p.slug))} />;
}
