import { useCallback, useEffect, useMemo, useState } from "react";
import type { Restaurant } from "@/lib/comejave-data";
import {
  EMPTY_CART,
  addItem,
  cartCount,
  cartTotal,
  conflicts,
  decrementItem,
  parseCart,
  removeItem,
  type CartItem,
  type CartState,
} from "@/lib/cart";

const CART_KEY = "comejave.cart";

/**
 * Carrito de un solo restaurante. Se guarda en sessionStorage para no perderlo
 * al recargar la página; se borra al cerrar la pestaña.
 */
export function useCart() {
  const [state, setState] = useState<CartState>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);

  // Se lee después del primer render para no romper la hidratación del SSR.
  useEffect(() => {
    try {
      setState(parseCart(sessionStorage.getItem(CART_KEY)));
    } catch {
      /* sin almacenamiento disponible */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (state.lines.length) sessionStorage.setItem(CART_KEY, JSON.stringify(state));
      else sessionStorage.removeItem(CART_KEY);
    } catch {
      /* sin almacenamiento disponible: el carrito vive solo en memoria */
    }
  }, [state, hydrated]);

  const add = useCallback(
    (fromRestaurant: Restaurant["id"], item: CartItem) =>
      setState((previous) => addItem(previous, fromRestaurant, item)),
    [],
  );
  const decrement = useCallback(
    (itemId: string) => setState((previous) => decrementItem(previous, itemId)),
    [],
  );
  const remove = useCallback(
    (itemId: string) => setState((previous) => removeItem(previous, itemId)),
    [],
  );
  const clear = useCallback(() => setState(EMPTY_CART), []);

  const conflictsWith = useCallback(
    (fromRestaurant: Restaurant["id"]) => conflicts(state, fromRestaurant),
    [state],
  );
  const qtyOf = useCallback(
    (itemId: string) => state.lines.find((line) => line.id === itemId)?.qty ?? 0,
    [state.lines],
  );

  const count = useMemo(() => cartCount(state), [state]);
  const total = useMemo(() => cartTotal(state), [state]);

  return {
    restaurantId: state.restaurantId,
    lines: state.lines,
    count,
    total,
    add,
    decrement,
    remove,
    clear,
    qtyOf,
    conflictsWith,
  };
}
