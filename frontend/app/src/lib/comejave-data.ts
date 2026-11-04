export type Product = { id: string; name: string; desc: string; price: number };
export type Category = { id: string; name: string; items: Product[] };
export type Restaurant = {
  id: "ventolini" | "lafrute";
  name: string;
  tagline: string;
  accent: "accent" | "primary";
  categories: Category[];
};

export const restaurants: Restaurant[] = [
  {
    id: "ventolini",
    name: "Ventolini",
    tagline: "Pastas y pizzas",
    accent: "accent",
    categories: [
      {
        id: "pastas",
        name: "Pastas",
        items: [
          {
            id: "p1",
            name: "Bolognesa",
            desc: "Salsa de carne y tomate",
            price: 22000,
          },
          { id: "p2", name: "Alfredo", desc: "Crema, queso parmesano", price: 24000 },
          { id: "p3", name: "Pesto", desc: "Albahaca y piñones", price: 23000 },
        ],
      },
      {
        id: "pizzas",
        name: "Pizzas",
        items: [
          {
            id: "z1",
            name: "Margarita",
            desc: "Tomate, mozzarella, albahaca",
            price: 26000,
          },
          { id: "z2", name: "Pepperoni", desc: "Doble pepperoni", price: 29000 },
          { id: "z3", name: "Hawaiana", desc: "Jamón y piña", price: 27000 },
        ],
      },
    ],
  },
  {
    id: "lafrute",
    name: "La Frute",
    tagline: "Bowls y ensaladas",
    accent: "primary",
    categories: [
      {
        id: "bowls",
        name: "Bowls",
        items: [
          {
            id: "b1",
            name: "Bowl Açaí",
            desc: "Granola, banano, fresa",
            price: 18000,
          },
          {
            id: "b2",
            name: "Bowl Proteico",
            desc: "Pollo, quinua, aguacate",
            price: 21000,
          },
          { id: "b3", name: "Bowl Tropical", desc: "Mango, piña, coco", price: 17000 },
        ],
      },
      {
        id: "ensaladas",
        name: "Ensaladas",
        items: [
          {
            id: "e1",
            name: "César",
            desc: "Pollo, crutones, parmesano",
            price: 19000,
          },
          {
            id: "e2",
            name: "Mediterránea",
            desc: "Tomate cherry, feta, olivas",
            price: 20000,
          },
          {
            id: "e3",
            name: "Verde",
            desc: "Espinaca, pepino, vinagreta",
            price: 16000,
          },
        ],
      },
    ],
  },
];

export const formatCOP = (value: number) =>
  "$" + value.toLocaleString("es-CO", { maximumFractionDigits: 0 });

/** sku que usa la API para este producto: `<restaurante>:<id del menú>`. */
export const skuFor = (restaurantId: Restaurant["id"], itemId: string) =>
  `${restaurantId}:${itemId}`;

type MenuEntry = { restaurant: Restaurant; category: Category; item: Product };

const menuBySku = new Map<string, MenuEntry>(
  restaurants.flatMap((restaurant) =>
    restaurant.categories.flatMap((category) =>
      category.items.map((item): [string, MenuEntry] => [
        skuFor(restaurant.id, item.id),
        { restaurant, category, item },
      ]),
    ),
  ),
);

export const findMenuEntryBySku = (sku: string | null | undefined) =>
  sku ? menuBySku.get(sku) : undefined;

/** Los ids del menú (p1, z1, b1, e1...) son únicos entre restaurantes. */
export const findMenuEntryByItemId = (itemId: string) =>
  [...menuBySku.values()].find((entry) => entry.item.id === itemId);
