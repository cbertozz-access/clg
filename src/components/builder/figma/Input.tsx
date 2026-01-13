"use client";

/**
 * Input Component - Generated from Figma
 *
 * Figma node: 17704:100020
 * Uses CSS variables for multi-brand theming.
 */

export interface FigmaInputProps {
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: "text" | "email" | "tel" | "password" | "number";
  /** Field name for forms */
  name?: string;
  /** Required field */
  required?: boolean;
  /** Helper text below input */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
}

export function FigmaInput({
  label = "Label",
  placeholder = "Enter value",
  type = "text",
  name,
  required = false,
  helperText,
  error = false,
  errorMessage,
}: FigmaInputProps) {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="font-medium text-sm text-[var(--color-foreground,#020617)] leading-5"
        >
          {label}
          {required && <span className="text-[var(--color-error,#ef4444)] ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-3 py-2.5
          bg-[var(--color-background,white)]
          border border-[var(--color-input,#e2e8f0)]
          rounded-[calc(var(--radius,8px)-2px)]
          text-sm text-[var(--color-foreground,#020617)]
          placeholder:text-[var(--color-muted-foreground,#64748b)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#0f172a)] focus:border-transparent
          transition-colors
          ${error ? "border-[var(--color-error,#ef4444)] focus:ring-[var(--color-error,#ef4444)]" : ""}
        `.replace(/\s+/g, " ").trim()}
      />

      {(helperText || (error && errorMessage)) && (
        <p
          className={`text-sm leading-5 ${
            error
              ? "text-[var(--color-error,#ef4444)]"
              : "text-[var(--color-muted-foreground,#64748b)]"
          }`}
        >
          {error && errorMessage ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
}
