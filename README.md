# Para Karol

Un regalo de cumpleaños mobile-first y 100% estático. Incluye calendario de turnos, frasco de notas, respiración 4-7-8, recordatorios, meta compartida y galería de Lima. No usa backend, cuentas, analytics ni servicios pagos: el calendario y la meta viven solamente en `localStorage` del navegador.

## Publicarlo hoy en GitHub Pages

1. En GitHub, creá un repositorio **público** llamado `para-karol`. No agregues README ni otros archivos desde GitHub, porque ya están incluidos acá.
2. Abrí PowerShell dentro de esta carpeta y ejecutá:

```powershell
git init
git add .
git commit -m "Regalo para Karol"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/para-karol.git
git push -u origin main
```

3. En el repositorio de GitHub, entrá a **Settings → Pages**. En **Source**, elegí **GitHub Actions**.
4. Abrí la pestaña **Actions** y esperá a que “Publicar Para Karol” aparezca en verde. Cada cambio futuro que subas a `main` vuelve a publicar el sitio automáticamente.
5. La dirección final será:

```text
https://TU-USUARIO.github.io/para-karol/
```

Todos los enlaces y las imágenes usan rutas relativas, así que funcionan correctamente dentro de `/para-karol/` sin ninguna configuración adicional.

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
