"use client";
import Link from "next/link";
import { useState } from "react";
import { Img } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface Tile { title: string; text?: string; href: string; image: string }
export function Tabbed({ tabs, cols = 4, ratio = "aspect-[3/4]" }: { tabs: Record<string, Tile[]>; cols?: 3 | 4 | 5; ratio?: string }) {
  const keys = Object.keys(tabs); const [k, setK] = useState(keys[0]!);
  return (
    <div>
      {keys.length > 1 && <div role="tablist" className="mb-6 flex gap-2">
        {keys.map((x) => <button key={x} role="tab" aria-selected={k === x} onClick={() => setK(x)} className={cn("label h-10 border border-ink px-5", k === x ? "bg-ink text-white" : "hover:bg-surface")}>{x}</button>)}
      </div>}
      <div className={cn("grid grid-cols-2 gap-3", cols === 4 && "lg:grid-cols-4", cols === 3 && "lg:grid-cols-3", cols === 5 && "lg:grid-cols-5")}>
        {tabs[k]!.map((t) => (
          <Link key={t.title} href={t.href} className={cn("group relative block overflow-hidden bg-surface", ratio)}>
            <Img src={t.image} alt="" className="transition-transform duration-500 group-hover:scale-105" sizes="(min-width:1024px) 25vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white"><p className="display text-2xl">{t.title}</p>{t.text && <p className="mt-1 text-sm">{t.text}</p>}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
