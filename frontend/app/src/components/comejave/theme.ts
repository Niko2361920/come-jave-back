import type { CSSProperties } from "react";
import type { Restaurant } from "@/lib/comejave-data";

/** Color de cada restaurante, expuesto como variables CSS (--r, --r-soft). */
const THEMES: Record<Restaurant["id"], { color: string; soft: string }> = {
  ventolini: { color: "var(--ventolini)", soft: "var(--ventolini-soft)" },
  lafrute: { color: "var(--frute)", soft: "var(--frute-soft)" },
};

export const restaurantStyle = (id: Restaurant["id"]) =>
  ({ "--r": THEMES[id].color, "--r-soft": THEMES[id].soft }) as CSSProperties;
