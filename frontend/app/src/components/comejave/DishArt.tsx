import { findMenuEntryByItemId } from "@/lib/comejave-data";
import { cn } from "@/lib/utils";

/**
 * Ilustraciones propias de cada plato, vistas desde arriba.
 * Reemplazan los emojis: se ven igual en todos los dispositivos y tienen la
 * identidad de color de cada restaurante.
 */

type Kind = "pasta" | "pizza" | "bowl" | "salad";

type Spec = { kind: Kind; sauce: string; top: string; extra: string };

const SPECS: Record<string, Spec> = {
  // Ventolini: pastas
  p1: { kind: "pasta", sauce: "#C2381F", top: "#8B2A16", extra: "#4E8F3A" },
  p2: { kind: "pasta", sauce: "#F4E7C5", top: "#E9D49B", extra: "#C9A44A" },
  p3: { kind: "pasta", sauce: "#5E9B3C", top: "#3F7A2A", extra: "#F2E3A6" },
  // Ventolini: pizzas
  z1: { kind: "pizza", sauce: "#D2462A", top: "#FFF6DF", extra: "#3E8A35" },
  z2: { kind: "pizza", sauce: "#D2462A", top: "#A8261A", extra: "#FFE7A8" },
  z3: { kind: "pizza", sauce: "#D2462A", top: "#F6C632", extra: "#F2A0A0" },
  // La Frute: bowls
  b1: { kind: "bowl", sauce: "#5B2A6E", top: "#F6D35B", extra: "#E8445A" },
  b2: { kind: "bowl", sauce: "#E9D7A9", top: "#5E9B3C", extra: "#C98A4B" },
  b3: { kind: "bowl", sauce: "#F6A92C", top: "#FFE27A", extra: "#FFFFFF" },
  // La Frute: ensaladas
  e1: { kind: "salad", sauce: "#7DBF4E", top: "#E9C77B", extra: "#F4EFE0" },
  e2: { kind: "salad", sauce: "#6FB043", top: "#E2452F", extra: "#2E2A2A" },
  e3: { kind: "salad", sauce: "#3F8F3A", top: "#9ED36A", extra: "#DDEFC3" },
};

const CATEGORY_SPEC: Record<string, Spec> = {
  pastas: SPECS["p1"]!,
  pizzas: SPECS["z2"]!,
  bowls: SPECS["b1"]!,
  ensaladas: SPECS["e2"]!,
};

function Pasta({ s }: { s: Spec }) {
  // Nido de pasta: varios aros ondulados que llenan el plato.
  const rings = [40, 33, 26, 19];
  return (
    <>
      <circle cx="60" cy="60" r="56" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="55" fill="none" stroke="#E3E7EE" strokeWidth="2" />
      <g fill="none" strokeLinecap="round">
        {rings.map((r, i) => (
          <circle
            key={r}
            cx="60"
            cy="60"
            r={r}
            stroke={i % 2 ? "#F0BC50" : "#F6CF72"}
            strokeWidth="7"
            strokeDasharray={`${r * 1.1} ${r * 0.25}`}
            transform={`rotate(${i * 47} 60 60)`}
          />
        ))}
      </g>
      <path
        d="M38 56c2-12 16-20 28-16 14 2 20 16 14 26-6 12-24 16-34 10-8-4-10-12-8-20z"
        fill={s.sauce}
      />
      <g fill={s.top}>
        <circle cx="52" cy="54" r="4.5" />
        <circle cx="66" cy="50" r="4" />
        <circle cx="64" cy="66" r="4.5" />
        <circle cx="52" cy="66" r="3" />
      </g>
      <ellipse cx="78" cy="44" rx="9" ry="5" fill={s.extra} transform="rotate(-35 78 44)" />
      <ellipse cx="84" cy="54" rx="8" ry="4.5" fill={s.extra} transform="rotate(15 84 54)" />
      <g fill="#FFF8E7" opacity="0.9">
        <rect x="44" y="40" width="5" height="3" rx="1" transform="rotate(20 46 41)" />
        <rect x="70" y="72" width="5" height="3" rx="1" transform="rotate(-30 72 73)" />
      </g>
    </>
  );
}

function Pizza({ s }: { s: Spec }) {
  const dots = [
    [44, 46],
    [70, 40],
    [80, 64],
    [56, 72],
    [40, 66],
    [62, 56],
  ] as const;
  return (
    <>
      <circle cx="60" cy="60" r="56" fill="#E59A45" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#C97C2E" strokeWidth="3" />
      <circle cx="60" cy="60" r="46" fill={s.sauce} />
      <path
        d="M24 56c6-14 24-20 34-14 12-10 32-2 34 12 8 8 2 26-10 26-6 10-26 12-34 4-14 2-28-12-24-28z"
        fill="#FFE3A3"
        opacity="0.9"
      />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6.5" fill={s.top} />
      ))}
      <ellipse cx="52" cy="38" rx="6" ry="3" fill={s.extra} transform="rotate(-20 52 38)" />
      <ellipse cx="78" cy="78" rx="6" ry="3" fill={s.extra} transform="rotate(30 78 78)" />
      <g stroke="#C97C2E" strokeWidth="1.5" opacity="0.55">
        <path d="M60 4v112M4 60h112M20 20l80 80M100 20l-80 80" />
      </g>
    </>
  );
}

function Bowl({ s }: { s: Spec }) {
  return (
    <>
      <circle cx="60" cy="60" r="56" fill="#1F3A5F" />
      <circle cx="60" cy="60" r="48" fill={s.sauce} />
      <path d="M22 60a38 38 0 0 1 38-38v38z" fill={s.top} opacity="0.95" />
      <g fill={s.extra}>
        <circle cx="74" cy="44" r="7" />
        <circle cx="86" cy="58" r="6" />
        <circle cx="70" cy="62" r="5" />
      </g>
      <g fill="#FFF7E6" stroke="#E9C77B" strokeWidth="2">
        <circle cx="46" cy="76" r="8" />
        <circle cx="62" cy="84" r="8" />
        <circle cx="78" cy="78" r="7" />
      </g>
      <g fill="#C98A4B">
        <circle cx="36" cy="40" r="2.2" />
        <circle cx="44" cy="34" r="2" />
        <circle cx="32" cy="50" r="2" />
        <circle cx="50" cy="44" r="1.8" />
      </g>
    </>
  );
}

function Salad({ s }: { s: Spec }) {
  const leaves = [
    [42, 44, -30],
    [70, 38, 25],
    [84, 62, 70],
    [62, 80, -10],
    [38, 70, 40],
    [58, 58, 0],
  ] as const;
  return (
    <>
      <circle cx="60" cy="60" r="56" fill="#FFFFFF" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#E6E9EF" strokeWidth="2" />
      <circle cx="60" cy="60" r="46" fill="#EAF4E2" />
      {leaves.map(([x, y, r]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx="15"
          ry="9"
          fill={s.sauce}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <g fill={s.top}>
        <circle cx="50" cy="52" r="5" />
        <circle cx="72" cy="56" r="5" />
        <circle cx="60" cy="70" r="5" />
      </g>
      <g fill={s.extra}>
        <rect x="64" y="40" width="9" height="9" rx="2" transform="rotate(15 68 44)" />
        <rect x="40" y="62" width="8" height="8" rx="2" transform="rotate(-20 44 66)" />
        <rect x="76" y="70" width="7" height="7" rx="2" />
      </g>
    </>
  );
}

function Art({ spec, className }: { spec: Spec; className?: string | undefined }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn("block", className)}>
      {spec.kind === "pasta" && <Pasta s={spec} />}
      {spec.kind === "pizza" && <Pizza s={spec} />}
      {spec.kind === "bowl" && <Bowl s={spec} />}
      {spec.kind === "salad" && <Salad s={spec} />}
    </svg>
  );
}

/** Ilustración de un plato por su id del menú (p1, z2, b3…). */
export function DishArt({ itemId, className }: { itemId: string; className?: string }) {
  const spec = SPECS[itemId] ?? CATEGORY_SPEC[findMenuEntryByItemId(itemId)?.category.id ?? ""];
  return spec ? <Art spec={spec} className={className} /> : null;
}

/** Ilustración representativa de una categoría (pastas, pizzas, bowls, ensaladas). */
export function CategoryArt({ categoryId, className }: { categoryId: string; className?: string }) {
  const spec = CATEGORY_SPEC[categoryId];
  return spec ? <Art spec={spec} className={className} /> : null;
}
