"use client";
import Link from "next/link";
import { useState } from "react";
import { NAV, type NavKey } from "./nav-data";
import { useCart, cartCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { Drawer } from "@/components/ui/Drawer";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [open, setOpen] = useState<NavKey | null>(null);
  const count = useCart((s) => cartCount(s.lines));
  const setCart = useCart((s) => s.setOpen);
  const { menuOpen, setMenu, setSearch, wishlist } = useUI();
  const [mob, setMob] = useState<NavKey | null>(null);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white" onMouseLeave={() => setOpen(null)}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 lg:px-8">
        <button className="label lg:hidden" aria-label="Abrir menú" onClick={() => setMenu(true)}>☰</button>
        <Link href="/" aria-label="Holy Fitness - Inicio" className="shrink-0"><Logo className="h-12" /></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {(Object.keys(NAV) as NavKey[]).map((k) => (
            <Link key={k} href={`/${k}`} onMouseEnter={() => setOpen(k)} onFocus={() => setOpen(k)} className="label px-3 py-5 hover:underline underline-offset-8">{NAV[k].label}</Link>
          ))}
          <Link href="/coleccion/sculpt" onMouseEnter={() => setOpen(null)} className="label px-3 py-5 hover:underline underline-offset-8">Explorar</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <button className="label" onClick={() => setSearch(true)} aria-label="Buscar">Buscar</button>
          <Link href="/cuenta/favoritos" className="label hidden sm:block" aria-label="Favoritos">♡{wishlist.length > 0 && ` ${wishlist.length}`}</Link>
          <Link href="/cuenta" className="label hidden sm:block">Cuenta</Link>
          <button className="label" onClick={() => setCart(true)} aria-label={`Abrir carrito, ${count} productos`}>Carrito ({count})</button>
        </div>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full hidden border-b border-line bg-white lg:block" onMouseEnter={() => setOpen(open)}>
          <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_320px] gap-10 px-8 py-8">
            <div className="grid grid-cols-4 gap-6">
              {NAV[open].cols.map((c) => (
                <div key={c.title}>
                  <p className="label mb-3">{c.title}</p>
                  <ul className="space-y-2 text-sm">{c.links.map(([l, h]) => <li key={h}><Link href={h} onClick={() => setOpen(null)} className="hover:underline">{l}</Link></li>)}</ul>
                </div>
              ))}
            </div>
            <Link href={NAV[open].feature.href} onClick={() => setOpen(null)} className="relative block aspect-[4/3] overflow-hidden bg-surface">
              <Image src={NAV[open].feature.image} alt="" fill className="object-cover" />
              <span className="display absolute bottom-3 left-3 text-3xl">{NAV[open].feature.title}</span>
            </Link>
          </div>
        </div>
      )}
      <Drawer open={menuOpen} onOpenChange={setMenu} title="Menú" side="left">
        <nav className="overflow-y-auto p-5">
          {(Object.keys(NAV) as NavKey[]).map((k) => (
            <div key={k} className="border-b border-line">
              <button className="display flex w-full justify-between py-4 text-2xl" aria-expanded={mob === k} onClick={() => setMob(mob === k ? null : k)}>{NAV[k].label}<span>{mob === k ? "–" : "+"}</span></button>
              {mob === k && NAV[k].cols.map((c) => (
                <div key={c.title} className="pb-4">
                  <p className="label mb-2 text-muted">{c.title}</p>
                  <ul className="space-y-2">{c.links.map(([l, h]) => <li key={h}><Link href={h} onClick={() => setMenu(false)}>{l}</Link></li>)}</ul>
                </div>
              ))}
            </div>
          ))}
          <ul className="label mt-6 space-y-4"><li><Link href="/cuenta" onClick={() => setMenu(false)}>Mi cuenta</Link></li><li><Link href="/cuenta/favoritos" onClick={() => setMenu(false)}>Favoritos</Link></li><li><Link href="/ayuda/envios" onClick={() => setMenu(false)}>Ayuda</Link></li></ul>
        </nav>
      </Drawer>
    </header>
  );
}
