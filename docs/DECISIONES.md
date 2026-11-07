# Decisiones y pendientes

## Decisiones
- Next 16 + React 19 + Tailwind v4; tokens en `styles/tokens.css` (acento neutro `--color-accent` configurable).
- Fuentes: Archivo (display) + Inter, vía `next/font`.
- Puertos (`lib/providers/ports.ts`) + `CATALOG_SOURCE` / `ORDERS_SOURCE` separados.
- El checkout recalcula precios, cupón, envío y stock en el servidor (`/api/checkout`, validado con zod, rate limit simple en memoria).
- Pagos: `PAYMENTS_MODE=simulado` por defecto (marca el pedido como pagado). Mercado Pago crea la preferencia; **falta el webhook** de confirmación.
- Imágenes: placeholders SVG generados en `/api/placeholder`. Se reemplazan cambiando las URLs del seed.
- Valores por defecto asumidos (confirmar): envío gratis desde $ 120.000, 3 cuotas sin interés, cupones BIENVENIDA10 (10%) y HOLY15 (15%), costos de envío por zona de CP (CABA/GBA/interior).

## Pendiente (no incluido en este MVP)
- `SupabaseProvider` real, esquema SQL con RLS, Supabase Auth, historial de pedidos y cuenta. Hoy los pedidos mock viven en memoria del proceso (se pierden al reiniciar y no funcionan en serverless).
- Webhook de Mercado Pago con verificación de firma; datos bancarios reales para transferencia.
- Reseñas reales y "avisame cuando haya stock" (hoy es solo UI); newsletter solo valida en el cliente.
- Analítica (GA4/Meta) y datos estructurados `BreadcrumbList`/`Organization`.
- Test E2E con Playwright; auditoría Lighthouse; i18n.
- Textos legales, datos del local, razón social/CUIT (marcados con `[completar]` en `data/content.ts`).
- Pulido visual: selector "Ordenar" apretado en desktop, versión mobile de filtros como drawer, imágenes reales.
- `NexusProvider`: esqueleto sin endpoints; ver `docs/NEXUS.md`.
