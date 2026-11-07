import type { Category, Collection, Customer, Order, OrderStatus, Product, ProductPage, ProductQuery } from "@/lib/domain/types";

export interface CatalogProvider {
  listProducts(q: ProductQuery): Promise<ProductPage>;
  getProduct(slug: string): Promise<Product | null>;
  getProducts(slugs: string[]): Promise<Product[]>;
  listCategories(): Promise<Category[]>;
  listCollections(): Promise<Collection[]>;
  getCollection(slug: string): Promise<Collection | null>;
  search(term: string, limit?: number): Promise<{ products: Product[]; categories: Category[] }>;
}
export interface InventoryProvider {
  /** Stock vigente por variante (fuente de verdad: stock unificado con la tienda física). */
  getStock(variantIds: string[]): Promise<Record<string, number>>;
}
export interface NewOrder extends Omit<Order, "id" | "createdAt" | "status"> {}
export interface OrderProvider {
  createOrder(o: NewOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  listOrdersByEmail(email: string): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}
export interface CustomerProvider {
  upsertCustomer(c: Omit<Customer, "id">): Promise<Customer>;
}
