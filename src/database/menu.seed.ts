export interface SeedProduct {
  /** `<restaurante>:<id del menú del frontend>`; une el menú del front con la API. */
  sku: string;
  name: string;
  description: string;
  price: number;
}

// Debe coincidir con frontend/app/src/lib/comejave-data.ts (mismos sku y precios).
export const menuSeed: SeedProduct[] = [
  // Ventolini · Pastas
  {
    sku: 'ventolini:p1',
    name: 'Ventolini - Bolognesa',
    description: 'Salsa de carne y tomate',
    price: 22000,
  },
  {
    sku: 'ventolini:p2',
    name: 'Ventolini - Alfredo',
    description: 'Crema, queso parmesano',
    price: 24000,
  },
  {
    sku: 'ventolini:p3',
    name: 'Ventolini - Pesto',
    description: 'Albahaca y piñones',
    price: 23000,
  },
  // Ventolini · Pizzas
  {
    sku: 'ventolini:z1',
    name: 'Ventolini - Margarita',
    description: 'Tomate, mozzarella, albahaca',
    price: 26000,
  },
  {
    sku: 'ventolini:z2',
    name: 'Ventolini - Pepperoni',
    description: 'Doble pepperoni',
    price: 29000,
  },
  {
    sku: 'ventolini:z3',
    name: 'Ventolini - Hawaiana',
    description: 'Jamón y piña',
    price: 27000,
  },
  // La Frute · Bowls
  {
    sku: 'lafrute:b1',
    name: 'La Frute - Bowl Açaí',
    description: 'Granola, banano, fresa',
    price: 18000,
  },
  {
    sku: 'lafrute:b2',
    name: 'La Frute - Bowl Proteico',
    description: 'Pollo, quinua, aguacate',
    price: 21000,
  },
  {
    sku: 'lafrute:b3',
    name: 'La Frute - Bowl Tropical',
    description: 'Mango, piña, coco',
    price: 17000,
  },
  // La Frute · Ensaladas
  {
    sku: 'lafrute:e1',
    name: 'La Frute - César',
    description: 'Pollo, crutones, parmesano',
    price: 19000,
  },
  {
    sku: 'lafrute:e2',
    name: 'La Frute - Mediterránea',
    description: 'Tomate cherry, feta, olivas',
    price: 20000,
  },
  {
    sku: 'lafrute:e3',
    name: 'La Frute - Verde',
    description: 'Espinaca, pepino, vinagreta',
    price: 16000,
  },
];
