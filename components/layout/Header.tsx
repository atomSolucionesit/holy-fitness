"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, cartCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { Drawer } from "@/components/ui/Drawer";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import type { Category, Collection } from "@/lib/domain/types";

const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_COLLECTIONS: Collection[] = [];

export function Header({
  categories = EMPTY_CATEGORIES,
  collections = EMPTY_COLLECTIONS,
}: {
  categories?: Category[];
  collections?: Collection[];
}) {
  const [open, setOpen] = useState(false);
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const count = useCart((s) => cartCount(s.lines));
  const setCart = useCart((s) => s.setOpen);
  const { menuOpen, setMenu, setSearch, wishlist } = useUI();

  // Ordenamos alfabéticamente las categorías traídas desde Nexus (evitando duplicados por slug)
  const nexusCategories = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) {
      if (!map.has(c.slug)) map.set(c.slug, c);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const activeCategory = useMemo(() => {
    if (hoveredCatSlug) {
      const found = nexusCategories.find((c) => c.slug === hoveredCatSlug);
      if (found) return found;
    }
    return nexusCategories[0] ?? null;
  }, [hoveredCatSlug, nexusCategories]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const featureImage = activeCategory?.image;
  const featureTitle = activeCategory?.name || "Explorar";
  const featureHref = activeCategory
    ? `/explorar?categoria=${encodeURIComponent(activeCategory.slug)}`
    : "/explorar";

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-line bg-white"
      onMouseLeave={() => setOpen(false)}
    >
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-6 px-4 lg:h-20 lg:px-8">
        <button className="label lg:hidden" aria-label="Abrir menú" onClick={() => setMenu(true)}>
          ☰
        </button>
        <Link href="/" aria-label="Holy Fitness - Inicio" className="shrink-0">
          <Logo className="h-14 lg:h-[68px]" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="label px-3 py-5 hover:underline underline-offset-8 cursor-pointer"
          >
            Explorar {open ? "▴" : "▾"}
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <button className="label" onClick={() => setSearch(true)} aria-label="Buscar">
            Buscar
          </button>
          <Link href="/cuenta/favoritos" className="label hidden sm:block" aria-label="Favoritos">
            ♡{wishlist.length > 0 && ` ${wishlist.length}`}
          </Link>
          <Link href="/cuenta" className="label hidden sm:block">
            Cuenta
          </Link>
          <button className="label" onClick={() => setCart(true)} aria-label={`Abrir carrito, ${count} productos`}>
            Carrito ({count})
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full hidden border-b border-line bg-white lg:block shadow-sm">
          <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_320px] gap-10 px-8 py-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <p className="label">Categorías</p>
                <Link
                  href="/explorar"
                  onClick={() => setOpen(false)}
                  className="label text-xs underline underline-offset-4"
                >
                  Ver todo el catálogo
                </Link>
              </div>
              {nexusCategories.length === 0 ? (
                <p className="text-sm text-muted">No hay categorías publicadas todavía.</p>
              ) : (
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2.5 text-sm">
                  {nexusCategories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/explorar?categoria=${encodeURIComponent(c.slug)}`}
                        onMouseEnter={() => setHoveredCatSlug(c.slug)}
                        onFocus={() => setHoveredCatSlug(c.slug)}
                        onClick={() => setOpen(false)}
                        className={`block py-0.5 hover:underline underline-offset-4 ${
                          activeCategory?.slug === c.slug ? "font-semibold text-ink underline" : ""
                        }`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {collections.length > 0 && (
                <div className="pt-2 border-t border-line">
                  <p className="label mb-2 text-xs text-muted">Colecciones</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                    {collections.map((col) => (
                      <Link
                        key={col.slug}
                        href={`/coleccion/${col.slug}`}
                        onClick={() => setOpen(false)}
                        className="hover:underline"
                      >
                        {col.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href={featureHref}
              onClick={() => setOpen(false)}
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-line bg-surface"
            >
              {featureImage ? (
                <>
                  <Image
                    src={featureImage}
                    alt={featureTitle}
                    fill
                    sizes="320px"
                    className="object-cover transition-opacity duration-200"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                    <span className="display text-2xl text-white">{featureTitle}</span>
                  </div>
                </>
              ) : (
                <div className="px-6 text-center">
                  <span className="display text-2xl text-ink">{featureTitle}</span>
                </div>
              )}
            </Link>
          </div>
        </div>
      )}

      <Drawer open={menuOpen} onOpenChange={setMenu} title="Explorar" side="left">
        <nav className="overflow-y-auto p-5">
          <div className="border-b border-line pb-4">
            <Link
              href="/explorar"
              onClick={() => setMenu(false)}
              className="display block py-2 text-2xl underline underline-offset-4"
            >
              Ver todo
            </Link>
            <p className="label mt-4 mb-3 text-muted">Categorías</p>
            <ul className="space-y-2.5">
              {nexusCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/explorar?categoria=${encodeURIComponent(c.slug)}`}
                    onClick={() => setMenu(false)}
                    className="block py-1 text-base hover:underline"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul className="label mt-6 space-y-4">
            <li>
              <Link href="/cuenta" onClick={() => setMenu(false)}>
                Mi cuenta
              </Link>
            </li>
            <li>
              <Link href="/cuenta/favoritos" onClick={() => setMenu(false)}>
                Favoritos
              </Link>
            </li>
            <li>
              <Link href="/ayuda/envios" onClick={() => setMenu(false)}>
                Ayuda
              </Link>
            </li>
          </ul>
        </nav>
      </Drawer>
    </header>
  );
}
