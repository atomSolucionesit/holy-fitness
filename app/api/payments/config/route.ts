import { nexusGetPaymentConfig, type EcommercePaymentConfig } from "@/lib/providers/nexus";

const DEFAULT_CONFIG: EcommercePaymentConfig = {
  methods: [
    {
      method: "mercadopago",
      enabled: true,
      label: "Mercado Pago (tarjetas, hasta 3 cuotas sin interés)",
      discountPercent: 0,
      onlyPickup: false,
    },
    {
      method: "transferencia",
      enabled: true,
      label: "Transferencia bancaria",
      discountPercent: 0,
      onlyPickup: false,
    },
    {
      method: "local",
      enabled: true,
      label: "Pago en el local (solo con retiro)",
      discountPercent: 0,
      onlyPickup: true,
    },
  ],
  installmentRules: [{ minAmount: 0, maxInstallments: 3 }],
  mpConnected: false,
};

export async function GET() {
  if (process.env.CATALOG_SOURCE === "nexus" || process.env.ORDERS_SOURCE === "nexus") {
    try {
      const cfg = await nexusGetPaymentConfig();
      return Response.json(cfg);
    } catch {
      return Response.json(DEFAULT_CONFIG);
    }
  }
  return Response.json(DEFAULT_CONFIG);
}
