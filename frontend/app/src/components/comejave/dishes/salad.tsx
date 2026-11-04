import { f, rng, scatter } from "./kit";
import { Leaf, Plate, Shine, type DishProps } from "./parts";

/** Cama de hojas: cada hoja lleva su sombra para que se vean apiladas. */
function Bed({
  count,
  seed,
  tones,
  len = 22,
  wid = 8.6,
}: {
  count: number;
  seed: number;
  tones: readonly string[];
  len?: number;
  wid?: number;
}) {
  const leaves = scatter(count, 33, seed);
  return (
    <g>
      {leaves.map((l, i) => (
        <g key={i}>
          <Leaf
            centered
            x={l.x + 0.8}
            y={l.y + 1}
            rot={l.rot}
            len={len}
            wid={wid}
            fill="rgba(10,40,10,.28)"
          />
          <Leaf
            centered
            x={l.x}
            y={l.y}
            rot={l.rot}
            len={len}
            wid={wid}
            fill={tones[i % tones.length]!}
          />
        </g>
      ))}
    </g>
  );
}

function Cherry({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={f(x + 0.5)} cy={f(y + 0.9)} r={f(r)} fill="#4A0C06" fillOpacity=".35" />
      <circle cx={f(x)} cy={f(y)} r={f(r)} fill="#E1412B" />
      <circle
        cx={f(x - r * 0.35)}
        cy={f(y - r * 0.4)}
        r={f(r * 0.28)}
        fill="#fff"
        fillOpacity=".75"
      />
      <circle cx={f(x)} cy={f(y - r * 0.85)} r={f(r * 0.2)} fill="#2F7F34" />
    </g>
  );
}

function Cucumber({ x, y, r = 5.6 }: { x: number; y: number; r?: number }) {
  const seeds = [0, 1.3, 2.6, 3.9, 5.2];
  return (
    <g>
      <circle cx={f(x + 0.5)} cy={f(y + 0.9)} r={f(r)} fill="#143A10" fillOpacity=".3" />
      <circle cx={f(x)} cy={f(y)} r={f(r)} fill="#4D9A3A" />
      <circle cx={f(x)} cy={f(y)} r={f(r * 0.82)} fill="#CFE8A8" />
      <circle cx={f(x)} cy={f(y)} r={f(r * 0.5)} fill="#E6F4CB" />
      {seeds.map((a, i) => (
        <ellipse
          key={i}
          cx={f(x + Math.cos(a) * r * 0.42)}
          cy={f(y + Math.sin(a) * r * 0.42)}
          rx=".7"
          ry=".4"
          fill="#9CC56A"
        />
      ))}
    </g>
  );
}

function Olive({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={f(x + 0.4)} cy={f(y + 0.8)} r="3.8" fill="#000" fillOpacity=".3" />
      <circle cx={f(x)} cy={f(y)} r="3.8" fill="#2D2927" />
      <circle cx={f(x)} cy={f(y)} r="1.4" fill="#7C705A" />
      <circle cx={f(x - 1.4)} cy={f(y - 1.4)} r=".7" fill="#fff" fillOpacity=".5" />
    </g>
  );
}

function Cube({
  x,
  y,
  rot,
  size,
  fill,
  edge,
}: {
  x: number;
  y: number;
  rot: number;
  size: number;
  fill: string;
  edge: string;
}) {
  const h = size / 2;
  return (
    <g transform={`rotate(${f(rot)} ${f(x)} ${f(y)})`}>
      <rect
        x={f(x - h + 0.6)}
        y={f(y - h + 0.9)}
        width={size}
        height={size}
        rx="1.5"
        fill="#000"
        fillOpacity=".25"
      />
      <rect
        x={f(x - h)}
        y={f(y - h)}
        width={size}
        height={size}
        rx="1.5"
        fill={fill}
        stroke={edge}
        strokeWidth=".6"
      />
      <rect
        x={f(x - h + 1)}
        y={f(y - h + 1)}
        width={f(size * 0.5)}
        height="1.6"
        rx=".8"
        fill="#fff"
        fillOpacity=".55"
      />
    </g>
  );
}

function Strip({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`rotate(${f(rot)} ${f(x)} ${f(y)})`}>
      <rect
        x={f(x - 8 + 0.6)}
        y={f(y - 3.2 + 0.9)}
        width="16"
        height="6.4"
        rx="3"
        fill="#5A3A10"
        fillOpacity=".3"
      />
      <rect
        x={f(x - 8)}
        y={f(y - 3.2)}
        width="16"
        height="6.4"
        rx="3"
        fill="#F0CE98"
        stroke="#CF9F5F"
        strokeWidth=".7"
      />
      <path
        d={`M${f(x - 4)} ${f(y - 2.2)}l2 4.4M${f(x)} ${f(y - 2.2)}l2 4.4M${f(x + 4)} ${f(y - 2.2)}l2 4.4`}
        stroke="#A9743A"
        strokeOpacity=".7"
        strokeWidth=".9"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Ensalada César: lechuga romana, pollo, crutones y láminas de parmesano. */
export function Cesar({ uid }: DishProps) {
  const croutons = scatter(8, 25, 7);
  const shavings = scatter(7, 27, 17);
  const pepper = scatter(14, 32, 29);
  return (
    <>
      <Plate uid={uid} />
      <Bed count={26} seed={5} tones={["#B6D977", "#9CCB5C", "#CFE79A", "#86BB4A"]} />
      {[
        [50, 50, 20],
        [70, 58, -25],
        [56, 72, 5],
      ].map(([x, y, r], i) => (
        <Strip key={i} x={x!} y={y!} rot={r!} />
      ))}
      {croutons.map((c, i) => (
        <g key={i} transform={`rotate(${f(c.rot)} ${f(c.x)} ${f(c.y)})`}>
          <rect
            x={f(c.x - 4 + 0.6)}
            y={f(c.y - 4 + 0.9)}
            width="8"
            height="8"
            rx="1.6"
            fill="#4A2D08"
            fillOpacity=".3"
          />
          <rect
            x={f(c.x - 4)}
            y={f(c.y - 4)}
            width="8"
            height="8"
            rx="1.6"
            fill="#E3B45A"
            stroke="#BF8A32"
            strokeWidth=".7"
          />
          <circle cx={f(c.x - 1.2)} cy={f(c.y - 1)} r=".6" fill="#B07A26" />
          <circle cx={f(c.x + 1.4)} cy={f(c.y + 1.4)} r=".6" fill="#B07A26" />
        </g>
      ))}
      {shavings.map((s, i) => (
        <path
          key={i}
          d="M-5 0q5-5 10 0q-5 2.4-10 0Z"
          fill="#FFF6CC"
          stroke="#E7D59A"
          strokeWidth=".5"
          transform={`translate(${f(s.x)} ${f(s.y)}) rotate(${f(s.rot)})`}
        />
      ))}
      <path
        d="M38 46q8-6 14 0t14 0t14 0"
        fill="none"
        stroke="#FFFCEC"
        strokeOpacity=".9"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {pepper.map((p, i) => (
        <circle key={i} cx={f(p.x)} cy={f(p.y)} r=".5" fill="#2A2420" />
      ))}
      <Shine uid={uid} />
    </>
  );
}

/** Ensalada mediterránea: tomate cherry, queso feta, aceitunas, pepino y cebolla morada. */
export function Mediterranea({ uid }: DishProps) {
  const tomatoes = scatter(7, 26, 3);
  const feta = scatter(7, 26, 19);
  const olives = scatter(7, 27, 33);
  const cucumbers = scatter(4, 27, 45);
  const oregano = scatter(18, 33, 57);
  return (
    <>
      <Plate uid={uid} />
      <Bed count={26} seed={11} tones={["#6FB043", "#8CC152", "#57A038", "#A6D36A"]} />
      {cucumbers.map((c, i) => (
        <Cucumber key={i} x={c.x} y={c.y} />
      ))}
      {[
        [44, 56, 0],
        [70, 48, 80],
        [62, 74, 150],
      ].map(([x, y, a], i) => (
        <path
          key={i}
          d="M-7 0A7 7 0 0 1 7 0"
          fill="none"
          stroke={i % 2 ? "#A83E86" : "#C4559F"}
          strokeWidth="1.8"
          strokeLinecap="round"
          transform={`translate(${x} ${y}) rotate(${a})`}
        />
      ))}
      {feta.map((c, i) => (
        <Cube key={i} x={c.x} y={c.y} rot={c.rot} size={7.4} fill="#FFFFFF" edge="#E4DEC8" />
      ))}
      {tomatoes.map((t, i) => (
        <Cherry key={i} x={t.x} y={t.y} />
      ))}
      {olives.map((o, i) => (
        <Olive key={i} x={o.x} y={o.y} />
      ))}
      {oregano.map((o, i) => (
        <circle key={i} cx={f(o.x)} cy={f(o.y)} r=".7" fill="#2F6B2A" fillOpacity=".8" />
      ))}
      <Shine uid={uid} />
    </>
  );
}

function AvocadoSlice({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      <path
        d="M-10 0Q0-8 10 0Q0 3-10 0Z"
        fill="#1F3F10"
        fillOpacity=".3"
        transform="translate(.6 1)"
      />
      <path
        d="M-10 0Q0-8 10 0Q0 3-10 0Z"
        fill="#CBE07A"
        stroke="#3F6B22"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M-6 -1.2Q0-5 6-1.2"
        fill="none"
        stroke="#EAF4B0"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Ensalada verde: espinaca, pepino, aguacate, arvejas y semillas con vinagreta. */
export function Verde({ uid }: DishProps) {
  const cucumbers = scatter(6, 28, 13);
  const peas = scatter(12, 27, 27);
  const seeds = scatter(16, 31, 39);
  const rand = rng(77);
  return (
    <>
      <Plate uid={uid} />
      <Bed count={30} seed={21} tones={["#2F7D32", "#3F9138", "#56A844", "#6DB84F"]} />
      {cucumbers.map((c, i) => (
        <Cucumber key={i} x={c.x} y={c.y} r={5.2} />
      ))}
      {[
        [48, 52, -20],
        [68, 60, 25],
        [56, 72, 70],
      ].map(([x, y, r], i) => (
        <AvocadoSlice key={i} x={x!} y={y!} rot={r!} />
      ))}
      {peas.map((p, i) => (
        <g key={i}>
          <circle cx={f(p.x + 0.4)} cy={f(p.y + 0.7)} r="2.4" fill="#0F3A0A" fillOpacity=".3" />
          <circle cx={f(p.x)} cy={f(p.y)} r="2.4" fill="#86C94F" />
          <circle cx={f(p.x - 0.8)} cy={f(p.y - 0.8)} r=".7" fill="#E9F7C5" />
        </g>
      ))}
      {seeds.map((s, i) => (
        <ellipse
          key={i}
          cx={f(s.x)}
          cy={f(s.y)}
          rx="1.3"
          ry=".7"
          fill="#F3E6B0"
          stroke="#CDB873"
          strokeWidth=".3"
          transform={`rotate(${f(s.rot)} ${f(s.x)} ${f(s.y)})`}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse
          key={i}
          cx={f(40 + rand() * 40)}
          cy={f(40 + rand() * 40)}
          rx="2.6"
          ry="1"
          fill="#fff"
          fillOpacity=".55"
          transform={`rotate(${f(rand() * 180)} 60 60)`}
        />
      ))}
      <Shine uid={uid} />
    </>
  );
}
