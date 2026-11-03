import type { ReactNode } from "react";
import { f, leafPath, paint } from "./kit";

export type DishProps = { uid: string };

type Stop = readonly [offset: number, color: string];

const stopsOf = (stops: readonly Stop[]) =>
  stops.map(([offset, color]) => <stop key={offset + color} offset={offset} stopColor={color} />);

export function Radial({
  id,
  stops,
  cx = 0.5,
  cy = 0.4,
  r = 0.65,
}: {
  id: string;
  stops: readonly Stop[];
  cx?: number;
  cy?: number;
  r?: number;
}) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {stopsOf(stops)}
    </radialGradient>
  );
}

export function Linear({
  id,
  stops,
  vertical = true,
}: {
  id: string;
  stops: readonly Stop[];
  vertical?: boolean;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
      {stopsOf(stops)}
    </linearGradient>
  );
}

/** Hoja con nervadura. */
export function Leaf({
  x,
  y,
  rot,
  len = 14,
  wid = 5,
  fill,
  centered = false,
}: {
  x: number;
  y: number;
  rot: number;
  len?: number;
  wid?: number;
  fill: string;
  /** Con `true`, (x, y) es el centro de la hoja y no su base: gira sin salirse de su lugar. */
  centered?: boolean;
}) {
  return (
    <g
      transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})${centered ? ` translate(${f(-len / 2)} 0)` : ""}`}
    >
      <path d={leafPath(len, wid)} fill={fill} />
      <path
        d={`M1 0H${f(len * 0.88)}`}
        stroke="#fff"
        strokeOpacity=".38"
        strokeWidth=".7"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Plato blanco visto desde arriba, con borde y fondo hondo. */
export function Plate({ uid, children }: { uid: string; children?: ReactNode }) {
  return (
    <>
      <defs>
        <Radial
          id={`${uid}-plate`}
          stops={[
            [0, "#FFFFFF"],
            [0.72, "#F5F7FA"],
            [1, "#D5DCE7"],
          ]}
        />
        <Radial
          id={`${uid}-well`}
          stops={[
            [0, "#FFFFFF"],
            [1, "#ECEFF5"],
          ]}
        />
      </defs>
      <circle cx="60" cy="60" r="58" fill={paint(uid, "plate")} />
      <circle cx="60" cy="60" r="57.4" fill="none" stroke="#C3CCDB" strokeWidth="1" />
      <circle
        cx="60"
        cy="60"
        r="47.5"
        fill={paint(uid, "well")}
        stroke="#DEE4EE"
        strokeWidth="1.2"
      />
      {children}
    </>
  );
}

/** Brillo suave en la esquina superior izquierda para dar volumen. */
export function Shine({ uid, r = 58 }: { uid: string; r?: number }) {
  return (
    <>
      <defs>
        <Radial
          id={`${uid}-shine`}
          cx={0.3}
          cy={0.25}
          r={0.7}
          stops={[
            [0, "rgba(255,255,255,.34)"],
            [0.55, "rgba(255,255,255,0)"],
            [1, "rgba(0,0,0,.12)"],
          ]}
        />
      </defs>
      <circle cx="60" cy="60" r={r} fill={paint(uid, "shine")} />
    </>
  );
}
