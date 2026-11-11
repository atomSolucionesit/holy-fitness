import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "@/styles/globals.css";

const archivo = Archivo({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-archivo", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Holy Fitness | Ropa deportiva en Argentina", template: "%s | Holy Fitness" },
  description: "Ropa deportiva y zapatillas para mujer. Envíos a todo el país, cuotas sin interés y retiro en nuestro local.",
  openGraph: { type: "website", locale: "es_AR", siteName: "Holy Fitness" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${archivo.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
