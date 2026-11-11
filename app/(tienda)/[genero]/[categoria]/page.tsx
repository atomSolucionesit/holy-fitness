import { notFound } from "next/navigation";
import { PLP } from "@/components/product/PLP";
import { GENDERS, parseQuery } from "@/lib/utils/query";
import type { Gender } from "@/lib/domain/types";

type P = { params: Promise<{ genero: string; categoria: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export default async function Page({ params, searchParams }: P) {
  const { genero, categoria } = await params; const sp = await searchParams;
  if (!GENDERS.includes(genero as Gender)) notFound();
  return <PLP title={genero === "zapatillas" ? `Zapatillas ${categoria}` : `${cap(categoria)} ${cap(genero)}`} crumbs={[[cap(genero), `/${genero}`], [cap(categoria)]]} query={parseQuery(sp, { gender: genero as Gender, category: categoria })} basePath={`/${genero}/${categoria}`} searchParams={sp} />;
}
