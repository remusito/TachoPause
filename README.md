# TachoPause Optimizer

TachoPause Optimizer es una aplicación web progresiva (PWA) diseñada para ayudar a los conductores de camiones a optimizar sus tiempos de conducción y descanso, aprovechando la "regla del minuto" y otras herramientas útiles para el día a día en la carretera.

 <!-- Reemplaza esto con una captura de pantalla de tu app -->

## ✨ Características Principales

- **Temporizador de Conducción (Semáforo)**: Un sistema visual e intuitivo con alertas sonoras que gestiona los ciclos de conducción y pausa para maximizar la eficiencia.
- **Velocímetro GPS**: Muestra la velocidad actual, velocidad máxima, velocidad media, distancia recorrida y tiempo transcurrido, todo ello utilizando el GPS del dispositivo.
- **Calculadora de Ruta**: Estima la distancia y el tiempo de viaje para múltiples tramos, optimizado para una velocidad media de camión. *(Función Premium)*
- **Buscador de Paradas**: Encuentra áreas de servicio, gasolineras y restaurantes a lo largo de tu ruta. *(Función Premium)*
- **Directorio Telefónico**: Acceso rápido a una lista de contactos importantes de la empresa. *(Función Premium)*
- **Historial y Estadísticas**: Registra y visualiza tus actividades de conducción y pausas, con gráficos semanales y resúmenes mensuales.
- **Sistema de Logros**: Desbloquea recompensas por alcanzar hitos dentro de la aplicación (usarla a ciertas horas, alcanzar velocidades, etc.).
- **Autenticación de Usuarios**: Soporte para inicio de sesión con Google y con correo electrónico/contraseña a través de Firebase.
- **Tema Claro/Oscuro**: Adaptable a las preferencias del usuario.
- **Diseño Responsivo y PWA**: Funciona como una aplicación nativa en dispositivos móviles y es totalmente funcional sin conexión.

## 🚀 Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (con App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [Shadcn/ui](https://ui.shadcn.com/)
- **Backend y Autenticación**: [Firebase](https://firebase.google.com/) (Authentication)
- **Funcionalidades AI**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Mapas y Rutas**: [Google Maps Platform APIs](https://developers.google.com/maps)

## 🛠️ Cómo Empezar

Sigue estos pasos para poner en marcha el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/en/) (versión 18 o superior)
- `npm`, `yarn` o `pnpm`

### 1. Clona el Repositorio

```bash
git clone https://github.com/tu-usuario/tachopause-optimizer.git
cd tachopause-optimizer
```

### 2. Instala las Dependencias

```bash
npm install
```

### 3. Configura las Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave de la API de Google Maps:

```.env.local
# Es necesario tener habilitadas las APIs: Directions API, Places API
GOOGLE_MAPS_API_KEY="TU_API_KEY_DE_GOOGLE_MAPS"
```

### 4. Configuración de Firebase

La aplicación utiliza Firebase para la autenticación de usuarios.

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  Dentro de tu proyecto, ve a la sección **Authentication** y habilita los proveedores de **Google** y **Correo electrónico/Contraseña**.
3.  Ve a la configuración de tu proyecto (Project Settings) y en la sección "Tus apps", crea una nueva aplicación web.
4.  Copia el objeto de configuración de Firebase (`firebaseConfig`) y pégalo en el archivo `src/lib/firebase.ts`.

### 5. Ejecuta la Aplicación

```bash
npm run dev
```

Abre [http://localhost:9005](http://localhost:9005) en tu navegador para ver la aplicación en funcionamiento.

---

Hecho con ❤️ para los héroes de la carretera.
