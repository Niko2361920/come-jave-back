# Come Jave Backend

Backend desarrollado con NestJS para gestionar usuarios, productos y pedidos de una aplicación de comercio o ventas.

## Tecnologías

- Node.js
- NestJS
- TypeScript
- TypeORM
- SQLite por defecto
- PostgreSQL compatible

## Características

- CRUD de usuarios
- CRUD de productos
- CRUD de pedidos
- Filtros para búsquedas de productos y pedidos
- Validación de variables de entorno
- Soporte para SQLite y PostgreSQL

## Requisitos

- Node.js 18 o superior
- npm
- Git

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto.

### SQLite (por defecto)

```env
PORT=3000
DB_TYPE=sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=false
DB_DATABASE=data/app.sqlite
```

### PostgreSQL

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

## Ejecutar la aplicación

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run build
npm run start:prod
```

## Scripts disponibles

```bash
npm run start
npm run start:dev
npm run start:debug
npm run build
npm run test
npm run test:e2e
npm run lint
```

## Endpoints principales

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

Ejemplo de filtros:

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

## Estructura del proyecto

```text
src/
  app.module.ts
  main.ts
  config/
  users/
  products/
  orders/
  data/
```

## Contribución

1. Haz fork del proyecto.
2. Crea una rama para tu funcionalidad: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios.
4. Haz commit: `git commit -m "Agrega nueva funcionalidad"`
5. Haz push: `git push origin feature/nueva-funcionalidad`
6. Abre un Pull Request.

## Licencia

Este proyecto está bajo la licencia UNLICENSED.
