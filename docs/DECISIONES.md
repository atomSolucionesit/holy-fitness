# Decisiones y pendientes

## Decisiones
- Next 16 + React 19 + Tailwind v4; tokens en `styles/tokens.css` (acento neutro `--color-accent` configurable).
- Fuentes: Archivo (display) + Inter, vía `next/font`.
- Puertos (`lib/providers/ports.ts`) + `CATALOG_SOURCE` / `ORDERS_SOURCE` separados.
- El checkout recalcula precios, cupón, envío y stock en el servidor (`/api/checkout`, validado con zod, rate limit simple en memoria).
- Pagos: `PAYMENTS_MODE=simulado` por defecto (marca el pedido como pagado). Mercado Pago crea la preferencia; **falta el webhook** de confirmación.
- Imágenes: fotos de demostración generadas con IA en `public/img` (2 campañas y 1 foto por tipo de prenda y género). Todos los productos de una misma categoría comparten foto y los colores no tienen foto propia; son **provisorias** y se reemplazan cambiando las URLs en `data/seed.ts`. El endpoint `/api/placeholder` queda como respaldo. Se descartaron y regeneraron las tomas que traían marcas de terceros o texto inventado.
- Logo: `public/logo-black.png` y `logo-white.png` (PNG transparente derivado del JPG del cliente) + favicon en `app/icon.png`. Conviene pedir el SVG original.
- Envíos: Correo Argentino y Vía Cargo, a domicilio o a sucursal, más retiro en el local. Cotización por CP y peso en `/api/shipping/quote`; el servidor recalcula al confirmar el pedido. **Las tarifas son estimadas (demo)**: ver `docs/ENVIOS.md`.
- Valores por defecto asumidos (confirmar): envío gratis desde $ 120.000 (cubre la opción de envío más económica; si el cliente elige otra, paga la diferencia), 3 cuotas sin interés, cupones BIENVENIDA10 (10%) y HOLY15 (15%).

## Pendiente (no incluido en este MVP)
- `SupabaseProvider` real, esquema SQL con RLS, Supabase Auth, historial de pedidos y cuenta. Hoy los pedidos mock viven en memoria del proceso (se pierden al reiniciar y no funcionan en serverless).
- Webhook de Mercado Pago con verificación de firma; datos bancarios reales para transferencia.
- Reseñas reales y "avisame cuando haya stock" (hoy es solo UI); newsletter solo valida en el cliente.
- Analítica (GA4/Meta) y datos estructurados `BreadcrumbList`/`Organization`.
- Test E2E con Playwright; auditoría Lighthouse; i18n.
- Textos legales, datos del local, razón social/CUIT (marcados con `[completar]` en `data/content.ts`).
- Pulido visual: filtros en mobile como drawer; fotos reales por producto y por color.
- Cotizador real de envíos (APIs de Correo Argentino y Vía Cargo).
- `NexusProvider`: esqueleto sin endpoints; ver `docs/NEXUS.md`.
