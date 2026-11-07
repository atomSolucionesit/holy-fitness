import { catalog } from "@/lib/providers";
export async function GET(req: Request) {
  const slugs = (new URL(req.url).searchParams.get("slugs") ?? "").split(",").filter(Boolean).slice(0, 50);
  return Response.json(await catalog.getProducts(slugs));
}
