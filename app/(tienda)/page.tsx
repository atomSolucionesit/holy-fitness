import Link from "next/link";
import { catalog } from "@/lib/providers";
import { Hero } from "@/components/home/Hero";
import { Carousel } from "@/components/home/Carousel";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionTitle, Button } from "@/components/ui";
import { Tabbed, type Tile } from "@/components/home/Tabbed";
import { NewsletterForm } from "@/components/home/NewsletterForm";

export const revalidate = 300;

const trending = (g: string, items: [string, string, string, string][]): Tile[] => items.map(([title, text, href, img]) => ({ title, text, href: `/${g}${href}`, image: `/img/${img}.jpg` }));
const acts = (g: "mujer" | "hombre"): Tile[] => {
  const imgs = g === "mujer" ? ["hero-mujer", "m-camperas", "m-shorts", "m-conjuntos", "m-buzos"] : ["h-remeras", "h-camperas", "h-shorts", "h-joggers", "h-buzos"];
  return ["Lifting", "Running", "HIIT", "Pilates", "Rest day"].map((a, i) => ({ title: a, href: `/${g}?actividad=${a === "Rest day" ? "descanso" : a.toLowerCase()}`, image: `/img/${imgs[i]}.jpg` }));
};

export default async function Home() {
  const [sculpt, invierno, popular] = await Promise.all([
    catalog.listProducts({ collection: "sculpt", limit: 8 }),
    catalog.listProducts({ collection: "invierno", limit: 8 }),
    catalog.listProducts({ sort: "mas-vendidos", limit: 8 }),
  ]);
  return (
    <>
      <Hero priority title="Entrená sin excusas" sub="Nueva colección Sculpt. Hecha en Argentina para tu mejor versión." image="/img/hero-mujer.jpg" position="68% 50%" cta1={["Comprar mujer", "/mujer"]} cta2={["Comprar hombre", "/hombre"]} />
      <section className="mx-auto mt-12 max-w-[1600px] px-4 lg:px-8"><SectionTitle href="/coleccion/sculpt">Sculpt</SectionTitle><Carousel>{sculpt.items.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel></section>
      <div className="mt-16"><Hero title="Frío no es excusa" sub="Abrigo técnico para entrenar todo el año." image="/img/hero-invierno.jpg" position="55% 50%" cta1={["Ver colección Invierno", "/coleccion/invierno"]} /></div>
      <section className="mx-auto mt-12 max-w-[1600px] px-4 lg:px-8"><SectionTitle href="/coleccion/invierno">Invierno</SectionTitle><Carousel>{invierno.items.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel></section>
      <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8">
        <SectionTitle>Lo más elegido</SectionTitle>
        <Tabbed tabs={{
          Mujer: trending("mujer", [["Calzas", "Soporte y comodidad", "/calzas", "m-calzas"], ["Tops", "Para cada impacto", "/tops", "m-tops"], ["Buzos", "Abrigo suave", "/buzos", "m-buzos"], ["Conjuntos", "Listos para usar", "/conjuntos", "m-conjuntos"]]),
          Hombre: trending("hombre", [["Remeras", "Oversized y muscle fit", "/remeras", "h-remeras"], ["Joggers", "Cortes tapered", "/joggers", "h-joggers"], ["Shorts", "Para entrenar", "/shorts", "h-shorts"], ["Camperas", "Livianas y cálidas", "/camperas", "h-camperas"]]),
        }} />
      </section>
      <section className="mt-20 bg-accent py-16 text-accent-ink">
        <div className="mx-auto max-w-2xl px-4 text-center"><h2 className="display h-section">10% OFF en tu primera compra</h2><p className="mt-3">Sumate al newsletter y recibí tu código de bienvenida.</p><div className="mx-auto max-w-md"><NewsletterForm /></div></div>
      </section>
      <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8"><SectionTitle>¿Cómo entrenás?</SectionTitle><Tabbed cols={5} ratio="aspect-[3/4]" tabs={{ Mujer: acts("mujer"), Hombre: acts("hombre") }} /></section>
      <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8"><SectionTitle href="/mujer?orden=mas-vendidos">Popular ahora</SectionTitle><Carousel>{popular.items.map((p) => <ProductCard key={p.id} p={p} />)}</Carousel></section>
      <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8">
        <SectionTitle>Hay más…</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {[["Guía de talles", "Encontrá tu calce perfecto.", "/ayuda/talles"], ["Cuidado de tus prendas", "Que duren más y mejor.", "/blog/cuidado-de-tus-prendas"], ["Nuestro local", "Visitanos y probate todo.", "/paginas/local"]].map(([t, d, h]) => (
            <Link key={t} href={h!} className="block border border-line p-6 hover:bg-surface"><p className="display text-2xl">{t}</p><p className="mt-2 text-sm text-muted">{d}</p><p className="label mt-6 underline">Leer más</p></Link>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-20 max-w-3xl px-4 text-sm text-muted">
        <h2 className="display mb-3 text-xl text-ink">Holy Fitness, ropa deportiva argentina</h2>
        <p>Diseñamos ropa deportiva para mujer y hombre pensada para el entrenamiento real: calzas, tops, remeras, shorts, buzos y accesorios. Tenemos local físico y tienda online con envíos a todo el país.</p>
        <div className="mt-6"><Button href="/mujer" variant="outline">Explorar tienda</Button></div>
      </section>
    </>
  );
}
