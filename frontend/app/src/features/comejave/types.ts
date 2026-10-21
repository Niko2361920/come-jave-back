export type ScreenId =
  | "login"
  | "signup"
  | "home"
  | "restaurant"
  | "category"
  | "checkout"
  | "online"
  | "waiting"
  | "success"
  | "history";

export type CartLine = { id: string; name: string; price: number; qty: number; emoji: string };

export type PaymentMethod = "Efectivo" | "Nequi";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export type Order = {
  id: string;
  date: string;
  restaurant: string;
  emoji: string;
  items: CartLine[];
  total: number;
  method: PaymentMethod;
  rating: number;
  /** Solo viene cuando el pedido está guardado en la API. */
  status?: OrderStatus;
};

export type SessionUser = { name: string; email: string };
