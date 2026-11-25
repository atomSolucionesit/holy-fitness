import { cookies } from "next/headers";
import {
  CUSTOMER_SESSION_COOKIE,
  revokeNexusCustomerSession,
} from "@/lib/providers/nexus/customer-session";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) {
    await revokeNexusCustomerSession(token);
  }
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  return Response.json({ ok: true });
}
