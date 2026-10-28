import { useState } from "react";
import { ChevronRight, LogOut, ReceiptText, ShoppingBag, Star } from "lucide-react";
import { Btn, ConfirmDialog, Notice, Screen } from "@/components/comejave/ui";
import { CartButton, Header, IconButton } from "@/components/comejave/layout";
import { CategoryArt, DishArt } from "@/components/comejave/DishArt";
import { restaurantStyle } from "@/components/comejave/theme";
import type { Order, OrderStatus, SessionUser } from "@/features/comejave/types";
import {
  findMenuEntryByItemId,
  formatCOP,
  restaurants,
  type Restaurant,
} from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

const firstName = (name: string) => {
  const first = name.trim().split(/[\s.]+/)[0] || name;
  return first.charAt(0).toUpperCase() + first.slice(1);
};

const dishCount = (r: Restaurant) => r.categories.reduce((n, c) => n + c.items.length, 0);
const fromPrice = (r: Restaurant) =>
  Math.min(...r.categories.flatMap((c) => c.items.map((i) => i.price)));

/** Plato que representa al restaurante en su bloque del inicio. */
const HERO_DISH: Record<Restaurant["id"], string> = { ventolini: "z1", lafrute: "b3" };

export function HomeScreen({
  user,
  cartCount,
  cartTotal,
  cartRestaurant,
  historyCount,
  onCart,
  onHistory,
  onPick,
  onSignOut,
}: {
  user: SessionUser;
  cartCount: number;
  cartTotal: number;
  /** Restaurante del carrito actual, si hay algo en él. */
  cartRestaurant?: Restaurant;
  historyCount: number;
  onCart: () => void;
  onHistory: () => void;
  onPick: (id: Restaurant["id"]) => void;
  onSignOut: () => void;
}) {
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <Screen className="flex flex-1 flex-col gap-7 px-5 pt-6 pb-10">
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-[17px] font-bold text-white"
        >
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-semibold text-foreground">{user.name}</p>
          {user.email && <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>}
        </div>
        <IconButton label="Cerrar sesión" onClick={() => setConfirmSignOut(true)}>
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
        </IconButton>
        <CartButton count={cartCount} onClick={onCart} />
      </header>

      <h1 className="font-display px-1 text-[40px] font-extrabold tracking-[-0.035em] text-foreground">
        ¿Qué comemos hoy, {firstName(user.name)}?
      </h1>

      {cartCount > 0 && cartRestaurant && (
        <button
          type="button"
          onClick={onCart}
          style={restaurantStyle(cartRestaurant.id)}
          className="pressable flex items-center gap-3 rounded-[22px] bg-card p-3 pr-4 text-left shadow-[0_1px_2px_rgba(14,30,54,0.06)] ring-1 ring-separator"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--r-soft)]">
            <ShoppingBag className="h-5 w-5 text-[var(--r)]" strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold text-foreground">
              Sigue con tu pedido
            </span>
            <span className="block truncate text-[14px] text-muted-foreground">
              {cartCount} {cartCount === 1 ? "plato" : "platos"} de {cartRestaurant.name},{" "}
              {formatCOP(cartTotal)}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      <div className="flex flex-col gap-4">
        {restaurants.map((r) => (
          <button
            type="button"
            key={r.id}
            onClick={() => onPick(r.id)}
            style={restaurantStyle(r.id)}
            className="pressable group relative isolate flex min-h-[188px] flex-col justify-between overflow-hidden rounded-[28px] bg-[var(--r)] p-6 text-left text-white shadow-[0_18px_40px_-22px_var(--r)]"
          >
            <span className="relative z-10">
              <span className="font-display block text-[34px] font-extrabold tracking-[-0.03em]">
                {r.name}
              </span>
              <span className="mt-1 block text-[16px] text-white/85">{r.tagline}</span>
            </span>
            <span className="relative z-10 inline-flex w-fit items-center gap-1 rounded-full bg-white/18 px-3 py-1.5 text-[14px] font-semibold backdrop-blur-md">
              {dishCount(r)} platos desde {formatCOP(fromPrice(r))}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <DishArt
              itemId={HERO_DISH[r.id]}
              className="absolute -right-10 -bottom-12 -z-0 h-48 w-48 rotate-[-14deg] drop-shadow-[0_16px_24px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:rotate-[-4deg]"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onHistory}
        className="pressable flex items-center gap-3 rounded-[22px] bg-card p-3 pr-4 text-left shadow-[0_1px_2px_rgba(14,30,54,0.06)] ring-1 ring-separator"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft">
          <ReceiptText className="h-5 w-5 text-primary" strokeWidth={2} />
        </span>
        <span className="flex-1">
          <span className="block text-[16px] font-semibold text-foreground">Mis pedidos</span>
          <span className="block text-[14px] text-muted-foreground">
            {historyCount
              ? `${historyCount} ${historyCount === 1 ? "pedido" : "pedidos"}`
              : "Aquí verás el estado de cada pedido"}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>

      <ConfirmDialog
        open={confirmSignOut}
        title="¿Cerrar sesión?"
        body={
          cartCount > 0
            ? "Se vaciará tu carrito. Tus pedidos enviados quedan guardados."
            : "Puedes volver a entrar con tu correo institucional cuando quieras."
        }
        confirmLabel="Cerrar sesión"
        onConfirm={() => {
          setConfirmSignOut(false);
          onSignOut();
        }}
        onCancel={() => setConfirmSignOut(false)}
      />
    </Screen>
  );
}

const STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
  PENDING: { text: "Pendiente de pago", className: "bg-accent-soft text-accent-foreground" },
  PAID: { text: "Pagado", className: "bg-frute-soft text-frute" },
  CANCELLED: { text: "Cancelado", className: "bg-muted text-muted-foreground" },
};

export function HistoryScreen({
  orders,
  loading,
  loadError,
  onBack,
  onBrowse,
  onCancel,
}: {
  orders: Order[];
  loading: boolean;
  loadError: string;
  onBack: () => void;
  onBrowse: () => void;
  /** Solo se pasa cuando los pedidos viven en la API (permite cancelar pendientes). */
  onCancel?: (orderId: string) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [toCancel, setToCancel] = useState<Order | null>(null);

  const cancel = async (orderId: string) => {
    if (!onCancel) return;
    setBusyId(orderId);
    setCancelError("");
    try {
      await onCancel(orderId);
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "No se pudo cancelar el pedido.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-10">
      <Header title="Mis pedidos" onBack={onBack} />
      {loadError && <Notice>{loadError}</Notice>}
      {cancelError && <Notice>{cancelError}</Notice>}
      {loading ? (
        <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando pedidos">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-36 animate-pulse rounded-[22px] bg-card" />
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div aria-hidden className="relative mb-2 h-28 w-40">
            <CategoryArt
              categoryId="pizzas"
              className="absolute left-0 top-2 h-24 w-24 -rotate-12"
            />
            <CategoryArt
              categoryId="bowls"
              className="absolute right-0 top-0 h-24 w-24 rotate-12"
            />
          </div>
          <p className="font-display text-[24px] font-bold text-foreground">
            Aún no tienes pedidos
          </p>
          <p className="text-[15px] text-muted-foreground">
            Cuando hagas el primero, aquí verás su estado.
          </p>
          <Btn variant="accent" onClick={onBrowse} className="mt-3">
            Hacer un pedido
          </Btn>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => {
            const entry = o.items[0] ? findMenuEntryByItemId(o.items[0].id) : undefined;
            const style = entry ? restaurantStyle(entry.restaurant.id) : undefined;
            return (
              <li
                key={o.id}
                style={style}
                className="overflow-hidden rounded-[22px] bg-card shadow-[0_1px_2px_rgba(14,30,54,0.06)] ring-1 ring-separator"
              >
                <div className="flex items-center gap-3 p-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--r-soft,var(--muted))] p-1.5">
                    {o.items[0] && <DishArt itemId={o.items[0].id} className="h-full w-full" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-semibold text-foreground">{o.restaurant}</p>
                    <p className="text-[14px] text-muted-foreground">
                      {o.date}, {o.method}
                    </p>
                  </div>
                  <p className="text-[17px] font-bold text-foreground tabular-nums">
                    {formatCOP(o.total)}
                  </p>
                </div>
                <p className="border-t border-separator px-4 py-3 text-[15px] text-foreground">
                  {o.items.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                </p>
                {(o.status || o.rating > 0) && (
                  <div className="flex items-center justify-between gap-3 border-t border-separator px-4 py-3">
                    {o.status ? (
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[13px] font-semibold",
                          STATUS_LABEL[o.status].className,
                        )}
                      >
                        {STATUS_LABEL[o.status].text}
                      </span>
                    ) : (
                      <span />
                    )}
                    {onCancel && o.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => setToCancel(o)}
                        disabled={busyId === o.id}
                        className="min-h-10 rounded-full px-3 text-[15px] font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                      >
                        {busyId === o.id ? "Cancelando…" : "Cancelar"}
                      </button>
                    ) : (
                      o.rating > 0 && (
                        <span
                          className="flex items-center gap-0.5"
                          aria-label={`Calificado con ${o.rating} de 5`}
                        >
                          {Array.from({ length: o.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-accent text-accent" aria-hidden />
                          ))}
                        </span>
                      )
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toCancel !== null}
        title="¿Cancelar este pedido?"
        body={
          toCancel
            ? `${toCancel.restaurant}, ${formatCOP(toCancel.total)}. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Sí, cancelar pedido"
        cancelLabel="No, mantenerlo"
        onConfirm={() => {
          const order = toCancel;
          setToCancel(null);
          if (order) void cancel(order.id);
        }}
        onCancel={() => setToCancel(null)}
      />
    </Screen>
  );
}
