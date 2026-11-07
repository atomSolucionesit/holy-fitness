import type { Order } from "@/lib/domain/types";
import type { OrderProvider } from "../ports";

// Memoria del proceso. Suficiente para desarrollo/demo; en producción usar Supabase (ver docs/DECISIONES.md).
const g = globalThis as unknown as { __orders?: Map<string, Order> };
const store = (g.__orders ??= new Map());

export const mockOrders: OrderProvider = {
  async createOrder(o) {
    const id = `HF-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    const order: Order = { ...o, id, createdAt: new Date().toISOString(), status: "pendiente" };
    store.set(id, order);
    return order;
  },
  async getOrder(id) { return store.get(id) ?? null; },
  async listOrdersByEmail(email) { return [...store.values()].filter((o) => o.customer.email.toLowerCase() === email.toLowerCase()).reverse(); },
  async updateStatus(id, status) { const o = store.get(id); if (o) o.status = status; },
};
