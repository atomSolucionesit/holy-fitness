import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PAGINAS } from "@/data/content";

type P = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return Object.keys(PAGINAS).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: P): Promise<Metadata> { const p = PAGINAS[(await params).slug]; return { title: p?.title }; }
export default async function Page({ params }: P) {
  const p = PAGINAS[(await params).slug]; if (!p) notFound();
  return (<article className="mx-auto max-w-2xl px-4 py-12"><h1 className="display h-section mb-6">{p.title}</h1><div className="space-y-4 text-muted">{p.body.map((t, i) => <p key={i}>{t}</p>)}</div></article>);
}
