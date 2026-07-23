# Para Karol

Un regalo de cumpleaños mobile-first y 100% estático. Incluye calendario de turnos, frasco de notas, respiración 4-7-8, recordatorios, meta compartida y galería de Lima. No usa backend, cuentas, analytics ni servicios pagos: el calendario y la meta viven solamente en `localStorage` del navegador.

## Sitio publicado

La versión pública está en:

```text
https://barbararoza60-png.github.io/para-karol/
```

GitHub Pages publica automáticamente la carpeta raíz de la rama `main`. Cada cambio nuevo guardado en esa rama actualiza el enlace, sin servidor ni servicio pago. Todos los enlaces y las imágenes usan rutas relativas para funcionar correctamente dentro de `/para-karol/`.

## Verlo antes en tu computadora

Si tenés Python instalado:

```powershell
python -m http.server 8080
```

Después abrí `http://localhost:8080`. Es mejor probarlo así que abriendo `index.html` directamente, porque la galería descubre las fotos mediante el servidor local.

## Cambiar textos sin tocar el resto del sitio

Todo el contenido personal está en un único archivo: [`content.js`](./content.js).

Ahí podés actualizar:

- `hero`: bienvenida de la portada.
- `jarNotes`: papelitos del frasco.
- `affirmations`: frases del rincón de calma.
- `goalDefaults`: meta inicial (solo se usa antes del primer guardado en el navegador).
- `galleryCaptions`: captions de las fotos, en orden.
- `closing`: mensaje final, firma y fecha.

Conservá las comillas, las comas y los corchetes. Si querés un cambio, también podés pasarme solamente `content.js` y pedirlo en lenguaje normal.

## Sumar o reemplazar fotos de Lima

Las fotos están en `img/lima/` y se llaman `1.jpg`, `2.jpg`, `3.jpg`, etc. La galería busca números consecutivos hasta encontrar el primero que falta.

- Para reemplazar fotos: cambiá los archivos manteniendo exactamente los mismos nombres.
- Para agregar: seguí la numeración sin saltear números, por ejemplo `11.jpg`, `12.jpg`.
- Para quitar: renumerá las restantes para que no quede un hueco.

Las imágenes se cargan de a una al recorrer el carrusel; las comprobaciones de archivos usan solicitudes livianas para no descargar toda la galería al abrir la página.

## Datos guardados

El calendario, la meta y el orden de los papelitos se guardan en el navegador de ese dispositivo. No se envían a ningún servidor. Si se borran los datos del navegador o se abre el sitio desde otro teléfono, esos datos empiezan de cero.
