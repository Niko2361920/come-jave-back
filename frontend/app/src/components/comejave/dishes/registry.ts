import type { ReactNode } from "react";
import { BowlAcai, BowlProteico, BowlTropical } from "./bowl";
import type { DishProps } from "./parts";
import { Alfredo, Bolognesa, Pesto } from "./pasta";
import { Hawaiana, Margarita, Pepperoni } from "./pizza";
import { Cesar, Mediterranea, Verde } from "./salad";

/** Ilustración de cada plato, por su id del menú. */
export const ART: Record<string, (props: DishProps) => ReactNode> = {
  // Ventolini: pastas
  p1: Bolognesa,
  p2: Alfredo,
  p3: Pesto,
  // Ventolini: pizzas
  z1: Margarita,
  z2: Pepperoni,
  z3: Hawaiana,
  // La Frute: bowls
  b1: BowlAcai,
  b2: BowlProteico,
  b3: BowlTropical,
  // La Frute: ensaladas
  e1: Cesar,
  e2: Mediterranea,
  e3: Verde,
};

/** Ids de platos que tienen ilustración (las pruebas comprueban que cubren todo el menú). */
export const DISH_ART_IDS = Object.keys(ART);

/** Plato que representa a cada categoría. */
export const CATEGORY_DISH: Record<string, string> = {
  pastas: "p1",
  pizzas: "z2",
  bowls: "b1",
  ensaladas: "e2",
};
