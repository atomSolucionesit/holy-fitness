import "server-only";
import { nexusShipping } from "@/lib/providers/nexus";
import type { ShippingOption } from "./types";

export interface QuoteInput {
  zip: string;
  weightGrams: number;
  subtotal?: number;
  items?: { slug: string; qty: number }[];
}
export interface ShippingProvider {
  quote(i: QuoteInput): Promise<ShippingOption[]>;
  freeShippingFrom?(): Promise<number>;
}

export const shipping: ShippingProvider = nexusShipping;
