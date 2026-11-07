import { PLP } from "@/components/product/PLP";
import { parseQuery } from "@/lib/utils/query";
export const metadata = { title: "Buscar", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams; const q = typeof sp.q === "string" ? sp.q : "";
  return <PLP title={q ? `Resultados para “${q}”` : "Buscar"} crumbs={[["Buscar"]]} query={parseQuery(sp)} basePath="/buscar" searchParams={sp} />;
}
