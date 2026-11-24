import { z } from "zod";
import { catalog } from "@/lib/providers";
import { couponDiscount } from "@/lib/domain/rules";
import { nexusValidateCoupon } from "@/lib/providers/nexus";

const schema = z.object({
  code: z.string().trim().min(1, "Ingresá un cupón").max(40),
  items: z
    .array(
      z.object({
        slug: z.string().max(120),
        qty: z.number().int().min(1).max(50),
      }),
    )
    .min(1, "Tu carrito está vacío")
    .max(50),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { valid: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { code, items } = parsed.data;
  const normalizedCode = code.trim().toUpperCase();

  if (process.env.CATALOG_SOURCE === "nexus") {
    const result = await nexusValidateCoupon(normalizedCode, items, false);
    if (!result.isValid) {
      return Response.json({ valid: false, error: result.message }, { status: 422 });
    }
    return Response.json({
      valid: true,
      code: result.code,
      discount: result.discount,
      message: result.message,
      type: result.type,
      value: result.value,
    });
  }

  const products = await catalog.getProducts([...new Set(items.map((i) => i.slug))]);
  const subtotal = items.reduce((sum, it) => {
    const p = products.find((x) => x.slug === it.slug);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
  const discount = couponDiscount(normalizedCode, subtotal);
  if (discount <= 0) {
    return Response.json({ valid: false, error: "Cupón inválido" }, { status: 422 });
  }
  return Response.json({ valid: true, code: normalizedCode, discount, message: "Cupón aplicado" });
}
