# Jalio · Landing page

Sitio estático (HTML, CSS y JS, sin dependencias) listo para GitHub Pages.

## Estructura
```
index.html            Página
css/styles.css        Estilos (tokens del brandbook al inicio)
js/main.js            Interacciones y configuración de contacto
assets/logo/          Firma, símbolo y logotipo en SVG (negro y blanco), extraídos del manual
assets/icons/         Favicons e icono 512 px oficiales
assets/og-image.png   Imagen para compartir en redes (1200 × 630)
favicon.ico
.nojekyll
```

## Antes de publicar
1. **Contacto**: en `js/main.js`, completa `CONTACTO.whatsapp` (ej. `5214441234567`) y/o `CONTACTO.correo`. Si llenas ambos, el formulario deja elegir el canal.
2. **Proyectos**: confirma con D'Nice y Club Deportivo 2000 que pueden aparecer. Cuando tengas capturas, reemplaza cada `.project__shot` por un `<img>` (WebP, ~1200 px de ancho, con `alt` descriptivo).
3. **Open Graph**: cambia `og:image` en `index.html` por la URL absoluta una vez publicada.

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la raíz de un repositorio.
2. Settings → Pages → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
3. Para dominio propio, agrega un archivo `CNAME` con tu dominio y configura el DNS.
