import { z } from "zod";
import { inventory } from "@/lib/providers";
const schema = z.object({ ids: z.array(z.string().max(120)).max(50) });
export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return Response.json({ error: "Solicitud inválida" }, { status: 400 });
  return Response.json(await inventory.getStock(p.data.ids));
}
