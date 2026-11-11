import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLP } from "@/components/product/PLP";
import { GENDERS, parseQuery } from "@/lib/utils/query";
import type { Gender } from "@/lib/domain/types";

type P = { params: Promise<{ genero: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const META: Record<string, [string, string]> = {
  mujer: ["Ropa deportiva para mujer", "Comprá ropa deportiva para mujer en Holy Fitness."],
  zapatillas: ["Zapatillas deportivas para mujer", "Comprá zapatillas de running, training y urbanas para mujer en Holy Fitness."],
  accesorios: ["Accesorios deportivos", "Comprá accesorios para entrenar en Holy Fitness."],
};
export async function generateMetadata({ params }: P): Promise<Metadata> { const { genero } = await params; const [title, description] = META[genero] ?? [cap(genero), ""]; return { title, description }; }
export default async function Page({ params, searchParams }: P) {
  const { genero } = await params; const sp = await searchParams;
  if (!GENDERS.includes(genero as Gender)) notFound();
  return <PLP title={cap(genero)} subtitle="Todo para entrenar, sin distracciones." crumbs={[[cap(genero)]]} query={parseQuery(sp, { gender: genero as Gender })} basePath={`/${genero}`} searchParams={sp} />;
}
