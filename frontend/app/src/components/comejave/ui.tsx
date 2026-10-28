import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "outline" | "ghost";
  full?: boolean;
};

export function Btn({ variant = "primary", full, className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "pressable inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[17px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        full && "w-full",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        variant === "accent" &&
          "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover",
        variant === "outline" &&
          "bg-card text-primary ring-1 ring-separator hover:bg-secondary active:bg-secondary",
        variant === "ghost" && "text-primary hover:bg-secondary/70 active:bg-secondary",
        className,
      )}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  className,
  endAdornment,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Texto de ayuda bajo el campo. */
  hint?: string | undefined;
  /** Mensaje de error del campo; reemplaza la ayuda y marca el campo como inválido. */
  error?: string | undefined;
  endAdornment?: ReactNode;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error || hint ? `${inputId}-desc` : undefined;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-[14px] font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
          className={cn(
            "w-full rounded-2xl border bg-card px-4 py-3.5 text-[17px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary",
            error ? "border-destructive" : "border-input",
            endAdornment && "pr-12",
            className,
          )}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-3 flex items-center">{endAdornment}</div>
        )}
      </div>
      {(error || hint) && (
        <p
          id={describedBy}
          className={cn(
            "mt-1.5 text-[13px]",
            error ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

/** Mensaje en línea para errores y avisos (con su rol ARIA correcto). */
export function Notice({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "info";
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-4 py-3 text-left text-[14px] font-medium",
        tone === "error" ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-primary",
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
      <span>{children}</span>
    </div>
  );
}

/** Control − cantidad + para una línea del carrito. */
export function QtyStepper({
  qty,
  name,
  onIncrement,
  onDecrement,
  size = "md",
}: {
  qty: number;
  name: string;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
}) {
  const button = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div
      className="flex items-center gap-0.5 rounded-full bg-[var(--r,var(--primary))] p-0.5 text-white shadow-[0_4px_12px_-4px_var(--r,var(--primary))]"
      role="group"
      aria-label={`Cantidad de ${name}`}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={qty === 1 ? `Quitar ${name}` : `Quitar uno de ${name}`}
        className={cn(
          "pressable flex items-center justify-center rounded-full transition-colors hover:bg-white/15",
          button,
        )}
      >
        {qty === 1 ? (
          <Trash2 className="h-4 w-4" strokeWidth={2.25} />
        ) : (
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
      <span className="min-w-5 text-center text-[16px] font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Agregar otro ${name}`}
        className={cn(
          "pressable flex items-center justify-center rounded-full transition-colors hover:bg-white/15",
          button,
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** Aviso breve que aparece abajo y se oculta solo. */
export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(timer);
  }, [message, onDone]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-32 z-30 flex justify-center px-6"
    >
      {message && (
        <p
          key={message}
          className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-foreground/90 px-4 py-2.5 text-[15px] font-medium text-white shadow-[0_12px_30px_-8px_rgba(14,30,54,0.5)] backdrop-blur duration-200"
        >
          {message}
        </p>
      )}
    </div>
  );
}

/** Diálogo modal nativo para decisiones que no se pueden deshacer. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="sheet mx-auto mt-auto mb-0 w-full max-w-[420px] rounded-t-[28px] bg-card px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-card-foreground shadow-[0_-20px_60px_-20px_rgba(14,30,54,0.45)] backdrop:bg-[rgba(14,30,54,0.35)] sm:mb-auto sm:max-w-[380px] sm:rounded-[28px] sm:pt-6"
    >
      <div aria-hidden className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-secondary sm:hidden" />
      <h2 id={titleId} className="font-display text-[24px] font-bold text-foreground">
        {title}
      </h2>
      <div className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{body}</div>
      <div className="mt-6 flex flex-col gap-2">
        <Btn full onClick={onConfirm}>
          {confirmLabel}
        </Btn>
        <Btn full variant="outline" onClick={onCancel} autoFocus>
          {cancelLabel}
        </Btn>
      </div>
    </dialog>
  );
}

/** Barra fija abajo de la pantalla para la acción principal. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="material sticky bottom-0 z-20 mt-auto px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] [mask-image:none] shadow-[0_-1px_0_var(--separator)]">
      {children}
    </div>
  );
}

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("animate-in fade-in duration-200", className)}>{children}</div>;
}
