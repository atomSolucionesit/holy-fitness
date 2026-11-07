import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { catalog } from "@/lib/providers";
import { PDPClient } from "@/components/product/PDPClient";
import { ProductGrid } from "@/components/product/ProductCard";
import { SectionTitle, Stars } from "@/components/ui";
import { REVIEWS } from "@/data/seed";

export const revalidate = 300;
type P = { params: Promise<{ slug: string }>; searchParams: Promise<{ color?: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await catalog.getProduct((await params).slug); if (!p) return {};
  return { title: p.name, description: p.description.slice(0, 155), openGraph: { images: [p.colors[0]!.images[0]!] } };
}
export default async function Page({ params, searchParams }: P) {
  const { slug } = await params; const { color } = await searchParams;
  const p = await catalog.getProduct(slug); if (!p) notFound();
  const related = (await catalog.listProducts({ gender: p.gender, category: p.category, limit: 5 })).items.filter((x) => x.id !== p.id).slice(0, 4);
  const look = (await catalog.listProducts({ gender: p.gender, collection: p.collections[0], limit: 5 })).items.filter((x) => x.id !== p.id && x.category !== p.category).slice(0, 4);
  const ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, image: p.colors.map((c) => c.images[0]), sku: p.variants[0]?.sku, brand: { "@type": "Brand", name: "Holy Fitness" }, aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount }, offers: { "@type": "Offer", priceCurrency: "ARS", price: p.price, availability: p.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } };
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="py-4 text-xs text-muted"><Link href="/">Inicio</Link> / <Link href={`/${p.gender}`} className="capitalize">{p.gender}</Link> / <Link href={`/${p.gender}/${p.category}`} className="capitalize">{p.category}</Link></nav>
      <PDPClient p={p} initialColor={color} />
      <section className="mt-20"><SectionTitle>Reseñas</SectionTitle>
        <div className="mb-6 flex items-center gap-3"><span className="display text-5xl">{p.rating}</span><Stars rating={p.rating} count={p.reviewCount} /></div>
        <div className="grid gap-4 md:grid-cols-2">{REVIEWS.map((r) => <div key={r.author} className="border border-line p-5"><Stars rating={r.rating} /><p className="mt-2 font-semibold">{r.title}</p><p className="mt-1 text-sm text-muted">{r.body}</p><p className="mt-3 text-xs">{r.author}</p></div>)}</div></section>
      {look.length > 0 && <section className="mt-20"><SectionTitle>Completá el look</SectionTitle><ProductGrid items={look} /></section>}
      {related.length > 0 && <section className="mt-20"><SectionTitle>También te puede gustar</SectionTitle><ProductGrid items={related} /></section>}
    </div>
  );
}
