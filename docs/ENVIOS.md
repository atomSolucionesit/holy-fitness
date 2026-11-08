# Envíos

## Qué hay hoy (demo)
- Operadores: **Correo Argentino** y **Vía Cargo**, cada uno a domicilio o a sucursal, más **retiro en el local** (gratis).
- El cliente ingresa su código postal en el carrito (o en el checkout) y ve las opciones con precio y plazo. La elección se guarda y se reutiliza en el checkout.
- `POST /api/shipping/quote` recibe `{ zip, items:[{slug, qty}], coupon? }`. El peso y el subtotal salen del catálogo en el servidor, nunca del navegador.
- `POST /api/checkout` vuelve a cotizar y valida que la opción elegida exista; guarda operador, servicio, plazo y dirección en el pedido.
- Envío gratis desde $ 120.000 (después del cupón): cubre la opción más económica; las demás cobran la diferencia.

## Las tarifas son ESTIMADAS
`lib/shipping/tariffs.ts` usa un tarifario inventado para la demo: zona según el CP (CABA, GBA, centro, litoral, NOA, interior, Patagonia), precio base hasta 1 kg + adicional por kg, y la sucursal con un 25–30 % de descuento. Los pesos por categoría están en el mismo archivo. **No son precios reales de ninguno de los dos operadores.**

## Para pasar a cotización real
La interfaz es `ShippingProvider` en `lib/shipping/index.ts`; con `SHIPPING_SOURCE=real` se usa el adaptador `real`, hoy un `TODO`. Falta, para cada operador:
1. Contrato o credenciales de la API y su documentación (no hay endpoints inventados en el código).
2. Peso y dimensiones reales por producto o variante (hoy es un peso por categoría).
3. Código postal de origen del depósito o local.
4. Listado de sucursales para que el cliente elija una (hoy se coordina por email).
5. Generación de etiquetas y número de seguimiento al confirmar el pedido.
6. Ante una caída del operador, la API devuelve un error amable (ya implementado); falta decidir si se ofrece una tarifa de contingencia.
