import { ChevronRight, Plus, ShoppingBag } from "lucide-react";
import { BottomBar, Btn, QtyStepper, Screen } from "@/components/comejave/ui";
import { BackButton, CartButton } from "@/components/comejave/layout";
import { CategoryArt, DishArt } from "@/components/comejave/DishArt";
import { restaurantStyle } from "@/components/comejave/theme";
import { formatCOP, type Category, type Product, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

function CartBar({ count, total, onCart }: { count: number; total: number; onCart: () => void }) {
  if (count === 0) return null;
  return (
    <BottomBar>
      <Btn
        full
        onClick={onCart}
        className="justify-between bg-[var(--r)] hover:bg-[var(--r)] hover:brightness-110"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 px-2 text-[15px] tabular-nums">
            {count}
          </span>
          Ver carrito
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          {formatCOP(total)}
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
        </span>
      </Btn>
    </BottomBar>
  );
}

function ProductRow({
  item,
  qty,
  onAdd,
  onDecrement,
}: {
  item: Product;
  qty: number;
  onAdd: () => void;
  onDecrement: () => void;
}) {
  return (
    <li className="flex items-center gap-4 py-4 pr-4 pl-3">
      <span
        className={cn(
          "flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[20px] p-1.5 transition-colors",
          qty > 0 ? "bg-[var(--r-soft)]" : "bg-muted",
        )}
      >
        <DishArt itemId={item.id} className="h-full w-full" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] leading-tight font-semibold text-foreground">{item.name}</p>
        <p className="mt-0.5 text-[14px] leading-snug text-muted-foreground">{item.desc}</p>
        <p className="mt-1.5 text-[16px] font-bold text-foreground tabular-nums">
          {formatCOP(item.price)}
        </p>
      </div>
      {qty > 0 ? (
        <QtyStepper
          size="sm"
          qty={qty}
          name={item.name}
          onIncrement={onAdd}
          onDecrement={onDecrement}
        />
      ) : (
        <button
          type="button"
          aria-label={`Agregar ${item.name}`}
          onClick={onAdd}
          className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--r-soft)] text-[var(--r)] transition-colors hover:bg-[var(--r)] hover:text-white"
        >
          <Plus className="h-5 w-5" strokeWidth={2.75} />
        </button>
      )}
    </li>
  );
}

/** Restaurante con sus categorías en un control segmentado y la lista de platos. */
export function RestaurantScreen({
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
      <div style={restaurantStyle(restaurant.id)} className="flex flex-1 flex-col">
        <div className="relative isolate overflow-hidden bg-[var(--r)] px-5 pt-6 pb-16 text-white">
          <div className="relative z-10 flex items-center justify-between">
            <BackButton onBack={onBack} onColor />
            <CartButton count={cartCount} onClick={onCart} onColor />
          </div>
          <h2 className="font-display relative z-10 mt-10 text-[44px] font-extrabold tracking-[-0.04em]">
            {restaurant.name}
          </h2>
          <p className="relative z-10 mt-1 text-[17px] text-white/85">{restaurant.tagline}</p>
          <CategoryArt
            key={category.id}
            categoryId={category.id}
            className="pop absolute -right-12 -bottom-16 -z-0 h-56 w-56 rotate-[-12deg] drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)]"
          />
        </div>

        <div className="sticky top-0 z-20 -mt-8 rounded-t-[28px] bg-background px-5 pt-5 pb-3">
          <div
            role="tablist"
            aria-label="Categorías"
            className="grid grid-cols-2 gap-1 rounded-2xl bg-[#e3e6ee] p-1"
          >
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
                    "flex min-h-11 items-center justify-center gap-2 rounded-xl text-[16px] font-semibold transition-all duration-200",
                    selected
                      ? "bg-card text-foreground shadow-[0_2px_8px_-2px_rgba(14,30,54,0.2)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <CategoryArt categoryId={c.id} className="h-6 w-6" />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-background px-5 pb-8">
          <ul
            role="tabpanel"
            aria-label={category.name}
            className="divide-y divide-separator overflow-hidden rounded-[22px] bg-card ring-1 ring-separator"
          >
            {category.items.map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                qty={qtyOf(item.id)}
                onAdd={() => onAdd(item)}
                onDecrement={() => onDecrement(item.id)}
              />
            ))}
          </ul>
          {restaurant.categories.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const i = restaurant.categories.findIndex((c) => c.id === category.id);
                const next = restaurant.categories[(i + 1) % restaurant.categories.length]!;
                onCategory(next.id);
              }}
              className="mx-auto mt-5 flex min-h-11 items-center gap-1 rounded-full px-4 text-[15px] font-semibold text-[var(--r)] hover:bg-[var(--r-soft)]"
            >
              Ver{" "}
              {restaurant.categories[
                (restaurant.categories.findIndex((c) => c.id === category.id) + 1) %
                  restaurant.categories.length
              ]!.name.toLowerCase()}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
        <CartBar count={cartCount} total={cartTotal} onCart={onCart} />
      </div>
    </Screen>
  );
}
