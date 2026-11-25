import Link from "next/link";
import { catalog } from "@/lib/providers";
import { Hero } from "@/components/home/Hero";
import { Carousel } from "@/components/home/Carousel";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionTitle, Button, Img } from "@/components/ui";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { NEWSLETTER_ENABLED } from "@/lib/domain/rules";

export const revalidate = 300;

export default async function Home() {
  const [categories, novedades, popular] = await Promise.all([
    catalog.listCategories().catch(() => []),
    catalog.listProducts({ featured: true, sort: "novedades", limit: 12 }),
    catalog.listProducts({ sort: "mas-vendidos", limit: 8 }),
  ]);

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Hero
        priority
        title="Estilo y comodidad"
        sub="Diseñada en Argentina para acompañarte en cada entrenamiento."
        image="/img/hero-mujer.jpg"
        position="68% 50%"
        cta1={["Explorar tienda", "/explorar"]}
      />

      {novedades.items.length > 0 && (
        <section className="mx-auto mt-12 max-w-[1600px] px-4 lg:px-8">
          <SectionTitle href="/explorar?orden=novedades">Novedades</SectionTitle>
          <Carousel>
            {novedades.items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </Carousel>
        </section>
      )}

      {sortedCategories.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8">
          <SectionTitle href="/explorar">Categorías</SectionTitle>
          <Carousel>
            {sortedCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/explorar?categoria=${encodeURIComponent(c.slug)}`}
                className="group relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-line bg-surface"
              >
                {c.image ? (
                  <>
                    <Img
                      src={c.image}
                      alt={c.name}
                      fallbackLabel={c.name}
                      className="transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width:1024px) 25vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="display text-2xl">{c.name}</p>
                    </div>
                  </>
                ) : (
                  <p className="display px-4 text-center text-2xl text-ink">{c.name}</p>
                )}
              </Link>
            ))}
          </Carousel>
        </section>
      )}

      {NEWSLETTER_ENABLED && (
        <section className="mt-20 bg-accent py-16 text-accent-ink">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="display h-section">10% OFF en tu primera compra</h2>
            <p className="mt-3">Sumate al newsletter y recibí tu código de bienvenida.</p>
            <div className="mx-auto max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </section>
      )}

      {popular.items.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8">
          <SectionTitle href="/explorar?orden=mas-vendidos">Popular ahora</SectionTitle>
          <Carousel>
            {popular.items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </Carousel>
        </section>
      )}

      <section className="mx-auto mt-20 max-w-[1600px] px-4 lg:px-8">
        <SectionTitle>Hay más…</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Cuidado de tus prendas", "Que duren más y mejor.", "/blog/cuidado-de-tus-prendas"],
            ["Nuestro local", "Visitanos y probate todo.", "/paginas/local"],
          ].map(([t, d, h]) => (
            <Link key={t} href={h!} className="block border border-line p-6 hover:bg-surface">
              <p className="display text-2xl">{t}</p>
              <p className="mt-2 text-sm text-muted">{d}</p>
              <p className="label mt-6 underline">Leer más</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl px-4 text-sm text-muted">
        <h2 className="display mb-3 text-xl text-ink">Holy Fitness, ropa deportiva para mujer</h2>
        <p>
          Diseñamos ropa deportiva y zapatillas para mujer pensadas para el entrenamiento real. Tenemos local físico y tienda online con envíos a todo el país.
        </p>
        <div className="mt-6">
          <Button href="/explorar" variant="outline">
            Explorar tienda
          </Button>
        </div>
      </section>
    </>
  );
}
