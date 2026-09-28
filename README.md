# Come Jave

Este repositorio contiene la base del proyecto Come Jave: un sistema backend con NestJS y una interfaz móvil tipo app creada en React + Vite. La idea principal es una app de pedidos para estudiantes de la Pontificia Universidad Javeriana Cali, con menú fijo de restaurantes, carrito, historial y flujo de pago.

## 1. Estructura del repositorio

```text
come-jave-backend/
├─ README.md
├─ package.json
├─ src/
│  ├─ app.module.ts
│  ├─ main.ts
│  ├─ config/
│  ├─ users/
│  ├─ products/
│  ├─ orders/
│  └─ ...
├─ data/
├─ dist/
├─ test/
├─ postman/
├─ frontend/
│  └─ app/
│     ├─ package.json
│     ├─ src/
│     ├─ public/
│     └─ vite.config.ts
└─ node_modules/
```

### Qué hace cada parte

- Backend: lógica de la API, entidades, validaciones, configuración, CRUD y conexión a base de datos.
- Frontend: interfaz móvil con pantallas del flujo de compra y selección de menú.
- data/: archivos locales de la base de datos SQLite.
- dist/: salida compilada del backend y del frontend.
- postman/: colección para probar endpoints.

---

## 2. Tecnologías usadas

### Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- SQLite por defecto
- PostgreSQL compatible

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React

---

## 3. Requisitos previos

Antes de ejecutar el proyecto necesitas:

- Node.js 18 o superior
- npm
- Git
- Visual Studio Code (opcional, pero recomendado)

---

## 4. Instalación paso a paso

### 4.1 Clonar el repositorio

```bash
git clone https://github.com/Niko2361920/come-jave-back.git
cd come-jave-back
```

### 4.2 Instalar dependencias del backend

```bash
npm install
```

### 4.3 Instalar dependencias del frontend

```bash
cd frontend/app
npm install
```

> Si la carpeta ya tiene dependencias instaladas, no es necesario volverlas a instalar.

---

## 5. Configuración de variables de entorno

En la raíz del backend crea un archivo `.env`.

### Opción A: SQLite (por defecto)

```env
PORT=3000
DB_TYPE=sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_DATABASE=data/app.sqlite
```

### Opción B: PostgreSQL

```env
PORT=3000
DB_TYPE=postgres
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=come_jave
```

> El backend ya está preparado para aceptar una base de datos SQLite local, lo que facilita correr el proyecto sin PostgreSQL instalado.

---

## 6. Cómo arrancar el backend

Desde la raíz del proyecto:

```bash
npm run start:dev
```

Este comando levanta la API en modo desarrollo con recarga automática.

### Producción

```bash
npm run build
npm run start:prod
```

### Verificar que el backend está activo

Abre el navegador o usa una petición HTTP:

```bash
http://localhost:3000
```

Una ruta raíz puede devolver 404 si no hay una ruta inicial; eso es normal. Lo importante es que el servidor responda.

---

## 7. Cómo arrancar el frontend

Desde la carpeta del frontend:

```bash
cd frontend/app
npm run dev -- --host 0.0.0.0
```

Luego abre en el navegador:

```bash
http://localhost:8080/
```

---

## 8. Scripts útiles

### Backend

```bash
npm run start
npm run start:dev
npm run start:debug
npm run build
npm run test
npm run test:e2e
npm run lint
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 9. API principal del backend

La app backend tiene módulos para usuarios, productos y pedidos.

### Usuarios

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

### Productos

- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

Ejemplo con filtros:

```http
GET /products?name=whey&minPrice=10&maxPrice=200&minStock=1
```

### Pedidos

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /orders/user/:userId`
- `PUT /orders/:id`
- `PUT /orders/:id/cancel`
- `DELETE /orders/:id`

> El CRUD base quedó disponible, pero para la app móvil de Come Jave lo más importante es el flujo de pedido y el menú estático, no crear productos desde la app.

---

## 10. Flujo de la app Come Jave

La interfaz está pensada como una app móvil centrada en celular, con 9 pantallas:

1. Login
2. Crear cuenta
3. Menú principal
4. Menú del restaurante
5. Categoría de productos
6. Pago
7. Datos de pago online (Nequi)
8. Pago en espera
9. Pago exitoso

La lógica de historial y carrito se maneja con `localStorage` para que sobreviva recargas.

---

## 11. Menú y restaurantes incluidos

### Ventolini 🍕

- Pastas
  - Bolognesa $22.000
  - Alfredo $24.000
  - Pesto $23.000
- Pizzas
  - Margarita $26.000
  - Pepperoni $29.000
  - Hawaiana $27.000

### La Frute 🥗

- Bowls
  - Açaí $18.000
  - Proteico $21.000
  - Tropical $17.000
- Ensaladas
  - César $19.000
  - Mediterránea $20.000
  - Verde $16.000

---

## 12. Recomendación de uso real

Para esta app en particular, lo más correcto es:

- Mantener el CRUD base del backend como respaldo académico y técnico.
- Usar el frontend con menú fijo y datos programados.
- Evitar crear productos desde la UI si los productos son siempre los mismos.
- Usar el carrito y el historial del cliente en frontend con `localStorage`.

Esto hace que la solución se vea más realista para una app universitaria y evita crear un sistema de inventario complejo cuando la app solo necesita vender comida ya definida.

---

## 13. Buenas prácticas para seguir trabajando

1. No mezclar lógica de negocio del frontend con el backend si el flujo es local.
2. Mantener los nombres de carpetas claros.
3. Verificar que el backend siga corriendo antes de probar el frontend.
4. Usar Postman o la colección de la carpeta `postman/` para probar la API.
5. Cuando cambies la estructura, verifica con `npm run build`.

---

## 14. Licencia

Este proyecto se mantiene bajo licencia UNLICENSED.

---

## 15. Siguientes pasos recomendados

- Dejar una versión final del backend más limpia y enfocada en Come Jave.
- Ajustar la interfaz móvil para una vista tipo celular de 420px.
- Conectar la app con un backend más real si se quiere persistencia en base de datos.
- Preparar una versión demo para presentación del proyecto.
