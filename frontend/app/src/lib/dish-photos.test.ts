import { describe, expect, it } from "vitest";
import { indexPhotos } from "./dish-photos";

describe("fotos de los platos", () => {
  it("asocia cada archivo con el id del plato por su nombre", () => {
    const index = indexPhotos({
      "../assets/dishes/p1.webp": "/assets/p1-abc.webp",
      "../assets/dishes/z2.jpg": "/assets/z2-def.jpg",
      "../assets/dishes/b3.png": "/assets/b3-ghi.png",
    });
    expect(index).toEqual({
      p1: "/assets/p1-abc.webp",
      z2: "/assets/z2-def.jpg",
      b3: "/assets/b3-ghi.png",
    });
  });

  it("sin fotos devuelve un mapa vacío (se usan las ilustraciones)", () => {
    expect(indexPhotos({})).toEqual({});
  });
});
