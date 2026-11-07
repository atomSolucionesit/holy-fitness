import type { CatalogProvider, OrderProvider } from "../ports";

// TODO(supabase): implementar con @supabase/supabase-js (cliente server) + mappers fila → dominio.
// El esquema SQL con RLS vive en /supabase/migrations.
const pending = async (): Promise<never> => { throw new Error("SupabaseProvider pendiente: configurar proyecto y credenciales"); };
export const supabaseCatalog: CatalogProvider = {
  listProducts: pending, getProduct: pending, getProducts: pending, listCategories: pending,
  listCollections: pending, getCollection: pending, search: pending,
};
export const supabaseOrders: OrderProvider = { createOrder: pending, getOrder: pending, listOrdersByEmail: pending, updateStatus: pending };
