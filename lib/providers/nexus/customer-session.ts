import "server-only";
import { createHmac } from "crypto";
import { getNexusConfig, nexusFetch } from "./client";

export const CUSTOMER_SESSION_COOKIE = "hf_customer_session";

export interface NexusCustomerProfile {
  id: number;
  name: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface NexusCustomerOrderItem {
  id?: number | string;
  itemName?: string | null;
  quantity: number;
  price: number;
  description?: string | null;
}

export interface NexusCustomerOrder {
  id: string;
  correlative: string;
  date: string;
  status: string;
  total: number;
  shippingCost?: number | null;
  details?: NexusCustomerOrderItem[];
}

function splitDisplayName(displayName?: string | null, email?: string): { name: string; lastName: string } {
  const clean = (displayName || "").trim();
  if (!clean) {
    const prefix = (email || "Cliente").split("@")[0] || "Cliente";
    return { name: prefix, lastName: "" };
  }
  const parts = clean.split(/\s+/);
  return {
    name: parts[0] || "Cliente",
    lastName: parts.slice(1).join(" "),
  };
}

export async function verifyFirebaseIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  lastName: string;
}> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Falta NEXT_PUBLIC_FIREBASE_API_KEY en el servidor");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("No pudimos validar tu sesión con Google");
  }

  const data = (await res.json()) as {
    users?: Array<{ email?: string; displayName?: string; emailVerified?: boolean }>;
  };
  const user = data.users?.[0];
  if (!user?.email) {
    throw new Error("La cuenta de Google no devolvió un email válido");
  }

  const { name, lastName } = splitDisplayName(user.displayName, user.email);
  return { email: user.email.trim().toLowerCase(), name, lastName };
}

function syncSecretHeaders(rawBody: string): Record<string, string> {
  const { webhookSecret } = getNexusConfig();
  if (!webhookSecret) {
    throw new Error("Falta configurar NEXUS_WEBHOOK_SECRET en el servidor");
  }
  const signature = `sha256=${createHmac("sha256", webhookSecret).update(rawBody).digest("hex")}`;
  return {
    "Content-Type": "application/json",
    "x-nexus-secret": webhookSecret,
    "x-nexus-signature": signature,
  };
}

export async function createNexusCustomerSession(input: {
  email: string;
  name: string;
  lastName?: string;
}): Promise<{ token: string; expiresAt?: string; customer: NexusCustomerProfile }> {
  const { companyId } = getNexusConfig();
  const rawBody = JSON.stringify({
    email: input.email,
    name: input.name,
    lastName: input.lastName || undefined,
    ttlDays: 30,
  });

  return nexusFetch<{ token: string; expiresAt?: string; customer: NexusCustomerProfile }>(
    `/webhooks/sync/${companyId}/sessions`,
    {
      method: "POST",
      cache: "no-store",
      headers: syncSecretHeaders(rawBody),
      body: rawBody,
    },
  );
}

export async function getNexusCustomerAccount(sessionToken: string): Promise<{
  customer: NexusCustomerProfile | null;
  orders: NexusCustomerOrder[];
}> {
  const { companyId } = getNexusConfig();
  const headers = { "x-customer-session": sessionToken };

  const [meRes, ordersRes] = await Promise.all([
    nexusFetch<{ customer?: NexusCustomerProfile } | NexusCustomerProfile>(
      `/webhooks/sync/${companyId}/me`,
      { cache: "no-store", headers },
    ).catch(() => null),
    nexusFetch<{ orders?: NexusCustomerOrder[]; data?: NexusCustomerOrder[] }>(
      `/webhooks/sync/${companyId}/me/orders?page=1&limit=20`,
      { cache: "no-store", headers },
    ).catch(() => null),
  ]);

  const customer =
    meRes && "customer" in meRes && meRes.customer
      ? meRes.customer
      : meRes && "id" in meRes
        ? (meRes as NexusCustomerProfile)
        : null;

  const orders = Array.isArray(ordersRes?.orders)
    ? ordersRes.orders
    : Array.isArray(ordersRes?.data)
      ? ordersRes.data
      : [];

  return { customer, orders };
}

export async function revokeNexusCustomerSession(sessionToken: string): Promise<void> {
  const { companyId } = getNexusConfig();
  const rawBody = JSON.stringify({ token: sessionToken });
  await nexusFetch(`/webhooks/sync/${companyId}/sessions/revoke`, {
    method: "POST",
    cache: "no-store",
    headers: syncSecretHeaders(rawBody),
    body: rawBody,
  }).catch(() => undefined);
}
