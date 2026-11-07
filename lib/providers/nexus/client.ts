import "server-only";

/**
 * Cliente HTTP de Nexus. SOLO servidor. No hay endpoints inventados: todo lo marcado TODO
 * se completa cuando revisemos la documentación de la API (ver docs/NEXUS.md).
 */
export class NexusError extends Error {}

export async function nexusFetch<T>(_path: string, _init?: RequestInit): Promise<T> {
  const base = process.env.NEXUS_API_URL; const key = process.env.NEXUS_API_KEY;
  if (!base || !key) throw new NexusError("Nexus no configurado (NEXUS_API_URL / NEXUS_API_KEY)");
  // TODO(nexus): autenticación real (header, esquema), paginación, timeouts y reintentos con backoff.
  throw new NexusError("NexusProvider pendiente de implementación");
}
