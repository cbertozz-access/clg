"use client";

/**
 * Equipment Card Component
 *
 * Displays a single equipment item with image, specs, pricing, and CTA.
 * Uses CSS variables for multi-brand theming.
 */

export interface EquipmentCardProps {
  /** Equipment ID */
  id?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Equipment brand */
  brand?: string;
  /** Model number */
  model?: string;
  /** Display name/title */
  name?: string;
  /** Equipment category */
  category?: string;
  /** Primary spec line */
  spec1?: string;
  /** Secondary spec line */
  spec2?: string;
  /** Daily rental price */
  dailyPrice?: string | number;
  /** Weekly rental price */
  weeklyPrice?: string | number;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaLink?: string;
  /** Card variant */
  variant?: "default" | "compact" | "featured";
  /** Show pricing */
  showPricing?: boolean;
  /** Show specs */
  showSpecs?: boolean;
}

export function EquipmentCard({
  id,
  imageUrl,
  brand,
  model,
  name,
  category,
  spec1,
  spec2,
  dailyPrice,
  weeklyPrice,
  ctaText = "View Details",
  ctaLink = "#",
  variant = "default",
  showPricing = true,
  showSpecs = true,
}: EquipmentCardProps) {
  const formatPrice = (price?: string | number): string => {
    if (!price) return "POA";
    if (typeof price === "string") return price;
    return `$${price.toFixed(2)}`;
  };

  const placeholderImage = `https://placehold.co/400x300/f3f4f6/64748b?text=${encodeURIComponent(model || "Equipment")}`;

  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <div
      className={`
        group relative flex flex-col
        bg-[var(--color-card,white)]
        border border-[var(--color-border,#e2e8f0)]
        rounded-[var(--radius,8px)]
        overflow-hidden
        transition-all duration-200
        hover:shadow-lg hover:border-[var(--color-primary,#e31937)]
        ${isFeatured ? "ring-2 ring-[var(--color-primary,#e31937)]" : ""}
      `}
    >
      {/* Image Container */}
      <div className={`relative ${isCompact ? "h-40" : "h-48 md:h-56"} overflow-hidden bg-[var(--color-background-alt,#f8fafc)]`}>
        <img
          src={imageUrl || placeholderImage}
          alt={name || model || "Equipment"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Badge */}
        {category && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-[var(--radius-sm,4px)] bg-[var(--color-background,white)]/90 text-[var(--color-foreground,#0f172a)]">
            {category}
          </span>
        )}

        {/* Featured Badge */}
        {isFeatured && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-[var(--radius-sm,4px)] bg-[var(--color-primary,#e31937)] text-[var(--color-primary-foreground,white)]">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-grow ${isCompact ? "p-3" : "p-4"}`}>
        {/* Brand & Model */}
        <div className="mb-2">
          {brand && (
            <span className="text-xs font-medium text-[var(--color-muted-foreground,#64748b)] uppercase tracking-wide">
              {brand}
            </span>
          )}
          {model && (
            <span className="text-xs text-[var(--color-muted-foreground,#64748b)] ml-2">
              {model}
            </span>
          )}
        </div>

        {/* Name/Title */}
        <h3 className={`font-semibold text-[var(--color-foreground,#0f172a)] mb-2 line-clamp-2 ${isCompact ? "text-sm" : "text-base md:text-lg"}`}>
          {name || model || "Equipment"}
        </h3>

        {/* Specs */}
        {showSpecs && (spec1 || spec2) && (
          <div className={`space-y-1 mb-3 ${isCompact ? "text-xs" : "text-sm"} text-[var(--color-muted-foreground,#64748b)]`}>
            {spec1 && <p>{spec1}</p>}
            {spec2 && <p>{spec2}</p>}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Pricing */}
        {showPricing && (
          <div className={`flex gap-4 ${isCompact ? "mb-2" : "mb-4"} border-t border-[var(--color-border,#e2e8f0)] pt-3`}>
            <div>
              <span className="text-xs text-[var(--color-muted-foreground,#64748b)]">Daily</span>
              <p className={`font-bold text-[var(--color-foreground,#0f172a)] ${isCompact ? "text-sm" : "text-base"}`}>
                {formatPrice(dailyPrice)}
              </p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-muted-foreground,#64748b)]">Weekly</span>
              <p className={`font-bold text-[var(--color-foreground,#0f172a)] ${isCompact ? "text-sm" : "text-base"}`}>
                {formatPrice(weeklyPrice)}
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <a
          href={ctaLink || `#${id}`}
          className={`
            block w-full text-center font-medium
            rounded-[var(--radius-sm,4px)]
            transition-colors duration-200
            bg-[var(--color-primary,#e31937)]
            hover:bg-[var(--color-primary-hover,#841020)]
            text-[var(--color-primary-foreground,white)]
            ${isCompact ? "py-2 text-sm" : "py-2.5 text-base"}
          `}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}

export default EquipmentCard;
