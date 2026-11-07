import { notFound } from "next/navigation";
import { PLP } from "@/components/product/PLP";
import { catalog } from "@/lib/providers";
import { parseQuery } from "@/lib/utils/query";

type P = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function Page({ params, searchParams }: P) {
  const { slug } = await params; const sp = await searchParams;
  const c = await catalog.getCollection(slug); if (!c) notFound();
  return <PLP title={c.name} subtitle={c.tagline} crumbs={[["Colecciones"], [c.name]]} query={parseQuery(sp, { collection: slug })} basePath={`/coleccion/${slug}`} searchParams={sp} />;
}
