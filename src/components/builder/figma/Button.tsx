"use client";

/**
 * Button Component - Generated from Figma
 *
 * Figma node: 17704:99723
 * Uses CSS variables for multi-brand theming.
 */

export interface FigmaButtonProps {
  /** Button text */
  label?: string;
  /** Button variant */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Full width button */
  fullWidth?: boolean;
  /** Click handler URL */
  href?: string;
  /** Button type for forms */
  type?: "button" | "submit" | "reset";
}

export function FigmaButton({
  label = "Button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  href,
  type = "button",
}: FigmaButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium transition-colors
    rounded-[var(--radius,6px)]
    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
  `;

  const variantClasses = {
    primary: `
      bg-[var(--color-primary,#0f172a)]
      text-[var(--color-primary-foreground,#f8fafc)]
      hover:bg-[var(--color-primary-dark,#020617)]
    `,
    secondary: `
      bg-[var(--color-accent,#3b82f6)]
      text-[var(--color-accent-foreground,#ffffff)]
      hover:opacity-90
    `,
    outline: `
      border border-[var(--color-border,#e2e8f0)]
      bg-transparent
      text-[var(--color-foreground,#020617)]
      hover:bg-[var(--color-background-alt,#f3f4f6)]
    `,
    ghost: `
      bg-transparent
      text-[var(--color-foreground,#020617)]
      hover:bg-[var(--color-background-alt,#f3f4f6)]
    `,
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-w-[60px]",
    md: "px-4 py-2 text-sm min-w-[80px]",
    lg: "px-6 py-3 text-base min-w-[100px]",
  };

  const className = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
  `.replace(/\s+/g, " ").trim();

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button type={type} className={className}>
      {label}
    </button>
  );
}
