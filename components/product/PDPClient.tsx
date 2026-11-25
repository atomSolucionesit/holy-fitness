"use client";
import { useMemo, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import type { Product } from "@/lib/domain/types";
import { Button, Img, Price, Stars, Swatch } from "@/components/ui";
import { WishlistButton } from "./WishlistButton";
import { useCart } from "@/store/cart";
import { installments } from "@/lib/domain/rules";
import { cn, formatMoney } from "@/lib/utils";


export function PDPClient({ p, initialColor }: { p: Product; initialColor?: string }) {
  const [ci, setCi] = useState(
    Math.max(
      0,
      p.colors.findIndex((c) => c.name.toLowerCase() === (initialColor || "").toLowerCase()),
    ),
  );
  const [size, setSize] = useState<string>(); const [img, setImg] = useState(0); const [err, setErr] = useState(""); const [notify, setNotify] = useState(false);
  const add = useCart((s) => s.add);
  const color = p.colors[ci]!;
  const sizes = useMemo(() => p.variants.filter((v) => v.color === color.name), [p, color]);
  const colorHasStock = sizes.some((v) => v.stock > 0);
  const variant = sizes.find((v) => v.size === size);
  const submit = () => {
    if (!colorHasStock) return setErr("Sin stock disponible");
    if (!variant) return setErr("Elegí un talle");
    if (variant.stock === 0) return setErr("Talle agotado");
    setErr(""); add({ variantId: variant.id, slug: p.slug, name: p.name, color: color.name, size: variant.size, price: p.price, image: color.images[0] ?? "", max: variant.stock });
  };
  const activeImg = color.images[img] ?? color.images[0];
  const cta = (
    <Button full onClick={submit} disabled={!colorHasStock}>
      {colorHasStock ? "Agregar al carrito" : "Sin stock"}
    </Button>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[80px_1fr]">
        {color.images.length > 0 && (
          <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">{color.images.map((src, i) => (
            <button key={src} onClick={() => setImg(i)} aria-label={`Imagen ${i + 1}`} className={cn("relative aspect-[4/5] w-16 shrink-0 overflow-hidden border bg-surface lg:w-full", i === img ? "border-ink" : "border-transparent")}><Img src={src} alt="" hideOnError className="object-contain" sizes="80px" /></button>))}</div>
        )}
        <div className={cn("relative order-1 mx-auto aspect-[4/5] max-h-[70vh] w-full lg:max-h-[min(78vh,760px)] overflow-hidden bg-surface lg:order-2", color.images.length === 0 && "lg:col-span-2 flex items-center justify-center border border-line p-8 text-center")}>
          {activeImg ? (
            <Img src={activeImg} alt={`${p.name} ${color.name}`} fallbackLabel={p.name} priority className="object-contain" sizes="(min-width:1024px) 50vw, 100vw" />
          ) : (
            <span className="display text-3xl text-ink">{p.name}</span>
          )}
        </div>
      </div>
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:max-w-[560px]">
        <h1 className="display text-3xl lg:text-4xl">{p.name}</h1>
        <p className="mt-1 text-sm text-muted">{p.fit}</p>
        <div className="mt-3 flex items-center gap-4"><Price price={p.price} compare={p.compareAtPrice} className="text-xl" /><Stars rating={p.rating} count={p.reviewCount} /></div>
        <p className="mt-1 text-sm text-muted">3 cuotas sin interés de {formatMoney(installments(p.price))}</p>
        <p className="label mt-6">Color: <span className="font-normal normal-case tracking-normal">{color.name}</span></p>
        <div className="mt-2 flex gap-3">{p.colors.map((c, i) => <Swatch key={c.name} hex={c.hex} label={c.name} active={i === ci} onClick={() => { setCi(i); setSize(undefined); setImg(0); window.history.replaceState(null, "", `?color=${encodeURIComponent(c.name)}`); }} />)}</div>
        <p className="label mt-6">Talle</p>
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
