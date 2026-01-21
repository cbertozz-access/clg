"use client";

/**
 * TextBlock Component
 *
 * Rich text component that respects brand fonts and colors.
 * - Headings use Lato font
 * - Body text uses Roboto font
 * - Colors from CSS variables
 */

export interface TextBlockProps {
  /** Rich text HTML content */
  text?: string;
  /** Text size for body text */
  size?: "sm" | "base" | "lg" | "xl" | "2xl";
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Text color */
  color?: "default" | "muted" | "primary" | "white";
  /** Max width constraint */
  maxWidth?: "none" | "prose" | "2xl" | "4xl" | "full";
  /** Padding */
  padding?: "none" | "sm" | "md" | "lg";
}

export function TextBlock({
  text = "<p>Enter your text here</p>",
  size = "lg",
  align = "center",
  color = "default",
  maxWidth = "4xl",
  padding = "md",
}: TextBlockProps) {

  const sizeClasses: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const colorClasses: Record<string, string> = {
    default: "text-slate-900",
    muted: "text-slate-600",
    primary: "text-[#e31937]",
    white: "text-white",
  };

  const maxWidthClasses: Record<string, string> = {
    none: "",
    prose: "max-w-prose",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  const paddingClasses: Record<string, string> = {
    none: "",
    sm: "py-4 px-4",
    md: "py-8 px-6",
    lg: "py-12 px-8",
  };

  return (
    <div
      className={`
        w-full
        ${paddingClasses[padding]}
        ${alignClasses[align]}
        ${colorClasses[color]}
      `}
    >
      <div
        className={`
          ${maxWidthClasses[maxWidth]}
          ${align === "center" ? "mx-auto" : ""}
          ${align === "right" ? "ml-auto" : ""}

          ${sizeClasses[size]}
          leading-relaxed

          [&_h1]:text-5xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:leading-tight
          [&_h2]:text-4xl [&_h2]:font-bold [&_h2]:mb-5 [&_h2]:leading-tight
          [&_h3]:text-3xl [&_h3]:font-bold [&_h3]:mb-4 [&_h3]:leading-tight
          [&_h4]:text-2xl [&_h4]:font-semibold [&_h4]:mb-3
          [&_h5]:text-xl [&_h5]:font-semibold [&_h5]:mb-3
          [&_h6]:text-lg [&_h6]:font-semibold [&_h6]:mb-2

          [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:font-[Lato,sans-serif]

          [&_p]:mb-4 [&_p:last-child]:mb-0
          [&_p]:font-[Roboto,sans-serif]

          [&_strong]:font-bold
          [&_em]:italic
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1
          [&_a]:text-[#e31937] [&_a]:underline [&_a]:hover:text-[#841020]
        `}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

export default TextBlock;
