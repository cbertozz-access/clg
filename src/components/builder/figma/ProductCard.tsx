"use client";

/**
 * Product Card Component - Generated from Figma
 *
 * Figma node: 17704:100231
 * Equipment product listing card with pricing.
 * Uses CSS variables for multi-brand theming.
 */

export interface FigmaProductCardProps {
  /** Product image URL */
  imageUrl?: string;
  /** Brand/company logo URL */
  logoUrl?: string;
  /** Fuel type (Diesel, Electric, etc.) */
  fuelType?: string;
  /** Model number */
  modelNumber?: string;
  /** Product title */
  title?: string;
  /** Spec line 1 */
  spec1?: string;
  /** Spec line 2 */
  spec2?: string;
  /** Daily price */
  dailyPrice?: string;
  /** Weekly price */
  weeklyPrice?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaLink?: string;
}

export function FigmaProductCard({
  imageUrl = "https://placehold.co/186x186/f3f4f6/64748b?text=Product",
  logoUrl,
  fuelType = "Diesel",
  modelNumber = "340AJ",
  title = "33ft Articulating Boom Lift",
  spec1 = "Reach: 19' 11\"/6.06M",
  spec2 = "Height: 33' 9\"/10.28M",
  dailyPrice = "$149.00",
  weeklyPrice = "$301.00",
  ctaText = "View details",
  ctaLink = "#",
}: FigmaProductCardProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Logo Container */}
      {logoUrl && (
        <div className="
          bg-[var(--color-border,#e2e8f0)]
          flex items-center justify-center
          px-2.5 py-3 h-[54px]
          rounded-t-[calc(var(--radius,8px)-2px)]
        ">
          <img
            src={logoUrl}
            alt="Brand logo"
            className="max-h-[30px] max-w-[160px] object-contain"
          />
        </div>
      )}

      {/* Product Container */}
      <div className={`
        bg-[var(--color-background,white)]
        border border-[var(--color-border,#e2e8f0)]
        p-3
        ${logoUrl ? "rounded-b-[calc(var(--radius,8px)-2px)]" : "rounded-[calc(var(--radius,8px)-2px)]"}
      `}>
        <div className="flex flex-col gap-3">
          {/* Image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full aspect-square object-cover rounded-[var(--radius,8px)]"
            />
            {/* Info icon */}
            <button className="absolute top-0 left-0 p-1 text-[var(--color-muted-foreground,#64748b)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                <path strokeLinecap="round" d="M12 16v-4M12 8h.01" strokeWidth={2} />
              </svg>
            </button>
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-1.5">
            {/* Fuel & Model */}
            <div className="flex gap-1.5 text-sm text-[var(--color-muted-foreground,#64748b)]">
              <span>{fuelType}</span>
              <span>{modelNumber}</span>
            </div>

            {/* Title */}
            <h3 className="text-lg text-[var(--color-foreground,#020617)] leading-7">
              {title}
            </h3>

            {/* Specs */}
            <div className="flex flex-col gap-0.5 text-sm text-[var(--color-muted-foreground,#64748b)]">
              <span>{spec1}</span>
              <span>{spec2}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[var(--color-foreground,#020617)] tracking-tight leading-7">
                {dailyPrice}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground,#64748b)]">
                daily
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[var(--color-foreground,#020617)] tracking-tight leading-7">
                {weeklyPrice}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground,#64748b)]">
                weekly
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href={ctaLink}
            className="
              flex items-center justify-center
              w-full h-10 px-3
              bg-[var(--color-primary,#0f172a)]
              text-[var(--color-primary-foreground,#f8fafc)]
              rounded-[calc(var(--radius,8px)-2px)]
              text-sm font-medium
              hover:bg-[var(--color-primary-dark,#020617)]
              transition-colors
            "
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
