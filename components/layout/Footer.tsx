import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/home/NewsletterForm";
const COLS = [
  { t: "Ayuda", l: [["Envíos", "/ayuda/envios"], ["Cambios y devoluciones", "/ayuda/cambios-y-devoluciones"], ["Seguimiento de pedido", "/ayuda/seguimiento"], ["Medios de pago", "/ayuda/medios-de-pago"], ["Guía de talles", "/ayuda/talles"]] },
  { t: "Mi cuenta", l: [["Ingresar", "/cuenta"], ["Mis pedidos", "/cuenta"], ["Favoritos", "/cuenta/favoritos"]] },
  { t: "Holy Fitness", l: [["Nosotros", "/paginas/nosotros"], ["Nuestro local", "/paginas/local"], ["Trabajá con nosotros", "/paginas/trabaja-con-nosotros"], ["Blog", "/blog"]] },
  { t: "Legales", l: [["Términos y condiciones", "/legales/terminos"], ["Política de privacidad", "/legales/privacidad"], ["Botón de arrepentimiento", "/legales/arrepentimiento"], ["Defensa del consumidor", "/legales/defensa-del-consumidor"]] },
] as const;
export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div><Logo tone="white" className="h-20" /><p className="mt-3 text-sm text-white/70">Ropa deportiva argentina. Tienda online y local físico.</p><NewsletterForm dark /></div>
          {COLS.map((c) => (<div key={c.t}><p className="label mb-4">{c.t}</p><ul className="space-y-2 text-sm text-white/75">{c.l.map(([l, h]) => <li key={l}><Link href={h} className="hover:text-white hover:underline">{l}</Link></li>)}</ul></div>))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/60 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Holy Fitness. Todos los derechos reservados.</p>
          <p>Medios de pago: Mercado Pago · Tarjetas · Transferencia · Efectivo en local</p>
          <p>Instagram · TikTok · WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}
