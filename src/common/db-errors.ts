/** true si el error de la base de datos es una violación de restricción UNIQUE. */
export function isUniqueViolation(error: unknown): boolean {
  const { code, message } = error as { code?: string; message?: string };
  return (
    code === '23505' || // postgres
    code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    /UNIQUE constraint failed/i.test(message ?? '')
  );
}
