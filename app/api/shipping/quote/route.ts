import { z } from "zod";
import { quoteForCart } from "@/lib/shipping/cart";

const schema = z.object({
  zip: z.string().regex(/^\d{4}$/, "Ingresá un código postal de 4 dígitos"),
  items: z.array(z.object({ slug: z.string().max(120), qty: z.number().int().min(1).max(20) })).min(1).max(50),
  coupon: z.string().max(30).optional(),
});
export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return Response.json({ error: p.error.issues[0]?.message ?? "Solicitud inválida" }, { status: 400 });
  try {
    const q = await quoteForCart(p.data.items, p.data.zip, p.data.coupon);
    if (q.options.length === 0) return Response.json({ error: "No pudimos cotizar ese código postal" }, { status: 422 });
    return Response.json({ options: q.options, free: q.free });
  } catch {
    return Response.json({ error: "No pudimos cotizar el envío ahora. Probá de nuevo en unos minutos." }, { status: 502 });
  }
}
