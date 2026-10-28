import { useState } from "react";
import { Banknote, Check, Copy, ShoppingBag, Smartphone } from "lucide-react";
import { BottomBar, Btn, Field, Notice, QtyStepper, Screen } from "@/components/comejave/ui";
import { Header } from "@/components/comejave/layout";
import { Stars } from "@/components/comejave/Stars";
import type { CartLine, PaymentMethod } from "@/features/comejave/types";
import { isValidReference } from "@/features/comejave/validation";
import { formatCOP } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

const NEQUI_NUMBER = "318 452 9017";

const METHODS: { id: PaymentMethod; title: string; detail: string; Icon: typeof Banknote }[] = [
  {
    id: "Efectivo",
    title: "Efectivo",
    detail: "Pagas al reclamar en el punto",
    Icon: Banknote,
  },
  {
    id: "Nequi",
    title: "Nequi",
    detail: "Transfieres ahora y registras el comprobante",
    Icon: Smartphone,
  },
];

export function CheckoutScreen({
  restaurantName,
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
  restaurantName: string;
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
      <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
        <Header title="Tu pedido" onBack={onBack} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
            <ShoppingBag className="h-9 w-9 text-primary" strokeWidth={1.75} />
          </span>
          <p className="text-lg font-bold text-primary">Tu carrito está vacío</p>
          <p className="text-[15px] text-muted-foreground">Elige un restaurante y agrega platos.</p>
          <Btn variant="accent" onClick={onBrowse} className="mt-2">
            Ver restaurantes
          </Btn>
        </div>
      </Screen>
    );
  }

  return (
    <Screen className="flex flex-1 flex-col">
      <div className="flex flex-col gap-7 px-7 pt-10 pb-8">
        <Header title="Tu pedido" subtitle={restaurantName} onBack={onBack} />
        <ul className="flex flex-col gap-3">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex items-center gap-3 rounded-2xl bg-primary-soft/70 px-4 py-3"
            >
              <span className="text-2xl" aria-hidden>
                {line.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">{line.name}</p>
                <p className="text-[13px] text-muted-foreground">
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
            </li>
          ))}
        </ul>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-bold text-primary">¿Cómo vas a pagar?</legend>
          {METHODS.map(({ id, title, detail, Icon }) => {
            const selected = method === id;
            return (
              <label
                key={id}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  selected
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-background hover:bg-secondary",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={id}
                  checked={selected}
                  onChange={() => onMethod(id)}
                  className="sr-only"
                />
                <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
                <span className="flex-1">
                  <span className="block text-[15px] font-bold text-primary">{title}</span>
                  <span className="block text-[13px] text-muted-foreground">{detail}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    selected ? "border-primary bg-primary" : "border-border",
                  )}
                >
                  {selected && (
                    <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>
      <BottomBar>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[15px] text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">{formatCOP(total)}</span>
        </div>
        <Btn full onClick={onContinue}>
          {method === "Nequi" ? "Continuar al pago con Nequi" : "Revisar pedido"}
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
      <div className="flex flex-col gap-7 px-7 pt-10 pb-8">
        <Header title="Pago con Nequi" onBack={onBack} />
        <ol className="flex flex-col gap-5">
          <li className="rounded-3xl bg-primary p-6 text-primary-foreground">
            <p className="text-[13px] text-primary-foreground/75">
              1. Transfiere a esta cuenta Nequi
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-bold tracking-tight tabular-nums">{NEQUI_NUMBER}</p>
              <button
                type="button"
                onClick={() => void copy()}
                className="flex min-h-10 items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3.5 text-[13px] font-semibold transition-colors hover:bg-primary-foreground/25"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="mt-1 text-[14px] text-primary-foreground/80">Come Jave, Javeriana Cali</p>
            <div className="mt-5 flex items-baseline justify-between border-t border-primary-foreground/20 pt-4">
              <span className="text-[13px] text-primary-foreground/75">Monto exacto</span>
              <span className="text-xl font-bold text-accent">{formatCOP(total)}</span>
            </div>
          </li>
          <li>
            <Field
              label="2. Escribe el número de comprobante"
              placeholder="Ej. 987654321"
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
              value={reference}
              hint="Lo encuentras en el detalle del movimiento en Nequi (6 a 20 dígitos)."
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
  restaurantName,
  lines,
  total,
  method,
  reference,
  submitting,
  error,
  onConfirm,
  onBack,
}: {
  restaurantName: string;
  lines: CartLine[];
  total: number;
  method: PaymentMethod;
  reference: string;
  submitting: boolean;
  error: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <Screen className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 px-7 pt-10 pb-8">
        <Header title="Confirma tu pedido" subtitle={restaurantName} onBack={onBack} />
        <dl className="divide-y divide-border rounded-3xl bg-primary-soft/70 px-5 ring-1 ring-primary/10">
          <div className="py-4">
            <dt className="text-[13px] text-muted-foreground">
              {count} {count === 1 ? "plato" : "platos"}
            </dt>
            <dd className="mt-1 text-[15px] text-foreground">
              {lines.map((line) => `${line.qty}× ${line.name}`).join(", ")}
            </dd>
          </div>
          <div className="flex items-center justify-between py-4">
            <dt className="text-[13px] text-muted-foreground">Pago</dt>
            <dd className="text-[15px] font-semibold text-foreground">
              {method}
              {method === "Nequi" && reference ? `, comprobante ${reference}` : ""}
            </dd>
          </div>
          <div className="flex items-baseline justify-between py-4">
            <dt className="text-[13px] text-muted-foreground">Total</dt>
            <dd className="text-2xl font-bold text-primary">{formatCOP(total)}</dd>
          </div>
        </dl>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          {method === "Efectivo"
            ? `Pagas en el punto de ${restaurantName} al reclamar. El pedido estará listo en unos 15 minutos.`
            : `${restaurantName} verifica tu transferencia y prepara el pedido en unos 15 minutos.`}
        </p>
        {error && <Notice>{error}</Notice>}
      </div>
      <BottomBar>
        <div className="flex flex-col gap-2">
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
  restaurantName,
  remote,
  rating,
  onRate,
  onHome,
  onHistory,
}: {
  restaurantName: string;
  /** true cuando el pedido quedó registrado en la API (queda pendiente de pago). */
  remote: boolean;
  rating: number;
  onRate: (value: number) => void;
  onHome: () => void;
  onHistory: () => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
        <Check className="h-11 w-11 text-accent" strokeWidth={2.5} />
      </span>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          {remote ? "Pedido enviado" : "Pedido confirmado"}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {remote
            ? `${restaurantName} lo marcará como pagado al confirmar tu pago. Puedes seguir su estado en el historial.`
            : `Reclámalo en el punto de ${restaurantName} en unos 15 minutos.`}
        </p>
      </div>
      <div className="mt-2 w-full rounded-3xl bg-accent-soft px-5 py-6">
        <p className="mb-4 text-[14px] font-medium text-accent-foreground">
          {rating ? "Gracias por calificar" : "¿Cómo te fue pidiendo?"}
        </p>
        <Stars value={rating} onChange={onRate} />
      </div>
      <div className="flex w-full flex-col gap-3">
        <Btn full onClick={onHistory}>
          Ver estado del pedido
        </Btn>
        <Btn full variant="outline" onClick={onHome}>
          Volver al inicio
        </Btn>
      </div>
    </Screen>
  );
}
