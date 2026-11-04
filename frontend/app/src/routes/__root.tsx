import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  type ErrorComponentProps,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { StatusPage, statusButton, statusButtonOutline } from "@/components/comejave/StatusPage";
import { reportLovableError } from "../lib/lovable-error-reporting";

const TITLE = "Come Jave · Pide en el campus Javeriana Cali";
const DESCRIPTION =
  "Pide en Ventolini y La Frute desde tu celular: elige categoría, agrega al carrito, paga en efectivo o Nequi y revisa tu historial de comidas.";
/** Dirección pública de la app (sin barra final); los enlaces de Open Graph deben ser absolutos. */
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/$/, "");

function NotFoundComponent() {
  return (
    <StatusPage
      dishId="z1"
      title="Esta página no existe"
      body="La dirección que abriste no está en Come Jave."
    >
      <Link to="/" className={statusButton}>
        Ir al inicio
      </Link>
    </StatusPage>
  );
}

function ErrorComponent({ error: caught, reset }: ErrorComponentProps) {
  const error = useMemo(
    () => (caught instanceof Error ? caught : new Error(String(caught))),
    [caught],
  );
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <StatusPage
      dishId="p1"
      title="Algo salió mal"
      body="Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio."
    >
      <button
        type="button"
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className={statusButton}
      >
        Intentar de nuevo
      </button>
      <a href="/" className={statusButtonOutline}>
        Ir al inicio
      </a>
    </StatusPage>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0d2d5a" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CO" },
      { property: "og:site_name", content: "Come Jave" },
      { property: "og:image", content: `${SITE_URL}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og.png` },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Come Jave" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
