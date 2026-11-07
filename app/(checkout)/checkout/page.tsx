import { CheckoutForm } from "@/components/checkout/CheckoutForm";
export const metadata = { title: "Checkout", robots: { index: false } };
export default function Page() { return (<><h1 className="display mb-8 text-4xl">Finalizar compra</h1><CheckoutForm /></>); }
