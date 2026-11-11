export type Gender = "mujer" | "zapatillas" | "accesorios";
export type Badge = "NUEVO" | "MÁS VENDIDO" | "ÚLTIMAS UNIDADES";

export interface ColorOption { name: string; hex: string; images: string[] }
export interface Variant { id: string; sku: string; color: string; size: string; stock: number }

export interface Product {
  id: string; slug: string; name: string; fit: string; description: string;
  gender: Gender; category: string; activities: string[]; collections: string[];
  price: number; compareAtPrice?: number; badges: Badge[];
  colors: ColorOption[]; variants: Variant[];
  composition: string; rating: number; reviewCount: number; createdAt: string; sales: number;
}
export interface Category { slug: string; name: string; gender: Gender }
export interface Collection { slug: string; name: string; tagline: string; image: string }
export interface Customer { id: string; email: string; name: string; phone?: string }

export type ShippingMethod = "envio" | "retiro";
export type PaymentMethod = "mercadopago" | "transferencia" | "local";
export type OrderStatus = "pendiente" | "pagado" | "preparando" | "enviado" | "entregado" | "cancelado";

export interface OrderItem { variantId: string; productSlug: string; name: string; color: string; size: string; unitPrice: number; qty: number }
export interface Order {
  id: string; createdAt: string; status: OrderStatus; items: OrderItem[];
  subtotal: number; discount: number; shipping: number; total: number;
  couponCode?: string; shippingMethod: ShippingMethod;
  shippingOption?: { id: string; carrierName: string; service: string; label: string; eta: string }; paymentMethod: PaymentMethod;
  customer: { name: string; email: string; phone: string };
  address?: { street?: string; city: string; province: string; zip: string };
}

export interface ProductQuery {
  gender?: Gender; category?: string; collection?: string; activity?: string;
  sizes?: string[]; colors?: string[]; fits?: string[]; minPrice?: number; maxPrice?: number;
  sort?: "destacados" | "novedades" | "precio-asc" | "precio-desc" | "mas-vendidos";
  q?: string; limit?: number; offset?: number; badge?: Badge; onSale?: boolean;
}
export interface ProductPage { items: Product[]; total: number; facets: { sizes: Record<string, number>; colors: Record<string, number>; fits: Record<string, number>; categories: Record<string, number> } }
