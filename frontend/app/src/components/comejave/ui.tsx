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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        full && "w-full",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        variant === "accent" &&
          "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover",
        variant === "outline" &&
          "border border-border bg-background text-foreground hover:bg-secondary active:bg-secondary",
        variant === "ghost" && "text-primary hover:bg-secondary active:bg-secondary",
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
      <label htmlFor={inputId} className="mb-2 block text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
          className={cn(
            "w-full rounded-xl border bg-card px-4 py-3.5 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary",
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
      className="flex items-center gap-1 rounded-full bg-accent p-0.5 text-accent-foreground"
      role="group"
      aria-label={`Cantidad de ${name}`}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={qty === 1 ? `Quitar ${name}` : `Quitar uno de ${name}`}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors hover:bg-accent-hover",
          button,
        )}
      >
        {qty === 1 ? (
          <Trash2 className="h-4 w-4" strokeWidth={2.25} />
        ) : (
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
      <span className="min-w-5 text-center text-[15px] font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Agregar otro ${name}`}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors hover:bg-accent-hover",
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
          className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground shadow-[0_10px_30px_rgba(13,45,90,0.3)] duration-200"
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
      className="m-auto w-[min(360px,calc(100vw-2rem))] rounded-3xl bg-card p-6 text-card-foreground shadow-[0_24px_60px_rgba(13,45,90,0.3)] backdrop:bg-primary/40"
    >
      <h2 id={titleId} className="text-xl font-bold tracking-tight text-primary">
        {title}
      </h2>
      <div className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</div>
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
    <div className="sticky bottom-0 z-20 mt-auto border-t border-border/70 bg-background/95 px-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur">
      {children}
    </div>
  );
}

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-right-3 duration-300", className)}>
      {children}
    </div>
  );
}
