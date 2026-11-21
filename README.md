# IMSS | Gestión de Citas Médicas — Prototipo educativo

## Contenido
- `index.html`: estructura de la aplicación.
- `styles.css`: diseño adaptable y estilos.
- `script.js`: validaciones, inicio de sesión demostrativo, registro, consulta, cancelación, estadísticas y filtros.

## Flujo de acceso
Al abrir `index.html`, se muestra primero la pantalla de inicio de sesión. Usa datos ficticios (NSS de 11 dígitos, CURP de 18 caracteres y contraseña de al menos 4 caracteres). Tras validar el formato, se muestra la aplicación principal. Al cerrar sesión vuelve al login.

## Cómo ejecutarlo
1. Extrae el ZIP.
2. Abre la carpeta en Visual Studio Code.
3. Abre `index.html` con Live Server (recomendado) o en un navegador.
4. Usa datos ficticios para probar: NSS de 11 dígitos, CURP de 18 caracteres alfanuméricos y contraseña de demostración de al menos 4 caracteres.
5. Registra una cita y revisa el panel de “Mis citas”.

## Publicación
Puedes subir los archivos a GitHub y activar GitHub Pages desde Settings > Pages > Deploy from a branch > main > /(root).

## Aviso
Proyecto académico de Front-End. No está conectado al IMSS ni a servicios reales. No introduzcas datos personales o médicos reales. Los datos se almacenan localmente en el navegador mediante LocalStorage.

## Especialidades interactivas
Selecciona una tarjeta de especialidad para ver descripción, servicios de ejemplo y médico/horario ficticio en paneles separados. La selección también se refleja en el formulario de citas.
