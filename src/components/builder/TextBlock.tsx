"use client";

/**
 * TextBlock Component
 *
 * A flexible rich text component for headings and body text.
 * Supports WYSIWYG editing in Builder.io with vertical/horizontal centering.
 * Respects brand fonts (Lato for headings, Roboto for body).
 */

export interface TextBlockProps {
  /** Rich text HTML content */
  text?: string;
  /** Text element type */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";
  /** Text size override */
  size?: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Vertical alignment */
  verticalAlign?: "top" | "center" | "bottom";
  /** Text color */
  color?: "default" | "muted" | "primary" | "white";
  /** Font weight */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /** Max width constraint */
  maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
  /** Minimum height */
  minHeight?: "none" | "sm" | "md" | "lg" | "xl" | "screen";
  /** Padding */
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  /** Top margin */
  marginTop?: "none" | "sm" | "md" | "lg" | "xl";
  /** Bottom margin */
  marginBottom?: "none" | "sm" | "md" | "lg" | "xl";
  /** Custom class name */
  className?: string;
}

export function TextBlock({
  text = "<p>Enter your text here</p>",
  as = "div",
  size = "lg",
  align = "center",
  verticalAlign = "center",
  color = "default",
  weight = "normal",
  maxWidth = "4xl",
  minHeight = "none",
  padding = "md",
  marginTop = "none",
  marginBottom = "none",
  className = "",
}: TextBlockProps) {
  const Tag = as;

  const isHeading = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(as);

  // Font family based on element type
  const fontClass = isHeading ? "font-[var(--font-heading)]" : "font-[var(--font-body)]";

  // Text size classes
  const sizeClasses: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
    "2xl": "text-2xl md:text-3xl",
    "3xl": "text-3xl md:text-4xl",
    "4xl": "text-4xl md:text-5xl",
    "5xl": "text-5xl md:text-6xl",
  };

  // Horizontal alignment classes
  const alignClasses: Record<string, string> = {
    left: "text-left justify-start",
    center: "text-center justify-center",
    right: "text-right justify-end",
  };

  // Vertical alignment classes
  const verticalAlignClasses: Record<string, string> = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
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
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  // Min height classes
  const minHeightClasses: Record<string, string> = {
    none: "",
    sm: "min-h-[100px]",
    md: "min-h-[200px]",
    lg: "min-h-[300px]",
    xl: "min-h-[400px]",
    screen: "min-h-screen",
  };

  // Padding classes
  const paddingClasses: Record<string, string> = {
    none: "",
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-12",
    xl: "p-12 md:p-16",
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
  const appliedWeight = isHeading && weight === "normal" ? "font-bold" : weightClasses[weight];

  // Check if we need flex container for vertical centering
  const needsFlexContainer = verticalAlign !== "top" || minHeight !== "none";

  if (needsFlexContainer) {
    return (
      <div
        className={`
          flex flex-col w-full
          ${alignClasses[align]}
          ${verticalAlignClasses[verticalAlign]}
          ${minHeightClasses[minHeight]}
          ${paddingClasses[padding]}
          ${marginTopClasses[marginTop]}
          ${marginBottomClasses[marginBottom]}
          ${className}
        `.trim().replace(/\s+/g, " ")}
      >
        <Tag
          className={`
            ${fontClass}
            ${sizeClasses[size]}
            ${colorClasses[color]}
            ${appliedWeight}
            ${maxWidthClasses[maxWidth]}
            leading-relaxed
            [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:lg:text-6xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:font-[var(--font-heading)]
            [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:font-[var(--font-heading)]
            [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:font-[var(--font-heading)]
            [&_h4]:text-xl [&_h4]:md:text-2xl [&_h4]:font-semibold [&_h4]:mb-3 [&_h4]:font-[var(--font-heading)]
            [&_h5]:text-lg [&_h5]:md:text-xl [&_h5]:font-semibold [&_h5]:mb-3 [&_h5]:font-[var(--font-heading)]
            [&_h6]:text-base [&_h6]:md:text-lg [&_h6]:font-semibold [&_h6]:mb-2 [&_h6]:font-[var(--font-heading)]
            [&_p]:mb-4 [&_p:last-child]:mb-0
            [&_strong]:font-bold
            [&_em]:italic
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
            [&_li]:mb-1
            [&_a]:text-[var(--color-primary,#e31937)] [&_a]:underline
          `.trim().replace(/\s+/g, " ")}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    );
  }

  return (
    <Tag
      className={`
        ${fontClass}
        ${sizeClasses[size]}
        ${alignClasses[align].split(" ")[0]}
        ${colorClasses[color]}
        ${appliedWeight}
        ${maxWidthClasses[maxWidth]}
        ${paddingClasses[padding]}
        ${marginTopClasses[marginTop]}
        ${marginBottomClasses[marginBottom]}
        ${align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""}
        leading-relaxed
        [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:lg:text-6xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:font-[var(--font-heading)]
        [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:font-[var(--font-heading)]
        [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:font-[var(--font-heading)]
        [&_h4]:text-xl [&_h4]:md:text-2xl [&_h4]:font-semibold [&_h4]:mb-3 [&_h4]:font-[var(--font-heading)]
        [&_h5]:text-lg [&_h5]:md:text-xl [&_h5]:font-semibold [&_h5]:mb-3 [&_h5]:font-[var(--font-heading)]
        [&_h6]:text-base [&_h6]:md:text-lg [&_h6]:font-semibold [&_h6]:mb-2 [&_h6]:font-[var(--font-heading)]
        [&_p]:mb-4 [&_p:last-child]:mb-0
        [&_strong]:font-bold
        [&_em]:italic
        [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
        [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
        [&_li]:mb-1
        [&_a]:text-[var(--color-primary,#e31937)] [&_a]:underline
        ${className}
      `.trim().replace(/\s+/g, " ")}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

export default TextBlock;
