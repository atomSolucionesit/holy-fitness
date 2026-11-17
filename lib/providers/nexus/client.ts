import "server-only";
import { createHmac } from "node:crypto";

export class NexusError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "NexusError";
  }
}

export interface NexusConfig {
  apiBase: string;
  originUrl: string;
  companyId: number;
  webhookSecret: string;
}

export function getNexusConfig(): NexusConfig {
  const rawUrl = (process.env.NEXUS_API_URL || "https://api-test.atomsolucionesit.com.ar/api").trim().replace(/\/+$/, "");
  const apiBase = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
  const originUrl = apiBase.replace(/\/api$/, "");
  const companyId = Number(process.env.NEXUS_COMPANY_ID || 44);
  if (!Number.isInteger(companyId) || companyId <= 0) {
    throw new NexusError("NEXUS_COMPANY_ID inválido");
  }
  const webhookSecret = (process.env.NEXUS_WEBHOOK_SECRET || process.env.NEXUS_API_KEY || "").trim();
  return { apiBase, originUrl, companyId, webhookSecret };
}

export function resolveNexusAssetUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/img/") || trimmed.startsWith("/api/")) return trimmed;
  const { originUrl } = getNexusConfig();
  return `${originUrl}/${trimmed.replace(/^\/+/, "")}`;
}

type FetchOptions = RequestInit & {
  revalidate?: number | false;
  tags?: string[];
  timeoutMs?: number;
  retries?: number;
};

export async function nexusFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { apiBase, webhookSecret } = getNexusConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${apiBase}${normalizedPath}`;
  const { revalidate = 60, tags = ["catalog"], timeoutMs = 10000, retries = 2, headers, ...rest } = opts;

  const reqHeaders = new Headers(headers);
  if (!reqHeaders.has("Accept")) reqHeaders.set("Accept", "application/json");
  if (webhookSecret && normalizedPath.startsWith("/webhooks/") && !reqHeaders.has("x-nexus-secret")) {
    reqHeaders.set("x-nexus-secret", webhookSecret);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...rest,
        cache: "no-store",
        headers: reqHeaders,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg =
          (body && typeof body === "object" && "message" in body && String((body as { message: unknown }).message)) ||
          `Error HTTP ${res.status} al consultar Nexus (${normalizedPath})`;
        if (res.status >= 500 && attempt < retries) {
          lastError = new NexusError(msg, res.status, body);
          await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
          continue;
        }
        throw new NexusError(msg, res.status, body);
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (err instanceof NexusError && err.status && err.status < 500) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new NexusError(`No se pudo conectar con Nexus (${normalizedPath})`);
}

/**
 * Envía un evento firmado con HMAC-SHA256 al receptor de webhooks de Nexus:
 * POST /api/webhooks/incoming/:companyId
 */
export async function nexusWebhookSend<T = Record<string, unknown>>(
  payload: Record<string, unknown>,
): Promise<T> {
  const { companyId, webhookSecret } = getNexusConfig();
  if (!webhookSecret) {
    throw new NexusError(
      "Falta configurar NEXUS_WEBHOOK_SECRET en .env.local (copialo desde Nexus > Integraciones > Webhooks).",
      503,
    );
  }

  const rawBody = JSON.stringify(payload);
  const signature = `sha256=${createHmac("sha256", webhookSecret).update(rawBody).digest("hex")}`;

  return nexusFetch<T>(`/webhooks/incoming/${companyId}`, {
    method: "POST",
    cache: "no-store",
    retries: 1,
    headers: {
      "Content-Type": "application/json",
      "x-nexus-secret": webhookSecret,
      "x-nexus-signature": signature,
    },
    body: rawBody,
  });
}

const g = globalThis as unknown as {
  __nexusJwtCache?: Map<number, { token: string; expiresAt: number }>;
};
const jwtCache = (g.__nexusJwtCache ??= new Map<number, { token: string; expiresAt: number }>());

/**
 * Obtiene un JWT de sesión ecommerce para la empresa actual (`NEXUS_COMPANY_ID`)
 * usando los endpoints existentes de Nexus (`/company/service/:id` -> `/auth/ecommerce/login`).
 */
export async function getNexusEcommerceJwt(forceRefresh = false): Promise<string> {
  const { companyId } = getNexusConfig();
  const cached = jwtCache.get(companyId);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  let companyToken = (process.env.NEXUS_API_KEY || "").trim();
  if (!companyToken) {
    const companyRes = await nexusFetch<{ info?: { token?: string } }>(`/company/service/${companyId}`);
    companyToken = companyRes?.info?.token?.trim() || "";
  }
  if (!companyToken) {
    throw new NexusError(`No se pudo resolver el token de la empresa ${companyId} en Nexus`, 401);
  }

  const loginRes = await nexusFetch<{ info?: { access_token?: string } }>("/auth/ecommerce/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyToken }),
  });

  const jwt = loginRes?.info?.access_token?.trim();
  if (!jwt) {
    throw new NexusError("Nexus no devolvió un access_token para la sesión ecommerce", 401);
  }

  jwtCache.set(companyId, {
    token: jwt,
    expiresAt: Date.now() + 30 * 60_000, // 30 minutos de caché en memoria
  });
  return jwt;
}

/**
 * Llamada autenticada como la empresa actual en Nexus (para leer medios de pago,
 * reglas de cuotas de Mercado Pago y generar preferencias de Checkout Pro).
 */
export async function nexusAuthFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const jwt = await getNexusEcommerceJwt();
  const headers = new Headers(opts.headers);
  headers.set("Authorization", `Bearer ${jwt}`);
  try {
    return await nexusFetch<T>(path, { ...opts, headers });
  } catch (err) {
    if (err instanceof NexusError && err.status === 401) {
      const freshJwt = await getNexusEcommerceJwt(true);
      headers.set("Authorization", `Bearer ${freshJwt}`);
      return await nexusFetch<T>(path, { ...opts, headers });
    }
    throw err;
  }
}
