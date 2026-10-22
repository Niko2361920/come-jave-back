import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  apiConfigured,
  cancelOrder,
  createOrder,
  ensureProfile,
  fetchMyOrders,
  fetchProducts,
  type ApiOrder,
} from "@/lib/api";
import { findMenuEntryBySku, skuFor, type Restaurant } from "@/lib/comejave-data";
import { firebaseEnabled } from "@/lib/firebase";
import type { CartLine, Order, PaymentMethod, SessionUser } from "@/features/comejave/types";

/**
 * Con backend (VITE_API_URL) y Firebase configurados los pedidos viven en la API.
 * Sin alguno de los dos, la app funciona en modo demo guardando todo en localStorage.
 */
export const remoteOrders = apiConfigured && firebaseEnabled;

const HISTORY_KEY = "comejave.history";
const RATINGS_KEY = "comejave.ratings";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento disponible: se ignora */
  }
}

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function fromApi(order: ApiOrder, ratings: Record<string, number>): Order {
  const lines = order.items.map((item) => ({
    item,
    entry: findMenuEntryBySku(item.product?.sku),
  }));
  const restaurant = lines.find((line) => line.entry)?.entry?.restaurant;

  return {
    id: order.id,
    date: formatDate(order.createdAt),
    restaurant: restaurant?.name ?? "Pedido",
    emoji: restaurant?.emoji ?? "🍽️",
    items: lines.map(({ item, entry }) => ({
      id: entry?.item.id ?? item.productId,
      name: entry?.item.name ?? item.product?.name ?? "Producto",
      price: Number(item.unitPrice),
      qty: item.quantity,
      emoji: entry?.item.emoji ?? "🍽️",
    })),
    total: Number(order.total),
    method: order.paymentMethod === "NEQUI" ? "Nequi" : "Efectivo",
    rating: ratings[order.id] ?? 0,
    status: order.status,
  };
}

export type PlaceOrderInput = {
  restaurant: Restaurant;
  lines: CartLine[];
  method: PaymentMethod;
  /** Número de comprobante Nequi (solo se usa cuando el método es Nequi). */
  reference: string;
};

export function useOrders(user: SessionUser | null) {
  const queryClient = useQueryClient();
  const [localHistory, setLocalHistory] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    setLocalHistory(readJson<Order[]>(HISTORY_KEY, []));
    setRatings(readJson<Record<string, number>>(RATINGS_KEY, {}));
  }, []);

  // Al cerrar sesión no deben quedar pedidos de la cuenta anterior en caché.
  useEffect(() => {
    if (!user && remoteOrders) queryClient.removeQueries({ queryKey: ["orders"] });
  }, [user, queryClient]);

  const ordersQuery = useQuery({
    queryKey: ["orders", "me", user?.email ?? ""],
    queryFn: fetchMyOrders,
    enabled: remoteOrders && Boolean(user),
  });

  const history = useMemo<Order[]>(() => {
    if (remoteOrders) return (ordersQuery.data ?? []).map((order) => fromApi(order, ratings));
    return localHistory.map((order) => ({ ...order, rating: ratings[order.id] ?? order.rating }));
  }, [ordersQuery.data, localHistory, ratings]);

  const placeOrder = useCallback(
    async ({ restaurant, lines, method, reference }: PlaceOrderInput): Promise<string> => {
      if (!remoteOrders) {
        const order: Order = {
          id: `${Date.now()}`,
          date: formatDate(new Date()),
          restaurant: restaurant.name,
          emoji: restaurant.emoji,
          items: lines,
          total: lines.reduce((sum, line) => sum + line.price * line.qty, 0),
          method,
          rating: 0,
        };
        setLocalHistory((previous) => {
          const next = [order, ...previous];
          writeJson(HISTORY_KEY, next);
          return next;
        });
        return order.id;
      }

      if (!user) throw new ApiError("Inicia sesión para continuar.", 401);

      // El menú del front se enlaza con los productos de la API por sku.
      const products = await queryClient.fetchQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
        staleTime: 60_000,
      });
      const bySku = new Map(products.flatMap((p) => (p.sku ? [[p.sku, p] as const] : [])));

      const items = lines.map((line) => {
        const product = bySku.get(skuFor(restaurant.id, line.id));
        if (!product) {
          throw new ApiError(`"${line.name}" no está disponible por ahora.`, 404);
        }
        return { productId: product.id, quantity: line.qty };
      });

      await ensureProfile(user.name, user.email);
      const created = await createOrder({
        items,
        paymentMethod: method === "Nequi" ? "NEQUI" : "CASH",
        ...(method === "Nequi" && reference ? { paymentReference: reference } : {}),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
      return created.id;
    },
    [queryClient, user],
  );

  /** Cancela un pedido pendiente (la API devuelve el stock). Solo modo remoto. */
  const cancel = useCallback(
    async (orderId: string) => {
      await cancelOrder(orderId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
    [queryClient],
  );

  const rate = useCallback((orderId: string, value: number) => {
    setRatings((previous) => {
      const next = { ...previous, [orderId]: value };
      writeJson(RATINGS_KEY, next);
      return next;
    });
  }, []);

  const loadError =
    ordersQuery.error instanceof Error
      ? ordersQuery.error.message
      : ordersQuery.isError
        ? "No pudimos cargar tu historial."
        : "";

  return {
    remote: remoteOrders,
    history,
    loading: remoteOrders && ordersQuery.isPending && Boolean(user),
    loadError,
    placeOrder,
    cancel,
    rate,
  };
}
