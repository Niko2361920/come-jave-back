/**
 * Utilidades puras para dibujar los platos en SVG.
 * Todo es determinista: el mismo plato siempre se dibuja igual (sin Math.random),
 * así no hay diferencias entre servidor y navegador al hidratar.
 */

/** Generador pseudoaleatorio con semilla (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Redondea a 1 decimal para mantener el SVG liviano. */
export const f = (n: number): string => String(Math.round(n * 10) / 10);

export type Spot = {
  x: number;
  y: number;
  /** Rotación sugerida en grados. */
  rot: number;
  /** Número entre 0 y 1 para variar tamaños o tonos. */
  k: number;
};

/** Reparte puntos dentro de un disco con la espiral áurea: se ven naturales y sin amontonarse. */
export function scatter(count: number, radius: number, seed: number, cx = 60, cy = 60): Spot[] {
  const rand = rng(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const r = radius * Math.sqrt((i + 0.5) / count) * (0.86 + rand() * 0.14);
    const angle = i * golden + rand() * 0.5;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      rot: rand() * 360,
      k: rand(),
    };
  });
}

/** Reparte puntos sobre un aro (por ejemplo, las manchas de la orilla de una pizza). */
export function ring(count: number, radius: number, seed: number, cx = 60, cy = 60): Spot[] {
  const rand = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + rand() * 0.7) / count) * Math.PI * 2;
    const r = radius + (rand() - 0.5) * 3;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      rot: (angle * 180) / Math.PI,
      k: rand(),
    };
  });
}

/** Trazo curvo de un círculo entre dos ángulos (en grados). */
export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(from));
  const y1 = cy + r * Math.sin(rad(from));
  const x2 = cx + r * Math.cos(rad(to));
  const y2 = cy + r * Math.sin(rad(to));
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${f(x1)} ${f(y1)}A${f(r)} ${f(r)} 0 ${large} 1 ${f(x2)} ${f(y2)}`;
}

/** Mancha orgánica (salsa, queso, aderezo): un círculo con el borde irregular. */
export function blob(cx: number, cy: number, r: number, seed: number, n = 9, wobble = 0.24) {
  const rand = rng(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rand() * wobble);
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)] as const;
  });
  const mid = (a: readonly [number, number], b: readonly [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  const last = pts[n - 1]!;
  const first = pts[0]!;
  const start = mid(last, first);
  let d = `M${f(start[0])} ${f(start[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const m = mid(p, pts[(i + 1) % n]!);
    d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d}Z`;
}

/** Contorno de una hoja que apunta hacia +x, con `len` de largo y `wid` de ancho. */
export function leafPath(len: number, wid: number): string {
  return `M0 0C${f(len * 0.25)} ${f(-wid)} ${f(len * 0.75)} ${f(-wid)} ${f(len)} 0C${f(len * 0.75)} ${f(wid)} ${f(len * 0.25)} ${f(wid)} 0 0Z`;
}

/** Referencia a un degradado definido con `uid`: `url(#uid-nombre)`. */
export const paint = (uid: string, name: string): string => `url(#${uid}-${name})`;
