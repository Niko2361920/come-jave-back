import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { ChevronLeft, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { Field } from "@/components/comejave/ui";
import { cn } from "@/lib/utils";

/** Botón redondo de solo ícono. `onColor` se usa sobre fondos de color. */
export function IconButton({
  label,
  onClick,
  onColor,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  onColor?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "pressable relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
        onColor
          ? "bg-white/18 text-white backdrop-blur-md hover:bg-white/28"
          : "bg-card text-primary shadow-[0_1px_2px_rgba(14,30,54,0.08)] ring-1 ring-separator hover:bg-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BackButton({ onBack, onColor }: { onBack: () => void; onColor?: boolean }) {
  return (
    <IconButton label="Volver" onClick={onBack} {...(onColor ? { onColor } : {})}>
      <ChevronLeft className="h-6 w-6 -translate-x-px" strokeWidth={2.25} />
    </IconButton>
  );
}

/** Encabezado con título grande, al estilo de las apps de iOS. */
export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: ReactNode;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <BackButton onBack={onBack} />
        {right}
      </div>
      <div>
        <h2 className="font-display text-[34px] font-bold text-foreground">{title}</h2>
        {subtitle && <div className="mt-1.5 text-[15px] text-muted-foreground">{subtitle}</div>}
      </div>
    </header>
  );
}

export function CartButton({
  count,
  onClick,
  onColor,
}: {
  count: number;
  onClick: () => void;
  onColor?: boolean;
}) {
  // El contador rebota cuando aumenta, como confirmación de que el plato entró.
  const previous = useRef(count);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count > previous.current) setBump((n) => n + 1);
    previous.current = count;
  }, [count]);

  return (
    <IconButton
      label={count ? `Carrito, ${count} ${count === 1 ? "plato" : "platos"}` : "Carrito vacío"}
      onClick={onClick}
      {...(onColor ? { onColor } : {})}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={2} />
      {count > 0 && (
        <span
          key={bump}
          className={cn(
            "absolute -right-1 -top-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent px-1.5 text-[12px] font-bold text-accent-foreground ring-2",
            onColor ? "ring-transparent" : "ring-background",
            bump > 0 && "bump",
          )}
        >
          {count}
        </span>
      )}
    </IconButton>
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
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
    />
  );
}
