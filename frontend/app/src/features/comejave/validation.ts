/** La API exige entre 6 y 20 dígitos para el comprobante de Nequi. */
export const isValidReference = (value: string) => /^\d{6,20}$/.test(value.trim());
