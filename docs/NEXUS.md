# Integración con Nexus

Toda llamada va solo del lado servidor (`lib/providers/nexus`). Variables: `NEXUS_API_URL`, `NEXUS_API_KEY`, `NEXUS_WEBHOOK_SECRET`. No hay endpoints inventados: el cliente falla con un error claro hasta implementarlo.

## Qué necesita la web de Nexus
Productos, variantes (talle/color/SKU), precios, imágenes, categorías/colecciones y stock por variante (unificado con la tienda física).

## Qué le envía la web
Pedidos online (ítems por variante, cliente, envío, pago) para que descuenten stock de la tienda física.

## Qué falta implementar
`nexusCatalog`, `nexusInventory`, `nexusOrders` (hoy `TODO`), mappers a `lib/domain/types.ts`, reintentos/backoff con fallback a caché, y el payload real del webhook `/api/webhooks/nexus` (ya valida HMAC y revalida el tag `catalog`; hay que etiquetar los fetch con `next: { tags: ["catalog"] }`).

## Preguntas abiertas
1. Autenticación (API key, OAuth, header).
2. ¿Hay webhooks de stock/precio? ¿Formato y firma?
3. Paginación y filtros del listado de productos.
4. Formato y hosting de imágenes.
5. Modelo de variantes (talle/color) y SKUs.
6. ¿Cómo se crea un pedido y cómo se informa el pago?
7. Límites de uso (rate limit) y ambiente de pruebas.
