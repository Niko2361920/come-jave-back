import type { Restaurant } from "@/lib/comejave-data";
import type { CartLine } from "@/features/comejave/types";

export type CartItem = Omit<CartLine, "qty">;
export type CartState = { restaurantId: Restaurant["id"] | null; lines: CartLine[] };

export const EMPTY_CART: CartState = { restaurantId: null, lines: [] };

/** Agrega una unidad. Si el producto es de otro restaurante, el carrito empieza de cero. */
export function addItem(
  cart: CartState,
  fromRestaurant: Restaurant["id"],
  item: CartItem,
): CartState {
  const base = cart.restaurantId === fromRestaurant ? cart.lines : [];
  const found = base.some((line) => line.id === item.id);
  const { id, name, price, emoji } = item;
  return {
    restaurantId: fromRestaurant,
    lines: found
      ? base.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line))
      : [...base, { id, name, price, emoji, qty: 1 }],
  };
}

/** Quita una unidad; con la última, la línea desaparece. */
export function decrementItem(cart: CartState, itemId: string): CartState {
  const lines = cart.lines
    .map((line) => (line.id === itemId ? { ...line, qty: line.qty - 1 } : line))
    .filter((line) => line.qty > 0);
  return lines.length ? { ...cart, lines } : EMPTY_CART;
}

export function removeItem(cart: CartState, itemId: string): CartState {
  const lines = cart.lines.filter((line) => line.id !== itemId);
  return lines.length ? { ...cart, lines } : EMPTY_CART;
}

/** true si agregar desde este restaurante vaciaría el carrito actual. */
export const conflicts = (cart: CartState, fromRestaurant: Restaurant["id"]) =>
  cart.lines.length > 0 && cart.restaurantId !== null && cart.restaurantId !== fromRestaurant;

export const cartCount = (cart: CartState) => cart.lines.reduce((sum, line) => sum + line.qty, 0);

export const cartTotal = (cart: CartState) =>
  cart.lines.reduce((sum, line) => sum + line.price * line.qty, 0);

/** Valida lo que venga de sessionStorage antes de usarlo. */
export function parseCart(raw: string | null): CartState {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const valid =
      Array.isArray(parsed.lines) &&
      parsed.lines.every(
        (line) =>
          typeof line?.id === "string" &&
          typeof line.price === "number" &&
          Number.isInteger(line.qty) &&
          line.qty > 0,
      ) &&
      (parsed.restaurantId === "ventolini" || parsed.restaurantId === "lafrute");
    return valid ? (parsed as CartState) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}
