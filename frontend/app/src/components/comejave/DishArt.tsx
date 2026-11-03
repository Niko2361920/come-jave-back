import { useId } from "react";
import { findMenuEntryByItemId } from "@/lib/comejave-data";
import { photoFor } from "@/lib/dish-photos";
import { cn } from "@/lib/utils";
import { ART, CATEGORY_DISH } from "./dishes/registry";

/**
 * Imagen de cada plato.
 *
 * Si existe una foto en `src/assets/dishes/<id>.webp` se muestra la foto; si no,
 * una ilustración propia en SVG, vista desde arriba. Así la app se ve igual de
 * completa con o sin fotos, en cualquier dispositivo y sin descargas extra.
 */

/** Foto o ilustración de un plato por su id del menú (p1, z2, b3…). */
export function DishArt({ itemId, className }: { itemId: string; className?: string | undefined }) {
  // El id del plato evita choques entre los degradados de platos distintos en la misma página.
  const uid = `${itemId}${useId().replace(/:/g, "")}`;
  const photo = photoFor(itemId);

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          "block aspect-square rounded-full object-cover ring-1 ring-black/10",
          className,
        )}
      />
    );
  }

  const Art =
    ART[itemId] ?? ART[CATEGORY_DISH[findMenuEntryByItemId(itemId)?.category.id ?? ""] ?? ""];
  if (!Art) return null;
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn("block", className)}>
      <Art uid={uid} />
    </svg>
  );
}

/** Imagen representativa de una categoría (pastas, pizzas, bowls, ensaladas). */
export function CategoryArt({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string | undefined;
}) {
  const itemId = CATEGORY_DISH[categoryId];
  return itemId ? <DishArt itemId={itemId} className={className} /> : null;
}
