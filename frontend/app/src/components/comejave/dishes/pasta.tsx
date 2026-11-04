import { arcPath, blob, f, paint, rng, scatter } from "./kit";
import { Leaf, Plate, Radial, Shine, type DishProps } from "./parts";

/** Nido de pasta larga: varios hilos curvos con sombra, color y brillo. */
function Strands({
  count,
  width,
  tones,
  seed,
}: {
  count: number;
  width: number;
  tones: readonly string[];
  seed: number;
}) {
  const rand = rng(seed);
  const strands = Array.from({ length: count }, (_, i) => {
    const r = 11 + rand() * 28;
    const start = rand() * 360;
    const sweep = 130 + rand() * 150;
    return {
      d: arcPath(60, 60, r, start, start + sweep),
      tone: tones[i % tones.length]!,
      w: width * (0.85 + rand() * 0.3),
    };
  });
  return (
    <g fill="none" strokeLinecap="round">
      {strands.map((s, i) => (
        <path
          key={`s${i}`}
          d={s.d}
          stroke="#9A6A1C"
          strokeOpacity=".32"
          strokeWidth={f(s.w + 1.2)}
          transform="translate(.7 1)"
        />
      ))}
      {strands.map((s, i) => (
        <path key={`b${i}`} d={s.d} stroke={s.tone} strokeWidth={f(s.w)} />
      ))}
      {strands.map((s, i) => (
        <path
          key={`h${i}`}
          d={s.d}
          stroke="#FFFFFF"
          strokeOpacity=".4"
          strokeWidth={f(s.w * 0.26)}
          transform="translate(-.5 -.6)"
        />
      ))}
    </g>
  );
}

/** Spaghetti a la boloñesa: salsa roja con trozos de carne, albahaca y parmesano. */
export function Bolognesa({ uid }: DishProps) {
  const meat = scatter(12, 14, 7, 60, 58);
  const flakes = scatter(5, 20, 21, 60, 58);
  return (
    <>
      <Plate uid={uid} />
      <Strands count={17} width={3.4} tones={["#F4CF72", "#EBBB50", "#F8DB8E"]} seed={3} />
      <defs>
        <Radial
          id={`${uid}-sauce`}
          stops={[
            [0, "#E9573A"],
            [0.7, "#C23A1F"],
            [1, "#9C2812"],
          ]}
        />
      </defs>
      <path d={blob(60, 58, 17.5, 11)} fill={paint(uid, "sauce")} />
      {meat.map((m, i) => (
        <circle
          key={i}
          cx={f(m.x)}
          cy={f(m.y)}
          r={f(1.5 + m.k * 1.9)}
          fill={m.k > 0.5 ? "#6B2113" : "#8D3621"}
        />
      ))}
      <Leaf x={51} y={49} rot={-35} len={15} wid={5.6} fill="#3C8A34" />
      <Leaf x={62} y={46} rot={28} len={13} wid={5} fill="#52A340" />
      {flakes.map((p, i) => (
        <rect
          key={i}
          x={f(p.x - 2.2)}
          y={f(p.y - 1)}
          width="4.4"
          height="2"
          rx="1"
          fill="#FFF3CE"
          transform={`rotate(${f(p.rot)} ${f(p.x)} ${f(p.y)})`}
        />
      ))}
      <Shine uid={uid} />
    </>
  );
}

/** Fettuccine Alfredo: cintas anchas, salsa cremosa, perejil y pimienta. */
export function Alfredo({ uid }: DishProps) {
  const pepper = scatter(16, 17, 5, 60, 60);
  const parsley = scatter(14, 18, 12, 60, 60);
  return (
    <>
      <Plate uid={uid} />
      <Strands count={11} width={6} tones={["#F6E3A6", "#EED48B", "#F9EBBF"]} seed={9} />
      <defs>
        <Radial
          id={`${uid}-cream`}
          stops={[
            [0, "#FFFBEA"],
            [0.75, "#F8EAC4"],
            [1, "#EBD39A"],
          ]}
        />
      </defs>
      <path d={blob(60, 60, 19, 4, 10, 0.3)} fill={paint(uid, "cream")} />
      <path d={blob(57, 56, 9, 8)} fill="#FFFFFF" fillOpacity=".5" />
      {parsley.map((p, i) => (
        <circle key={i} cx={f(p.x)} cy={f(p.y)} r={f(0.7 + p.k * 0.7)} fill="#4E9A3A" />
      ))}
      {pepper.map((p, i) => (
        <circle key={i} cx={f(p.x)} cy={f(p.y)} r={f(0.5 + p.k * 0.4)} fill="#3A3026" />
      ))}
      <g fill="none" stroke="#F3DC94" strokeWidth="2.2" strokeLinecap="round">
        <path d="M50 66q6-7 13-3" />
        <path d="M64 52q6 1 8 6" />
      </g>
      <Shine uid={uid} />
    </>
  );
}

function Penne({ x, y, rot, tone }: { x: number; y: number; rot: number; tone: string }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      <rect
        x="-8"
        y="-3.4"
        width="16"
        height="6.8"
        rx="2.4"
        fill="#A9771F"
        opacity=".35"
        transform="translate(.6 1)"
      />
      <rect x="-8" y="-3.4" width="16" height="6.8" rx="2.4" fill={tone} />
      <path
        d="M-4.5-3.2v6.4M-1 -3.2v6.4M2.5-3.2v6.4"
        stroke="#C6963C"
        strokeOpacity=".5"
        strokeWidth=".6"
      />
      <ellipse cx="7.4" cy="0" rx="1.1" ry="2.4" fill="#B5831F" />
      <rect x="-7" y="-2.8" width="9" height="1.4" rx=".7" fill="#fff" opacity=".35" />
    </g>
  );
}

/** Penne al pesto: tubos cubiertos de salsa verde, piñones y albahaca. */
export function Pesto({ uid }: DishProps) {
  const tubes = scatter(22, 34, 14, 60, 60);
  const nuts = scatter(11, 26, 33, 60, 60);
  const drops = scatter(7, 22, 41, 60, 60);
  return (
    <>
      <Plate uid={uid} />
      {tubes.map((t, i) => (
        <Penne key={i} x={t.x} y={t.y} rot={t.rot} tone={i % 2 ? "#EFC866" : "#F5D27C"} />
      ))}
      <defs>
        <Radial
          id={`${uid}-pesto`}
          stops={[
            [0, "#8DBE4C"],
            [0.7, "#5F9B35"],
            [1, "#4A8128"],
          ]}
        />
      </defs>
      <g opacity=".93">
        <path d={blob(54, 56, 16, 2)} fill={paint(uid, "pesto")} />
        <path d={blob(67, 62, 14, 6)} fill={paint(uid, "pesto")} />
        <path d={blob(58, 70, 11, 3)} fill={paint(uid, "pesto")} />
      </g>
      {drops.map((d, i) => (
        <circle key={i} cx={f(d.x)} cy={f(d.y)} r={f(1.2 + d.k * 1.2)} fill="#5F9B35" />
      ))}
      {nuts.map((n, i) => (
        <ellipse
          key={i}
          cx={f(n.x)}
          cy={f(n.y)}
          rx="2.5"
          ry="1.3"
          fill="#F6E7B9"
          stroke="#D9C07A"
          strokeWidth=".4"
          transform={`rotate(${f(n.rot)} ${f(n.x)} ${f(n.y)})`}
        />
      ))}
      <Leaf x={52} y={52} rot={-40} len={15} wid={5.6} fill="#2F7F2E" />
      <Leaf x={63} y={50} rot={20} len={13} wid={5} fill="#3F9438" />
      <Leaf x={58} y={66} rot={95} len={11} wid={4.2} fill="#4CA042" />
      <Shine uid={uid} />
    </>
  );
}
