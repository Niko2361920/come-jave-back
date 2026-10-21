import { useState } from "react";
import { ChevronRight, History, Star } from "lucide-react";
import { Btn, Screen } from "@/components/comejave/ui";
import { CartButton, Header } from "@/components/comejave/layout";
import type { Order, OrderStatus, SessionUser } from "@/features/comejave/types";
import { formatCOP, restaurants, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

export function HomeScreen({
  user,
  cartCount,
  historyCount,
  onCart,
  onHistory,
  onPick,
  onSignOut,
}: {
  user: SessionUser;
  cartCount: number;
  historyCount: number;
  onCart: () => void;
  onHistory: () => void;
  onPick: (id: Restaurant["id"]) => void;
  onSignOut: () => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col">
      <div className="rounded-b-[2rem] bg-primary px-7 pb-9 pt-10 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-primary-foreground/70">Hola, {user.name} 👋</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">¿Dónde comemos?</h1>
          </div>
          <CartButton count={cartCount} onDark onClick={onCart} />
        </div>
        <button
          type="button"
          onClick={onHistory}
          className="mt-7 flex w-full items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3.5 text-left transition-colors hover:bg-primary-foreground/20"
        >
          <History className="h-5 w-5" strokeWidth={1.75} />
          <span className="flex-1 text-[15px] font-medium">Historial de comidas</span>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-bold text-accent-foreground">
            {historyCount}
          </span>
        </button>

        <div className="mt-7 rounded-3xl bg-primary-soft p-4 ring-1 ring-primary/10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Perfil del usuario
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-primary">{user.name}</p>
              <p className="truncate text-[12px] text-muted-foreground">
                {user.email || "Sin correo principal"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-7 py-8">
        {restaurants.map((r) => (
          <button
            type="button"
            key={r.id}
            onClick={() => onPick(r.id)}
            className={cn(
              "flex items-center gap-4 rounded-3xl p-5 text-left transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0",
              r.accent === "accent"
                ? "bg-accent-soft ring-1 ring-accent/50"
                : "bg-primary-soft ring-1 ring-primary/15",
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
        <Btn variant="ghost" full onClick={onSignOut}>
          Cerrar sesión
        </Btn>
      </div>
    </Screen>
  );
}

const STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
  PENDING: { text: "Pendiente", className: "bg-accent-soft text-accent-foreground" },
  PAID: { text: "Pagado", className: "bg-primary text-primary-foreground" },
  CANCELLED: { text: "Cancelado", className: "bg-secondary text-muted-foreground" },
};

export function HistoryScreen({
  orders,
  loading,
  loadError,
  onBack,
  onCancel,
}: {
  orders: Order[];
  loading: boolean;
  loadError: string;
  onBack: () => void;
  /** Solo se pasa cuando los pedidos viven en la API (permite cancelar pendientes). */
  onCancel?: (orderId: string) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");

  const cancel = async (orderId: string) => {
    if (!onCancel) return;
    setBusyId(orderId);
    setCancelError("");
    try {
      await onCancel(orderId);
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "No pudimos cancelar el pedido.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen className="flex flex-1 flex-col gap-6 px-7 py-10">
      <Header title="Historial" subtitle="Tus comidas" onBack={onBack} />
      {loadError && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {loadError}
        </p>
      )}
      {cancelError && (
        <p role="alert" className="text-center text-sm font-medium text-red-600">
          {cancelError}
        </p>
      )}
      {loading ? (
        <p className="py-10 text-center text-[15px] text-muted-foreground">Cargando tus pedidos…</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="text-5xl">🍽️</span>
          <p className="text-[15px] text-muted-foreground">
            Todavía no has pedido nada.
            <br />
            Tu primera comida aparecerá aquí.
          </p>
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
                    {o.date} · {o.method}
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
                      onClick={() => void cancel(o.id)}
                      disabled={busyId === o.id}
                      className="rounded-full border border-border bg-background px-3 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      {busyId === o.id ? "Cancelando…" : "Cancelar pedido"}
                    </button>
                  )}
                </div>
              )}
              {o.rating > 0 && (
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: o.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
