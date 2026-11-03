import { useState, type CSSProperties } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="radiogroup"
      aria-label="Calificación"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} estrellas`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded-md p-1 transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <Star
            // Al cambiar la calificación se vuelven a montar solo las estrellas encendidas.
            key={n <= value ? `on-${value}` : "off"}
            style={{ "--i": n } as CSSProperties}
            className={cn(
              "h-9 w-9 transition-colors",
              n <= active ? "fill-accent text-accent" : "text-input",
              n <= value && "star-pop",
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
