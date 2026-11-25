import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { NEWSLETTER_ENABLED } from "@/lib/domain/rules";
const COLS = [
  { t: "Ayuda", l: [["Envíos", "/ayuda/envios"], ["Cambios y devoluciones", "/ayuda/cambios-y-devoluciones"], ["Seguimiento de pedido", "/ayuda/seguimiento"], ["Medios de pago", "/ayuda/medios-de-pago"]] },
  { t: "Mi cuenta", l: [["Ingresar", "/cuenta"], ["Mis pedidos", "/cuenta"], ["Favoritos", "/cuenta/favoritos"]] },
  { t: "Holy Fitness", l: [["Nosotros", "/paginas/nosotros"], ["Nuestro local", "/paginas/local"], ["Blog", "/blog"]] },
  { t: "Legales", l: [["Términos y condiciones", "/legales/terminos"], ["Política de privacidad", "/legales/privacidad"]] },
] as const;
const IG_URL = "https://www.instagram.com/holyfit.ness/";
const WA_URL = "https://wa.me/543772563993";
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id="ig-grad" cx="35%" cy="105%" r="120%">
          <stop offset="0%" stopColor="#FFD776" /><stop offset="20%" stopColor="#F9A13A" /><stop offset="45%" stopColor="#EE2A7B" /><stop offset="70%" stopColor="#C13584" /><stop offset="100%" stopColor="#5B51D8" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6.5" fill="url(#ig-grad)" />
      <rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="16.4" cy="7.6" r="1.15" fill="#fff" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6.5" fill="#1FBF3A" />
      <path fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" d="M12 5.2a6.8 6.8 0 0 0-5.85 10.27L5.3 18.7l3.3-.83A6.8 6.8 0 1 0 12 5.2z" />
      <path fill="#fff" d="M15.1 13.55c-.17-.09-1.02-.5-1.18-.56-.16-.06-.27-.09-.39.09-.11.17-.45.56-.55.68-.1.11-.2.13-.38.04-.17-.09-.73-.27-1.4-.86-.52-.46-.87-1.03-.97-1.21-.1-.17-.01-.27.08-.36.08-.08.17-.2.26-.31.09-.1.11-.17.17-.29.06-.11.03-.22-.01-.31-.04-.09-.39-.94-.54-1.28-.14-.34-.28-.29-.39-.3h-.33c-.11 0-.3.04-.46.22-.16.17-.61.6-.61 1.45s.63 1.68.71 1.8c.09.11 1.23 1.87 2.97 2.62.42.18.74.29.99.37.42.13.8.11 1.1.07.33-.05 1.02-.42 1.17-.82.14-.4.14-.75.1-.82-.04-.07-.16-.11-.33-.2z" />
    </svg>
  );
}
function Social({ className }: { className?: string }) {
  return (
    <div className={className}>
      <a href={IG_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Holy Fitness" className="flex items-center gap-2 text-sm text-white/80 transition hover:-translate-y-0.5 hover:text-white"><InstagramIcon className="h-7 w-7" /><span>@holyfit.ness</span></a>
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Holy Fitness" className="flex items-center gap-2 text-sm text-white/80 transition hover:-translate-y-0.5 hover:text-white"><WhatsAppIcon className="h-7 w-7" /><span>3772 563993</span></a>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div><Logo tone="white" className="h-20" /><p className="mt-3 text-sm text-white/70">Ropa deportiva argentina. Tienda online y local físico.</p><Social className="mt-5 flex flex-col gap-3" />{NEWSLETTER_ENABLED && <NewsletterForm dark />}</div>
          {COLS.map((c) => (<div key={c.t}><p className="label mb-4">{c.t}</p><ul className="space-y-2 text-sm text-white/75">{c.l.map(([l, h]) => <li key={l}><Link href={h} className="hover:text-white hover:underline">{l}</Link></li>)}</ul></div>))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/60 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Holy Fitness. Todos los derechos reservados.</p>
          <p>Medios de pago: Mercado Pago · Tarjetas · Transferencia · Efectivo en local</p>
          <div className="flex items-center gap-3"><a href={IG_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon className="h-5 w-5" /></a><a href={WA_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon className="h-5 w-5" /></a></div>
        </div>
      </div>
    </footer>
  );
}
