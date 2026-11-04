/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend NestJS, sin barra final. Ej: https://api.comejave.com */
  readonly VITE_API_URL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  /** Dirección pública de la app, sin barra final (para la imagen al compartir el enlace). */
  readonly VITE_SITE_URL?: string;
  /** Número de Nequi que recibe las transferencias. Ej: 300 000 0000 */
  readonly VITE_NEQUI_NUMBER?: string;
  /** Nombre que se muestra bajo el número de Nequi. */
  readonly VITE_NEQUI_ACCOUNT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
