import type { ReactNode } from "react";
import { DishArt } from "@/components/comejave/DishArt";

/** Pantalla completa para el 404 y los errores, con la misma identidad visual de la app. */
export function StatusPage({
  dishId,
  title,
  body,
  children,
}: {
  dishId: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-6">
      <div className="flex w-full max-w-[380px] flex-col items-center gap-3 text-center">
        <div aria-hidden className="float mb-3 h-40 w-40">
          <DishArt
            itemId={dishId}
            className="h-full w-full -rotate-12 drop-shadow-[0_18px_26px_rgba(14,30,54,0.3)]"
          />
        </div>
        <h1 className="font-display text-[34px] font-extrabold text-foreground">{title}</h1>
        <p className="text-[17px] leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-4 flex w-full flex-col gap-2">{children}</div>
      </div>
    </main>
  );
}

export const statusButton =
  "pressable inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-primary px-6 text-[17px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover";

export const statusButtonOutline =
  "pressable inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-card px-6 text-[17px] font-semibold text-primary ring-1 ring-separator transition-colors hover:bg-secondary";
