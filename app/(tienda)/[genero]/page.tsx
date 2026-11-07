import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLP } from "@/components/product/PLP";
import { GENDERS, parseQuery } from "@/lib/utils/query";
import type { Gender } from "@/lib/domain/types";

type P = { params: Promise<{ genero: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export async function generateMetadata({ params }: P): Promise<Metadata> { const { genero } = await params; return { title: `Ropa deportiva ${cap(genero)}`, description: `Comprá ropa deportiva de ${genero} en Holy Fitness.` }; }
export default async function Page({ params, searchParams }: P) {
  const { genero } = await params; const sp = await searchParams;
  if (!GENDERS.includes(genero as Gender)) notFound();
  return <PLP title={cap(genero)} subtitle="Todo para entrenar, sin distracciones." crumbs={[[cap(genero)]]} query={parseQuery(sp, { gender: genero as Gender })} basePath={`/${genero}`} searchParams={sp} />;
}
