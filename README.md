# ✈️ Premium Live Flight Tracker Globe

Un rastreador de vuelos 3D de alta precisión con analítica en tiempo real y una interfaz premium basada en **Glassmorphism**. Este proyecto visualiza miles de aeronaves sobre un globo terráqueo interactivo, proporcionando métricas de vuelo, récords globales y un diseño optimizado para portafolio.

![Preview](public/favicon.png)

## 🌟 Características Principales

- **Globo 3D Interactivo**: Visualización fluida con `react-globe.gl` y `Three.js`.
- **Analítica en Tiempo Real**: Panel de KPIs que calcula fases de vuelo (ascenso, crucero, descenso) y promedios globales.
- **Resiliencia de Datos**: Sistema de caché persistente (`localStorage`) que permite ver el último estado si la API no está disponible.
- **Seguridad Premium**: Arquitectura **Serverless** (Netlify Functions) que oculta las API Keys y protege contra ataques de cadena de suministro (Axios 1.13.0).
- **Modos de Rendimiento**: Opción de carga "Light" (400 aviones) y "Heavy" (Población total) para adaptarse a cualquier hardware.

## 🚀 Tecnologías

- **Frontend**: React 19, Vite, TailwindCSS (for base) / Vanilla CSS (Custom).
- **Visualización**: Three.js, React-Globe.gl.
- **API**: OpenSky Network (ADS-B Data).
- **Backend**: Netlify Functions (Node.js).

## 🛠️ Instalación y Desarrollo Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Alejndromaldonado/LiveFlightTrackerGlobe.git
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env`:
   ```env
   VITE_OPENSKY_CLIENT_ID=tu_usuario
   VITE_OPENSKY_CLIENT_SECRET=tu_password
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # O mejor, para probar las funciones serverless:
   netlify dev
   ```

## 🌐 Despliegue en Netlify

Este proyecto está pre-configurado para desplegarse en Netlify con un solo clic. Las API Keys se gestionan de forma segura a través del dashboard de Netlify.

---
Hecho con ❤️ para mi Portafolio Personal.
