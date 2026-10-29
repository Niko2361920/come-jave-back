# Frontend Come Jave

App móvil de Come Jave: React 19 con TanStack Start, Tailwind CSS 4 y Firebase Auth. La documentación completa del proyecto (backend, API y variables de entorno) está en el [README principal](../README.md).

## 1. Pantallas

- Login y crear cuenta (correo institucional o Google).
- Inicio con perfil, acceso a "Mis pedidos" y aviso de pedido sin terminar.
- Restaurante (Ventolini o La Frute) con portada a color, categorías en un control segmentado, selector de cantidad por plato y barra del carrito fija.
- Carrito editable con elección del método de pago.
- Pago con Nequi (copiar número y registrar comprobante).
- Confirmación con resumen del pedido.
- Pedido enviado con calificación.
- Mis pedidos, con estado y opción de cancelar los pendientes.

## 2. Estructura

```text
frontend/app/src/
├─ routes/index.tsx                 Orquesta las pantallas y el estado del pedido
├─ features/comejave/screens/       auth, home (inicio e historial), menu, checkout
├─ components/comejave/             ui.tsx (Btn, Field, Notice, QtyStepper, Toast,
│                                   ConfirmDialog, BottomBar), layout.tsx (Header,
│                                   IconButton, CartButton), DishArt.tsx (ilustraciones),
│                                   theme.ts (color por restaurante), Stars.tsx
├─ hooks/
│  ├─ useAuth.ts                    Sesión con Firebase o modo demo
│  ├─ useCart.ts                    Carrito persistido en sessionStorage
│  ├─ useOrders.ts                  Pedidos en la API o en localStorage (demo)
│  └─ useScreenHistory.ts           Pantallas sincronizadas con el botón atrás
└─ lib/
   ├─ cart.ts                       Lógica pura del carrito (con pruebas)
   ├─ api.ts, firebase.ts           Clientes de la API y de Firebase
   └─ comejave-data.ts              Menú (debe coincidir con el seed del backend)
```

## 3. Cómo correrlo

```bash
cd frontend/app
npm install
cp .env.example .env    # opcional: sin Firebase ni VITE_API_URL arranca en modo demo
npm run dev -- --host 0.0.0.0
```

Abre `http://localhost:8080/`. En modo demo cualquier usuario y contraseña sirven, y el historial se guarda en `localStorage`.

## 4. Scripts

| Script            | Qué hace                  |
| ----------------- | ------------------------- |
| `npm run dev`     | Servidor de desarrollo    |
| `npm run build`   | Compilación de producción |
| `npm run preview` | Sirve la compilación      |
| `npm run lint`    | ESLint                    |
| `npm run format`  | Prettier                  |
| `npm test`        | Pruebas con Vitest        |

## 5. Diseño

- **Pensada para celular:** en pantallas anchas se muestra centrada dentro de un marco de teléfono de 420 px.
- **Colores** (variables en `src/styles.css`): azul Javeriana `#0d2d5a` para acciones, dorado `#f2b81f` para destacar, rojo Ventolini `#c8331b`, verde La Frute `#167a43` y fondo agrupado `#f2f3f7`. Cada pantalla de un restaurante recibe su color con `restaurantStyle()` (variables `--r` y `--r-soft`).
- **Ilustraciones:** `DishArt` dibuja cada plato del menú en SVG. Si se agrega un plato nuevo, hay que sumarle una entrada en `SPECS` con su tipo (`pasta`, `pizza`, `bowl`, `salad`) y colores; si no la tiene, usa la de su categoría.
- **Tipografía:** Bricolage Grotesque (`@fontsource-variable/bricolage-grotesque`) en títulos con la clase `font-display`, y la fuente del sistema en el texto.
- **Interacción:** clase `pressable` para la respuesta al tocar, `material` para barras translúcidas, hojas inferiores para confirmar acciones destructivas.
- **Accesibilidad:** navegable con teclado y lector de pantalla, contraste AA, objetivos táctiles de 44 px y respeto a la preferencia de movimiento reducido.
