import { getFirebaseAuth } from "@/lib/firebase";
import type { OrderStatus } from "@/features/comejave/types";

const rawUrl = import.meta.env.VITE_API_URL;
const API_URL = rawUrl?.trim().replace(/\/+$/, "");

/** true cuando el frontend sabe a qué backend hablarle (VITE_API_URL). */
export const apiConfigured = Boolean(API_URL);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiProduct = {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
};

export type ApiOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: ApiProduct;
};

export type ApiOrder = {
  id: string;
  status: OrderStatus;
  total: number;
  paymentMethod: "CASH" | "NEQUI";
  paymentReference: string | null;
  createdAt: string;
  items: ApiOrderItem[];
};

export type ApiUser = { id: string; email: string; name: string };

async function getIdToken(): Promise<string | null> {
  const auth = await getFirebaseAuth();
  return (await auth?.currentUser?.getIdToken()) ?? null;
}

function errorMessage(body: unknown, fallback: string): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" && message ? message : fallback;
}

async function request<T>(
  path: string,
  { method = "GET", body, auth = true }: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  if (!API_URL) throw new ApiError("La API no está configurada (VITE_API_URL).", 0);

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await getIdToken();
    if (!token) throw new ApiError("Inicia sesión para continuar.", 401);
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError("No pudimos conectar con el servidor. Revisa tu internet.", 0);
  }

  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(errorMessage(data, "Algo salió mal. Inténtalo de nuevo."), response.status);
  }
  return data as T;
}

export const fetchProducts = () => request<ApiProduct[]>("/products", { auth: false });

export const fetchMyOrders = () => request<ApiOrder[]>("/orders/me");

export const cancelOrder = (id: string) =>
  request<ApiOrder>(`/orders/${id}/cancel`, { method: "PUT" });

export type CreateOrderInput = {
  items: { productId: string; quantity: number }[];
  paymentMethod: "CASH" | "NEQUI";
  paymentReference?: string;
};

/** Crea el perfil del usuario en la API si todavía no existe (primer pedido). */
export async function ensureProfile(name: string, email: string): Promise<ApiUser> {
  try {
    return await request<ApiUser>("/users/me");
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;
    return request<ApiUser>("/users", { method: "POST", body: { email, name } });
  }
}

export const createOrder = (input: CreateOrderInput) =>
  request<ApiOrder>("/orders", { method: "POST", body: input });
