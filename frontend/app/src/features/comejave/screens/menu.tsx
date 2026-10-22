import { Plus } from "lucide-react";
import { Btn, Screen } from "@/components/comejave/ui";
import { CartButton, Header } from "@/components/comejave/layout";
import { formatCOP, type Category, type Product, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

export function RestaurantScreen({
  restaurant,
  cartCount,
  onBack,
  onCart,
  onPick,
}: {
  restaurant: Restaurant;
  cartCount: number;
  onBack: () => void;
  onCart: () => void;
  onPick: (categoryId: string) => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
      <Header
        title={`${restaurant.emoji} ${restaurant.name}`}
        subtitle={restaurant.tagline}
        onBack={onBack}
        right={<CartButton count={cartCount} onClick={onCart} />}
      />
      <div className="grid grid-cols-2 gap-4">
        {restaurant.categories.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => onPick(c.id)}
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
  );
}

export function CategoryScreen({
  restaurant,
  category,
  cartCount,
  cartTotal,
  onBack,
  onCart,
  onAdd,
}: {
  restaurant: Restaurant;
  category: Category;
  cartCount: number;
  cartTotal: number;
  onBack: () => void;
  onCart: () => void;
  onAdd: (item: Product) => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
      <Header
        title={`${category.emoji} ${category.name}`}
        subtitle={restaurant.name}
        onBack={onBack}
        right={<CartButton count={cartCount} onClick={onCart} />}
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
              <p className="mt-1 text-[15px] font-bold text-primary">{formatCOP(item.price)}</p>
            </div>
            <button
              type="button"
              aria-label={`Agregar ${item.name}`}
              onClick={() => onAdd(item)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover active:bg-accent-hover"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </li>
        ))}
      </ul>
      {cartCount > 0 && (
        <Btn full onClick={onCart} className="mt-auto">
          🛒 Ver carrito · {formatCOP(cartTotal)}
        </Btn>
      )}
    </Screen>
  );
}
