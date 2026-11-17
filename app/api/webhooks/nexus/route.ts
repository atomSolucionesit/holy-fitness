import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { invalidateNexusCatalogCache } from "@/lib/providers/nexus";

/** Webhook de Nexus (stock/precio). Firma HMAC-SHA256 en `x-nexus-signature`. */
export async function POST(req: Request) {
  const secret = process.env.NEXUS_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "No configurado" }, { status: 503 });
  const raw = await req.text();
  const sig = (req.headers.get("x-nexus-signature") ?? "").replace(/^sha256=/i, "");
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "Firma inválida" }, { status: 401 });
  invalidateNexusCatalogCache();
  revalidateTag("catalog", "max");
  return Response.json({ ok: true });
}
