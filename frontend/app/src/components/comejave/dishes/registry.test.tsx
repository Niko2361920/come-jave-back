import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DishArt } from "@/components/comejave/DishArt";
import { restaurants } from "@/lib/comejave-data";
import { ART, CATEGORY_DISH, DISH_ART_IDS } from "./registry";

const menuItems = restaurants.flatMap((r) => r.categories.flatMap((c) => c.items));

describe("ilustraciones del menú", () => {
  it("cada plato del menú tiene su ilustración", () => {
    expect(DISH_ART_IDS.sort()).toEqual(menuItems.map((item) => item.id).sort());
  });

  it("cada categoría tiene un plato representativo que existe", () => {
    const categories = restaurants.flatMap((r) => r.categories);
    for (const category of categories) {
      const id = CATEGORY_DISH[category.id];
      expect(id, `categoría ${category.id}`).toBeDefined();
      expect(category.items.map((item) => item.id)).toContain(id);
    }
  });

  it("todas se dibujan como SVG sin valores inválidos", () => {
    for (const id of Object.keys(ART)) {
      const markup = renderToStaticMarkup(<DishArt itemId={id} />);
      expect(markup, id).toContain("<svg");
      expect(markup, id).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it("un id desconocido no rompe la pantalla", () => {
    expect(renderToStaticMarkup(<DishArt itemId="no-existe" />)).toBe("");
  });
});
