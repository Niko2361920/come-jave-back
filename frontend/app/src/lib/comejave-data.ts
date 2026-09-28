export type Product = { id: string; name: string; desc: string; price: number; emoji: string };
export type Category = { id: string; name: string; emoji: string; items: Product[] };
export type Restaurant = {
  id: "ventolini" | "lafrute";
  name: string;
  tagline: string;
  accent: "accent" | "primary";
  emoji: string;
  categories: Category[];
};

export const restaurants: Restaurant[] = [
  {
    id: "ventolini",
    name: "Ventolini",
    tagline: "Pastas y pizzas",
    emoji: "🍕",
    accent: "accent",
    categories: [
      {
        id: "pastas",
        emoji: "🍝",
        name: "Pastas",
        items: [
          { id: "p1", name: "Bolognesa", desc: "Salsa de carne y tomate", price: 22000, emoji: "🍝" },
          { id: "p2", name: "Alfredo", desc: "Crema, queso parmesano", price: 24000, emoji: "🍜" },
          { id: "p3", name: "Pesto", desc: "Albahaca y piñones", price: 23000, emoji: "🌿" },
        ],
      },
      {
        id: "pizzas",
        emoji: "🍕",
        name: "Pizzas",
        items: [
          { id: "z1", name: "Margarita", desc: "Tomate, mozzarella, albahaca", price: 26000, emoji: "🍕" },
          { id: "z2", name: "Pepperoni", desc: "Doble pepperoni", price: 29000, emoji: "🍕" },
          { id: "z3", name: "Hawaiana", desc: "Jamón y piña", price: 27000, emoji: "🍍" },
        ],
      },
    ],
  },
  {
    id: "lafrute",
    name: "La Frute",
    tagline: "Bowls y ensaladas",
    emoji: "🥗",
    accent: "primary",
    categories: [
      {
        id: "bowls",
        emoji: "🥣",
        name: "Bowls",
        items: [
          { id: "b1", name: "Bowl Açaí", desc: "Granola, banano, fresa", price: 18000, emoji: "🫐" },
          { id: "b2", name: "Bowl Proteico", desc: "Pollo, quinua, aguacate", price: 21000, emoji: "🥑" },
          { id: "b3", name: "Bowl Tropical", desc: "Mango, piña, coco", price: 17000, emoji: "🥭" },
        ],
      },
      {
        id: "ensaladas",
        emoji: "🥗",
        name: "Ensaladas",
        items: [
          { id: "e1", name: "César", desc: "Pollo, crutones, parmesano", price: 19000, emoji: "🥗" },
          { id: "e2", name: "Mediterránea", desc: "Tomate cherry, feta, olivas", price: 20000, emoji: "🫒" },
          { id: "e3", name: "Verde", desc: "Espinaca, pepino, vinagreta", price: 16000, emoji: "🥬" },
        ],
      },
    ],
  },
];

export const formatCOP = (value: number) =>
  "$" + value.toLocaleString("es-CO", { maximumFractionDigits: 0 });