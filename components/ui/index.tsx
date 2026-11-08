import Link from "next/link";
import Image from "next/image";
import { cn, formatMoney } from "@/lib/utils";

type BtnProps = { variant?: "primary" | "outline" | "light" | "accent"; full?: boolean; href?: string; className?: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>;
const base = "inline-flex h-12 items-center justify-center gap-2 px-6 label rounded-[2px] border transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-ink text-white border-ink hover:bg-white hover:text-ink",
  outline: "bg-transparent text-ink border-ink hover:bg-ink hover:text-white",
  light: "bg-white text-ink border-white hover:bg-transparent hover:text-white",
  accent: "bg-accent text-accent-ink border-accent hover:bg-ink hover:text-white hover:border-ink",
};
export function Button({ variant = "primary", full, href, className, children, ...rest }: BtnProps) {
  const cls = cn(base, variants[variant], full && "w-full", className);
  if (href) return <Link href={href} className={cls} onClick={rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}
export function Badge({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "accent" | "dark" }) {
  return <span className={cn("label inline-block px-2 py-1 text-[10px] leading-none", tone === "light" && "bg-white text-ink", tone === "accent" && "bg-accent text-accent-ink", tone === "dark" && "bg-ink text-white")}>{children}</span>;
}
export const Price = ({ price, compare, className }: { price: number; compare?: number; className?: string }) => (
  <span className={cn("flex items-baseline gap-2 font-semibold", className)}>
    <span className={compare ? "text-danger" : ""}>{formatMoney(price)}</span>
    {compare ? <s className="font-normal text-muted">{formatMoney(compare)}</s> : null}
  </span>
);
export const Stars = ({ rating, count }: { rating: number; count?: number }) => (
  <span className="flex items-center gap-1 text-xs" aria-label={`Valoración ${rating} de 5`}>
    <span aria-hidden className="tracking-tighter">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
    {count !== undefined && <span className="text-muted">({count})</span>}
  </span>
);
export const Swatch = ({ hex, active, label, onClick }: { hex: string; active?: boolean; label: string; onClick?: () => void }) => (
  <button type="button" aria-label={label} title={label} onClick={onClick} className={cn("h-5 w-5 rounded-full border border-line", active && "outline outline-2 outline-offset-2 outline-ink")} style={{ background: hex }} />
);
export const Img = ({ src, alt, className, priority, sizes, style }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string; style?: React.CSSProperties }) => (
  <Image src={src} alt={alt} fill priority={priority} sizes={sizes ?? "100vw"} style={style} className={cn("object-cover", className)} />
);
export const SectionTitle = ({ children, href, label = "Ver todo" }: { children: React.ReactNode; href?: string; label?: string }) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <h2 className="display h-section">{children}</h2>
    {href && <Link href={href} className="label shrink-0 underline underline-offset-4">{label}</Link>}
  </div>
);
export const Skeleton = ({ className }: { className?: string }) => <div className={cn("skeleton rounded-[2px]", className)} />;
