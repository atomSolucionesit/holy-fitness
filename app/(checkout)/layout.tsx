import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (<><header className="border-b border-line"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4"><Link href="/" aria-label="Holy Fitness"><Logo className="h-11" /></Link><Link href="/" className="label underline">Seguir comprando</Link></div></header><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></>);
}
