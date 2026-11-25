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

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <AccountClient
      initialCustomer={account.customer}
      initialOrders={account.orders}
      firebaseConfig={firebaseConfig}
    />
  );
}
