import { useState } from "react";
import { ChevronRight, History, LogOut, ShoppingBag, Star } from "lucide-react";
import { Btn, ConfirmDialog, Notice, Screen } from "@/components/comejave/ui";
import { CartButton, Header } from "@/components/comejave/layout";
import type { Order, OrderStatus, SessionUser } from "@/features/comejave/types";
import { formatCOP, restaurants, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

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
    <Screen className="flex flex-1 flex-col">
      <div className="rounded-b-[2rem] bg-primary px-7 pb-8 pt-8 text-primary-foreground">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{user.name}</p>
            {user.email && (
              <p className="truncate text-[12px] text-primary-foreground/70">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={() => setConfirmSignOut(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
          <CartButton count={cartCount} onDark onClick={onCart} />
        </div>
        <h1 className="mt-8 text-[2rem] font-bold leading-tight tracking-tight">
          ¿Qué comemos hoy, {firstName(user.name)}?
        </h1>
        <button
          type="button"
          onClick={onHistory}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3.5 text-left transition-colors hover:bg-primary-foreground/20"
        >
          <History className="h-5 w-5" strokeWidth={1.75} />
          <span className="flex-1 text-[15px] font-medium">Mis pedidos</span>
          {historyCount > 0 && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-bold text-accent-foreground">
              {historyCount}
            </span>
          )}
          <ChevronRight className="h-4 w-4 opacity-70" />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-7 py-8">
        {cartCount > 0 && cartRestaurant && (
          <button
            type="button"
            onClick={onCart}
            className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-accent bg-accent-soft/50 px-4 py-3.5 text-left transition-colors hover:bg-accent-soft"
          >
            <ShoppingBag className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
            <span className="flex-1 text-[14px] text-accent-foreground">
              <span className="block font-bold">Tienes un pedido sin terminar</span>
              {cartCount} {cartCount === 1 ? "plato" : "platos"} de {cartRestaurant.name},{" "}
              {formatCOP(cartTotal)}
            </span>
            <ChevronRight className="h-5 w-5 text-accent-foreground/70" />
          </button>
        )}
        <h2 className="text-[15px] font-bold text-primary">Restaurantes del campus</h2>
        {restaurants.map((r) => (
          <button
            type="button"
            key={r.id}
            onClick={() => onPick(r.id)}
            className={cn(
              "flex items-center gap-4 rounded-3xl p-5 text-left transition-colors",
              r.accent === "accent"
                ? "bg-accent-soft ring-1 ring-accent/50 hover:bg-accent/40"
                : "bg-primary-soft ring-1 ring-primary/15 hover:bg-primary-soft/60",
            )}
          >
            <span
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl",
                r.accent === "accent" ? "bg-accent" : "bg-primary",
              )}
            >
              {r.emoji}
            </span>
            <span className="flex-1">
              <span className="block text-lg font-bold text-primary">{r.name}</span>
              <span className="block text-[13px] text-muted-foreground">{r.tagline}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-primary/50" strokeWidth={2} />
          </button>
        ))}
      </div>

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
  PAID: { text: "Pagado", className: "bg-primary text-primary-foreground" },
  CANCELLED: { text: "Cancelado", className: "bg-secondary text-muted-foreground" },
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
    <Screen className="flex flex-1 flex-col gap-6 px-7 py-10">
      <Header title="Mis pedidos" onBack={onBack} />
      {loadError && <Notice>{loadError}</Notice>}
      {cancelError && <Notice>{cancelError}</Notice>}
      {loading ? (
        <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando pedidos">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-2xl bg-primary-soft" />
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="text-5xl" aria-hidden>
            🍽️
          </span>
          <p className="text-lg font-bold text-primary">Aún no tienes pedidos</p>
          <p className="text-[15px] text-muted-foreground">
            Cuando hagas el primero, aquí verás su estado.
          </p>
          <Btn variant="accent" onClick={onBrowse} className="mt-3">
            Hacer un pedido
          </Btn>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl bg-primary-soft p-5 ring-1 ring-primary/10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-xl">
                  {o.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-primary">{o.restaurant}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {o.date}, {o.method}
                  </p>
                </div>
                <p className="text-[15px] font-bold text-primary">{formatCOP(o.total)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items.map((l) => (
                  <span
                    key={l.id}
                    className="rounded-full bg-background px-3 py-1 text-[12px] text-foreground"
                  >
                    {l.emoji} {l.qty}× {l.name}
                  </span>
                ))}
              </div>
              {o.status && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[12px] font-bold",
                      STATUS_LABEL[o.status].className,
                    )}
                  >
                    {STATUS_LABEL[o.status].text}
                  </span>
                  {onCancel && o.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => setToCancel(o)}
                      disabled={busyId === o.id}
                      className="min-h-9 rounded-full border border-border bg-background px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      {busyId === o.id ? "Cancelando…" : "Cancelar pedido"}
                    </button>
                  )}
                </div>
              )}
              {o.rating > 0 && (
                <div
                  className="mt-3 flex items-center gap-1"
                  aria-label={`Calificado con ${o.rating} de 5`}
                >
                  {Array.from({ length: o.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" aria-hidden />
                  ))}
                </div>
              )}
            </li>
          ))}
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
