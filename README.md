# ORLÉVANE

**Elegancia en cada paso.**

Tienda de demostración de una casa de calzado con atelier en Asunción. Está hecha
para verse y comportarse como un comercio real de punta a punta —catálogo,
filtros, ficha, carrito, checkout, pasarela, seguimiento— **sin procesar un solo
guaraní**.

> ⚠️ **Esto es una demostración.** La marca, el catálogo, los precios, el stock,
> las boutiques, los datos bancarios y las reseñas son material inventado. La
> pasarela de pago corre entera en el navegador: no hay servidor, no se envía
> nada y no se cobra nada. **Nunca ingreses una tarjeta real.**
>
> En el sitio esto se declara en un solo lugar, a propósito: el botón final del
> checkout dice **«Realizar pago de prueba»**, y junto al formulario de tarjeta
> están las tarjetas de prueba. No hay banda ni cartel de demostración en el
> resto de la navegación, para que la tienda se pueda mostrar a un cliente sin
> que la ilusión se rompa. La cláusula completa vive al final de `/terminos`.

---

## Qué hace

| | |
|---|---|
| **Catálogo** | 36 referencias entre mujer, hombre y accesorios, con procedencia por pieza: número de serie, horma, curtido, peso y ficha técnica. |
| **Filtros** | Familia, talla, color, precio, disponibilidad y serie Ñandutí. Estado en la URL, así que un filtro se puede compartir. |
| **Ficha** | Galería, tallas con stock real por número, guía de tallas, piezas hermanas por colorway, relacionados por horma. |
| **Carrito** | Panel lateral y página completa, con códigos de descuento, medidor de envío bonificado y deshacer al quitar. |
| **Checkout** | Cuatro pasos: contacto, entrega, pago y confirmación. Validación campo por campo en los dos idiomas. |
| **Pasarela** | «ORLÉVANE Pay» simulada: detección de marca, validación Luhn, tarjeta 3D que gira al enfocar el CVV, cuotas, 3-D Secure simulado y rechazos reproducibles. |
| **Otros pagos** | Transferencia con referencia generada, pago contra entrega y pedido por WhatsApp. |
| **WhatsApp** | El mensaje se arma desde el carrito real: modelo, talla, color, cantidad, subtotal, envío, moneda y número de pedido. |
| **Pedidos** | Seguimiento con línea de estado avanzable, datos de transferencia y búsqueda por número. |
| **Idiomas** | Español y portugués, completo: interfaz, catálogo, checkout y mensajes de WhatsApp. |
| **Monedas** | Guaraní y real, con tasa fija de demostración. |
| **Además** | Búsqueda con `⌘K`, favoritos, guía de tallas, boutiques, La Maison, contacto, envíos, términos y privacidad. |

## Detalles de construcción

- **Movimiento de la ficha** exactamente como pide el brief: acercamiento del 6 %,
  inclinación de hasta 6° siguiendo el puntero, sombra más profunda y cruce a la
  segunda fotografía, en 400 ms y sin rebote. En puntero grueso la inclinación
  desaparece y la segunda foto se alcanza deslizando.
- **Pieza WebGL** en «El atelier»: la fotografía se lee píxel a píxel y se
  reconstruye como nube de puntos en tres dimensiones, con la profundidad sacada
  de la luminancia del negativo. Se arma al desplazarse. Técnica en la línea de
  [img2threejs](https://github.com/img2threejs/img2threejs), escrita a mano para
  controlar paleta, coste y degradación.
- **`prefers-reduced-motion`** desactiva inclinación, paralaje, WebGL y entradas
  por scroll en todo el sitio.
- Contraste AA, foco visible, trampa de foco en paneles, todo el flujo de compra
  operable con teclado.
- Sin analítica, sin píxeles de seguimiento, sin cookies de terceros.

## Puesta en marcha

```bash
npm install
npm run dev
```

Las fotografías ya están versionadas en `public/media`. Para regenerarlas:

```bash
node scripts/fetch-assets.mjs
```

Ese script descarga los negativos, arma los recortes 4:5, genera los «detalle»,
difumina los logotipos de terceros que asoman en la fotografía de referencia y
escribe los placeholders LQIP en `src/lib/blur.generated.ts`.

```bash
npm run build      # compilación de producción
npm run typecheck  # sólo tipos
```

## Configuración

Copiá `.env.example` a `.env.local`, o cargá las variables en Vercel:

| Variable | Para qué | Por defecto |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número que recibe los pedidos. Sólo dígitos, con código de país. | `595982064334` |
| `NEXT_PUBLIC_SITE_URL` | Dominio público, para metadatos y sitemap. | `https://orlevane.vercel.app` |

## Publicar en Vercel

1. Importá el repositorio en Vercel. Detecta Next.js solo; no hace falta tocar
   nada.
2. Cargá las dos variables de arriba en *Settings → Environment Variables*.
3. Desplegar.

No hay base de datos ni API: todo el estado vive en `localStorage` del visitante.

## Probar la pasarela

En el paso de pago hay un botón que rellena una tarjeta de prueba. Los números:

| Tarjeta | Desenlace |
|---|---|
| `4539 5789 0123 4564` | Aprueba |
| `5425 2334 3010 9903` | Aprueba |
| `3714 496353 98431` | Aprueba |
| `4000 0000 0000 0002` | Rechazo del emisor |
| `4000 0000 0000 9995` | Fondos insuficientes |

Vencimiento: cualquier fecha futura. CVV: cualquier número. Código del banco:
cualquiera de seis dígitos, salvo `000000`, que fuerza un rechazo.

Códigos de descuento: `ORLEVANE10`, `ÑANDUTI`, `BIENVENIDA`.

## Estructura

```
scripts/          pipeline de imágenes y generación del Open Graph
src/app/          rutas
src/components/   chrome/ · home/ · shop/ · checkout/ · pages/ · ui/
src/lib/          catálogo, diccionario, moneda, estado, pagos, WhatsApp
public/media/     fotografía procesada (p/ ficha · e/ editorial · w/ WebGL)
```

`PRODUCT.md` guarda la verdad de producto y `DESIGN.md` el sistema visual.

## Antes de usarlo de verdad

1. Reemplazar la fotografía por producción propia — ver `CREDITS.md`.
2. Reemplazar catálogo, precios, stock, boutiques, datos bancarios y reseñas.
3. Conectar una pasarela real y mover el checkout al servidor.
4. Cambiar la etiqueta del botón final (`k.confirmar`, `k.confirmarTransfer`),
   quitar el bloque de tarjetas de prueba del paso de pago y la última sección
   de `/terminos`.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lenis · Zustand ·
three.js · sharp
