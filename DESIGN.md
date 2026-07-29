# Design

Sistema visual de ORLÉVANE. Mundo fijado por el cliente; este archivo registra las
reglas durables que salieron de la primera construcción.

## Contrato de dirección

**THESIS** — La tienda se hojea como el muestrario de un taller, no como una grilla de
e-commerce. Cada par entra con su ficha de horma. Se rechaza el hero de foto lavada con
«comprar ahora» encima y la grilla de tarjetas iguales con globo de descuento.

**OWN-WORLD** — Marfil `#F4EFE6` como papel y negro café `#171411` como tinta, en
bloques de página completa que alternan. Dorado `#B89A5B` sólo en filetes de 1 px,
numeración de horma y el borde del control primario. Bordó `#721F2B` reservado a la
serie Ñandutí y a los avisos de última unidad. Reglas de un pixel en vez de bordes de
tarjeta; los productos flotan sobre el papel, sin contenedor. Didone para el display,
geométrica para el aparato. Grano fino permanente sobre los fondos oscuros.

**STORY** — El visitante entiende que hay un taller detrás; cree en la procedencia
porque la lee por par (horma, curtido, serie); y actúa agregando al carrito, o
escribiendo por WhatsApp con el pedido ya armado.

**FIRST VIEWPORT** — Vitrina a pantalla completa sobre negro café. A la izquierda, en
marfil, la ficha del par en exhibición: número de serie, horma, curtido y una línea
Bodoni de dos renglones. A la derecha, la fotografía a sangre. Un filete dorado corre
bajo la ficha marcando el avance entre las tres piezas en vitrina. El control primario
va en la ficha, no sobre la foto.

**FORM** — Fijado por el brief del cliente: no hubo tirada de dirección.

## Color

| Rol | Token | Valor |
|---|---|---|
| Tinta / fondo profundo | `--ink` | `#171411` |
| Papel / fondo claro | `--paper` | `#F4EFE6` |
| Dorado (filetes, acentos) | `--gilt` | `#B89A5B` |
| Bordó (serie Ñandutí, alertas) | `--claret` | `#721F2B` |
| Piedra (texto secundario, reglas) | `--stone` | `#8D8982` |

Derivados admitidos: `--paper-2 #EBE4D7` (superficie hundida sobre papel),
`--ink-2 #221E1A` (superficie elevada sobre tinta), `--gilt-soft #D9C08A` (dorado sobre
tinta, para llegar a contraste AA).

Reglas: el dorado no se usa como fondo de área ni como color de texto de párrafo. El
bordó no compite con el dorado en el mismo bloque. Sobre tinta, el texto secundario se
tinta desde el marfil (`color-mix`), nunca gris de sistema.

## Tipografía

- **Display — Bodoni Moda.** Títulos, nombre de modelo, precios de ficha. `text-wrap:
  balance`, tracking negativo desde `-0.01em` hasta `-0.035em` en los tamaños grandes.
  Nunca por debajo de 20 px: la didone se rompe en cuerpo pequeño.
- **Aparato — Jost.** Navegación, botones, formularios, tablas, cuerpo. Versalitas con
  tracking `0.18em` para etiquetas de ficha.
- Medida de lectura 62–70ch. Display máximo `clamp(3rem, 9vw, 7.5rem)`.

## Composición

Reglas de 1 px en `--stone/35` separan; no hay bordes de tarjeta en el catálogo. Los
bloques alternan papel y tinta a página completa. Más aire arriba de un título que
abajo. La grilla de catálogo es de 2 columnas en teléfono y 3 en escritorio, con la
ficha del par —serie, horma— bajo la fotografía, alineada a la izquierda.

## Movimiento

Una sola gramática, la del brief:

- Ficha de producto: `scale(1.06)`, inclinación máxima 6° siguiendo el puntero, sombra
  que gana profundidad, cruce a la segunda fotografía. **400 ms**, `cubic-bezier(0.22,
  0.61, 0.36, 1)`, sin rebote. En teléfono: deslizar o tocar cambia la fotografía.
- Entradas por scroll: desplazamiento de 24 px y opacidad, escalonadas 60 ms, una sola
  vez, desde un estado ya visible.
- Cortinas de página y panel del carrito: `clip-path` y transformación, 520 ms.
- `prefers-reduced-motion: reduce` desactiva inclinación, paralaje, el WebGL y las
  entradas por scroll; deja los cambios de estado instantáneos y legibles.

## Prohibiciones

- Texto con degradado; el énfasis sale del peso y del tamaño.
- Vidrio esmerilado como decoración (se admite sólo en la barra fija, donde separa
  capas de verdad).
- Tarjeta dentro de tarjeta.
- Dorado sobre marfil para texto por debajo de 18 px: no llega a contraste.
- Sombras sin desplazamiento; toda sombra cae hacia abajo.
