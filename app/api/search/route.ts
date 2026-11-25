import { catalog } from "@/lib/providers";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 60) ?? "";
  const r = await catalog.search(q, 8);
  return Response.json({
    products: r.products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.colors[0]?.images[0],
      fit: p.fit,
      category: p.category.replace(/-/g, " "),
    })),
    categories: r.categories.map((c) => ({
      name: c.name,
      href: `/explorar?categoria=${encodeURIComponent(c.slug)}`,
    })),
  });
}
