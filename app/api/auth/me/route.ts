import { cookies } from "next/headers";
import {
  CUSTOMER_SESSION_COOKIE,
  getNexusCustomerAccount,
} from "@/lib/providers/nexus/customer-session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) {
    return Response.json({ authenticated: false, customer: null, orders: [] });
  }

  const { customer, orders } = await getNexusCustomerAccount(token);
  if (!customer) {
    return Response.json({ authenticated: false, customer: null, orders: [] });
  }

  return Response.json({ authenticated: true, customer, orders });
}
