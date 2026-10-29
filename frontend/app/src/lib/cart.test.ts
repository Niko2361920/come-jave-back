import { describe, expect, it } from "vitest";
import {
  EMPTY_CART,
  addItem,
  cartCount,
  cartTotal,
  conflicts,
  decrementItem,
  parseCart,
  removeItem,
} from "./cart";

const bolognesa = { id: "p1", name: "Bolognesa", price: 22000, emoji: "🍝" };
const pesto = { id: "p3", name: "Pesto", price: 23000, emoji: "🌿" };
const cesar = { id: "e1", name: "César", price: 19000, emoji: "🥗" };

describe("carrito", () => {
  it("agrega productos y suma cantidades del mismo producto", () => {
    let cart = addItem(EMPTY_CART, "ventolini", bolognesa);
    cart = addItem(cart, "ventolini", bolognesa);
    cart = addItem(cart, "ventolini", pesto);
    expect(cart.lines).toEqual([
      { ...bolognesa, qty: 2 },
      { ...pesto, qty: 1 },
    ]);
    expect(cartCount(cart)).toBe(3);
    expect(cartTotal(cart)).toBe(67000);
  });

  it("no guarda la cantidad que traiga el producto al agregarlo", () => {
    const cart = addItem(EMPTY_CART, "ventolini", { ...bolognesa, qty: 9 } as never);
    expect(cart.lines[0]?.qty).toBe(1);
  });

  it("detecta y reemplaza el carrito al agregar de otro restaurante", () => {
    const cart = addItem(EMPTY_CART, "ventolini", bolognesa);
    expect(conflicts(cart, "lafrute")).toBe(true);
    expect(conflicts(cart, "ventolini")).toBe(false);
    expect(conflicts(EMPTY_CART, "lafrute")).toBe(false);

    const replaced = addItem(cart, "lafrute", cesar);
    expect(replaced.restaurantId).toBe("lafrute");
    expect(replaced.lines).toEqual([{ ...cesar, qty: 1 }]);
  });

  it("resta unidades y vacía el carrito al quitar la última", () => {
    let cart = addItem(addItem(EMPTY_CART, "ventolini", bolognesa), "ventolini", bolognesa);
    cart = decrementItem(cart, "p1");
    expect(cart.lines[0]?.qty).toBe(1);
    expect(decrementItem(cart, "p1")).toEqual(EMPTY_CART);
  });

  it("elimina una línea completa", () => {
    const cart = addItem(addItem(EMPTY_CART, "ventolini", bolognesa), "ventolini", pesto);
    expect(removeItem(cart, "p1").lines).toEqual([{ ...pesto, qty: 1 }]);
    expect(removeItem(removeItem(cart, "p1"), "p3")).toEqual(EMPTY_CART);
  });

  it("ignora datos guardados inválidos", () => {
    expect(parseCart(null)).toEqual(EMPTY_CART);
    expect(parseCart("{no es json")).toEqual(EMPTY_CART);
    expect(parseCart(JSON.stringify({ restaurantId: "otro", lines: [] }))).toEqual(EMPTY_CART);
    expect(
      parseCart(JSON.stringify({ restaurantId: "ventolini", lines: [{ id: "p1", qty: -1 }] })),
    ).toEqual(EMPTY_CART);

    const saved = addItem(EMPTY_CART, "ventolini", bolognesa);
    expect(parseCart(JSON.stringify(saved))).toEqual(saved);
  });
});
