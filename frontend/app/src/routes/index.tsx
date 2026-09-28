import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  History,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Btn, Field, Screen } from "@/components/comejave/ui";
import { Stars } from "@/components/comejave/Stars";
import { formatCOP, restaurants, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Come Jave · Pide en el campus Javeriana Cali" },
      {
        name: "description",
        content:
          "Pide en Ventolini y La Frute desde tu celular: elige categoría, agrega al carrito, paga en efectivo o Nequi y revisa tu historial de comidas.",
      },
      { property: "og:title", content: "Come Jave · Pide en el campus Javeriana Cali" },
      {
        property: "og:description",
        content: "Pide en Ventolini y La Frute desde tu celular: elige categoría, agrega al carrito, paga en efectivo o Nequi y revisa tu historial de comidas.",
      },
    ],
  }),
  component: Index,
});

type ScreenId =
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

type CartLine = { id: string; name: string; price: number; qty: number; emoji: string };
type Order = {
  id: string;
  date: string;
  restaurant: string;
  emoji: string;
  items: CartLine[];
  total: number;
  method: "Efectivo" | "Nequi";
  rating: number;
};

const STORAGE_KEY = "comejave.history";

function Index() {
  const [screen, setScreen] = useState<ScreenId>("login");
  const [restaurantId, setRestaurantId] = useState<Restaurant["id"]>("ventolini");
  const [categoryId, setCategoryId] = useState<string>("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [rating, setRating] = useState(0);
  const [method, setMethod] = useState<Order["method"]>("Efectivo");
  const [history, setHistory] = useState<Order[]>([]);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw) as Order[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Order[]) => {
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const restaurant = restaurants.find((r) => r.id === restaurantId)!;
  const category = restaurant.categories.find((c) => c.id === categoryId);
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const total = useMemo(() => cart.reduce((a, l) => a + l.price * l.qty, 0), [cart]);

  const add = (item: { id: string; name: string; price: number; emoji: string }) =>
    setCart((prev) => {
      const found = prev.find((l) => l.id === item.id);
      return found
        ? prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { ...item, qty: 1 }];
    });

  const confirmOrder = () => {
    const order: Order = {
      id: `${Date.now()}`,
      date: new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      restaurant: restaurant.name,
      emoji: restaurant.emoji,
      items: cart,
      total,
      method,
      rating: 0,
    };
    setLastOrderId(order.id);
    persist([order, ...history]);
    setScreen("success");
  };

  const rate = (value: number) => {
    setRating(value);
    persist(history.map((o) => (o.id === lastOrderId ? { ...o, rating: value } : o)));
  };

  const reset = () => {
    setCart([]);
    setRating(0);
    setCategoryId("");
    setScreen("home");
  };

  return (
    <main className="flex min-h-screen justify-center bg-surface sm:px-4 sm:py-10">
      <div className="flex min-h-screen w-full max-w-[420px] flex-col overflow-y-auto bg-background sm:h-[860px] sm:min-h-0 sm:rounded-[2rem] sm:border sm:border-border sm:shadow-lg">
        {screen === "login" && (
          <Screen className="flex flex-1 flex-col justify-center gap-9 px-7 py-14">
            <Brand />
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setScreen("home");
              }}
            >
              <Field label="Usuario" placeholder="tu.usuario" autoComplete="username" />
              <Field label="Contraseña" type="password" placeholder="••••••••" />
              <Btn full type="submit" className="mt-2">
                Ingresar
              </Btn>
            </form>
            <button
              onClick={() => setScreen("signup")}
              className="mx-auto rounded-full bg-accent-soft px-5 py-2.5 text-[15px] font-bold text-accent-foreground transition-colors hover:bg-accent active:bg-accent"
            >
              Crear cuenta
            </button>
          </Screen>
        )}

        {screen === "signup" && (
          <Screen className="flex flex-1 flex-col gap-8 px-7 py-10">
            <Header title="Crear cuenta" onBack={() => setScreen("login")} />
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setScreen("home");
              }}
            >
              <Field label="Usuario" placeholder="tu.usuario" />
              <Field label="Correo" type="email" placeholder="nombre@javerianacali.edu.co" />
              <Field label="Contraseña" type="password" placeholder="••••••••" />
              <Btn full type="submit" variant="accent" className="mt-2">
                Crear
              </Btn>
            </form>
          </Screen>
        )}

        {screen === "home" && (
          <Screen className="flex flex-1 flex-col">
            <div className="rounded-b-[2rem] bg-primary px-7 pb-9 pt-10 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-primary-foreground/70">Hola, javeriano 👋</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight">¿Dónde comemos?</h1>
                </div>
                <CartButton
                  count={count}
                  onDark
                  onClick={() => count && setScreen("checkout")}
                />
              </div>
              <button
                onClick={() => setScreen("history")}
                className="mt-7 flex w-full items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3.5 text-left transition-colors hover:bg-primary-foreground/20"
              >
                <History className="h-5 w-5" strokeWidth={1.75} />
                <span className="flex-1 text-[15px] font-medium">Historial de comidas</span>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-bold text-accent-foreground">
                  {history.length}
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-4 px-7 py-8">
              {restaurants.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRestaurantId(r.id);
                    setScreen("restaurant");
                  }}
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
            </div>
          </Screen>
        )}

        {screen === "history" && (
          <Screen className="flex flex-1 flex-col gap-6 px-7 py-10">
            <Header title="Historial" subtitle="Tus comidas" onBack={() => setScreen("home")} />
            {history.length === 0 ? (
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
                {history.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-2xl bg-primary-soft p-5 ring-1 ring-primary/10"
                  >
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
        )}

        {screen === "restaurant" && (
          <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
            <Header
              title={`${restaurant.emoji} ${restaurant.name}`}
              subtitle={restaurant.tagline}
              onBack={() => setScreen("home")}
              right={<CartButton count={count} onClick={() => count && setScreen("checkout")} />}
            />
            <div className="grid grid-cols-2 gap-4">
              {restaurant.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategoryId(c.id);
                    setScreen("category");
                  }}
                  className={cn(
                    "flex flex-col items-start gap-4 rounded-3xl p-5 text-left transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0",
                    restaurant.accent === "accent"
                      ? "bg-accent-soft ring-1 ring-accent/50"
                      : "bg-primary-soft ring-1 ring-primary/15",
                  )}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-[15px] font-bold text-primary">{c.name}</span>
                </button>
              ))}
            </div>
          </Screen>
        )}

        {screen === "category" && category && (
          <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
            <Header
              title={`${category.emoji} ${category.name}`}
              subtitle={restaurant.name}
              onBack={() => setScreen("restaurant")}
              right={<CartButton count={count} onClick={() => count && setScreen("checkout")} />}
            />
            <ul className="flex flex-col gap-3">
              {category.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl bg-primary-soft/70 p-4 ring-1 ring-primary/10"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">
                    {item.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{item.desc}</p>
                    <p className="mt-1 text-[15px] font-bold text-primary">
                      {formatCOP(item.price)}
                    </p>
                  </div>
                  <button
                    aria-label={`Agregar ${item.name}`}
                    onClick={() => add(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-hover"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </li>
              ))}
            </ul>
            {count > 0 && (
              <Btn full onClick={() => setScreen("checkout")} className="mt-auto">
                🛒 Ver carrito · {formatCOP(total)}
              </Btn>
            )}
          </Screen>
        )}

        {screen === "checkout" && (
          <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
            <Header title="Tu pedido" onBack={() => setScreen("restaurant")} />
            <ul className="flex flex-col gap-3">
              {cart.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-2xl bg-primary-soft/70 px-4 py-3"
                >
                  <span className="text-xl">{l.emoji}</span>
                  <span className="flex-1 text-[15px] text-foreground">
                    <span className="font-bold text-primary">{l.qty}×</span> {l.name}
                  </span>
                  <span className="text-[15px] font-bold text-foreground">
                    {formatCOP(l.price * l.qty)}
                  </span>
                </li>
              ))}
              {cart.length === 0 && (
                <li className="py-10 text-center text-[15px] text-muted-foreground">
                  🛒 Tu carrito está vacío
                </li>
              )}
            </ul>
            <div className="flex items-baseline justify-between rounded-2xl bg-accent-soft px-5 py-4">
              <span className="text-[15px] font-medium text-accent-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">{formatCOP(total)}</span>
            </div>
            <div className="mt-auto flex flex-col gap-3">
              <Btn
                full
                disabled={!cart.length}
                onClick={() => {
                  setMethod("Efectivo");
                  setScreen("waiting");
                }}
              >
                💵 Pagar en efectivo
              </Btn>
              <Btn
                full
                variant="accent"
                disabled={!cart.length}
                onClick={() => {
                  setMethod("Nequi");
                  setScreen("online");
                }}
              >
                📱 Pagar online
              </Btn>
            </div>
          </Screen>
        )}

        {screen === "online" && (
          <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
            <Header title="Pago online" onBack={() => setScreen("checkout")} />
            <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
              <p className="text-[13px] text-primary-foreground/70">
                📱 Transfiere a la cuenta Nequi
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight">318 452 9017</p>
              <p className="mt-1 text-[15px] text-primary-foreground/80">
                Come Jave · Javeriana Cali
              </p>
              <div className="mt-6 flex items-baseline justify-between border-t border-primary-foreground/20 pt-5">
                <span className="text-[13px] text-primary-foreground/70">Monto a transferir</span>
                <span className="text-xl font-bold text-accent">{formatCOP(total)}</span>
              </div>
            </div>
            <Field label="Número de comprobante" placeholder="Ej. 987654321" />
            <Btn full className="mt-auto" onClick={() => setScreen("waiting")}>
              Siguiente
            </Btn>
          </Screen>
        )}

        {screen === "waiting" && (
          <Screen className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-20 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft">
              <Clock className="h-10 w-10 text-accent-foreground" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-primary">Pago en espera ⏳</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Estamos confirmando tu pago. Tu pedido en {restaurant.name} estará listo en
                aproximadamente 15 minutos.
              </p>
            </div>
            <Btn className="mt-4" full onClick={confirmOrder}>
              Confirmar
            </Btn>
          </Screen>
        )}

        {screen === "success" && (
          <Screen className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-20 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
              <Check className="h-11 w-11 text-accent" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-primary">¡Pago exitoso! 🎉</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Tu pedido fue confirmado. Reclámalo en el punto de {restaurant.name}.
              </p>
            </div>
            <div className="mt-2 w-full rounded-3xl bg-accent-soft px-5 py-6">
              <p className="mb-4 text-[13px] font-medium text-accent-foreground">
                ¿Cómo estuvo tu experiencia?
              </p>
              <Stars value={rating} onChange={rate} />
            </div>
            <div className="flex w-full flex-col gap-3">
              <Btn full onClick={reset}>
                Volver a inicio
              </Btn>
              <Btn
                full
                variant="outline"
                onClick={() => {
                  setCart([]);
                  setRating(0);
                  setScreen("history");
                }}
              >
                Ver historial
              </Btn>
            </div>
          </Screen>
        )}
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-4xl">
        🍽️
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-primary">
        Come <span className="rounded-lg bg-accent px-2 text-accent-foreground">Jave</span>
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground">Pide sin filas en el campus</p>
    </div>
  );
}

function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        aria-label="Volver"
        onClick={onBack}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-accent-soft active:bg-accent-soft"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <div className="flex-1">
        {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
        <h2 className="text-2xl font-bold tracking-tight text-primary">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function CartButton({
  count,
  onClick,
  onDark,
}: {
  count: number;
  onClick: () => void;
  onDark?: boolean;
}) {
  return (
    <button
      aria-label={`Carrito, ${count} ítems`}
      onClick={onClick}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
        onDark
          ? "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          : "bg-primary-soft text-primary hover:bg-accent-soft",
      )}
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={2} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
          {count}
        </span>
      )}
    </button>
  );
}
