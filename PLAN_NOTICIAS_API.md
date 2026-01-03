# Plan de Implementación: Noticias via NewsAPI

Este documento detalla los pasos para integrar la sección de noticias dinámicas usando NewsAPI.

## 1. Definición de Tipos (`src/types/NewsApi.ts`)
Crearemos una interfaz TypeScript para asegurar el tipado correcto de la respuesta de la API.
- **Article**: Define la estructura de una noticia (título, autor, descripción, url, imagen, fecha).
- **NewsAPIResponse**: Define la respuesta completa de la API.

## 2. Servicio de Datos (`src/services/newsService.ts`)
Centralizaremos la lógica de conexión con la API aquí.
- Función `fetchBasketballNews()`:
  - Hará la petición GET a `https://newsapi.org/v2/everything`.
  - Parámetros: `q=basketball`, `sortBy=popularity`, `language=es` (o `en`, según preferencia, probaremos resultados), `pageSize=20`.
  - Usará la API Key proporcionada.
  - Transformará o validará los datos si es necesario.
  - Generará un `slug` (URL amigable) basado en el título para cada noticia.

## 3. Página de Listado (`src/pages/noticias2.astro`)
Esta página reemplazará el uso de colecciones locales por la llamada al servicio.
- **Lógica**:
  - Fetch de las noticias en tiempo de construcción (o request).
- **UI**:
  - Replicará exactamente el diseño de `noticias.astro`.
  - Grid de tarjetas con Imagen, Título, Fecha y Resumen.
  - Enlace apuntando a `/noticias-api/[slug]`.

## 4. Páginas de Detalle Dinámicas (`src/pages/noticias-api/[slug].astro`)
Generaremos páginas individuales para cada una de las 20 noticias recuperadas.
- **Rutas Dinámicas (`getStaticPaths`)**:
  - Llamará a `fetchBasketballNews()` para obtener la lista.
  - Generará una ruta por cada noticia usando el `slug`.
  - Pasará los datos de la noticia completa como `props` a la página.
- **UI**:
  - Replicará el diseño de `src/pages/noticias/[slug].astro`.
  - **Nota**: NewsAPI no devuelve el artículo completo, solo un fragmento. Mostraremos:
    - Encabezado (Título, Fecha, Intro).
    - Imagen principal y fondo difuminado.
    - Contenido disponible (fragmento).
    - **Botón "Leer artículo completo"**: Enlace externo a la fuente original (`url`).

## 5. Ejecución
1. Crear archivos de tipos y servicio.
2. Implementar página de listado `noticias2.astro`.
3. Implementar página dinámica de detalle.
4. Verificar navegación y estilos.

---
**Nota sobre API Key**: La key `000c8de9c86848278d35b4ed286592a9` será usada en el servicio.
