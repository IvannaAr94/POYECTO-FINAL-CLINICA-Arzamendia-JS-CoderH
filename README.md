# ProyectoFinalArzamendia

Proyecto final de JavaScript basado en un **simulador interactivo de turnos médicos** para **Clínica Central IMA**.

## ¿Qué permite hacer?

- registrarse como paciente
- iniciar y cerrar sesión
- cargar especialidades desde un archivo JSON
- reservar turnos
- buscar y filtrar turnos
- cancelar turnos
- guardar datos con `localStorage`
- usar librerías externas: `SweetAlert2` y `Toastify`

## Estructura del proyecto

- `index.html` → estructura principal del sitio
- `css/styles.css` → estilos completos del proyecto
- `js/script.js` → lógica del simulador
- `data/especialidades.json` → datos remotos de especialidades médicas
- `img/` → imágenes del proyecto

## Importante

Para que la carga del JSON funcione correctamente, conviene abrir el proyecto con **Live Server** o publicarlo en **GitHub Pages**.

De todos modos, el proyecto también tiene una **carga de respaldo** en JavaScript para que las especialidades no queden vacías si el JSON falla.
