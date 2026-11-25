import "server-only";
import { nexusCatalog, nexusInventory, nexusOrders } from "./nexus";
import { supabaseCatalog, supabaseOrders } from "./supabase";
import type { CatalogProvider, InventoryProvider, OrderProvider } from "./ports";

export const catalog: CatalogProvider =
  process.env.CATALOG_SOURCE === "supabase" ? supabaseCatalog : nexusCatalog;
export const inventory: InventoryProvider = nexusInventory;
export const orders: OrderProvider =
  process.env.ORDERS_SOURCE === "supabase" ? supabaseOrders : nexusOrders;
