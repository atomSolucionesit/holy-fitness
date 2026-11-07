import Link from "next/link";
import { BLOG } from "@/data/content";
export const metadata = { title: "Blog" };
export default function Page() { return (<div className="mx-auto max-w-2xl px-4 py-12"><h1 className="display h-section mb-6">Blog</h1><ul className="space-y-3">{Object.entries(BLOG).map(([s, p]) => <li key={s}><Link className="underline" href={`/blog/${s}`}>{p.title}</Link></li>)}</ul></div>); }
