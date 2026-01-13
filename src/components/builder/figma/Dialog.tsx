"use client";

import { useState } from "react";

/**
 * Dialog/Modal Component - Generated from Figma
 *
 * Figma node: 17704:99704
 * Email subscription dialog with close button.
 * Uses CSS variables for multi-brand theming.
 */

export interface FigmaDialogProps {
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Input placeholder */
  inputPlaceholder?: string;
  /** Submit button text */
  buttonText?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Form action URL */
  formAction?: string;
}

export function FigmaDialog({
  title = "Stay Ahead with Exclusive Deals & Updates!",
  description = "Sign up for the latest offers on forklift, generator, and earthmover hires and sales—plus expert tips and industry news!",
  inputPlaceholder = "Your Email",
  buttonText = "Subscribe",
  showCloseButton = true,
  formAction,
}: FigmaDialogProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="
        bg-[var(--color-background,white)]
        border border-[var(--color-border,#e2e8f0)]
        rounded-[var(--radius,8px)]
        shadow-lg
        overflow-hidden
        relative
        w-full max-w-[588px]
      "
    >
      {/* Header */}
      <div className="p-6 pb-2">
        <h3 className="font-semibold text-lg text-[var(--color-foreground,#020617)] tracking-tight">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--color-muted-foreground,#64748b)] leading-5">
          {description}
        </p>
      </div>

      {/* Content */}
      <div className="px-6 pt-2 pb-8">
        <form action={formAction} className="flex gap-2 items-center">
          <input
            type="email"
            name="email"
            placeholder={inputPlaceholder}
            required
            className="
              flex-1 px-3 py-2.5
              bg-[var(--color-background,white)]
              border border-[var(--color-input,#e2e8f0)]
              rounded-[calc(var(--radius,8px)-2px)]
              text-sm text-[var(--color-foreground,#020617)]
              placeholder:text-[var(--color-muted-foreground,#64748b)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            "
          />
          <button
            type="submit"
            className="
              px-4 py-2.5 min-w-[80px]
              bg-[var(--color-primary,#0f172a)]
              text-[var(--color-primary-foreground,#f8fafc)]
              rounded-[calc(var(--radius,8px)-2px)]
              text-sm font-medium
              hover:bg-[var(--color-primary-dark,#020617)]
              transition-colors
            "
          >
            {buttonText}
          </button>
        </form>
      </div>

      {/* Close Button */}
      {showCloseButton && (
        <button
          onClick={() => setIsVisible(false)}
          className="
            absolute top-3 right-3
            p-1.5 rounded-[calc(var(--radius,8px)-4px)]
            text-[var(--color-foreground,#0f172a)]
            hover:bg-[var(--color-background-alt,#f3f4f6)]
            transition-colors
          "
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
