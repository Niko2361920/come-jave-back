# Come Jave

App de pedidos para estudiantes de la Pontificia Universidad Javeriana Cali: menú fijo de restaurantes (Ventolini y La Frute), carrito, pago en efectivo o Nequi e historial. El repositorio tiene un backend en NestJS y un frontend móvil en React (TanStack Start + Vite).

## 1. Estructura

```text
├─ src/                    Backend NestJS
│  ├─ auth/                Guard de Firebase (token, dominio institucional, admin)
│  ├─ users/ products/ orders/
│  ├─ config/              Validación de variables de entorno
│  ├─ database/            data-source (CLI de TypeORM), seed del menú
│  ├─ migrations/          sqlite/ y postgres/
│  ├─ health/              GET /health
│  └─ app.setup.ts         ValidationPipe, CORS, helmet, Swagger (compartido con los e2e)
├─ test/                   Pruebas e2e
├─ postman/                Colección para probar la API
├─ data/                   Base SQLite local (no se versiona)
└─ frontend/app/           App móvil
   └─ src/
      ├─ routes/           index.tsx: orquesta las pantallas
      ├─ features/comejave/screens/   auth, home/historial, menú, checkout
      ├─ components/comejave/         Botones, campos, diálogo, aviso, selector de cantidad
      ├─ hooks/            useAuth, useCart, useOrders, useScreenHistory
      └─ lib/              api.ts (cliente de la API), firebase.ts, cart.ts, menú
```

## 2. Tecnologías

- **Backend:** Node.js, NestJS 12, TypeScript, TypeORM, SQLite (`better-sqlite3`) o PostgreSQL, Firebase Admin, Helmet, Throttler, Swagger.
- **Frontend:** React 19, TanStack Start/Router/Query, Tailwind CSS 4, Firebase Auth, Lucide.
- **Pruebas:** Vitest (backend y frontend).

## 3. Requisitos

- Node.js 24 (ver `.nvmrc`) y npm.
- Para el frontend, `bun` es opcional (el proyecto está conectado a Lovable y mantiene `bun.lock`); `npm` también funciona.

## 4. Instalación

```bash
git clone https://github.com/Niko2361920/come-jave-back.git
cd come-jave-back
npm install                      # backend
cd frontend/app && npm install   # frontend
```

## 5. Variables de entorno

### Backend (`.env` en la raíz)

Mínimo para desarrollo local con SQLite y sin Firebase:

```env
PORT=3000
DB_TYPE=sqlite
DB_DATABASE=data/app.sqlite
AUTH_ENABLED=false
```

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto de la API |
| `DB_TYPE` | `sqlite` | `sqlite` o `postgres` |
| `DB_DATABASE` | `data/app.sqlite` | Archivo SQLite o nombre de la base en Postgres |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | – | Obligatorias con `DB_TYPE=postgres` |
| `DB_SYNCHRONIZE` | `true` en dev, `false` en producción | Con `true` TypeORM crea el esquema solo; **prohibido en producción**, ahí se usan migraciones |
| `DB_LOGGING` | `false` | Log de queries |
| `AUTH_ENABLED` | `true` | Con `false` no se verifica Firebase (solo desarrollo, **prohibido en producción**) |
| `FIREBASE_PROJECT_ID` | – | Obligatoria si `AUTH_ENABLED=true` |
| `ALLOWED_EMAIL_DOMAIN` | `javerianacali.edu.co` | Dominio permitido para usuarios |
| `ADMIN_EMAILS` | vacío | Correos admin separados por coma (pueden ser de otro dominio) |
| `CORS_ORIGINS` | `http://localhost:8080,http://localhost:5173` | Orígenes permitidos, separados por coma |
| `SWAGGER_ENABLED` | `true` en dev, `false` en producción | Documentación en `/docs` |

Con `AUTH_ENABLED=false` la API acepta cualquier petición como admin; se puede simular otro usuario con los headers `x-dev-email` y `x-dev-admin: false`.

### Frontend (`frontend/app/.env`, ver `.env.example`)

- `VITE_FIREBASE_*`: configuración de Firebase Auth.
- `VITE_API_URL`: URL del backend, sin barra final (ej. `http://localhost:3000`).

El frontend tiene dos modos:

- **Con `VITE_API_URL` y Firebase configurados:** sesión real (solo correos `@javerianacali.edu.co` verificados), menú enlazado a los productos de la API por `sku`, pedidos guardados en la base de datos y cancelables mientras estén pendientes.
- **Sin alguno de los dos:** modo demo local; el historial y la sesión se guardan en `localStorage`.

## 6. Arrancar el backend

```bash
npm run migration:run   # crea el esquema (si DB_SYNCHRONIZE=false)
npm run seed            # carga el menú (idempotente: crea o actualiza por sku)
npm run start:dev       # http://localhost:3000
```

Con `DB_SYNCHRONIZE=true` (default en desarrollo) las migraciones no hacen falta. Comprobación rápida: `GET http://localhost:3000/health`. Swagger: `http://localhost:3000/docs`.

Producción:

```bash
npm run build
npm run start:prod      # exige AUTH_ENABLED=true y DB_SYNCHRONIZE=false
```

Generar una migración tras cambiar una entidad: `npm run migration:generate -- src/migrations/<motor>/NombreCambio`.

> SQLite escribe en un archivo local: en plataformas con disco efímero (como Vercel) los datos se pierden. Para desplegar usa PostgreSQL.

## 7. Arrancar el frontend

```bash
cd frontend/app
npm run dev -- --host 0.0.0.0   # http://localhost:8080
```

## 8. Scripts

**Backend:** `start`, `start:dev`, `build`, `start:prod`, `lint`, `format`, `test` (unitarias), `test:e2e`, `test:cov`, `seed`, `migration:run|generate|revert`.

**Frontend:** `dev`, `build`, `preview`, `lint`, `test`.

## 9. API

Autenticación: `Authorization: Bearer <ID token de Firebase>`. Rutas públicas: `GET /health`, `GET /products`, `GET /products/:id`. Las marcadas **Admin** requieren un correo en `ADMIN_EMAILS`.

| Recurso | Endpoints |
| --- | --- |
| Usuarios | `POST /users`, `GET /users/me`, `GET /users` (Admin), `GET/PUT/DELETE /users/:id` |
| Productos | `GET /products` (filtros: `name`, `minPrice`, `maxPrice`, `minStock`, `maxStock`), `GET /products/:id`; `POST`, `PUT`, `DELETE` (Admin) |
| Pedidos | `POST /orders`, `GET /orders/me`, `GET /orders/:id`, `PUT /orders/:id/cancel`; `GET /orders`, `PUT /orders/:id`, `DELETE /orders/:id` (Admin) |

Detalles de comportamiento:

- Los DTOs se validan globalmente: campos desconocidos devuelven 400.
- El dueño de un pedido sale siempre del token, no del body.
- Crear un pedido descuenta el stock de forma atómica; cancelarlo (solo si está pendiente) lo devuelve.
- Pagar con Nequi exige `paymentReference` (6 a 20 dígitos).
- 100 peticiones por minuto por IP.

## 10. Flujo de la app

Login → Inicio → Restaurante → Categoría → Carrito → Método de pago → (Nequi: transferencia y comprobante) → Confirmar pedido → Pedido enviado → Mis pedidos.

### Experiencia de usuario

- **Carrito editable:** cada plato tiene un selector − / + tanto en el menú como en el carrito; con la última unidad el botón cambia a quitar. Un aviso breve confirma cada producto agregado.
- **Un restaurante por pedido:** si el carrito tiene platos de un restaurante y se agrega uno de otro, la app pregunta antes de vaciarlo.
- **El carrito no se pierde al recargar:** se guarda en `sessionStorage` y se borra al cerrar la pestaña o al enviar el pedido.
- **Botón atrás del navegador y del celular:** cada pantalla queda en el historial (`useScreenHistory`), así que "atrás" regresa a la pantalla anterior en vez de salir de la app. Después de enviar un pedido no se puede volver a la confirmación.
- **Categorías en pestañas:** se cambia entre Pastas/Pizzas o Bowls/Ensaladas sin volver atrás, y la barra del carrito con el total queda fija abajo.
- **Pago claro:** primero se elige el método (efectivo o Nequi) y luego se continúa. En Nequi el número se copia con un toque, el campo del comprobante solo acepta dígitos y explica el error en línea.
- **Confirmación con resumen:** antes de enviar se ven los platos, el método de pago, el comprobante y el total.
- **Acciones con confirmación:** cancelar un pedido y cerrar sesión piden confirmación en un diálogo.
- **Pantallas vacías con salida:** carrito e historial vacíos ofrecen un botón para ir a pedir.
- **Accesibilidad:** foco visible con teclado, etiquetas ARIA en controles de solo ícono, errores anunciados con `role="alert"`, respeto a `prefers-reduced-motion`, objetivos táctiles de al menos 44 px, campos con texto de 16 px (sin zoom automático en iOS) y documento en `es-CO`.

## 11. Menú

**Ventolini 🍕:** Bolognesa $22.000, Alfredo $24.000, Pesto $23.000, Margarita $26.000, Pepperoni $29.000, Hawaiana $27.000.

**La Frute 🥗:** Bowl Açaí $18.000, Bowl Proteico $21.000, Bowl Tropical $17.000, César $19.000, Mediterránea $20.000, Verde $16.000.

El menú vive en `frontend/app/src/lib/comejave-data.ts` y en `src/database/menu.seed.ts`; deben mantenerse iguales (mismos `sku` y precios).

## 12. Pruebas

Backend (desde la raíz):

```bash
npm test          # unitarias (guard de Firebase, validación de entorno)
npm run test:e2e  # API completa con SQLite en memoria
```

Frontend (desde `frontend/app`):

```bash
npm test          # utilidades de auth y lógica del carrito (lib/cart.ts)
npm run lint
```

Para correr los e2e contra PostgreSQL: `E2E_DB=postgres` más las variables `DB_*`.

## 13. Autor

Nicolás Cuastumal, Ingeniería de Sistemas, Pontificia Universidad Javeriana Cali.

## 14. Licencia

UNLICENSED.
