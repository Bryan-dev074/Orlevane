# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Compradores de calzado de autor en Paraguay y sur de Brasil, navegando mayormente
desde el teléfono, de noche, decidiendo una compra cara sin poder tocar el zapato.
Segundo público: el cliente del proyecto, que muestra este sitio como pieza de
demostración para evaluar si una casa de calzado puede vender en línea con este nivel.

## Product Purpose

ORLÉVANE es una tienda **demostrativa** de una casa de calzado. Debe comportarse
como una tienda real de punta a punta —catálogo, filtros, ficha, carrito, checkout,
pago, seguimiento— sin procesar dinero real. Éxito: alguien recorre el flujo completo
y no encuentra el punto donde deja de ser una tienda.

## Positioning

Casa de calzado con atelier en Asunción: hormas y oficio de tradición europea,
cuero del Chaco y una serie de perforado inspirada en el ñandutí paraguayo. La
procedencia declarada por par —horma, curtido, taller, número de serie— es lo que
una tienda vecina no puede copiar y pegar.

## Operating Context

- Compra desde el teléfono en su mayoría; conexiones variables.
- WhatsApp es un canal de venta legítimo y esperado en la región, no un plan B.
- Dos monedas conviviendo: guaraní paraguayo y real brasileño.
- Dos idiomas conviviendo: español y portugués.
- El visitante compara contra las casas europeas, así que el listón visual es ése.

## Capabilities and Constraints

- Catálogo estático de 36 referencias: mujer, hombre y accesorios.
- Carrito, favoritos, búsqueda, filtros, orden, guía de tallas, seguimiento de pedido.
- Checkout de 4 pasos con pasarela **simulada** (tarjeta con Luhn + marca + 3-D Secure
  simulado), transferencia con referencia generada, pago contra entrega y pedido por
  WhatsApp. Nada sale del navegador; no hay backend ni base de datos.
- Pedido por WhatsApp a **+595 982 064 334**, con el mensaje armado desde el carrito
  real (modelo, talla, color, cantidad, subtotal, envío, moneda). Configurable por
  `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- Persistencia en `localStorage`. Sin cuentas ni login.
- Todo el estado de demostración debe estar rotulado como tal, sin arruinar la ilusión.

## Brand Commitments

Fijados por el cliente y no negociables:

- Nombre **ORLÉVANE**; handle `orlevane`; eslogan «Elegancia en cada paso.»
- Paleta: negro café `#171411`, marfil cálido `#F4EFE6`, dorado antiguo `#B89A5B`,
  bordó profundo `#721F2B`, gris piedra `#8D8982`.
- El dorado se usa con moderación; la superficie es mayormente marfil y negro.
- Movimiento de ficha: acercamiento ~6% al pasar el cursor, inclinación muy suave
  siguiendo el puntero, sombra más profunda, cambio a una segunda fotografía,
  transición ~400 ms sin rebote. En teléfono el efecto se reemplaza por deslizar o tocar.

## Evidence on Hand

- No hay fotografía de producto propia. Las imágenes son material de referencia de
  Unsplash (Unsplash License), recortadas por `scripts/fetch-assets.mjs`, y están
  listadas para reemplazo en `CREDITS.md`.
- No hay precios reales, stock real, boutiques reales ni reseñas reales: todo el
  contenido comercial es sintético y debe quedar rotulado como demostración.
- No hay pasarela contratada. La existente es una simulación en el cliente.

## Product Principles

1. La tienda se siente real o no sirve; el rótulo de demostración se admite, la
   tienda a medio construir no.
2. Cada par declara su procedencia. La ficha técnica es el argumento de venta.
3. El teléfono es el escenario principal; el escritorio es el lujo.
4. WhatsApp es una vía de compra de primera clase, no un enlace al pie.
5. Nunca pedir ni transmitir datos reales de pago.

## Accessibility & Inclusion

Contraste AA sobre marfil y sobre negro, foco visible en todo control, todo el flujo
de compra operable con teclado, y `prefers-reduced-motion` respetado en cada animación.
