import "server-only";
import { mockCatalog, mockInventory } from "./mock/catalog";
import { mockOrders } from "./mock/orders";
import { nexusCatalog, nexusInventory, nexusOrders } from "./nexus";
import { supabaseCatalog, supabaseOrders } from "./supabase";
import type { CatalogProvider, InventoryProvider, OrderProvider } from "./ports";

const pick = <T,>(src: string | undefined, m: T, s: T, n: T): T => (src === "nexus" ? n : src === "supabase" ? s : m);

export const catalog: CatalogProvider = pick(process.env.CATALOG_SOURCE, mockCatalog, supabaseCatalog, nexusCatalog);
export const inventory: InventoryProvider = pick(process.env.CATALOG_SOURCE, mockInventory, mockInventory, nexusInventory);
export const orders: OrderProvider = pick(process.env.ORDERS_SOURCE, mockOrders, supabaseOrders, nexusOrders);
