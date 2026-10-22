import type { ValueTransformer } from 'typeorm';

/**
 * Postgres devuelve las columnas decimal como string ("22000.00"); este
 * transformer las entrega siempre como number para que la API sea igual en
 * SQLite y en Postgres.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | number | null) =>
    value === null || value === undefined ? value : Number(value),
};
