import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { ArrowLeft, Eye, EyeOff, ShoppingCart } from "lucide-react";
import { Field } from "@/components/comejave/ui";
import { cn } from "@/lib/utils";

export function Brand() {
  return (
    <div className="text-center">
      <div
        aria-hidden
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[var(--primary)] to-[#123c79] text-4xl text-white shadow-[0_12px_25px_rgba(13,45,90,0.28)]"
      >
        🍽️
      </div>
      <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-primary">
        Come <span className="rounded-lg bg-accent px-2 py-1 text-accent-foreground">Jave</span>
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground">
        Pide en Ventolini y La Frute sin hacer fila
      </p>
    </div>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Volver"
        onClick={onBack}
        className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-accent-soft active:bg-accent-soft"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <div className="min-w-0 flex-1">
        {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
        <h2 className="truncate text-2xl font-bold tracking-tight text-primary">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function CartButton({
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
      type="button"
      aria-label={count ? `Carrito, ${count} ${count === 1 ? "plato" : "platos"}` : "Carrito vacío"}
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

/** Campo de contraseña con botón para mostrar/ocultar. */
export function PasswordField({
  label = "Contraseña",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  hint?: string | undefined;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      label={label}
      type={visible ? "text" : "password"}
      placeholder="••••••••"
      {...props}
      endAdornment={
        <button
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((previous) => !previous)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}
