# Holy Fitness — Ecommerce

Tienda online de ropa deportiva (Next.js App Router + TypeScript + Tailwind v4 + Zustand).

## Levantar el proyecto
```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint && npm test
```

## Variables de entorno
Ver `.env.example`. Las principales: `CATALOG_SOURCE` y `ORDERS_SOURCE` (`mock|supabase|nexus`), `PAYMENTS_MODE` (`simulado|mercadopago`), `NEXUS_*` (solo servidor).

## Estructura
- `app/` rutas: `(tienda)` (home, género, categoría, colección, producto, buscar, ayuda, legales, blog, cuenta), `(checkout)` (checkout, pedido), `api/`.
- `components/` ui, layout, product, home, cart, checkout.
- `lib/domain` modelo de dominio y reglas puras; `lib/providers` puertos + adaptadores (mock, supabase, nexus); `lib/payments`.
- `store/` Zustand (carrito, favoritos, UI). `data/` seed y contenido. `styles/tokens.css` design tokens (color de acento, fuentes).
- `docs/` DECISIONES.md, NEXUS.md.

## Estado del MVP
Funciona con datos mock: home, mega menú, búsqueda en vivo, listado con filtros/orden/URL, detalle, carrito, favoritos, checkout (pago simulado), confirmación. Ver `docs/DECISIONES.md` para lo pendiente.
