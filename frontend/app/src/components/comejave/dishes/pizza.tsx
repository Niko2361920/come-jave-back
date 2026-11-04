import { blob, f, paint, ring, scatter } from "./kit";
import { Leaf, Radial, Shine, type DishProps } from "./parts";

/** Masa, borde tostado y salsa: la base común de las tres pizzas. */
function Base({ uid }: DishProps) {
  const char = ring(14, 52.5, 17);
  return (
    <>
      <defs>
        <Radial
          id={`${uid}-crust`}
          stops={[
            [0, "#F6C277"],
            [0.8, "#E8A04C"],
            [1, "#C27526"],
          ]}
        />
        <Radial
          id={`${uid}-tomato`}
          stops={[
            [0, "#E5522F"],
            [1, "#B93219"],
          ]}
        />
      </defs>
      <circle cx="60" cy="60" r="58" fill={paint(uid, "crust")} />
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke="#B26A22"
        strokeWidth="1.2"
        strokeOpacity=".7"
      />
      {char.map((c, i) => (
        <ellipse
          key={i}
          cx={f(c.x)}
          cy={f(c.y)}
          rx={f(1.6 + c.k * 2.4)}
          ry={f(1 + c.k * 1.2)}
          fill="#8A4A1C"
          fillOpacity=".45"
          transform={`rotate(${f(c.rot)} ${f(c.x)} ${f(c.y)})`}
        />
      ))}
      <circle cx="60" cy="60" r="48" fill={paint(uid, "tomato")} />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="#9E2812"
        strokeOpacity=".35"
        strokeWidth="1.5"
      />
    </>
  );
}

/** Queso derretido con burbujas doradas. */
function Cheese({ uid }: DishProps) {
  const bubbles = scatter(9, 30, 51);
  return (
    <>
      <defs>
        <Radial
          id={`${uid}-cheese`}
          stops={[
            [0, "#FFF0B8"],
            [0.7, "#F9D36F"],
            [1, "#EDB947"],
          ]}
        />
      </defs>
      <path d={blob(60, 60, 43, 5, 12, 0.14)} fill={paint(uid, "cheese")} />
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={f(b.x)}
          cy={f(b.y)}
          r={f(1.6 + b.k * 2.4)}
          fill="#E5A83A"
          fillOpacity=".4"
        />
      ))}
    </>
  );
}

/** Cortes de la pizza en 8 porciones. */
function Cuts() {
  return (
    <g stroke="#7A4112" strokeOpacity=".32" strokeWidth="1" strokeLinecap="round">
      <path d="M60 3V117M3 60H117M20 20L100 100M100 20L20 100" />
    </g>
  );
}

/** Margarita: salsa, mozzarella fresca y albahaca. */
export function Margarita({ uid }: DishProps) {
  const cheese = scatter(7, 29, 8);
  const leaves = scatter(6, 31, 19);
  const specks = scatter(14, 38, 28);
  return (
    <>
      <Base uid={uid} />
      {specks.map((s, i) => (
        <circle key={i} cx={f(s.x)} cy={f(s.y)} r=".8" fill="#3F7A2A" fillOpacity=".7" />
      ))}
      {cheese.map((c, i) => (
        <g key={i}>
          <circle
            cx={f(c.x + 0.6)}
            cy={f(c.y + 0.9)}
            r={f(8 + c.k * 1.5)}
            fill="#7A2410"
            fillOpacity=".3"
          />
          <circle cx={f(c.x)} cy={f(c.y)} r={f(8 + c.k * 1.5)} fill="#FFFDF3" />
          <circle
            cx={f(c.x - 1.5)}
            cy={f(c.y - 1.8)}
            r={f(4 + c.k)}
            fill="#FFFFFF"
            fillOpacity=".8"
          />
          <circle
            cx={f(c.x)}
            cy={f(c.y)}
            r={f(8 + c.k * 1.5)}
            fill="none"
            stroke="#EADFBF"
            strokeWidth=".8"
          />
        </g>
      ))}
      {leaves.map((l, i) => (
        <Leaf
          centered
          key={i}
          x={l.x}
          y={l.y}
          rot={l.rot}
          len={13}
          wid={4.8}
          fill={i % 2 ? "#2E7D32" : "#3C9140"}
        />
      ))}
      <Cuts />
      <Shine uid={uid} />
    </>
  );
}

/** Pepperoni: queso y rodajas con grasa brillante. */
export function Pepperoni({ uid }: DishProps) {
  const slices = scatter(11, 34, 3);
  return (
    <>
      <Base uid={uid} />
      <Cheese uid={uid} />
      <defs>
        <Radial
          id={`${uid}-pep`}
          stops={[
            [0, "#D8402A"],
            [0.75, "#B02417"],
            [1, "#8A160D"],
          ]}
        />
      </defs>
      {slices.map((s, i) => {
        const r = 6.4 + s.k * 0.9;
        return (
          <g key={i}>
            <circle cx={f(s.x + 0.6)} cy={f(s.y + 0.9)} r={f(r)} fill="#5A1209" fillOpacity=".35" />
            <circle cx={f(s.x)} cy={f(s.y)} r={f(r)} fill={paint(uid, "pep")} />
            <circle cx={f(s.x - 2)} cy={f(s.y - 1.4)} r="1.1" fill="#F7B79F" fillOpacity=".85" />
            <circle cx={f(s.x + 2.2)} cy={f(s.y + 1.6)} r=".9" fill="#F7B79F" fillOpacity=".7" />
            <circle cx={f(s.x + 0.4)} cy={f(s.y - 2.8)} r=".7" fill="#F7B79F" fillOpacity=".7" />
            <circle
              cx={f(s.x)}
              cy={f(s.y)}
              r={f(r)}
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity=".15"
              strokeWidth=".8"
            />
          </g>
        );
      })}
      <Cuts />
      <Shine uid={uid} />
    </>
  );
}

/** Hawaiana: jamón rosado y trozos de piña. */
export function Hawaiana({ uid }: DishProps) {
  const ham = scatter(8, 32, 6);
  const pine = scatter(8, 32, 15);
  const herbs = scatter(10, 38, 40);
  return (
    <>
      <Base uid={uid} />
      <Cheese uid={uid} />
      {ham.map((h, i) => (
        <g key={i} transform={`rotate(${f(h.rot)} ${f(h.x)} ${f(h.y)})`}>
          <rect
            x={f(h.x - 5.4 + 0.6)}
            y={f(h.y - 4.2 + 0.9)}
            width="10.8"
            height="8.4"
            rx="2"
            fill="#7A2A2A"
            fillOpacity=".3"
          />
          <rect
            x={f(h.x - 5.4)}
            y={f(h.y - 4.2)}
            width="10.8"
            height="8.4"
            rx="2"
            fill={i % 2 ? "#F0A1A1" : "#F7B4B0"}
          />
          <rect
            x={f(h.x - 4.4)}
            y={f(h.y - 3.4)}
            width="7"
            height="2"
            rx="1"
            fill="#fff"
            fillOpacity=".4"
          />
        </g>
      ))}
      {pine.map((p, i) => (
        <g key={i} transform={`rotate(${f(p.rot)} ${f(p.x)} ${f(p.y)})`}>
          <path
            d={`M${f(p.x - 5)} ${f(p.y - 3.5)}h10l-1.6 7h-6.8z`}
            fill="#F9D63A"
            stroke="#E2B312"
            strokeWidth=".7"
            strokeLinejoin="round"
          />
          <path
            d={`M${f(p.x - 3)} ${f(p.y - 1.5)}h5`}
            stroke="#FFF2A8"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      ))}
      {herbs.map((h, i) => (
        <circle key={i} cx={f(h.x)} cy={f(h.y)} r=".7" fill="#3F7A2A" fillOpacity=".8" />
      ))}
      <Cuts />
      <Shine uid={uid} />
    </>
  );
}
