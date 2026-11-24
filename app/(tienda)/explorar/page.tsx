import type { Metadata } from "next";
import { PLP } from "@/components/product/PLP";
import { parseQuery } from "@/lib/utils/query";

type P = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Explorar productos",
  description: "Explorá todas las categorías y productos publicados de Holy Fitness.",
};

export default async function ExplorarPage({ searchParams }: P) {
  const sp = await searchParams;
  const query = parseQuery(sp);
  const selectedCats = query.categories ?? [];
  const title =
    selectedCats.length === 1
      ? selectedCats[0]!.charAt(0).toUpperCase() + selectedCats[0]!.slice(1).replace(/-/g, " ")
      : "Explorar";

  return (
    <PLP
      title={title}
      subtitle="Filtrá por categoría, talle, color, fit y precio."
      crumbs={
        selectedCats.length === 1
          ? [["Explorar", "/explorar"], [title]]
          : [["Explorar"]]
      }
      query={query}
      basePath="/explorar"
      searchParams={sp}
    />
  );
}
