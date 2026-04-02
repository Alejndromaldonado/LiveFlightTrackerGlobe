# ✈️ Live Flight Tracker Globe (Enterprise Edition v2.7)

¡Bienvenido al radar de vuelos global más avanzado y estético del ecosistema! 🌎🚀🛰️

Este proyecto ha evolucionado de un simple seguidor de vuelos a una plataforma de visualización masiva de datos en tiempo real, capaz de renderizar hasta **4,000 aeronaves simultáneamente** sin comprometer la fluidez.

## 🚀 Arquitectura "Radar Lake" (Data-Driven)

A diferencia de los trackers convencionales que dependen de llamadas directas a APIs frágiles, este sistema utiliza un modelo de **Data Lake Moderno**:

1.  **AWS Ingestion Worker**: Un script de Python en el ala de Amazon (AWS) realiza peticiones paralelas a la red OpenSky y realiza un `UPSERT` masivo en nuestra base de datos cada 2 minutos.
2.  **Supabase Backend**: Repositorio central de datos en PostgreSQL que actúa como caché persistente y motor de analíticas.
3.  **Vercel Proxy**: Una capa de seguridad en Edge que anonimiza las peticiones y evita bloqueos de IP, asegurando una conexión 24/7.
4.  **Parallel Fetching**: El frontend utiliza un sistema de peticiones paralelas para superar el límite de 1,000 registros por consulta, habilitando el modo **Ultra Heavy (4,000 pts)**.

## ✨ Características Premium

-   🌍 **Visualización 3D Majestuosa**: Globo interactivo con texturas nocturnas, atmósfera dinámica y fronteras políticas (GeoJSON).
-   🛰️ **Ultra-Heavy Mode**: Capacidad de visualización de 4,000 aeronaves con rotación de cabecera y escala de altitud real.
-   🔥 **3D Heatmap**: Mapa de densidad térmica basado en contenedores hexagonales (Hex-Binned) para analizar el tráfico mundial.
-   ☁️ **Glass Cloud Tooltips**: Tooltips con silueta de nube y efecto de cristal (Glassmorphism) para monitorizar KPIs de flota.
-   🛠️ **Centro de Mando Dual**:
    *   **Panel Izquierdo**: Búsqueda local y filtros de categoría (Estable, Ascenso).
    *   **Panel Derecho**: Sistemas de radar, analítica de records mundiales e inspección de aeronaves.
-   🗺️ **Map Modal**: Integración de OpenStreetMap en un popup con efecto de desenfoque de fondo (*backdrop-filter: blur*).

## 🛠️ Tech Stack

-   **Frontend**: React.js, React-Globe.gl (Three.js Engine).
-   **Estilos**: Vanilla CSS con Diseño Atómico y Variables Globales.
-   **Iconografía**: Lucide React.
-   **Backend / DB**: Supabase (PostgreSQL) con funciones RPC para analítica de flota.
-   **Ingesta**: Python (Worker AWS).
-   **Infraestructura**: Vercel (Edge Runtime).

## 📊 Métricas de Tiempo Real

El sistema realiza cálculos en el servidor para mostrar:
-   **Índice de Crucero**: Porcentaje de flota en vuelo estable.
-   **Velocidad Media Mundial**: Promedio de velocidad de toda la flota activa.
-   **Récords Globales**: Vuelo más alto, más rápido y origen más común detectado en tiempo real.

---

### 🕒 ¿Cómo empezar?

1.  **Clona el repositorio**: `git clone ...`
2.  **Instala dependencias**: `npm install`
3.  **Configura variables**: Añade tu `anon_key` de Supabase en `opensky.js`.
4.  **Despega**: `npm run dev`

---
*Diseñado para visualización cinematográfica y análisis técnico de datos aeroespaciales.* 🌍✈️🛰️
