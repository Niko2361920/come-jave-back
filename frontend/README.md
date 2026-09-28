# Frontend Come Jave

Esta carpeta contiene la interfaz móvil de la aplicación Come Jave.

## 1. Qué incluye

- Login
- Crear cuenta
- Menú principal
- Selector de restaurante
- Categorías de productos
- Carrito
- Pago en efectivo y Nequi
- Pago en espera
- Pago exitoso
- Historial con localStorage

## 2. Estructura

```text
frontend/
└─ app/
   ├─ src/
   ├─ package.json
   ├─ vite.config.ts
   └─ ...
```

## 3. Cómo correrlo

```bash
cd frontend/app
npm install
npm run dev -- --host 0.0.0.0
```

Abre:

```text
http://localhost:8080/
```

## 4. Cómo compilar

```bash
npm run build
```

## 5. Observaciones

La app está pensada para verse como una experiencia móvil centrada en un celular de 420px de ancho y con fondo suave alrededor.
