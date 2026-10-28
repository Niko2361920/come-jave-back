import { ChevronRight, Plus, ShoppingBag } from "lucide-react";
import { BottomBar, Btn, QtyStepper, Screen } from "@/components/comejave/ui";
import { CartButton, Header } from "@/components/comejave/layout";
import { formatCOP, type Category, type Product, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

const cheapest = (category: Category) => Math.min(...category.items.map((item) => item.price));

function CartBar({ count, total, onCart }: { count: number; total: number; onCart: () => void }) {
  if (count === 0) return null;
  return (
    <BottomBar>
      <Btn full onClick={onCart} className="justify-between">
        <span className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
          Ver carrito ({count})
        </span>
        <span className="font-bold">{formatCOP(total)}</span>
      </Btn>
    </BottomBar>
  );
}

export function RestaurantScreen({
  restaurant,
  cartCount,
  cartTotal,
  onBack,
  onCart,
  onPick,
}: {
  restaurant: Restaurant;
  cartCount: number;
  cartTotal: number;
  onBack: () => void;
  onCart: () => void;
  onPick: (categoryId: string) => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col">
      <div className="flex flex-col gap-7 px-7 py-10">
        <Header
          title={`${restaurant.emoji} ${restaurant.name}`}
          subtitle={restaurant.tagline}
          onBack={onBack}
          right={<CartButton count={cartCount} onClick={onCart} />}
        />
        <ul className="flex flex-col gap-3">
          {restaurant.categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-3xl p-5 text-left transition-colors",
                  restaurant.accent === "accent"
                    ? "bg-accent-soft ring-1 ring-accent/50 hover:bg-accent/40"
                    : "bg-primary-soft ring-1 ring-primary/15 hover:bg-primary-soft/60",
                )}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background text-3xl">
                  {c.emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-primary">{c.name}</span>
                  <span className="block text-[13px] text-muted-foreground">
                    {c.items.length} opciones, desde {formatCOP(cheapest(c))}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-primary/50" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <CartBar count={cartCount} total={cartTotal} onCart={onCart} />
    </Screen>
  );
}

export function CategoryScreen({
  restaurant,
  category,
  cartCount,
  cartTotal,
  qtyOf,
  onBack,
  onCart,
  onCategory,
  onAdd,
  onDecrement,
}: {
  restaurant: Restaurant;
  category: Category;
  cartCount: number;
  cartTotal: number;
  /** Cantidad de ese producto que ya está en el carrito. */
  qtyOf: (itemId: string) => number;
  onBack: () => void;
  onCart: () => void;
  onCategory: (categoryId: string) => void;
  onAdd: (item: Product) => void;
  onDecrement: (itemId: string) => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 px-7 pt-10 pb-8">
        <Header
          title={restaurant.name}
          subtitle={restaurant.tagline}
          onBack={onBack}
          right={<CartButton count={cartCount} onClick={onCart} />}
        />
        <div role="tablist" aria-label="Categorías" className="flex gap-2">
          {restaurant.categories.map((c) => {
            const selected = c.id === category.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onCategory(c.id)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary-soft text-primary hover:bg-accent-soft",
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.name}
              </button>
            );
          })}
        </div>
        <ul className="flex flex-col gap-3" role="tabpanel" aria-label={category.name}>
          {category.items.map((item) => {
            const qty = qtyOf(item.id);
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-4 ring-1 transition-colors",
                  qty > 0
                    ? "bg-accent-soft/60 ring-accent/60"
                    : "bg-primary-soft/70 ring-primary/10",
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{item.desc}</p>
                  <p className="mt-1 text-[15px] font-bold text-primary">{formatCOP(item.price)}</p>
                </div>
                {qty > 0 ? (
                  <QtyStepper
                    size="sm"
                    qty={qty}
                    name={item.name}
                    onIncrement={() => onAdd(item)}
                    onDecrement={() => onDecrement(item.id)}
                  />
                ) : (
                  <button
                    type="button"
                    aria-label={`Agregar ${item.name}`}
                    onClick={() => onAdd(item)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-hover"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <CartBar count={cartCount} total={cartTotal} onCart={onCart} />
    </Screen>
  );
}
