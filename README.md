# Sistema de Tabulación BP

Gestor de torneos de debate British Parliamentary (BP). Persistencia en Google Sheets, desplegado en Vercel.

## Requisitos

- Node.js 18+
- Google Cloud project con Sheets API habilitada
- Cuenta de servicio con permisos de edición en Google Sheets

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Sí | JSON de la cuenta de servicio de Google Cloud |
| `GOOGLE_SHEETS_ID` | No | ID de la hoja de cálculo existente. Si se omite, se crea una nueva automáticamente |
| `ADMIN_USER` | Sí | Usuario administrador para iniciar sesión |
| `ADMIN_PASS` | Sí | Contraseña del administrador |
| `SESSION_SECRET` | Sí | Secreto para firmar tokens JWT (usar string aleatorio de 32+ caracteres) |

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en el navegador. Serás redirigido a `/login` si no has iniciado sesión.

## Build y producción

```bash
npm run build
npm run start
```

## Inicialización de hojas

Una vez desplegado, ejecuta el endpoint de inicialización una sola vez para crear las 9 pestañas en Google Sheets:

```bash
curl -X POST "https://TU-DOMINIO.vercel.app/api/init?adminPass=TU_PASSWORD"
```

Este endpoint es idempotente — es seguro ejecutarlo varias veces.

## Autenticación

Sesión basada en JWT almacenado en cookie HttpOnly (`session-token`). El flujo:

1. Usuario ingresa credenciales en `/login`
2. `POST /api/auth/login` valida contra `ADMIN_USER`/`ADMIN_PASS` y emite cookie
3. Todas las rutas API y páginas protegidas validan la cookie server-side
4. `POST /api/auth/logout` limpia la cookie

El middleware de Next.js redirige a `/login` si no hay sesión válida.

## Endpoints API

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión (usuario, contraseña) |
| POST | `/api/auth/logout` | Cerrar sesión |

### Datos del torneo
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tournament` | Carga todos los datos del torneo |
| POST | `/api/init?adminPass=X` | Inicializar hojas de Google Sheets (una vez) |

### CRUD Entidades
| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/api/equipos` | Listar / crear equipos |
| GET/PUT/DELETE | `/api/equipos/:id` | Obtener / actualizar / eliminar equipo |
| GET/POST | `/api/instituciones` | Listar / crear instituciones |
| GET/PUT/DELETE | `/api/instituciones/:id` | Obtener / actualizar / eliminar institución |
| GET/POST | `/api/oradores` | Listar / crear oradores |
| GET/PUT/DELETE | `/api/oradores/:id` | Obtener / actualizar / eliminar orador |
| GET/POST | `/api/salas` | Listar / crear salas |
| GET/PUT/DELETE | `/api/salas/:id` | Obtener / actualizar / eliminar sala |
| GET/POST | `/api/rondas` | Listar / crear rondas |
| GET/PUT/DELETE | `/api/rondas/:id` | Obtener / actualizar / eliminar ronda |
| GET/POST | `/api/debates` | Listar / crear debates |
| GET/PUT/DELETE | `/api/debates/:id` | Obtener / actualizar / eliminar debate |
| GET/POST | `/api/resultados` | Listar / crear resultados |
| GET/PUT/DELETE | `/api/resultados/:id` | Obtener / actualizar / eliminar resultado |
| GET/POST | `/api/clasificacion` | Obtener / recalcular clasificaciones |

## Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno en el panel de Vercel (`ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_SHEETS_ID`)
3. Desplegar — Vercel detecta Next.js automáticamente
4. Ejecutar `POST /api/init?adminPass=TU_PASSWORD` para crear las hojas

## Estructura del proyecto

```
middleware.ts           # Protección de rutas (cookie session)
app/
  api/
    auth/login/         # POST login → cookie
    auth/logout/        # POST logout → clear cookie
    init/               # POST inicialización de hojas
    equipos/            # CRUD equipos
    instituciones/      # CRUD instituciones
    oradores/           # CRUD oradores
    salas/              # CRUD salas
    rondas/             # CRUD rondas
    debates/            # CRUD debates
    resultados/         # CRUD resultados
    clasificacion/      # GET/POST clasificaciones
    tournament/         # GET todos los datos
  components/           # Componentes compartidos (Sidebar)
  login/                # Página de inicio de sesión
  equipos/              # UI gestión de equipos
  instituciones/        # UI gestión de instituciones
  rondas/               # UI rondas y emparejamientos
  salas/                # UI gestión de salas
  pairings/             # UI emparejamientos
  resultados/           # UI entrada de puntajes
  ranking/              # UI clasificaciones
  dashboard/            # Resumen del torneo
  configuracion/        # Documentación
lib/
  auth.ts               # JWT sessions (create, validate, cookie helpers)
  sheetsService.ts      # Capa de abstracción sobre Google Sheets (read, append, update, batch, cache)
  sheetsInit.ts         # Inicialización idempotente de pestañas
  tournament.ts         # Lógica de negocio y sincronización
  googleSheets.ts       # Cliente de Google Sheets (bajo nivel)
  types.ts              # Interfaces del dominio
  apiUtils.ts           # Helpers HTTP (jsonResponse, errorResponse)
  withAuth.tsx          # HOC para páginas client-side protegidas
  utils.ts              # Utilidades generales
```
