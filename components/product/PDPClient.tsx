"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import type { Product } from "@/lib/domain/types";
import { Button, Price, Stars, Swatch } from "@/components/ui";
import { WishlistButton } from "./WishlistButton";
import { useCart } from "@/store/cart";
import { installments } from "@/lib/domain/rules";
import { cn, formatMoney } from "@/lib/utils";

const SIZE_TABLE = [["XS", "80-84", "60-64", "86-90"], ["S", "85-89", "65-69", "91-95"], ["M", "90-94", "70-74", "96-100"], ["L", "95-99", "75-79", "101-105"], ["XL", "100-106", "80-86", "106-112"]];

export function PDPClient({ p, initialColor }: { p: Product; initialColor?: string }) {
  const [ci, setCi] = useState(Math.max(0, p.colors.findIndex((c) => c.name === initialColor)));
  const [size, setSize] = useState<string>(); const [img, setImg] = useState(0); const [err, setErr] = useState(""); const [notify, setNotify] = useState(false);
  const add = useCart((s) => s.add);
  const color = p.colors[ci]!;
  const sizes = useMemo(() => p.variants.filter((v) => v.color === color.name), [p, color]);
  const variant = sizes.find((v) => v.size === size);
  const submit = () => {
    if (!variant) return setErr("Elegí un talle");
    if (variant.stock === 0) return setErr("Talle agotado");
    setErr(""); add({ variantId: variant.id, slug: p.slug, name: p.name, color: color.name, size: variant.size, price: p.price, image: color.images[0]!, max: variant.stock });
  };
  const cta = <Button full onClick={submit}>Agregar al carrito</Button>;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
      <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
        <div className="order-2 flex gap-2 lg:order-1 lg:flex-col">{color.images.map((src, i) => (
          <button key={src} onClick={() => setImg(i)} aria-label={`Imagen ${i + 1}`} className={cn("relative aspect-[4/5] w-16 border lg:w-full", i === img ? "border-ink" : "border-transparent")}><Image src={src} alt="" fill unoptimized className="object-cover" /></button>))}</div>
        <div className="relative order-1 aspect-[4/5] overflow-hidden bg-surface lg:order-2">
          <Image src={color.images[img] ?? color.images[0]!} alt={`${p.name} ${color.name}`} fill unoptimized priority className="object-cover transition-transform duration-300 hover:scale-125" sizes="(min-width:1024px) 55vw, 100vw" />
        </div>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h1 className="display text-4xl">{p.name}</h1>
        <p className="mt-1 text-sm text-muted">{p.fit}</p>
        <div className="mt-3 flex items-center gap-4"><Price price={p.price} compare={p.compareAtPrice} className="text-xl" /><Stars rating={p.rating} count={p.reviewCount} /></div>
        <p className="mt-1 text-sm text-muted">3 cuotas sin interés de {formatMoney(installments(p.price))}</p>
        <p className="label mt-6">Color: <span className="font-normal normal-case tracking-normal">{color.name}</span></p>
        <div className="mt-2 flex gap-3">{p.colors.map((c, i) => <Swatch key={c.name} hex={c.hex} label={c.name} active={i === ci} onClick={() => { setCi(i); setSize(undefined); setImg(0); }} />)}</div>
        <div className="mt-6 flex items-center justify-between"><p className="label">Talle</p>
          <Dialog.Root><Dialog.Trigger className="text-sm underline">Guía de talles</Dialog.Trigger>
            <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 bg-white p-6">
              <Dialog.Title className="display text-2xl">Guía de talles</Dialog.Title>
              <table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b border-line"><th className="py-2">Talle</th><th>Pecho (cm)</th><th>Cintura (cm)</th><th>Cadera (cm)</th></tr></thead><tbody>{SIZE_TABLE.map((r) => <tr key={r[0]} className="border-b border-line">{r.map((c, i) => <td key={i} className="py-2">{c}</td>)}</tr>)}</tbody></table>
              <Dialog.Close className="label mt-6 underline">Cerrar</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root></div>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Talle">{sizes.map((v) => (
          <button key={v.id} role="radio" aria-checked={size === v.size} onClick={() => { setSize(v.size); setErr(""); setNotify(false); }}
            className={cn("relative h-12 min-w-14 border px-3 text-sm", size === v.size ? "border-ink bg-ink text-white" : "border-line hover:border-ink", v.stock === 0 && "text-muted line-through")}>{v.size}</button>))}</div>
        {err && <p role="alert" className="mt-2 text-sm text-danger">{err}</p>}
        {variant && variant.stock > 0 && variant.stock <= 3 && <p className="mt-2 text-sm text-danger">¡Últimas {variant.stock} unidades!</p>}
        {variant?.stock === 0 && (notify ? <p className="mt-2 text-sm">Te avisamos cuando vuelva a haber stock.</p> : <button className="mt-2 text-sm underline" onClick={() => setNotify(true)}>Avisame cuando haya stock</button>)}
        <div className="mt-6 hidden gap-2 lg:flex"><div className="flex-1">{cta}</div><div className="border border-ink"><WishlistButton slug={p.slug} className="h-12 w-12" /></div></div>
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 lg:hidden">{cta}</div>
        <p className="mt-4 text-sm text-muted">Retiro gratis en el local · Envío gratis desde $ 120.000</p>
        <Accordion.Root type="multiple" defaultValue={["d"]} className="mt-6 border-t border-line">
          {[["d", "Descripción", p.description], ["c", "Composición y cuidado", p.composition], ["e", "Envíos y devoluciones", "Enviamos a todo el país en 2 a 7 días hábiles. Tenés 30 días para cambios y devoluciones."]].map(([v, t, b]) => (
            <Accordion.Item key={v} value={v!} className="border-b border-line"><Accordion.Header><Accordion.Trigger className="label flex w-full justify-between py-4">{t}<span aria-hidden>+</span></Accordion.Trigger></Accordion.Header><Accordion.Content className="pb-4 text-sm text-muted">{b}</Accordion.Content></Accordion.Item>))}
        </Accordion.Root>
      </div>
    </div>
  );
}
