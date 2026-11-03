/**
 * Datos de la cuenta de Nequi que se muestran al pagar. Se pueden cambiar con
 * `VITE_NEQUI_NUMBER` y `VITE_NEQUI_ACCOUNT_NAME` (ver `.env.example`) sin tocar código.
 */
export const NEQUI_NUMBER = import.meta.env.VITE_NEQUI_NUMBER?.trim() || "318 452 9017";
export const NEQUI_ACCOUNT_NAME =
  import.meta.env.VITE_NEQUI_ACCOUNT_NAME?.trim() || "Come Jave, Javeriana Cali";
