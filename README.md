# Margen · Sistema de Gestión de Tareas

Margen es una aplicación web para organizar actividades de estudio, trabajo o uso personal. Cada tarea tiene un título, una descripción, una categoría y una prioridad. La interfaz está escrita en TypeScript vanilla y HTML5, con CSS propio. Vite inicia el servidor de desarrollo y genera la versión de producción.

## Instalación y ejecución

Necesitás Node.js 22.12 o posterior, npm y un navegador moderno. Para clonar el repositorio y registrar cambios también necesitás Git.


```bash
npm ci
```
Corre la instalacion de los paquete necesarios para la ejecucion del programa y requerimiento 

```bash
npm run dev
```
Corre el programa en el puerto `http://localhost:5173` donde se proda visualizar el contenido y correra nuestro servidor local


## Características

- Creación y edición de tareas con validación de los cuatro campos.
- Categorías personalizadas y tres prioridades disponibles (alta, media y baja).
- Casilla para cambiar una tarea de pendiente a completada y viceversa.
- Eliminación con un diálogo que identifica la tarea y permite cancelar.
- Lista con búsqueda por título que admite palabras parciales e ignora mayúsculas y tildes.
- Filtros combinables por estado y prioridad.
- Resumen del progreso general y contador de resultados visibles.
- Guardado automático en `localStorage` y actualización de la lista al modificar tareas en otra pestaña del mismo sitio.
- Diseño adaptable a teléfono, tablet y escritorio, navegación por teclado y avisos al guardar.

Los datos se guardan en el navegador con la clave `margen.tareas.v1`. Al cerrar y volver a abrir la misma dirección en el mismo perfil, la aplicación recupera la lista. Cambiar el puerto o el navegador abre otro espacio de almacenamiento. Borrar los datos del sitio elimina las tareas de ese perfil.

## Organización del código

| Ruta | Responsabilidad |
| --- | --- |
| `src/domain/task.ts` | Define las tareas, valida sus campos y aplica los filtros. |
| `src/application/task-service.ts` | Implementa las operaciones sobre tareas y define el contrato de almacenamiento. |
| `src/infrastructure/local-task-repository.ts` | Lee, valida y guarda los registros del navegador. |
| `src/ui/task-row.ts` | Construye una fila accesible para cada tarea. |
| `src/main.ts` | Conecta los formularios, la lista y los filtros con el servicio. |
| `src/style.css` | Contiene el diseño responsive y los estados visuales. |

## Prueba rápida

En  [evidencia_de_pruebas.pdf](evidencia_de_pruebas.pdf) se encuentran las pruebas de su funcionamiento completo 

## Compilación de producción

```bash
npm run build
npm run preview
```

El primer comando comprueba los tipos de TypeScript y genera los archivos estáticos en `dist/`. El segundo sirve esa versión en la dirección que indica Vite.
