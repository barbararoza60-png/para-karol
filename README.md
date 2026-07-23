# Para Karol

Un regalo de cumpleaños mobile-first y 100% estático. Incluye cartas para distintos momentos, frasco de notas, respiración 4-7-8, misiones breves para compartir a distancia y galería de Lima. No usa backend, cuentas, analytics ni servicios pagos.

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
- `openWhenLetters`: títulos y textos de las cartas “Abrí cuando…”.
- `jarNotes`: papelitos del frasco.
- `affirmations`: frases del rincón de calma.
- `togetherMissions`: misiones de “Dos minutos juntas” y el texto listo para compartir.
- `galleryCaptions`: captions de las fotos, en orden.
- `closing`: mensaje final, firma y fecha.

Conservá las comillas, las comas y los corchetes. Si querés un cambio, también podés pasarme solamente `content.js` y pedirlo en lenguaje normal.

## Sumar o reemplazar fotos de Lima

Las fotos están en `img/lima/` y se llaman `1.jpg`, `2.jpg`, `3.jpg`, etc. La galería busca números consecutivos hasta encontrar el primero que falta.

- Para reemplazar fotos: cambiá los archivos manteniendo exactamente los mismos nombres.
- Para agregar: seguí la numeración sin saltear números, por ejemplo `11.jpg`, `12.jpg`.
- Para quitar: renumerá las restantes para que no quede un hueco.

Las imágenes se cargan de a una al recorrer el carrusel; las comprobaciones de archivos usan solicitudes livianas para no descargar toda la galería al abrir la página.

## Privacidad y datos guardados

El orden de los papelitos y la misión del día se guardan en el navegador de ese dispositivo. No se envían a ningún servidor. Si se borran los datos del navegador o se abre el sitio desde otro teléfono, empiezan de cero.

La conversación de WhatsApp usada para entender el tono no forma parte de este proyecto, no se publica y no se sube a GitHub.
