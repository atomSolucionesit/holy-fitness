import type { MetadataRoute } from "next";
import { catalog } from "@/lib/providers";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [all, cats, cols] = await Promise.all([
    catalog.listProducts({ limit: 500 }),
    catalog.listCategories().catch(() => []),
    catalog.listCollections().catch(() => []),
  ]);

  return [
    { url: `${site}` },
    { url: `${site}/explorar` },
    ...cats.map((c) => ({ url: `${site}/explorar?categoria=${encodeURIComponent(c.slug)}` })),
    ...cols.map((c) => ({ url: `${site}/coleccion/${c.slug}` })),
    ...all.items.map((p) => ({ url: `${site}/producto/${p.slug}` })),
  ];
}
