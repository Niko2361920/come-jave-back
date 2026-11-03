import type { ReactNode } from "react";
import { f, paint, scatter } from "./kit";
import { Leaf, Radial, Shine, type DishProps } from "./parts";

/** Bowl visto desde arriba: borde de cerámica y fondo hondo con la base del plato. */
function BowlShell({
  uid,
  base,
  children,
}: {
  uid: string;
  base: readonly (readonly [number, string])[];
  children: ReactNode;
}) {
  return (
    <>
      <defs>
        <Radial
          id={`${uid}-rim`}
          stops={[
            [0, "#FFFFFF"],
            [0.78, "#F3F5F9"],
            [1, "#CFD7E3"],
          ]}
        />
        <Radial id={`${uid}-base`} stops={base} />
      </defs>
      <circle cx="60" cy="60" r="58" fill={paint(uid, "rim")} />
      <circle cx="60" cy="60" r="57.4" fill="none" stroke="#BFC9D9" strokeWidth="1" />
      <circle cx="60" cy="60" r="50.5" fill="#DCE2EC" />
      <circle cx="60" cy="60" r="47" fill={paint(uid, "base")} />
      <circle
        cx="60"
        cy="60"
        r="47"
        fill="none"
        stroke="#000"
        strokeOpacity=".12"
        strokeWidth="2"
      />
      {children}
      <Shine uid={uid} />
    </>
  );
}

function Banana({ x, y, rot = 0, r = 5.4 }: { x: number; y: number; rot?: number; r?: number }) {
  return (
    <g transform={`rotate(${f(rot)} ${f(x)} ${f(y)})`}>
      <circle cx={f(x + 0.5)} cy={f(y + 0.8)} r={f(r)} fill="#5A3A10" fillOpacity=".3" />
      <circle cx={f(x)} cy={f(y)} r={f(r)} fill="#FBE9A6" stroke="#E9C766" strokeWidth=".9" />
      <circle cx={f(x)} cy={f(y)} r={f(r * 0.55)} fill="#FFF6CF" />
      <circle cx={f(x - 1)} cy={f(y - 0.6)} r=".5" fill="#B8913A" />
      <circle cx={f(x + 1.2)} cy={f(y + 0.8)} r=".5" fill="#B8913A" />
    </g>
  );
}

function Strawberry({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})`}>
      <path
        d="M0-6C6.5-6 7.5 1 0 7.5C-7.5 1-6.5-6 0-6Z"
        fill="#6B1020"
        fillOpacity=".3"
        transform="translate(.6 .9)"
      />
      <path d="M0-6C6.5-6 7.5 1 0 7.5C-7.5 1-6.5-6 0-6Z" fill="#E3364B" />
      <path d="M0-3.5C3.4-3.5 4 0.6 0 4.6C-4 0.6-3.4-3.5 0-3.5Z" fill="#F7A0A8" />
      <path d="M-3.6-6.2L0-4.4L3.6-6.2L2-7.8L0-6.6L-2-7.8Z" fill="#3E9B3A" />
    </g>
  );
}

function Blueberry({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={f(x + 0.4)} cy={f(y + 0.7)} r="3.6" fill="#0F1646" fillOpacity=".35" />
      <circle cx={f(x)} cy={f(y)} r="3.6" fill="#3340A0" />
      <circle cx={f(x - 1.1)} cy={f(y - 1.2)} r="1.1" fill="#8FA0F0" fillOpacity=".8" />
      <circle cx={f(x + 0.4)} cy={f(y + 0.3)} r=".9" fill="#1B2270" />
    </g>
  );
}

function Flake({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <rect
      x={f(x - 2.4)}
      y={f(y - 1)}
      width="4.8"
      height="2"
      rx="1"
      fill="#FFFFFF"
      stroke="#E7E1D4"
      strokeWidth=".3"
      transform={`rotate(${f(rot)} ${f(x)} ${f(y)})`}
    />
  );
}

/** Bowl de açaí: base morada con granola, banano, fresa y arándanos. */
export function BowlAcai({ uid }: DishProps) {
  const granola = scatter(11, 11, 4, 40, 44);
  const berries = scatter(7, 12, 9, 62, 56);
  const flakes = scatter(9, 14, 22, 60, 60);
  return (
    <BowlShell
      uid={uid}
      base={[
        [0, "#8A44A8"],
        [0.7, "#5E2279"],
        [1, "#431659"],
      ]}
    >
      <g fill="none" stroke="#B880CF" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round">
        <path d="M28 70q14 10 30 4" />
        <path d="M66 36q12-2 18 8" />
      </g>
      {granola.map((g, i) => (
        <rect
          key={i}
          x={f(g.x - 2.6)}
          y={f(g.y - 1.8)}
          width={f(4 + g.k * 2.2)}
          height={f(3 + g.k * 1.4)}
          rx="1.4"
          fill={i % 2 ? "#B27B42" : "#C99458"}
          stroke="#8A5A28"
          strokeWidth=".4"
          transform={`rotate(${f(g.rot)} ${f(g.x)} ${f(g.y)})`}
        />
      ))}
      {[
        [76, 46, 10],
        [86, 58, -20],
        [74, 61, 30],
        [84, 44, 0],
      ].map(([x, y, r], i) => (
        <Banana key={i} x={x!} y={y!} rot={r!} />
      ))}
      <Strawberry x={50} y={82} rot={-30} s={1.15} />
      <Strawberry x={64} y={86} rot={15} s={1.2} />
      <Strawberry x={78} y={78} rot={50} s={1.1} />
      {berries.map((b, i) => (
        <Blueberry key={i} x={b.x} y={b.y} />
      ))}
      {flakes.map((p, i) => (
        <Flake key={i} x={p.x} y={p.y} rot={p.rot} />
      ))}
    </BowlShell>
  );
}

/** Bowl proteico: quinoa con pollo a la plancha, aguacate, tomate cherry y espinaca. */
export function BowlProteico({ uid }: DishProps) {
  const grains = scatter(46, 44, 31);
  const spinach = scatter(6, 12, 8, 40, 42);
  const sesame = scatter(14, 40, 52);
  const corn = scatter(16, 15, 44, 42, 58);
  const greens = scatter(5, 9, 18, 76, 82);
  return (
    <BowlShell
      uid={uid}
      base={[
        [0, "#F1E2B8"],
        [1, "#DCC58B"],
      ]}
    >
      {grains.map((g, i) => (
        <circle
          key={i}
          cx={f(g.x)}
          cy={f(g.y)}
          r={f(0.7 + g.k * 0.5)}
          fill={i % 3 ? "#D2B972" : "#F8EDCB"}
        />
      ))}
      {spinach.map((s, i) => (
        <Leaf
          centered
          key={i}
          x={s.x}
          y={s.y}
          rot={s.rot}
          len={13}
          wid={5}
          fill={i % 2 ? "#2F7F34" : "#43963C"}
        />
      ))}
      {greens.map((s, i) => (
        <Leaf
          centered
          key={`g${i}`}
          x={s.x}
          y={s.y}
          rot={s.rot}
          len={12}
          wid={4.6}
          fill={i % 2 ? "#3B8F38" : "#54A844"}
        />
      ))}
      {corn.map((c, i) => (
        <circle
          key={`c${i}`}
          cx={f(c.x)}
          cy={f(c.y)}
          r="2"
          fill="#F5C93A"
          stroke="#D9A61A"
          strokeWidth=".4"
        />
      ))}
      {[
        [78, 38, 25],
        [84, 49, 40],
        [86, 61, 60],
        [80, 71, 80],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <rect
            x={f(x! - 8 + 0.6)}
            y={f(y! - 4.4 + 0.9)}
            width="16"
            height="8.8"
            rx="3.4"
            fill="#6A4416"
            fillOpacity=".3"
          />
          <rect
            x={f(x! - 8)}
            y={f(y! - 4.4)}
            width="16"
            height="8.8"
            rx="3.4"
            fill="#F0CE98"
            stroke="#D1A261"
            strokeWidth=".8"
          />
          <path
            d={`M${f(x! - 4)} ${f(y! - 3)}l3 6M${f(x!)} ${f(y! - 3)}l3 6M${f(x! + 4)} ${f(y! - 3)}l3 6`}
            stroke="#A9743A"
            strokeOpacity=".7"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      ))}
      {[-48, -24, 0, 24, 48].map((a, i) => (
        <g key={i} transform={`rotate(${a + 90} 54 84)`}>
          <ellipse
            cx="54"
            cy="70"
            rx="3.6"
            ry="11"
            fill="#2F5A1A"
            fillOpacity=".35"
            transform="translate(.6 .8)"
          />
          <ellipse
            cx="54"
            cy="70"
            rx="3.6"
            ry="11"
            fill="#CFE27A"
            stroke="#4B7F2A"
            strokeWidth="1"
          />
          <ellipse cx="54" cy="70" rx="1.6" ry="8" fill="#E9F3A8" />
        </g>
      ))}
      {[
        [38, 70],
        [46, 80],
        [66, 80],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={f(x! + 0.5)} cy={f(y! + 0.8)} r="4.9" fill="#5A0F08" fillOpacity=".35" />
          <circle cx={x} cy={y} r="4.9" fill="#E2412C" />
          <circle cx={f(x! - 1.5)} cy={f(y! - 1.6)} r="1.4" fill="#fff" fillOpacity=".7" />
          <circle cx={x} cy={f(y! - 4.6)} r=".9" fill="#2F7F34" />
        </g>
      ))}
      {sesame.map((s, i) => (
        <ellipse
          key={i}
          cx={f(s.x)}
          cy={f(s.y)}
          rx=".9"
          ry=".5"
          fill="#FFF8E0"
          transform={`rotate(${f(s.rot)} ${f(s.x)} ${f(s.y)})`}
        />
      ))}
    </BowlShell>
  );
}

function Kiwi({ x, y }: { x: number; y: number }) {
  const seeds = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  return (
    <g>
      <circle cx={f(x + 0.5)} cy={f(y + 0.8)} r="6" fill="#1F4A10" fillOpacity=".3" />
      <circle cx={x} cy={y} r="6" fill="#7BB73A" stroke="#5C9A26" strokeWidth=".8" />
      <circle cx={x} cy={y} r="4.6" fill="#B9DD6B" />
      <circle cx={x} cy={y} r="1.5" fill="#EFF8C8" />
      {seeds.map((a, i) => (
        <circle
          key={i}
          cx={f(x + Math.cos(a) * 3.1)}
          cy={f(y + Math.sin(a) * 3.1)}
          r=".5"
          fill="#2A3A12"
        />
      ))}
    </g>
  );
}

/** Bowl tropical: yogur con mango, piña, kiwi, maracuyá y coco. */
export function BowlTropical({ uid }: DishProps) {
  const mango = scatter(11, 23, 12, 52, 48);
  const pineapple = scatter(9, 21, 25, 70, 70);
  const flakes = scatter(10, 28, 61);
  return (
    <BowlShell
      uid={uid}
      base={[
        [0, "#FFF7D6"],
        [1, "#F6DC8E"],
      ]}
    >
      {mango.map((m, i) => (
        <g key={i} transform={`rotate(${f(m.rot)} ${f(m.x)} ${f(m.y)})`}>
          <rect
            x={f(m.x - 4.2 + 0.6)}
            y={f(m.y - 4.2 + 0.9)}
            width="8.4"
            height="8.4"
            rx="1.8"
            fill="#8A4A08"
            fillOpacity=".3"
          />
          <rect
            x={f(m.x - 4.2)}
            y={f(m.y - 4.2)}
            width="8.4"
            height="8.4"
            rx="1.8"
            fill={i % 2 ? "#FDA724" : "#FFB63B"}
          />
          <rect
            x={f(m.x - 3.2)}
            y={f(m.y - 3.2)}
            width="4.6"
            height="2"
            rx="1"
            fill="#FFE29A"
            fillOpacity=".8"
          />
        </g>
      ))}
      {pineapple.map((p, i) => (
        <g key={i} transform={`rotate(${f(p.rot)} ${f(p.x)} ${f(p.y)})`}>
          <path
            d={`M${f(p.x - 4.6)} ${f(p.y - 3.4)}h9.2l-1.6 6.8h-6z`}
            fill="#FBE04A"
            stroke="#E0B91C"
            strokeWidth=".7"
            strokeLinejoin="round"
          />
          <path
            d={`M${f(p.x - 2.6)} ${f(p.y - 1.4)}h4.6`}
            stroke="#FFF4B0"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      ))}
      <Kiwi x={36} y={74} />
      <Kiwi x={50} y={84} />
      {/* Maracuyá */}
      <g>
        <circle cx="75.5" cy="40.8" r="8.2" fill="#6A3A08" fillOpacity=".3" />
        <circle cx="75" cy="40" r="8.2" fill="#E98E1E" />
        <circle cx="75" cy="40" r="6" fill="#FFD84A" />
        {[
          [72.4, 38],
          [76, 36.8],
          [77.6, 40.4],
          [73.6, 42.2],
          [75.4, 40],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx=".9" ry="1.3" fill="#3A2A14" />
        ))}
      </g>
      {flakes.map((p, i) => (
        <Flake key={i} x={p.x} y={p.y} rot={p.rot} />
      ))}
      <Leaf x={58} y={36} rot={-60} len={10} wid={3.8} fill="#3E9B3C" />
      <Leaf x={60} y={36} rot={-110} len={9} wid={3.4} fill="#56B24A" />
    </BowlShell>
  );
}
