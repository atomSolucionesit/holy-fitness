import type { CatalogProvider, InventoryProvider, OrderProvider } from "../ports";
import { nexusFetch } from "./client";

// TODO(nexus): definir tipos de respuesta de Nexus y mappers → dominio (lib/domain/types.ts).
const todo = async (): Promise<never> => { await nexusFetch("TODO"); throw new Error("unreachable"); };

export const nexusCatalog: CatalogProvider = {
  listProducts: todo, getProduct: todo, getProducts: todo, listCategories: todo,
  listCollections: todo, getCollection: todo, search: todo,
};
export const nexusInventory: InventoryProvider = { getStock: todo };
export const nexusOrders: OrderProvider = { createOrder: todo, getOrder: todo, listOrdersByEmail: todo, updateStatus: todo };
