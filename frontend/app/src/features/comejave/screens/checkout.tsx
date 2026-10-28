import { useState, type ReactNode } from "react";
import { Banknote, Check, Copy, Smartphone } from "lucide-react";
import { BottomBar, Btn, Field, Notice, QtyStepper, Screen } from "@/components/comejave/ui";
import { Header } from "@/components/comejave/layout";
import { CategoryArt, DishArt } from "@/components/comejave/DishArt";
import { Stars } from "@/components/comejave/Stars";
import { restaurantStyle } from "@/components/comejave/theme";
import type { CartLine, PaymentMethod } from "@/features/comejave/types";
import { isValidReference } from "@/features/comejave/validation";
import { formatCOP, type Restaurant } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

const NEQUI_NUMBER = "318 452 9017";

const METHODS: {
  id: PaymentMethod;
  title: string;
  detail: string;
  Icon: typeof Banknote;
  tile: string;
}[] = [
  {
    id: "Efectivo",
    title: "Efectivo",
    detail: "Pagas al reclamar en el punto",
    Icon: Banknote,
    tile: "bg-frute",
  },
  {
    id: "Nequi",
    title: "Nequi",
    detail: "Transfieres ahora y registras el comprobante",
    Icon: Smartphone,
    tile: "bg-[#c4006f]",
  },
];

/** Grupo con título, al estilo de las listas agrupadas de iOS. */
function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section>
      {title && (
        <h3 className="mb-2 px-4 text-[15px] font-semibold text-muted-foreground">{title}</h3>
      )}
      <div className="divide-y divide-separator overflow-hidden rounded-[22px] bg-card ring-1 ring-separator">
        {children}
      </div>
    </section>
  );
}

function RestaurantChip({ restaurant }: { restaurant: Restaurant }) {
  return (
    <span
      style={restaurantStyle(restaurant.id)}
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--r-soft)] px-3 py-1 text-[14px] font-semibold text-[var(--r)]"
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--r)]" />
      {restaurant.name}
    </span>
  );
}

export function CheckoutScreen({
  restaurant,
  lines,
  total,
  method,
  onMethod,
  onIncrement,
  onDecrement,
  onBack,
  onBrowse,
  onContinue,
}: {
  restaurant: Restaurant;
  lines: CartLine[];
  total: number;
  method: PaymentMethod;
  onMethod: (method: PaymentMethod) => void;
  onIncrement: (line: CartLine) => void;
  onDecrement: (itemId: string) => void;
  onBack: () => void;
  onBrowse: () => void;
  onContinue: () => void;
}) {
  if (lines.length === 0) {
    return (
      <Screen className="flex flex-1 flex-col gap-7 px-5 pt-6 pb-10">
        <Header title="Tu pedido" onBack={onBack} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div aria-hidden className="relative mb-2 h-28 w-40">
            <CategoryArt
              categoryId="pastas"
              className="absolute left-0 top-2 h-24 w-24 -rotate-12"
            />
            <CategoryArt
              categoryId="ensaladas"
              className="absolute right-0 top-0 h-24 w-24 rotate-12"
            />
          </div>
          <p className="font-display text-[24px] font-bold text-foreground">
            Tu carrito está vacío
          </p>
          <p className="text-[16px] text-muted-foreground">Elige un restaurante y agrega platos.</p>
          <Btn onClick={onBrowse} className="mt-3">
            Ver restaurantes
          </Btn>
        </div>
      </Screen>
    );
  }

  return (
    <Screen className="flex flex-1 flex-col">
      <div style={restaurantStyle(restaurant.id)} className="flex flex-col gap-7 px-5 pt-6 pb-8">
        <Header
          title="Tu pedido"
          subtitle={<RestaurantChip restaurant={restaurant} />}
          onBack={onBack}
        />
        <Group>
          {lines.map((line) => (
            <div key={line.id} className="flex items-center gap-3 py-3 pr-3 pl-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--r-soft)] p-1">
                <DishArt itemId={line.id} className="h-full w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold text-foreground">{line.name}</p>
                <p className="text-[15px] text-muted-foreground tabular-nums">
                  {formatCOP(line.price * line.qty)}
                </p>
              </div>
              <QtyStepper
                size="sm"
                qty={line.qty}
                name={line.name}
                onIncrement={() => onIncrement(line)}
                onDecrement={() => onDecrement(line.id)}
              />
            </div>
          ))}
        </Group>

        <fieldset>
          <legend className="mb-2 px-4 text-[15px] font-semibold text-muted-foreground">
            Método de pago
          </legend>
          <div className="divide-y divide-separator overflow-hidden rounded-[22px] bg-card ring-1 ring-separator">
            {METHODS.map(({ id, title, detail, Icon, tile }) => {
              const selected = method === id;
              return (
                <label
                  key={id}
                  className="flex min-h-[4.25rem] items-center gap-3.5 px-4 py-3 transition-colors hover:bg-muted/60 has-[:focus-visible]:bg-muted"
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={id}
                    checked={selected}
                    onChange={() => onMethod(id)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white",
                      tile,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold text-foreground">{title}</span>
                    <span className="block text-[14px] text-muted-foreground">{detail}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                      selected ? "bg-primary" : "ring-2 ring-inset ring-input",
                    )}
                  >
                    {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <BottomBar>
        <div className="mb-3 flex items-baseline justify-between px-1">
          <span className="text-[16px] text-muted-foreground">Total</span>
          <span className="font-display text-[30px] font-bold text-foreground tabular-nums">
            {formatCOP(total)}
          </span>
        </div>
        <Btn full onClick={onContinue}>
          {method === "Nequi" ? "Pagar con Nequi" : "Revisar pedido"}
        </Btn>
      </BottomBar>
    </Screen>
  );
}

export function OnlinePaymentScreen({
  total,
  reference,
  referenceRequired,
  onReference,
  onBack,
  onNext,
}: {
  total: number;
  reference: string;
  /** Con la API el comprobante es obligatorio; en modo demo es opcional. */
  referenceRequired: boolean;
  onReference: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const hasValue = reference.trim().length > 0;
  const invalid = hasValue ? !isValidReference(reference) : referenceRequired;
  const showError = hasValue && !isValidReference(reference);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(NEQUI_NUMBER.replace(/\s/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* el navegador no permite copiar: el número sigue visible */
    }
  };

  return (
    <Screen className="flex flex-1 flex-col">
      <div className="flex flex-col gap-7 px-5 pt-6 pb-8">
        <Header title="Pago con Nequi" subtitle="Dos pasos y listo." onBack={onBack} />
        <ol className="flex flex-col gap-6">
          <li className="relative overflow-hidden rounded-[28px] bg-[#210049] p-6 text-white shadow-[0_24px_40px_-24px_#210049]">
            <span
              aria-hidden
              className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#c4006f]/60 blur-2xl"
            />
            <p className="relative text-[15px] text-white/75">1. Transfiere a esta cuenta</p>
            <p className="font-display relative mt-2 text-[32px] font-bold tracking-[-0.02em] tabular-nums">
              {NEQUI_NUMBER}
            </p>
            <p className="relative text-[15px] text-white/75">Come Jave, Javeriana Cali</p>
            <div className="relative mt-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-[13px] text-white/65">Monto exacto</p>
                <p className="text-[24px] font-bold tabular-nums">{formatCOP(total)}</p>
              </div>
              <button
                type="button"
                onClick={() => void copy()}
                className="pressable flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-[15px] font-semibold text-[#210049]"
              >
                {copied ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copiado" : "Copiar número"}
              </button>
            </div>
          </li>
          <li>
            <Field
              label="2. Número de comprobante"
              placeholder="Ej. 987654321"
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
              value={reference}
              hint="Está en el detalle del movimiento en Nequi (6 a 20 dígitos)."
              error={showError ? "Usa solo números, entre 6 y 20 dígitos." : undefined}
              onChange={(event) => onReference(event.target.value.replace(/\D/g, ""))}
            />
          </li>
        </ol>
      </div>
      <BottomBar>
        <Btn full disabled={invalid} onClick={onNext}>
          Revisar pedido
        </Btn>
      </BottomBar>
    </Screen>
  );
}

export function WaitingScreen({
  restaurant,
  lines,
  total,
  method,
  reference,
  submitting,
  error,
  onConfirm,
  onBack,
}: {
  restaurant: Restaurant;
  lines: CartLine[];
  total: number;
  method: PaymentMethod;
  reference: string;
  submitting: boolean;
  error: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col">
      <div style={restaurantStyle(restaurant.id)} className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <Header
          title="Confirma tu pedido"
          subtitle={<RestaurantChip restaurant={restaurant} />}
          onBack={onBack}
        />
        <Group>
          {lines.map((line) => (
            <div key={line.id} className="flex items-center gap-3 px-4 py-3">
              <DishArt itemId={line.id} className="h-10 w-10 shrink-0" />
              <span className="flex-1 text-[17px] text-foreground">
                <span className="font-semibold tabular-nums">{line.qty}×</span> {line.name}
              </span>
              <span className="text-[16px] text-muted-foreground tabular-nums">
                {formatCOP(line.price * line.qty)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[16px] text-muted-foreground">Pago</span>
            <span className="text-right text-[16px] font-semibold text-foreground">
              {method}
              {method === "Nequi" && reference && (
                <span className="block text-[14px] font-normal text-muted-foreground tabular-nums">
                  Comprobante {reference}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-baseline justify-between px-4 py-3.5">
            <span className="text-[16px] text-muted-foreground">Total</span>
            <span className="font-display text-[28px] font-bold text-foreground tabular-nums">
              {formatCOP(total)}
            </span>
          </div>
        </Group>
        <p className="px-1 text-[15px] leading-relaxed text-muted-foreground">
          {method === "Efectivo"
            ? `Pagas en el punto de ${restaurant.name} al reclamar. Estará listo en unos 15 minutos.`
            : `${restaurant.name} verifica tu transferencia y lo prepara en unos 15 minutos.`}
        </p>
        {error && <Notice>{error}</Notice>}
      </div>
      <BottomBar>
        <div className="flex flex-col gap-1">
          <Btn full onClick={onConfirm} disabled={submitting} aria-busy={submitting}>
            {submitting ? "Enviando pedido…" : error ? "Intentar de nuevo" : "Enviar pedido"}
          </Btn>
          <Btn full variant="ghost" onClick={onBack} disabled={submitting}>
            Cambiar algo
          </Btn>
        </div>
      </BottomBar>
    </Screen>
  );
}

export function SuccessScreen({
  restaurant,
  remote,
  rating,
  onRate,
  onHome,
  onHistory,
}: {
  restaurant: Restaurant;
  /** true cuando el pedido quedó registrado en la API (queda pendiente de pago). */
  remote: boolean;
  rating: number;
  onRate: (value: number) => void;
  onHome: () => void;
  onHistory: () => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col">
      <div
        style={restaurantStyle(restaurant.id)}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-14 text-center"
      >
        <span className="pop flex h-28 w-28 items-center justify-center rounded-full bg-[var(--r)] shadow-[0_20px_40px_-16px_var(--r)]">
          <Check className="h-14 w-14 text-white" strokeWidth={3} />
        </span>
        <div>
          <h2 className="font-display text-[34px] font-extrabold text-foreground">
            {remote ? "Pedido enviado" : "¡Listo, pedido hecho!"}
          </h2>
          <p className="mx-auto mt-3 max-w-[18rem] text-[17px] leading-relaxed text-muted-foreground">
            {remote
              ? `${restaurant.name} lo marcará como pagado al confirmar tu pago.`
              : `Reclámalo en el punto de ${restaurant.name} en unos 15 minutos.`}
          </p>
        </div>
        <div className="w-full rounded-[22px] bg-card px-5 py-5 ring-1 ring-separator">
          <p className="mb-3 text-[16px] font-semibold text-foreground">
            {rating ? "Gracias por calificar" : "¿Cómo te fue pidiendo?"}
          </p>
          <Stars value={rating} onChange={onRate} />
        </div>
      </div>
      <BottomBar>
        <div className="flex flex-col gap-1">
          <Btn full onClick={onHistory}>
            Ver estado del pedido
          </Btn>
          <Btn full variant="ghost" onClick={onHome}>
            Volver al inicio
          </Btn>
        </div>
      </BottomBar>
    </Screen>
  );
}
