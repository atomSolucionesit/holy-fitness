import type { Carrier, Service } from "./tariffs";
export interface ShippingOption {
  id: string; carrier: Carrier | "retiro"; carrierName: string; service: Service | "retiro";
  label: string; price: number; etaMin: number; etaMax: number;
}
export const RETIRO: ShippingOption = { id: "retiro", carrier: "retiro", carrierName: "Retiro en el local", service: "retiro", label: "Retiro en el local", price: 0, etaMin: 0, etaMax: 1 };
export const etaText = (o: Pick<ShippingOption, "etaMin" | "etaMax" | "service">) =>
  o.service === "retiro" ? "Disponible en 24 h" : `${o.etaMin} a ${o.etaMax} días hábiles`;
