# Integración con Nexus (Catálogo, Cupones, Envíos y Pedidos)

Toda llamada a Nexus ocurre **exclusivamente del lado servidor** (`lib/providers/nexus`).

## Variables de entorno (`.env.local`)

```env
CATALOG_SOURCE=nexus
ORDERS_SOURCE=nexus
SHIPPING_SOURCE=nexus
PAYMENTS_MODE=nexus
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXUS_API_URL=https://api-test.atomsolucionesit.com.ar/api
NEXUS_COMPANY_ID=44
NEXUS_WEBHOOK_SECRET=   # Clave secreta desde Nexus > Integraciones > Webhooks
```

Para pasar a producción solo se cambia `NEXUS_API_URL` (`https://api-nexus.atomsolucionesit.com.ar/api`), `NEXUS_COMPANY_ID`, `NEXUS_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL` (`https://tu-dominio.com`) y `PAYMENTS_MODE=mercadopago` (si querés exigir MP real estricto).

## Cómo lee el catálogo (`nexusCatalog` y `nexusInventory`)

- Consulta `GET /api/products/ecommerce/:companyId` y trae únicamente los productos con `published: true`.
- **Variantes y colores:** mapea `variantGroups` (`COLOR` / `SIZE` / `CUSTOM`) y `variants` (`optionLinks`, `stock`, `sku`, `colorHex`, `imageUrls`). Si un producto no tiene variantes, genera una variante única con su stock general.
- **Categorías inteligentes:** la dueña carga todo como categorías en Nexus y el mapper las reparte automáticamente:
  - **Prenda / Tipo (`category`):** `Calzas`, `Tops`, `Remeras`, `Shorts`, `Buzos`, `Camperas`, `Joggers`, `Conjuntos`, `Running`, `Training`, `Urbanas`, `Gorras`, `Mochilas`, `Botellas`, `Medias`, `Gym` o cualquier categoría nueva (aparece sola en el menú).
  - **Colecciones (`collections`):** `Sculpt`, `Flow`, `Impact`, `Essentials`, `Invierno`, `Verano` o cualquier categoría con prefijo `Colección: Nombre`.
  - **Actividades (`activities`):** `Lifting`, `Running`, `HIIT`, `Pilates`, `Descanso` o con prefijo `Actividad: Nombre`.
  - **Calce (`fit`):** `Soporte alto`, `Soporte medio`, `Sin costuras`, `Oversized`, `Boxy`, `Slim fit`, `Relajado`, etc., o con prefijo `Calce: Nombre`.
  - **Composición (`composition`):** categoría con prefijo `Composición: ...` / `Tela: ...` (o texto por defecto).

## Cómo valida y consume los cupones (`nexusValidateCoupon`)

- El checkout valida cupones en vivo contra `POST /api/coupon/validate-coupon-public` de Nexus (a través de `/api/coupons/validate`).
- Soporta cupones porcentuales (`percentage`), de monto fijo (`fixed`), con restricción por categoría (`categories`), fecha de vencimiento (`expirationDate`) y límite de usos (`usageLimit`).
- Al confirmar la compra en `/api/checkout`, envía `consume: true` para incrementar `usageCount` en Nexus y desactivar el cupón automáticamente si alcanza su límite.

## Cómo cotiza y registra los envíos (`nexusShipping` + Correo Argentino en Nexus)

- Con `SHIPPING_SOURCE=nexus`, consulta `GET /api/shipping/public-options/:companyId` en Nexus y, si no hay tarifas manuales cargadas, cotiza Correo Argentino y Vía Cargo (a domicilio y a sucursal) según código postal y peso de las prendas.
- Al crearse el pedido en estado `PENDING`, ingresa automáticamente en la bandeja de **Pedidos pendientes de envío** de Nexus (`GET /api/shipping/pending-orders`) con dirección, ciudad, provincia, código postal y costo de envío para asignarle **Correo Argentino** y emitir el rótulo desde Nexus.

## Cómo envía los pedidos (`nexusOrders`)

- Al confirmar el checkout (`/api/checkout`), valida precios y stock en vivo contra Nexus (`cache: "no-store"`).
- Envía `POST /api/webhooks/incoming/:companyId` con `x-nexus-secret` y firma HMAC-SHA256 en `x-nexus-signature` (`sha256=...`).
- El pedido entra en el historial de ventas de Nexus en estado `PENDING` (`ECOMM-WH-...`), vincula la variante por SKU/nombre y descuenta su stock.
- Si el pedido se cancela (`updateStatus(id, "cancelado")`), notifica `order.updated` con `status: "cancelled"` para que Nexus anule la venta y restaure el stock.

## Medios de pago, descuentos y Mercado Pago Checkout Pro

- **`GET /api/payments/config`** consulta en Nexus:
  - `GET /api/payment-type`: habilita/deshabilita en el checkout cada medio (`Mercado Pago`, `Transferencia bancaria`, `Efectivo` / `Pago en el local`).
  - `GET /api/payment/discounts/ecommerce/:companyId`: aplica automáticamente descuentos o recargos configurados para ecommerce (ej. `10% OFF` en transferencia).
  - `GET /api/payment-integrations/MERCADOPAGO/credentials`: lee las reglas de cuotas sin interés (`installmentRules`) y si la cuenta de Mercado Pago está vinculada (`mpConnected`).
- **Checkout Pro desde Nexus:** al elegir `mercadopago`, `holy-fitness` llama a `POST /api/mercadopago/payment` con `externalReference: "order-<saleId>"`. Nexus crea la preferencia con las credenciales de la dueña y devuelve el `init_point` (o `sandbox_init_point` si el token empieza con `TEST-`).
- **Retorno de pago:** la tienda expone `/pedido` ([app/(checkout)/pedido/page.tsx](file:///c:/Users/mateo/Desktop/AtomIT/Nexus/holy-fitness/app/(checkout)/pedido/page.tsx)) y `/pedido/[id]` ([app/(checkout)/pedido/[id]/page.tsx](file:///c:/Users/mateo/Desktop/AtomIT/Nexus/holy-fitness/app/(checkout)/pedido/[id]/page.tsx)), que sincronizan el resultado contra `POST /api/payment/mercadopago/return` y `/api/mercadopago/payment/:saleId/sync`.

### Checklist antes de conectar la cuenta real de Mercado Pago en Nexus

En **Nexus > Integraciones > Billeteras (`/integrations/wallets`)** de la empresa real, verificar que estén cargados:
1. **Access Token** de Mercado Pago (OAuth o manual de producción `APP_USR-...`, o `TEST-...` para sandbox).
2. **Tipo de pago activo** en Nexus con código `MP` o nombre `Mercado Pago` (`isActive: true`).
3. **Webhook Secret** de Mercado Pago configurado.
4. **Notification URL (HTTPS):** apuntando al webhook de Nexus (`https://api-nexus.atomsolucionesit.com.ar/api/mercadopago/webhook`).
5. **URLs de retorno (HTTPS obligatoria):**
   - `backUrlSuccess`: `https://<tu-dominio>/pedido`
   - `backUrlFailure`: `https://<tu-dominio>/pedido`
   - `backUrlPending`: `https://<tu-dominio>/pedido`
6. *(Opcional)* **Reglas de cuotas** (`installmentRules`) y **descuentos por medio de pago** con `isEcommerceEnabled: true`.
