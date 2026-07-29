# Fotografía propia

Todo lo que dejes acá reemplaza al negativo de referencia que baja
`scripts/fetch-assets.mjs`, sin tocar el manifiesto.

La ruta del archivo tiene que coincidir con el nombre de salida, con cualquiera
de estas extensiones: `.jpg` `.jpeg` `.png` `.webp` `.avif` `.tif`.

```
assets-src/h/aurore.jpg          → public/media/h/aurore.webp        (vitrina, 2000×2500)
assets-src/p/vesper-1.jpg        → public/media/p/vesper-1.webp      (ficha, 1400×1750)
assets-src/e/atelier-horma.jpg   → public/media/e/atelier-horma.webp (editorial, 2200×1467)
```

Después:

```bash
node scripts/fetch-assets.mjs
```

El script recorta, comprime y regenera el placeholder borroso. Avisa al final
cuántas imágenes salieron de acá.

## Encuadre

| Carpeta | Proporción | Salida | Para qué |
|---|---|---|---|
| `h/` | 4:5 vertical | 2000×2500 | vitrina de portada, a sangre |
| `p/` | 4:5 vertical | 1400×1750 | ficha de catálogo y de producto |
| `e/` | 3:2 apaisado | 2200×1467 | planos editoriales |
| `v/` | 2:3 vertical | 1500×2250 | campañas verticales |
| `w/` | 4:5 vertical | 1400×1750 | negativo que muestrea la pieza WebGL |

El recorte es siempre centrado, así que dejá aire alrededor del sujeto. En la
vitrina, además, tené en cuenta que en escritorio la fotografía se ve casi
cuadrada: el par tiene que sobrevivir a un recorte central 1:1.

Los archivos de esta carpeta no se versionan salvo este README.
