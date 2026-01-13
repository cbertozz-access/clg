"use client";

/**
 * Load More Button Component
 *
 * Simple button for loading more items in a list/grid.
 */

export interface LPLoadMoreProps {
  /** Button text */
  text?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Callback when clicked */
  onClick?: () => void;
  /** Button variant */
  variant?: "primary" | "outline";
}

export function LPLoadMore({
  text = "Load More",
  isLoading = false,
  loadingText = "Loading...",
  disabled = false,
  onClick,
  variant = "outline",
}: LPLoadMoreProps) {
  const baseClasses =
    "px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 min-h-[48px]";

  const variantClasses =
    variant === "primary"
      ? "bg-[var(--color-primary,#E63229)] hover:opacity-90 text-white"
      : "bg-white hover:bg-[var(--color-background-alt,#F3F4F6)] text-[var(--color-foreground,#1A1A1A)] border border-gray-300";

  return (
    <div className="text-center">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${
          disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText}
          </>
        ) : (
          text
        )}
      </button>
    </div>
  );
}
