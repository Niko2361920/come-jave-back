import { useCallback, useEffect, useRef, useState } from "react";
import type { ScreenId } from "@/features/comejave/types";

type Entry = { screen: ScreenId; depth: number };

const isEntry = (value: unknown): value is Entry =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Entry).screen === "string" &&
  typeof (value as Entry).depth === "number";

/**
 * Pantallas sincronizadas con el historial del navegador, para que el botón
 * "atrás" del navegador o del celular regrese a la pantalla anterior en vez de
 * salir de la app.
 */
export function useScreenHistory(initial: ScreenId) {
  const [screen, setScreen] = useState<ScreenId>(initial);
  const depth = useRef(0);

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, screen: initial, depth: 0 }, "");
    const onPop = (event: PopStateEvent) => {
      if (!isEntry(event.state)) return;
      depth.current = event.state.depth;
      setScreen(event.state.screen);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // Solo al montar: `initial` es la pantalla de arranque.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Avanza a otra pantalla (crea una entrada en el historial). */
  const go = useCallback((next: ScreenId) => {
    depth.current += 1;
    window.history.pushState({ ...window.history.state, screen: next, depth: depth.current }, "");
    setScreen(next);
  }, []);

  /** Reemplaza la pantalla actual sin crear entrada (redirecciones). */
  const replace = useCallback((next: ScreenId) => {
    window.history.replaceState(
      { ...window.history.state, screen: next, depth: depth.current },
      "",
    );
    setScreen(next);
  }, []);

  /** Vuelve atrás; si no hay historial propio, va a `fallback`. */
  const back = useCallback(
    (fallback: ScreenId) => {
      if (depth.current > 0) window.history.back();
      else replace(fallback);
    },
    [replace],
  );

  return { screen, go, replace, back };
}
