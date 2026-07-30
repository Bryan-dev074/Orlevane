# instruc.md — Cómo se construye una página que se siente premium

Este documento destila el método con el que se construyó ORLÉVANE, una tienda
de calzado que se ve y se comporta como una casa de lujo real. Está escrito
para que otra IA (u otro equipo) pueda producir algo **igual de bueno sin
copiar esta página**: los valores concretos que aparecen abajo son ejemplos de
un principio, no recetas. Ante cada uno, la pregunta correcta es «¿qué regla
encarna este número?» y derivar el propio desde el propio brief.

La tesis de todo el documento cabe en una línea:

> **Premium no es un estilo: es coherencia bajo una idea, más la disciplina de
> verificar cada promesa.** Una página se siente cara cuando todas sus piezas
> obedecen al mismo mundo, cuando nada está puesto "porque queda lindo", y
> cuando cada detalle que el visitante toca responde como el objeto real.

---

## 1 · El orden de trabajo (esto es lo que más importa)

El error clásico es empezar por el layout. El orden que produjo esta página:

1. **Verdad de producto primero.** Antes de una línea de código, un documento
   (`PRODUCT.md`) con: quién compra, desde qué dispositivo, en qué situación,
   qué lo convence, qué canales de venta son legítimos en su región (aquí:
   WhatsApp como canal de primera clase, dos idiomas, dos monedas). Todo lo
   que después parece "detalle mágico" sale de acá.
2. **Contrato de dirección.** Cinco bloques de ~30 palabras que se escriben
   ANTES de codear y contra los que se audita el resultado:
   - **TESIS**: la única idea que esta página posee, y qué convención del
     rubro rechaza. (Aquí: «la tienda se hojea como el muestrario de un
     taller, no como una grilla de e-commerce; se rechaza el hero de foto
     lavada con "comprar ahora" encima».)
   - **MUNDO PROPIO**: paleta y lenguaje de componentes tan específicos que se
     reconocerían con todo el contenido borrado.
   - **HISTORIA**: qué entiende, qué cree y qué hace el visitante.
   - **PRIMER VIEWPORT**: composición exacta, qué va dónde y a qué escala.
   - **FORMA**: qué materialidad del mundo real inspira la interfaz.
3. **Sistema registrado** (`DESIGN.md`): tokens con ROLES y PROHIBICIONES, no
   una lista de colores. "Qué color" importa menos que "dónde se permite y
   dónde se prohíbe".
4. **Contenido antes que layout.** El catálogo entero —nombres, historias,
   precios, fichas técnicas— se escribe antes de diseñar la ficha. El diseño
   de un contenedor sin contenido real siempre miente.
5. **Construir comprometido.** La primera versión ya va con el mundo completo,
   no una versión "segura" para pulir después. Cometer es la parte difícil.
6. **Verificar con los ojos y con números.** Capturas de pantalla en cada
   hito, recorrer el flujo entero como un cliente, y medir (bytes, ms,
   geometrías) en compilación de producción.

**La regla del brief:** si el cliente fijó algo (paleta, nombre, un movimiento
de 400 ms sin rebote), eso gana siempre — incluso contra el gusto propio.
Redirigir un brief claro hacia la estética preferida de uno es un fracaso, no
una mejora.

---

## 2 · El sistema visual: por qué se ve caro

### 2.1 Dos superficies, no veinte

Todo el sitio son **dos superficies que alternan a página completa**: papel
(marfil cálido `#F4EFE6`) y tinta (negro café `#171411`). No hay paneles
oscuros flotando dentro de páginas claras. Cada superficie tiene derivados
numerados con rol declarado (superficie hundida `#EBE4D7`, elevada sobre tinta
`#221E1A`), no una escala genérica de grises.

Cada componente compartido recibe una prop `onInk` que lo traduce a la
superficie oscura con reglas fijas — el dorado sube a un tono más claro
(`#D9C08A`) para conservar contraste AA, y el texto secundario sobre tinta se
tinta **desde el marfil** (`color-mix(in oklab, paper 62%, ink)`), nunca gris
de sistema, porque un gris neutro rompe la temperatura del par.

### 2.2 El acento se raciona (esto es el 50 % del "premium")

El dorado `#B89A5B` está **prohibido** como fondo de área y como color de
párrafo. Se permite solo en: filetes de 1 px, numeración, el guion del
antetítulo, el anillo de foco, el subrayado del enlace activo y el hover del
borde del botón. El bordó `#721F2B` tiene semántica reservada (serie especial
y avisos de última unidad) y nunca convive con el dorado en el mismo bloque.

**Principio transferible:** elegí un acento y hacelo escaso. Un color que
aparece en todos lados no significa nada; uno que aparece en cinco lugares
exactos se convierte en firma.

### 2.3 Filetes, no tarjetas

No hay bordes de tarjeta ni sombras de tarjeta en el catálogo: los productos
**flotan sobre el papel** y lo que separa es un filete de 1 px al 25–35 % de
opacidad. La "ficha técnica" (par etiqueta/valor separado por filete) es el
patrón compositivo de toda la casa — se lee como un muestrario impreso.
La sombra existe solo donde hay elevación real (paneles, ficha en hover) y
siempre **desplazada hacia abajo y tintada con la tinta de la casa**, nunca
un halo negro sin dirección.

### 2.4 Dos tipografías con roles estrictos

- **Display** (una didone: Bodoni): títulos, nombres de modelo, precios.
  Regla dura: **nunca por debajo de 20 px** — los trazos finos desaparecen.
  Escala con `clamp()` donde a más tamaño, más apretado: de `-0.014em` a
  `-0.035em` de tracking y line-height de 1.14 a 0.92. Peso 400 siempre: en
  una didone el contraste lo da el trazo, no la negrita.
- **Aparato** (una geométrica: Jost): navegación, botones, formularios,
  cuerpo. Las etiquetas son versalitas de 10–11 px con tracking 0.18–0.2em.
- **Cifras tabulares** (`font-variant-numeric: tabular-nums`) en todo lo que
  se compara: precios, contadores, tablas.
- Medida de lectura: 62–70ch. Solo cargar los cortes que se usan de verdad
  (aquí: 2 pesos + 1 itálica; subconjunto `latin` alcanza para es/pt).

### 2.5 Textura que no se nota pero se siente

Sobre los fondos de tinta hay un **grano de impresión**: un SVG de
`feTurbulence` (fractalNoise, baseFrequency 0.85) en mosaico de 160 px con
`mix-blend-mode: overlay` a opacidad 0.42. El negro plano parece pantalla; el
negro con grano parece material. Se apaga con `prefers-reduced-motion`.

### 2.6 Detalles de base que sostienen el mundo

- Selección de texto tematizada (tinta sobre papel; invertida sobre tinta).
- Foco de teclado visible en dorado (`outline 2px`, offset 3 px) en TODO.
- El subrayado de enlaces es un filete que **crece desde la izquierda** en
  400 ms — un solo patrón de enlace en todo el sitio.
- Las clases propias van en `@layer components` para que las utilidades del
  framework siempre puedan ganarles (una clase suelta rompe `hidden`).
- Marca denominativa intocable: tracking abierto fijo, jamás degradado, jamás
  sombra.

---

## 3 · Movimiento: una gramática, no efectos

**El principio:** una casa tiene UNA manera de moverse. Definí dos curvas con
nombre y usalas en todo:

```
SILK    cubic-bezier(0.22, 0.61, 0.36, 1)   — salida sedosa, para casi todo
CURTAIN cubic-bezier(0.65, 0, 0.35, 1)      — entra y sale con peso, para cortinas y máscaras
```

Reglas que hacen que el movimiento se sienta caro:

1. **Sin rebote.** El rebote es juguete; la seda es lujo.
2. **Entrar desde un estado ya legible** (opacidad 0 → 1 con 24 px de
   desplazamiento), una sola vez, nunca en cada scroll.
3. **Los títulos suben por renglones desde una máscara** (`overflow-hidden`
   por línea) y **los filetes se dibujan** de izquierda a derecha (scaleX
   0→1). Esto da la sensación de "escrito a mano" sin decir nada.
4. **Una duración viene del brief y es sagrada**: la ficha de producto hace
   su acercamiento del 6 %, inclinación máxima de 6° siguiendo el puntero,
   sombra más profunda y cruce a la segunda fotografía **en 400 ms exactos**.
5. **Escalonar con moderación**: 60–90 ms entre elementos hermanos, tope de
   ~8 elementos (después todos juntos).
6. **`prefers-reduced-motion` no es opcional**: cada pieza tiene su
   estrategia — la cortina no aparece, el WebGL muestra la foto, las
   entradas son instantáneas. Nunca "animación más corta": apagado real.
7. **Solo `transform` y `opacity`** para lo que se anima por cuadro. Nada que
   recalcule layout.

---

## 4 · Los momentos firma (y su ingeniería)

Una página memorable tiene 3–5 momentos que nadie más tiene. Los de esta obra,
con lo que los hace funcionar:

### 4.1 La cortina de entrada

No es un "loading screen": es un **acto de teatro con compases**.

- Secuencia: tinta → una línea de luz dorada asoma por la juntura vertical →
  el sello se escribe **letra por letra** desde máscaras (78 ms de duración,
  60 ms de paso) → la leyenda y un filete de carga → compás → los dos paños
  se abren hacia los lados en 1.4 s.
- Los paños parecen **tela y no rectángulos** por tres cosas: pliegues
  verticales sutilísimos (dos `repeating-linear-gradient` desfasados), sombra
  en el canto interno (donde dos telas pesadas se juntan y oscurecen), y que
  el paño derecho sale **90 ms después** que el izquierdo — dos cuerdas nunca
  tiran igual.
- El filete de carga marca **progreso real** (tipografías + `load`), no un
  porcentaje inventado.
- Tres salvaguardas obligatorias: un mínimo narrativo (que la secuencia
  termine de contarse, ~2.2 s), un **tope duro** (~4.2 s: la tienda nunca
  queda rehén de un recurso lento), y salida siempre disponible (clic o
  Escape, con un aviso que solo aparece si la espera se alarga).
- Con movimiento reducido la cortina se salta ANTES del primer pintado, con
  un script inline que marca `<html data-intro="skip">` (y
  `suppressHydrationWarning` porque el servidor no puede saber ese atributo).

### 4.2 El brillo sobre el producto

El hero nunca está congelado: cada ~7 s una **luz cruza la fotografía** — un
gradiente vertical (`transparent → paper al 10 % → transparent`) de un tercio
del ancho que viaja de lado a lado en 2.4 s. Es la técnica más barata del
documento (un div con gradiente animando `x`) y la que más "vida" aporta por
peso. Lo mismo en las fichas del catálogo: el cruce a la segunda fotografía en
hover es el "brillo" de cada producto.

### 4.3 Profundidad de vitrina

Con puntero fino, la fotografía del hero sigue al cursor ±14 px y la ficha de
texto se mueve 5 px **en sentido contrario** (doble muelle sobreamortiguado:
stiffness 60, damping 20). Dos planos que se mueven en contra = vidrio de
vitrina. **Solo en escritorio**: apilado en teléfono, el paralaje deja de ser
profundidad y se vuelve desorden (aprendido a golpe: empujaba la ficha sobre
la sección siguiente).

### 4.4 El cursor de la casa

Un punto de 5 px que sigue al instante + un anillo que llega con retardo
(lerp 0.18 por cuadro en un solo rAF, transform puro). Estados por zona vía
`data-cursor` en el elemento: sobre enlaces crece, sobre fichas se vuelve un
disco dorado con "VER", sobre la foto del hero "ARRASTRAR", sobre campos de
formulario **desaparece y vuelve el nativo**.

Dos lecciones caras:

- `mix-blend-mode: difference` **no funciona dentro de un contenedor
  posicionado con z-index**: el contexto de apilado hace que se mezcle contra
  el fondo transparente del contenedor y no contra la página. Los nodos del
  cursor deben colgar directos del body.
- **Nunca apagar el cursor nativo por CSS suelto.** La clase que lo apaga la
  pone el propio componente cuando de verdad se dibujó; si el componente no
  corre, el visitante conserva su puntero.

### 4.5 La pieza técnica única (WebGL)

Una fotografía del producto muestreada píxel a píxel y reconstruida como nube
de puntos 3D, usando la **luminancia como profundidad** (el zapato se levanta
del plano donde la luz pegó) y descartando el fondo con un umbral. Al
desplazarse, los puntos viajan de posiciones dispersas a su lugar (mezcla
`scatter→target` en el vertex shader, desfasada por una semilla por punto).

Su ingeniería importa más que su belleza:

- Montaje **diferido**: `IntersectionObserver` + `import()` dinámico de la
  librería 3D. No cuesta nada hasta que se acerca.
- El avance se lee **del rectángulo en cada cuadro** con trinquete (nunca
  retrocede), no de eventos de scroll — que con scroll suave se pierden y
  dejan la pieza a medio armar.
- Al desmontar: `forceContextLoss()` **antes** de `dispose()`. Solo con
  dispose el navegador sigue contando el contexto WebGL y tras ~una docena de
  montajes deja de entregar contextos: la pieza "a veces no aparece".
- La fotografía de respaldo no se oculta **hasta que se pintó un cuadro
  real**, y vuelve si el contexto se pierde. Fallar hacia la foto, nunca
  hacia un hueco negro.

### 4.6 El motivo cultural como firma

El patrón decorativo del sitio no es genérico: es el **ñandutí** (encaje
paraguayo), dibujado como trazos SVG que se trazan al entrar (pathLength
0→1), no como imagen. Buscá el equivalente en el mundo del propio brief: un
motivo local convertido en sistema gráfico vale más que cualquier textura de
stock.

**Lección de rendimiento que costó un bug real:** ese radial eran ~125 nodos
SVG animados a la vez por JavaScript, y al entrar a la sección congelaba el
scroll del teléfono (cuadros de 167 ms medidos). La regla: **el número de
animaciones simultáneas es un presupuesto**. Los 96 nudos pasaron a entrar
como UN grupo con un fundido, y en pantallas táctiles el dibujo trazo a trazo
se reemplaza por un solo fundido del conjunto: 1 animación en lugar de 125
(167 ms → 14 ms de peor cuadro).

---

## 5 · El realismo: por qué se siente una tienda de verdad

Esta es la capa que separa "demo linda" de "tienda creíble". El principio:
**cada dato visible tiene una lógica interna que lo sostiene.**

- **Procedencia por pieza.** Cada producto declara número de serie con tirada
  (`N.º 011 / 120`), horma (`H-072`), curtido con origen y peso con talla de
  referencia. Las historias tienen lógica de taller: números que se sostienen
  entre sí (si la tirada es de 60, hay lista de espera; si el cuero es claro,
  se corta a primera hora). Los textos de producto se escriben como los
  escribiría el artesano, no el marketing.
- **Stock verosímil y determinista.** Un hash estable (FNV-1a sobre
  `slug:talla`) genera stock en curva de campana: las tallas del medio
  abundan, las puntas escasean, algunas están agotadas. Determinista para que
  servidor y cliente coincidan (nada de `Math.random()` en render). Las
  etiquetas se **derivan** del stock (0 → agotado, ≤4 → últimas unidades),
  nunca se declaran a mano: los datos no pueden mentirse entre sí.
- **Reglas comerciales de verdad**: envío bonificado sobre el neto con
  medidor de progreso de 1 px, cupones (incluida la doble grafía Ñ/N),
  cuotas escalonadas según el importe como haría un emisor local.
- **Pasarela simulada con seriedad de pasarela**: validación Luhn, detección
  de marca por prefijo, una tarjeta 3D dibujada (sin logos: la marca se
  dibuja con formas) que **gira al enfocar el CVV**, 3-D Secure con reglas
  anunciadas, y rechazos reproducibles por sufijo de tarjeta. La autorización
  es teatral: cuatro pasos con demoras calibradas (520/760/900/520 ms) porque
  lo instantáneo no se cree.
- **Códigos de pedido sin caracteres ambiguos** (alfabeto sin 0/O/1/I) — el
  cliente los va a dictar por teléfono.
- **El canal regional como ciudadano de primera**: el pedido por WhatsApp se
  arma del carrito real (modelo, talla, color, cantidad, totales, moneda,
  número de pedido) en el idioma del visitante.
- **Idioma y moneda resueltos en el servidor** vía cookie: la página llega ya
  traducida, sin parpadeo. El diccionario es un objeto plano tipado donde el
  segundo idioma está **forzado por el compilador** a tener todas las claves
  (`Record<DictKey, string>`), y el modelo de datos usa el mismo truco
  (`L10n = Record<Locale, string>`) para que ningún texto de producto exista
  en un solo idioma.
- **Dinero formateado a mano**, sin `Intl`: servidor y navegador deben
  producir exactamente la misma cadena o la hidratación falla. Una moneda es
  fuente de verdad y la otra se deriva con tasa fija y redondeo de vitrina.
- **Deshacer en vez de confirmar**: quitar del carrito muestra un toast con
  "Deshacer" que restaura en el mismo orden. Toasts con `aria-live`,
  apilados, con acción y sin bloquear clics alrededor.
- **La honestidad, concentrada**: si el proyecto es una demo, el aviso vive
  en UN lugar con peso (el botón final dice «Realizar pago de prueba», junto
  a las tarjetas de prueba) y no regado por toda la página rompiendo la
  ilusión.

---

## 6 · La fotografía como sistema

- **Registro unificado por grupo.** Tres tarjetas que conviven = tres fotos
  con la misma luz, el mismo fondo y el mismo tipo de plano. Es la diferencia
  entre "una campaña" y "tres fotos sueltas". El manifiesto de assets ES un
  documento de dirección de arte.
- **Regla del doble de píxel.** Cada imagen se genera al doble de su tamaño
  CSS máximo (pantallas retina). La ficha que se muestra a ~700 px se genera
  a 1400; el plano a sangre del hero, a 2000+. Si el navegador agranda, se ve
  blanda — y "blanda" el visitante lo lee como "barata".
- **Tamaños POR USO**, no una talla única: ficha 4:5, detalle (zoom real
  sobre el mismo negativo, no otra foto), campaña 3:4, editorial 3:2, vitrina.
- **Cero marcas ajenas.** Si la foto de referencia muestra el logo de otro
  fabricante, se difumina con un parche de desenfoque sobre superficie lisa
  (rectángulos normalizados en el pipeline) o se cambia la foto. Una casa no
  puede exhibir el logo de otra.
- **LQIP generado en build**: miniatura de 20 px desenfocada, en base64,
  escrita como módulo TypeScript que el componente de imagen consume
  automáticamente. Nada carga "en blanco".
- **Curaduría con hojas de contacto**: para elegir fotos, componer grillas
  etiquetadas y mirarlas — nunca elegir por nombre de archivo.
- **Vía de reemplazo**: una carpeta espejo (`assets-src/`) donde dejar
  material propio que pisa al de referencia pieza a pieza, con el pipeline
  aplicando recorte, compresión y LQIP igual.

---

## 7 · Rendimiento sin perder calidad

**Medir primero, en compilación de producción.** Optimizar sin números es
adivinar. Los de esta obra, como referencia de qué es alcanzable:

| Métrica | Antes | Después |
|---|---|---|
| Transferencia total | 1087 KB | 581 KB |
| Imágenes | 712 KB | 212 KB |
| Tipografías | 215 KB | 143 KB |
| LCP | 808 ms | 172 ms |
| Tareas largas | 51 ms | ninguna |
| Peor cuadro (sección pesada, móvil) | 167 ms | 14 ms |

De dónde salió cada ganancia (los patrones se repiten en cualquier proyecto):

1. **Cazar la doble descarga.** El precargador pedía los archivos crudos y el
   optimizador de imágenes bajaba los mismos ya procesados: medio mega
   duplicado. Regla: el preloader espera *eventos* (fonts.ready, load), no
   vuelve a pedir *recursos*.
2. **Tipografías: solo los cortes usados.** Grep de los pesos realmente
   presentes en el código antes de decidir qué se carga.
3. **Presupuesto de animaciones simultáneas.** Cien tweens JS a la vez
   congelan un teléfono; un grupo con un fundido no. En pantallas táctiles,
   la versión rica de un efecto se degrada a una versión de una sola
   animación.
4. **Lo caro se difiere y se libera**: WebGL con import dinámico +
   IntersectionObserver, render pausado fuera de pantalla y con la pestaña
   oculta, contexto liberado de verdad al desmontar.
5. **Sin recálculo de layout en caliente**: todo lo que anima por cuadro es
   transform/opacity; el scroll-lock compensa la barra para que nada salte.
6. **La calidad no se negocia donde se ve**: el plano a sangre conserva
   calidad 90 con una excepción documentada; se recorta donde el ojo no
   distingue (WebP q78 en fichas, LQIP de 20 px).

---

## 8 · Accesibilidad y solidez (lo que no se ve pero se nota)

- Trampa de foco completa en paneles y modales (un solo hook reutilizado):
  Tab circular, Escape cierra, restaura el foco al abridor.
- Todo el flujo de compra operable con teclado; la búsqueda con flechas +
  Enter; el carrusel con flechas del teclado.
- Búsqueda insensible a diacríticos (`normalize('NFD')` + quitar
  `\p{Diacritic}`): "nanduti" encuentra "Ñandutí". Ranking por niveles
  (exacto > empieza > contiene > campos secundarios).
- Filtros serializados en la URL (compartibles, con atrás/adelante), y los
  valores por defecto se BORRAN de la URL en vez de escribirse.
- Estados con voz propia: el 404 y la página de error hablan el idioma de la
  casa («Se nos soltó una costura»), los vacíos invitan en vez de disculparse.
- Tallas agotadas **dibujadas** (línea tachada en diagonal), no solo
  deshabilitadas; escasez anunciada con `role="status"`.
- Compuerta de hidratación para todo lo que lee almacenamiento local: primero
  un placeholder neutro, después el dato — nunca un "flash de vacío".
- Skip-link, `aria-live` en toasts, `aria-pressed` en toggles, checkboxes
  custom con `peer sr-only` + foco visible.
- Estilos de impresión: la página de pedido se imprime limpia como
  comprobante (`.no-print` en barras y overlays).
- SEO: JSON-LD de producto derivado de los datos reales, robots que excluye
  rutas transaccionales, sitemap con prioridades, OG image generada por
  script con la tipografía y el velo de la casa.

---

## 9 · Trampas reales (cada una costó un bug)

1. **Hidratación**: nada de `Intl`, `Date.now()` ni `Math.random()` en
   render. Los senos/cosenos de un SVG generado se redondean a 5 decimales
   (el último dígito difiere entre servidor y navegador).
   `suppressHydrationWarning` solo para atributos escritos por scripts
   pre-pintado, nunca como parche general.
2. **`mix-blend-mode` + contextos de apilado**: un wrapper `fixed` con
   z-index rompe la mezcla. Nodos de mezcla directos al body.
3. **`IntersectionObserver` + `overflow: hidden`**: un elemento desplazado
   dentro de una máscara nunca se ve a sí mismo entrar. Observar el
   contenedor, no el elemento enmascarado.
4. **WebGL**: `dispose()` no libera el contexto; `forceContextLoss()` sí.
   Sin eso, tras navegar varias veces la pieza deja de aparecer.
5. **CSS en capas**: clases propias en `@layer components` o le ganarán la
   especificidad a las utilidades y `hidden` dejará de funcionar.
6. **El cursor propio** jamás debe poder dejar al visitante sin puntero: el
   nativo se apaga solo si el propio confirmó que se dibujó.
7. **Paralaje en móvil**: apilado vertical + desplazamiento = solape. Los
   efectos de profundidad se restringen a viewport ancho con matchMedia.
8. **Animaciones de scroll por eventos**: con scroll suave los eventos se
   pierden. Leer el rectángulo en el rAF, con trinquete si no debe
   desarmarse.

---

## 10 · Herramientas de esta obra (y el porqué)

| Herramienta | Rol | Por qué esta |
|---|---|---|
| Next.js (App Router) | marco | SSR de idioma/moneda por cookie sin parpadeo, imágenes optimizadas, metadatos |
| Tailwind 4 | estilos | tokens en `@theme` = el sistema vive en un solo lugar |
| Motion (Framer) | animación | springs, máscaras, `useInView`, `AnimatePresence` con salidas |
| Lenis | scroll suave | el peso del scroll es parte del lujo; respeta reduced-motion |
| Zustand + persist | estado | carrito/favoritos/pedidos en localStorage con saneo al rehidratar |
| three.js | la pieza WebGL | cargado dinámico, solo cuando se acerca |
| sharp (scripts) | pipeline de fotos | recortes por uso, retoque, LQIP, OG — todo reproducible por script |
| next/font | tipografías | self-hosted, subconjuntadas, sin FOUT de terceros |

El stack importa menos que la disciplina: cualquier equivalente sirve si se
respetan los principios de las secciones 2–9.

---

## 11 · El bucle de verificación (sin esto, nada de lo anterior sobrevive)

1. **Capturar, mirar, corregir.** Screenshot de escritorio Y de teléfono en
   cada hito. La mitad de los bugs de esta obra se vieron en una captura
   antes que en el código (solapes, contrastes, un logo ajeno en una foto).
2. **Recorrer el flujo como un cliente**, de punta a punta, hasta obtener el
   número de pedido. Un flujo que "debería funcionar" no existe.
3. **Medir geometría en vez de discutirla**: ¿hay rendija entre los paños?
   `getBoundingClientRect` y listo. ¿Se traba? Grabar deltas de rAF y contar
   cuadros >33 ms, antes y después.
4. **Auditar contra el contrato**: al final, releer TESIS/MUNDO/HISTORIA y
   preguntar si la página construida los cumple o los diluyó.
5. **Escuchar el feedback como se dijo**: si el cliente dice «se ve horrible,
   el anterior estaba mejor pero no funcionaba», la tarea es conservar el
   arreglo funcional y revertir el aspecto — no defender el rediseño.

---

## 12 · Lista de control final

**Mundo**
- [ ] ¿Puedo reconocer el sitio con todo el texto borrado?
- [ ] ¿El acento aparece en menos de seis contextos, siempre los mismos?
- [ ] ¿Hay UN motivo cultural/material propio convertido en sistema?

**Movimiento**
- [ ] ¿Dos curvas nombradas y ninguna animación fuera de ellas?
- [ ] ¿Hay 3–5 momentos firma y el resto es sereno?
- [ ] ¿`prefers-reduced-motion` apaga de verdad cada pieza?
- [ ] ¿Alguna vista anima más de ~30 nodos a la vez? (rehacer si sí)

**Realismo**
- [ ] ¿Cada dato visible tiene una lógica que lo sostiene?
- [ ] ¿Los estados derivados (badges, escasez) salen de los datos, no de
      declaraciones a mano?
- [ ] ¿El flujo completo funciona con teclado y termina en un comprobante?

**Material**
- [ ] ¿Toda imagen se genera al doble de su tamaño CSS?
- [ ] ¿Ninguna foto muestra marcas ajenas?
- [ ] ¿Grupos de fotos que conviven comparten registro?

**Salud**
- [ ] ¿Medido en producción: transferencia, LCP, cuadros largos?
- [ ] ¿Nada se descarga dos veces? ¿Solo se cargan los cortes tipográficos
      usados?
- [ ] ¿Cero errores de hidratación en consola?
- [ ] ¿Lo caro se monta al acercarse y se libera al irse?

---

*Documento generado a partir del código real de ORLÉVANE
(github.com/Bryan-dev074/Orlevane): cada técnica citada existe en ese repo y
fue verificada con capturas y mediciones durante la construcción.*
