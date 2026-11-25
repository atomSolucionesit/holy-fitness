import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { catalog } from "@/lib/providers";
import { PDPClient } from "@/components/product/PDPClient";
import { ProductGrid } from "@/components/product/ProductCard";
import { SectionTitle } from "@/components/ui";

export const revalidate = 300;
type P = { params: Promise<{ slug: string }>; searchParams: Promise<{ color?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await catalog.getProduct((await params).slug);
  if (!p) return {};
  const firstImg = p.colors[0]?.images[0];
  return { title: p.name, description: p.description.slice(0, 155), openGraph: firstImg ? { images: [firstImg] } : undefined };
}

export default async function Page({ params, searchParams }: P) {
  const { slug } = await params;
  const { color } = await searchParams;
  const p = await catalog.getProduct(slug);
  if (!p) notFound();

  const related = (await catalog.listProducts({ category: p.category, limit: 5 })).items
    .filter((x) => x.id !== p.id)
    .slice(0, 4);
  const look = p.collections[0]
    ? (await catalog.listProducts({ collection: p.collections[0], limit: 5 })).items
        .filter((x) => x.id !== p.id && x.category !== p.category)
        .slice(0, 4)
    : [];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.colors.map((c) => c.images[0]),
    sku: p.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Holy Fitness" },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: p.price,
      availability: p.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="py-4 text-xs text-muted">
        <Link href="/">Inicio</Link> /{" "}
        <Link href="/explorar">Explorar</Link> /{" "}
        <Link href={`/explorar?categoria=${encodeURIComponent(p.category)}`} className="capitalize">
          {p.category.replace(/-/g, " ")}
        </Link>
      </nav>
      <PDPClient p={p} initialColor={color} />
      {look.length > 0 && (
        <section className="mt-20">
          <SectionTitle>Completá el look</SectionTitle>
          <ProductGrid items={look} />
        </section>
      )}
      {related.length > 0 && (
        <section className="mt-20">
          <SectionTitle>También te puede gustar</SectionTitle>
          <ProductGrid items={related} />
        </section>
      )}
    </div>
  );
}
