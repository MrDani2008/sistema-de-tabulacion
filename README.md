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
| `API_KEY` | No | Clave para proteger las rutas API. Si se omite, la autenticación se desactiva (solo desarrollo) |
| `NEXT_PUBLIC_API_KEY` | No | Misma clave API, expuesta al cliente para las llamadas fetch desde el navegador |

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en el navegador.

## Build y producción

```bash
npm run build
npm run start
```

## Autenticación de API

Todas las rutas API requieren la cabecera `x-api-key` cuando la variable `API_KEY` está configurada.

Ejemplo con curl:

```bash
curl -H "x-api-key: TU_CLAVE" http://localhost:3000/api/equipos
```

Si `API_KEY` no está definida, las rutas aceptan peticiones sin autenticación.

## Endpoints API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/tournament` | Carga todos los datos del torneo |
| GET/POST | `/api/equipos` | Listar / crear equipos |
| GET/PUT/DELETE | `/api/equipos/:id` | Obtener / actualizar / eliminar equipo |
| GET/POST | `/api/instituciones` | Listar / crear instituciones |
| GET/PUT/DELETE | `/api/instituciones/:id` | Obtener / actualizar / eliminar institución |
| GET/POST | `/api/salas` | Listar / crear salas |
| GET/PUT/DELETE | `/api/salas/:id` | Obtener / actualizar / eliminar sala |
| GET/POST | `/api/rondas` | Listar / crear rondas |
| GET/PUT/DELETE | `/api/rondas/:id` | Obtener / actualizar / eliminar ronda |
| GET/POST | `/api/debates` | Listar / crear debates |
| GET/PUT/DELETE | `/api/debates/:id` | Obtener / actualizar / eliminar debate |
| GET/POST | `/api/resultados` | Listar / crear resultados |
| GET/PUT/DELETE | `/api/resultados/:id` | Obtener / actualizar / eliminar resultado |

## Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno en el panel de Vercel
3. Desplegar — Vercel detecta Next.js automáticamente

```bash
vercel deploy
```

## Estructura del proyecto

```
app/
  api/          # Rutas API (equipos, instituciones, salas, rondas, debates, resultados, tournament)
  components/   # Componentes compartidos (Sidebar)
  equipos/      # CRUD de equipos
  instituciones/# CRUD de instituciones
  salas/        # CRUD de salas
  rondas/       # Creación de rondas y emparejamientos
  pairings/     # Visualización de emparejamientos
  resultados/   # Entrada de puntajes
  ranking/      # Clasificaciones
  dashboard/    # Resumen del torneo
  configuracion/# Documentación de configuración
lib/
  types.ts        # Interfaces del dominio
  tournament.ts   # Lógica de negocio y sincronización con Sheets
  googleSheets.ts # Cliente de Google Sheets (capa de persistencia)
  apiUtils.ts     # Helpers HTTP (auth, respuestas JSON)
  utils.ts        # Utilidades generales
```
