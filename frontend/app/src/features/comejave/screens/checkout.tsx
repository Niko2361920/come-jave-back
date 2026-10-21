import { Check, Clock } from "lucide-react";
import { Btn, Field, Screen } from "@/components/comejave/ui";
import { Header } from "@/components/comejave/layout";
import { Stars } from "@/components/comejave/Stars";
import type { CartLine, PaymentMethod } from "@/features/comejave/types";
import { isValidReference } from "@/features/comejave/validation";
import { formatCOP } from "@/lib/comejave-data";

export function CheckoutScreen({
  lines,
  total,
  onBack,
  onPay,
}: {
  lines: CartLine[];
  total: number;
  onBack: () => void;
  onPay: (method: PaymentMethod) => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
      <Header title="Tu pedido" onBack={onBack} />
      <ul className="flex flex-col gap-3">
        {lines.map((l) => (
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
        {lines.length === 0 && (
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
        <Btn full disabled={!lines.length} onClick={() => onPay("Efectivo")}>
          💵 Pagar en efectivo
        </Btn>
        <Btn full variant="accent" disabled={!lines.length} onClick={() => onPay("Nequi")}>
          📱 Pagar online
        </Btn>
      </div>
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
  const hasValue = reference.trim().length > 0;
  const invalid = hasValue ? !isValidReference(reference) : referenceRequired;
  const showHint = hasValue && !isValidReference(reference);

  return (
    <Screen className="flex flex-1 flex-col gap-7 px-7 py-10">
      <Header title="Pago online" onBack={onBack} />
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
        <p className="text-[13px] text-primary-foreground/70">📱 Transfiere a la cuenta Nequi</p>
        <p className="mt-2 text-2xl font-bold tracking-tight">318 452 9017</p>
        <p className="mt-1 text-[15px] text-primary-foreground/80">Come Jave · Javeriana Cali</p>
        <div className="mt-6 flex items-baseline justify-between border-t border-primary-foreground/20 pt-5">
          <span className="text-[13px] text-primary-foreground/70">Monto a transferir</span>
          <span className="text-xl font-bold text-accent">{formatCOP(total)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Field
          label="Número de comprobante"
          placeholder="Ej. 987654321"
          inputMode="numeric"
          autoComplete="off"
          value={reference}
          onChange={(event) => onReference(event.target.value)}
        />
        {showHint && (
          <p role="alert" className="text-[13px] font-medium text-red-600">
            El comprobante debe tener entre 6 y 20 dígitos (solo números).
          </p>
        )}
      </div>
      <Btn full className="mt-auto" disabled={invalid} onClick={onNext}>
        Siguiente
      </Btn>
    </Screen>
  );
}

export function WaitingScreen({
  restaurantName,
  submitting,
  error,
  onConfirm,
  onBack,
}: {
  restaurantName: string;
  submitting: boolean;
  error: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <Screen className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-20 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-soft">
        <Clock className="h-10 w-10 text-accent-foreground" strokeWidth={1.75} />
      </span>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary">Pago en espera ⏳</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Estamos confirmando tu pago. Tu pedido en {restaurantName} estará listo en aproximadamente
          15 minutos.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div className="mt-4 flex w-full flex-col gap-3">
        <Btn full onClick={onConfirm} disabled={submitting}>
          {submitting ? "Enviando pedido..." : error ? "Reintentar" : "Confirmar"}
        </Btn>
        <Btn full variant="outline" onClick={onBack} disabled={submitting}>
          Volver al pedido
        </Btn>
      </div>
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
    <Screen className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-20 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
        <Check className="h-11 w-11 text-accent" strokeWidth={2.5} />
      </span>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          {remote ? "¡Pedido recibido! 🎉" : "¡Pago exitoso! 🎉"}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {remote
            ? `Lo marcaremos como pagado cuando ${restaurantName} confirme tu pago. Reclámalo en su punto.`
            : `Tu pedido fue confirmado. Reclámalo en el punto de ${restaurantName}.`}
        </p>
      </div>
      <div className="mt-2 w-full rounded-3xl bg-accent-soft px-5 py-6">
        <p className="mb-4 text-[13px] font-medium text-accent-foreground">
          ¿Cómo estuvo tu experiencia?
        </p>
        <Stars value={rating} onChange={onRate} />
      </div>
      <div className="flex w-full flex-col gap-3">
        <Btn full onClick={onHome}>
          Volver a inicio
        </Btn>
        <Btn full variant="outline" onClick={onHistory}>
          Ver historial
        </Btn>
      </div>
    </Screen>
  );
}
