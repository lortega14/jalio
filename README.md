# Jalio · Landing page

Sitio estático (HTML, CSS y JS, sin dependencias) listo para GitHub Pages.

## Estructura
```
index.html            Página
css/styles.css        Estilos (tokens del brandbook al inicio)
js/main.js            Interacciones, tema y configuración de contacto
js/particulas.js      Campo de partículas interactivo del hero
assets/logo/          Firma, símbolo y logotipo en SVG (negro y blanco), extraídos del manual
assets/icons/         Favicons e icono 512 px oficiales
assets/og-image.png   Imagen para compartir en redes (1200 × 630)
favicon.ico
.nojekyll
```

## Antes de publicar
1. **Contacto**: en `js/main.js`, completa `CONTACTO.whatsapp` (ej. `5214441234567`) y/o `CONTACTO.correo`. Si llenas ambos, el formulario deja elegir el canal.
2. **Tema**: por defecto sigue la configuración del dispositivo (oscuro si no hay preferencia) y recuerda la elección del botón. Para forzar oscuro siempre de inicio, en el `<script>` del `<head>` cambia la línea del `matchMedia` por `t = 'dark';`.
3. **Open Graph**: cambia `og:image` en `index.html` por la URL absoluta una vez publicada.

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la raíz de un repositorio.
2. Settings → Pages → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
3. Para dominio propio, agrega un archivo `CNAME` con tu dominio y configura el DNS.
