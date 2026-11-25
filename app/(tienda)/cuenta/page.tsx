import { cookies } from "next/headers";
import { AccountClient } from "@/components/account/AccountClient";
import {
  CUSTOMER_SESSION_COOKIE,
  getNexusCustomerAccount,
} from "@/lib/providers/nexus/customer-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

  const account = token
    ? await getNexusCustomerAccount(token).catch(() => ({ customer: null, orders: [] }))
    : { customer: null, orders: [] };

  return (
    <AccountClient
      initialCustomer={account.customer}
      initialOrders={account.orders}
    />
  );
}
