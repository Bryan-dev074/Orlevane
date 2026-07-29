# Créditos y material de terceros

## Fotografía

Todas las imágenes de `public/media` provienen de **Unsplash** y se usan bajo la
[Unsplash License](https://unsplash.com/license), que permite uso comercial y no
exige atribución. Aun así se listan las fuentes, porque es lo correcto.

Las fotografías **no son de producto propio**: muestran calzado y marroquinería de
otras casas, fotografiado por terceros. Están acá como material de referencia para
que la demostración se sostenga visualmente.

`scripts/fetch-assets.mjs` guarda la lista completa de identificadores en su
constante `MANIFEST`. Cada entrada corresponde a
`https://images.unsplash.com/<id>`. Ese mismo script:

- recorta a 4:5 las fichas de producto y a 3:2 o 2:3 los planos editoriales;
- genera los «detalle» como zoom real sobre el mismo negativo;
- **difumina los logotipos de terceros** que quedan a la vista (constante
  `RETOUCH`), para que ninguna pieza aparente ser de una marca ajena;
- escribe los placeholders LQIP.

Quedan marcas menores de fabricante en algunas piezas, a un tamaño que no es
legible al navegar. No se retocaron porque el parche resultaba más visible que la
marca.

### Antes de cualquier uso comercial

**Reemplazar toda la fotografía por producción propia.** Una tienda real no puede
vender su catálogo con fotos de productos de otras marcas, por más permisiva que
sea la licencia de la imagen. Basta con sustituir las entradas de `MANIFEST` por
las fuentes propias y volver a correr el script.

## Tipografía

- **Bodoni Moda** — SIL Open Font License 1.1. Servida desde el propio dominio
  por `next/font`.
- **Jost** — SIL Open Font License 1.1. Ídem.

## Datos de tarjeta de prueba

Los números que aparecen en el checkout son los de prueba públicos de la
industria de pagos. No corresponden a ninguna cuenta ni a ningún titular.

## Contenido inventado

Marca, historia, catálogo, nombres de modelo, precios, stock, números de serie,
hormas, curtidos, boutiques, horarios, datos bancarios y reseñas son material
sintético escrito para esta demostración. Ninguna de esas afirmaciones es un
hecho comercial.

El nombre **ORLÉVANE** y el eslogan **«Elegancia en cada paso»** los aportó el
cliente del proyecto.

## Referencias técnicas

- Nube de puntos a partir de fotografía, en la línea de
  [img2threejs](https://github.com/img2threejs/img2threejs), reimplementada aquí
  desde cero.
- Criterios de interfaz y movimiento: [impeccable.style](https://impeccable.style)
  y las notas de [Emil Kowalski](https://emilkowal.ski/).
