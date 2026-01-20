"use client";

/**
 * TextBlock Component
 *
 * A flexible text component for headings and body text.
 * Respects brand fonts (Lato for headings, Roboto for body).
 */

export interface TextBlockProps {
  /** The text content */
  text?: string;
  /** Text element type */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Text color */
  color?: "default" | "muted" | "primary" | "white";
  /** Font weight */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /** Max width constraint */
  maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Top margin */
  marginTop?: "none" | "sm" | "md" | "lg" | "xl";
  /** Bottom margin */
  marginBottom?: "none" | "sm" | "md" | "lg" | "xl";
  /** Custom class name */
  className?: string;
}

export function TextBlock({
  text = "Enter your text here",
  as = "p",
  align = "left",
  color = "default",
  weight = "normal",
  maxWidth = "none",
  marginTop = "none",
  marginBottom = "none",
  className = "",
}: TextBlockProps) {
  const Tag = as;

  const isHeading = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(as);

  // Font family based on element type
  const fontClass = isHeading ? "font-[var(--font-heading)]" : "font-[var(--font-body)]";

  // Text size based on element type
  const sizeClasses: Record<string, string> = {
    h1: "text-4xl md:text-5xl lg:text-6xl",
    h2: "text-3xl md:text-4xl lg:text-5xl",
    h3: "text-2xl md:text-3xl",
    h4: "text-xl md:text-2xl",
    h5: "text-lg md:text-xl",
    h6: "text-base md:text-lg",
    p: "text-base md:text-lg",
    span: "text-base",
  };

  // Alignment classes
  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  };

  // Color classes
  const colorClasses: Record<string, string> = {
    default: "text-[var(--color-foreground,#0f172a)]",
    muted: "text-[var(--color-muted-foreground,#64748b)]",
    primary: "text-[var(--color-primary,#e31937)]",
    white: "text-white",
  };

  // Weight classes
  const weightClasses: Record<string, string> = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  // Max width classes
  const maxWidthClasses: Record<string, string> = {
    none: "",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  // Margin top classes
  const marginTopClasses: Record<string, string> = {
    none: "",
    sm: "mt-2",
    md: "mt-4",
    lg: "mt-8",
    xl: "mt-12",
  };

  // Margin bottom classes
  const marginBottomClasses: Record<string, string> = {
    none: "",
    sm: "mb-2",
    md: "mb-4",
    lg: "mb-8",
    xl: "mb-12",
  };

  // Default weights for headings if not specified
  const defaultWeight = isHeading && weight === "normal" ? "font-bold" : weightClasses[weight];

  return (
    <Tag
      className={`
        ${fontClass}
        ${sizeClasses[as]}
        ${alignClasses[align]}
        ${colorClasses[color]}
        ${defaultWeight}
        ${maxWidthClasses[maxWidth]}
        ${marginTopClasses[marginTop]}
        ${marginBottomClasses[marginBottom]}
        leading-tight
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      {text}
    </Tag>
  );
}

export default TextBlock;
