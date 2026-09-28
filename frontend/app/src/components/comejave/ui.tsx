import { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "outline" | "ghost";
  full?: boolean;
};

export function Btn({ variant = "primary", full, className, ...props }: BtnProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40",
        full && "w-full",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover",
        variant === "accent" &&
          "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover",
        variant === "outline" &&
          "border border-border bg-background text-foreground hover:bg-secondary active:bg-secondary",
        variant === "ghost" && "text-primary hover:bg-secondary active:bg-secondary",
        className,
      )}
    />
  );
}

export function Field({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-input bg-background px-4 py-3.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary",
          className,
        )}
      />
    </label>
  );
}

export function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("animate-in fade-in slide-in-from-right-3 duration-300", className)}>
      {children}
    </div>
  );
}