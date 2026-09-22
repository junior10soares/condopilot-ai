import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium " +
  "transition-all duration-[var(--duration-micro)] ease-[var(--ease-standard)] " +
  "cursor-pointer select-none active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2",
  lg: "px-5 py-2.5",
} as const;

const variantClasses = {
  primary:
    "text-white shadow-[0_0_0_0_rgba(124,92,255,0)] hover:shadow-[0_4px_20px_-4px_rgba(124,92,255,0.55)] hover:brightness-110",
  secondary:
    "border border-border bg-surface text-text hover:border-secondary/60 hover:bg-surface-elevated",
  ghost: "text-muted hover:bg-surface-elevated hover:text-text",
  danger:
    "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 hover:border-danger/50",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      style={variant === "primary" ? { background: "var(--gradient-brand)", ...style } : style}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="animate-spin-token h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
