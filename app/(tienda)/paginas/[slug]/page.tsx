import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PAGINAS } from "@/data/content";

type P = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return Object.keys(PAGINAS).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = PAGINAS[(await params).slug];
  return { title: p?.title };
}

const MAPS_QUERY = encodeURIComponent("Colón 1037, Paso de los Libres, Corrientes, Argentina");

export default async function Page({ params }: P) {
  const { slug } = await params;
  const p = PAGINAS[slug];
  if (!p) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display h-section mb-6">{p.title}</h1>
      <div className="space-y-4 text-muted">
        {p.body.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>

      {slug === "local" && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/5493772563993"
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex h-10 items-center border border-ink bg-ink px-5 text-white hover:opacity-90"
            >
              Escribir por WhatsApp (3772 563993)
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex h-10 items-center border border-ink px-5 text-ink hover:bg-surface"
            >
              Abrir en Google Maps
            </a>
          </div>

          <div className="aspect-[16/9] w-full overflow-hidden border border-line bg-surface">
            <iframe
              title="Mapa de Holy Fitness - Colón 1037"
              src={`https://maps.google.com/maps?q=${MAPS_QUERY}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </article>
  );
}
