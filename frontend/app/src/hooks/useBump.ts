import { useEffect, useRef, useState } from "react";

/**
 * Devuelve un contador que sube cada vez que `value` aumenta.
 * Se usa como `key` o para activar una animación corta de "rebote".
 */
export function useBump(value: number): number {
  const previous = useRef(value);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (value > previous.current) setBump((n) => n + 1);
    previous.current = value;
  }, [value]);
  return bump;
}
