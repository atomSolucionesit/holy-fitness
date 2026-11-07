"use client";
import { useEffect, useState } from "react";
const MSGS = ["Envío gratis desde $ 120.000", "3 cuotas sin interés con todas las tarjetas", "10% OFF en tu primera compra: BIENVENIDA10", "Retiro gratis en nuestro local"];
export function AnnouncementBar() {
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const t = setInterval(() => setI((x) => (x + 1) % MSGS.length), 4000); return () => clearInterval(t); }, [paused]);
  return (
    <div className="bg-ink text-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p role="status" className="label mx-auto flex h-9 items-center justify-center px-4 text-center text-[11px]">{MSGS[i]}</p>
    </div>
  );
}
