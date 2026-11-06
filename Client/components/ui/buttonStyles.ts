import { cn } from "@/lib/utils";

// Kept in a plain module (no "use client") so both server components
// (ButtonLink) and the client Button can use the same styles.

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "outline"
  | "outline-light"
  | "light"
  | "ghost"
  | "ghost-light"
  | "danger"
  | "success"
  | "warning"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink-950 text-paper-50 hover:bg-ink-700 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
  accent: "bg-accent text-accent-contrast hover:brightness-[0.93]",
  secondary: "bg-paper-200 text-ink-900 hover:bg-paper-300",
  outline: "border border-ink-900/20 text-ink-900 hover:border-ink-900/60 hover:bg-ink-900/[0.04]",
  "outline-light": "border border-white/20 text-paper-50 hover:border-white/55 hover:bg-white/[0.06]",
  light: "bg-paper-50 text-ink-950 hover:bg-white",
  ghost: "text-ink-900 hover:bg-ink-900/[0.06]",
  "ghost-light": "text-paper-50 hover:bg-white/10",
  danger: "bg-error text-white hover:brightness-95",
  success: "bg-success text-white hover:brightness-95",
  warning: "bg-warning text-ink-950 hover:brightness-95",
  link: "text-current underline underline-offset-4 decoration-1 hover:decoration-2 !px-0 !h-auto",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-[3.25rem] px-7 text-base",
  xl: "h-14 px-8 text-lg",
  icon: "size-11 p-0",
};

export const buttonClasses = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) =>
  cn(
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em]",
    "transition-[background-color,border-color,color,filter,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)]",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  );
