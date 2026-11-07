# Elle Studio · Página web pública

Página de presentación y reservas de Elle Studio (San Isidro, Lima).
**Separada del CRM** — este repositorio no comparte código con la app de gestión.
Se publica en GitHub Pages: https://ellestudiolr-dot.github.io/Ellestudio-web/

## Cómo está armada (noviembre 2026)
Diseño estilo Apple (tipografía SF Pro en iPhone/Mac, Inter en el resto; textos que aparecen
y desaparecen al hacer scroll) con la estructura de una página tipo "club" (portada con video,
invitación, ofertas en tarjetas oscuras, módulos con video, mitad color/mitad video, pasos, FAQ, Instagram).

Cada pestaña del menú es una **vista** (solo se muestra la que toca):
- `inicio` — enfocado en depilación láser: video de portada, invitación, ofertas del mes, cómo funciona, preguntas, Instagram.
- `tratamientos` — tres módulos con video (láser, glúteos, faciales), reductores y Hollywood Peel.
- `precios` — en vivo desde Supabase (`precios_servicios` y `precios_promociones`, las mismas tablas que edita
  el CRM en Lista de precios; la web solo lee con la llave anon). Cada servicio sale con su foto del proceso
  (`img/precios/`, mismas reglas de elección que el CRM). Si la base no responde, usa `data/precios.json`.
- `estudio` y `ubicacion` — como siempre.

```
index.html          Página (todas las vistas en un solo archivo)
js/pagina.js        Vistas, menú, popup de reserva, animaciones de texto, videos en silencio
js/precios.js       Datos y tablas de precios
js/instagram.js     Publicaciones de Instagram (ver abajo)
js/whatsapp.js      Pedidos y reserva → WhatsApp + registro en Supabase (web_reservas)
js/reserva.js       Configuración (WhatsApp, Instagram, Supabase)
video/              6 videos de 8 s (Veo 3.1 Fast en Google Flow), sin audio, ~1 MB cada uno
img/v/              Fotos de partida de los videos (también sirven de póster)
img/logo-elle.png   Logo real en PNG sin fondo (barra) · img/logo-elle-claro.png (pie oscuro)
data/instagram.json Respaldo de publicaciones por si falla la actualización automática
```

## Instagram se actualiza solo
La tabla `web_instagram` de Supabase guarda las últimas publicaciones de @_elleestudio.
Un trabajo programado (`cron.job` → `web_instagram_actualizar()`, cada hora) lee lo público del perfil
y renueva miniaturas y textos. La página las lee con la llave anon (solo lectura).
Si algún día Instagram cambia y deja de funcionar, la página sigue mostrando lo último guardado y,
si no hubiera nada, `data/instagram.json`. Alternativa oficial: Behold (poner el enlace en `CONFIG.BEHOLD_FEED`).

## Datos
Las reservas se guardan en la tabla `web_reservas` de Supabase (proyecto compartido,
tablas separadas de las `elle_*` del CRM). RLS: el público SOLO puede insertar;
leer/atender requiere sesión del equipo.

## Configurar WhatsApp / Instagram
En `js/reserva.js`: `CONFIG.WHATSAPP` (ej. `51987654321`) y `CONFIG.INSTAGRAM` (usuario sin @).

## Deploy
GitHub Pages. Cada push a `main` publica solo.
