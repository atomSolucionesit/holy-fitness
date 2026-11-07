"use client";
import { useState } from "react";
export function NewsletterForm({ dark }: { dark?: boolean }) {
  const [done, setDone] = useState(false); const [err, setErr] = useState("");
  return done ? <p className="mt-4 text-sm">¡Gracias! Tu código: <b>BIENVENIDA10</b></p> : (
    <form className="mt-4 flex" onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("email") as string; if (!/^\S+@\S+\.\S+$/.test(v)) return setErr("Email inválido"); setErr(""); setDone(true); }} noValidate>
      <label className="sr-only" htmlFor={`nl-${dark}`}>Email</label>
      <input id={`nl-${dark}`} name="email" type="email" placeholder="Tu email" className={`h-12 w-full border px-3 text-sm ${dark ? "border-white/40 bg-transparent text-white placeholder:text-white/50" : "border-ink bg-white"}`} />
      <button className={`label h-12 px-5 ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>Suscribirme</button>
      {err && <p role="alert" className="sr-only">{err}</p>}
    </form>
  );
}
