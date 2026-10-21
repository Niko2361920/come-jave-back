import { useCallback, useMemo, useState } from "react";
import type { Restaurant } from "@/lib/comejave-data";
import type { CartLine } from "@/features/comejave/types";

type CartItem = Omit<CartLine, "qty">;

/** Carrito de un solo restaurante: al agregar de otro, se reemplaza el contenido. */
export function useCart() {
  const [restaurantId, setRestaurantId] = useState<Restaurant["id"] | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback(
    (fromRestaurant: Restaurant["id"], item: CartItem) => {
      const sameRestaurant = restaurantId === null || restaurantId === fromRestaurant;
      setRestaurantId(fromRestaurant);
      setLines((previous) => {
        const base = sameRestaurant ? previous : [];
        const found = base.find((line) => line.id === item.id);
        return found
          ? base.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line))
          : [...base, { ...item, qty: 1 }];
      });
    },
    [restaurantId],
  );

  const clear = useCallback(() => {
    setLines([]);
    setRestaurantId(null);
  }, []);

  const count = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.qty, 0), [lines]);

  return { restaurantId, lines, count, total, add, clear };
}
