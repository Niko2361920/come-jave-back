import { describe, expect, it } from "vitest";
import { arcPath, blob, paint, rng, scatter } from "./kit";

describe("utilidades de dibujo", () => {
  it("el generador con semilla es determinista", () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("scatter deja todos los puntos dentro del disco pedido", () => {
    for (const spot of scatter(40, 30, 7)) {
      expect(Math.hypot(spot.x - 60, spot.y - 60)).toBeLessThanOrEqual(30);
    }
  });

  it("arcPath y blob generan trazos válidos (sin NaN)", () => {
    expect(arcPath(60, 60, 20, 0, 200)).toMatch(/^M[\d.\- ]+A/);
    expect(blob(60, 60, 18, 3)).not.toMatch(/NaN|undefined/);
  });

  it("paint arma la referencia a un degradado", () => {
    expect(paint("p1abc", "sauce")).toBe("url(#p1abc-sauce)");
  });
});
