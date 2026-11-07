"use client";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
export function WishlistButton({ slug, className }: { slug: string; className?: string }) {
  const on = useUI((s) => s.wishlist.includes(slug));
  const toggle = useUI((s) => s.toggleWish);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? "Quitar de favoritos" : "Agregar a favoritos"} onClick={(e) => { e.preventDefault(); toggle(slug); }} className={cn("grid h-9 w-9 place-items-center text-lg", className)}>
      <span aria-hidden>{on ? "♥" : "♡"}</span>
    </button>
  );
}
