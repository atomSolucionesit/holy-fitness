"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[holy-fitness] Error inesperado:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="label text-xs text-muted">Ups, algo salió mal</p>
      <h1 className="display mt-3 text-4xl lg:text-5xl">
        Estamos teniendo problemas técnicos
      </h1>
      <p className="mt-4 text-sm text-muted">
        Ocurrió un inconveniente al cargar la página. Probá reintentar o volver al inicio.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button href="/" variant="outline">
          Volver al inicio
        </Button>
      </div>
      <p className="mt-8 text-xs text-muted">
        ¿Necesitás ayuda? Escribinos por{" "}
        <a
          href="https://wa.me/543772563993"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink"
        >
          WhatsApp (3772 563993)
        </a>
        .
      </p>
    </main>
  );
}
