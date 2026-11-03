/**
 * Fotos reales de los platos (opcional).
 *
 * Basta con copiar la foto a `src/assets/dishes/` con el id del plato como
 * nombre (`p1.webp`, `z2.jpg`, `b3.png`...). Se detectan al compilar: si existe
 * la foto se usa, y si no, la app dibuja la ilustración de ese plato.
 * Los ids están en `lib/comejave-data.ts` y en el README.
 */

const files = import.meta.glob<string>("../assets/dishes/*.{webp,jpg,jpeg,png,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

/** Convierte las rutas de los archivos en un mapa `id del plato -> url`. */
export function indexPhotos(entries: Record<string, string>): Record<string, string> {
  const index: Record<string, string> = {};
  for (const [path, url] of Object.entries(entries)) {
    const id = path
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "");
    if (id) index[id] = url;
  }
  return index;
}

const photos = indexPhotos(files);

export const photoFor = (itemId: string): string | undefined => photos[itemId];
