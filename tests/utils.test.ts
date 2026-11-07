import { describe, expect, it } from "vitest";
import { formatMoney, slugify, normalize, discountPct } from "@/lib/utils";
import { couponDiscount, orderTotals, shippingCost, FREE_SHIPPING_FROM } from "@/lib/domain/rules";
import { mockCatalog } from "@/lib/providers/mock/catalog";

describe("utils", () => {
  it("formatea ARS", () => expect(formatMoney(45990)).toMatch(/^\$ 45\.990$/));
  it("slugify sin tildes", () => expect(slugify("Calza Sculpt Cintura Alta")).toBe("calza-sculpt-cintura-alta"));
  it("normalize", () => expect(normalize("Bordó")).toBe("bordo"));
  it("descuento", () => expect(discountPct(80, 100)).toBe(20));
});
describe("reglas", () => {
  it("cupón", () => expect(couponDiscount("BIENVENIDA10", 10000)).toBe(1000));
  it("envío gratis por monto", () => expect(shippingCost("domicilio", "1000", FREE_SHIPPING_FROM)).toBe(0));
  it("retiro gratis", () => expect(shippingCost("retiro", "5000", 100)).toBe(0));
  it("totales", () => expect(orderTotals([{ unitPrice: 10000, qty: 2 }], undefined, "domicilio", "1000").total).toBe(24500));
});
describe("catálogo mock", () => {
  it("filtra por género", async () => { const r = await mockCatalog.listProducts({ gender: "hombre", limit: 100 }); expect(r.items.every((p) => p.gender === "hombre")).toBe(true); });
  it("busca sin tildes", async () => { const r = await mockCatalog.search("bordo"); expect(r.products.length).toBeGreaterThan(0); });
  it("al menos 40 productos", async () => { expect((await mockCatalog.listProducts({ limit: 100 })).total).toBeGreaterThanOrEqual(40); });
});
