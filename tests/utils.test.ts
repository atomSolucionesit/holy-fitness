import { describe, expect, it } from "vitest";
import { formatMoney, slugify, normalize, discountPct } from "@/lib/utils";
import { couponDiscount, orderTotals } from "@/lib/domain/rules";
import { tariff, zoneOf } from "@/lib/shipping/tariffs";
import { mockCatalog } from "@/lib/providers/mock/catalog";

describe("utils", () => {
  it("formatea ARS", () => expect(formatMoney(45990)).toMatch(/^\$ 45\.990$/));
  it("slugify sin tildes", () => expect(slugify("Calza Sculpt Cintura Alta")).toBe("calza-sculpt-cintura-alta"));
  it("normalize", () => expect(normalize("Bordó")).toBe("bordo"));
  it("descuento", () => expect(discountPct(80, 100)).toBe(20));
});
describe("reglas", () => {
  it("cupón", () => expect(couponDiscount("BIENVENIDA10", 10000)).toBe(1000));
  it("totales", () => expect(orderTotals([{ unitPrice: 10000, qty: 2 }], undefined, 4500).total).toBe(24500));
});
describe("envíos", () => {
  it("zonas por CP", () => { expect(zoneOf("1425")).toBe("caba"); expect(zoneOf("1900")).toBe("gba"); expect(zoneOf("9000")).toBe("patagonia"); expect(zoneOf("12")).toBeNull(); });
  it("más peso, más caro", () => expect(tariff("correo-argentino", "domicilio", "caba", 3000).price).toBeGreaterThan(tariff("correo-argentino", "domicilio", "caba", 500).price));
  it("sucursal más barata que domicilio", () => expect(tariff("via-cargo", "sucursal", "centro", 800).price).toBeLessThan(tariff("via-cargo", "domicilio", "centro", 800).price));
});
describe("catálogo mock", () => {
  it("filtra por género", async () => { const r = await mockCatalog.listProducts({ gender: "zapatillas", limit: 100 }); expect(r.items.every((p) => p.gender === "zapatillas")).toBe(true); });
  it("busca sin tildes", async () => { const r = await mockCatalog.search("bordo"); expect(r.products.length).toBeGreaterThan(0); });
  it("al menos 40 productos", async () => { expect((await mockCatalog.listProducts({ limit: 100 })).total).toBeGreaterThanOrEqual(40); });
});
