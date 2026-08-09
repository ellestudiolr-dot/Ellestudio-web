# Elle Studio · Página web pública

Página de presentación y reservas de Elle Studio (San Isidro, Lima).
**Separada del CRM** — este repositorio no comparte código con la app de gestión.

## Estructura
```
index.html        Página (secciones: hero, servicios, cómo funciona, ubicación, reserva)
css/estilos.css   Estilos (paleta y tipografías de la marca)
js/reserva.js     Config (WhatsApp/Instagram) + envío de reservas a Supabase
```

## Datos
Las reservas se guardan en la tabla `web_reservas` de Supabase (proyecto compartido,
tablas separadas de las `elle_*` del CRM). RLS: el público SOLO puede insertar;
leer/atender requiere sesión del equipo.

## Configurar WhatsApp / Instagram
En `js/reserva.js`, llenar `CONFIG.WHATSAPP` (ej. `51987654321`) y
`CONFIG.INSTAGRAM` (usuario sin @). Los botones aparecen solos al llenarlos.

## Deploy
Vercel. Cada push a `main` publica automáticamente (si el repo está conectado en Vercel).
