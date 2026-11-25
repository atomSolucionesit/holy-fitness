"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  /** Texto a mostrar sobre fondo sólido si la imagen falla al cargar. */
  fallbackLabel?: string;
  /** Si es true, al fallar no renderiza nada (útil para imágenes secundarias de hover o fondos). */
  hideOnError?: boolean;
}

export function SafeImage({
  src,
  alt,
  className,
  priority,
  sizes,
  style,
  fallbackLabel,
  hideOnError,
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const broken = !src || failedSrc === src;

  if (broken) {
    if (hideOnError) return null;
    const label = fallbackLabel ?? alt;
    return (
      <div
        role="img"
        aria-label={label || "Imagen no disponible"}
        className="absolute inset-0 flex items-center justify-center border border-line bg-surface p-4 text-center"
      >
        {label && <span className="display text-lg text-ink">{label}</span>}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes ?? "100vw"}
      style={style}
      className={cn("object-cover", className)}
      onError={() => setFailedSrc(src)}
    />
  );
}
