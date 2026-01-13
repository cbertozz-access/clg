"use client";

/**
 * Trust Scroll - Mobile Component
 *
 * Horizontal scrolling trust badges/stats for mobile.
 * Displays stats as compact pills that scroll horizontally.
 */

export interface TrustStat {
  value: string;
  label: string;
}

export interface LPTrustScrollProps {
  /** Trust statistics to display */
  stats?: TrustStat[];
  /** Background variant */
  variant?: "light" | "white";
}

const defaultStats: TrustStat[] = [
  { value: "7,500", label: "Equipment Units" },
  { value: "24/7", label: "Support" },
  { value: "20+", label: "Locations" },
  { value: "Same Day", label: "Delivery" },
];

export function LPTrustScroll({
  stats = defaultStats,
  variant = "white",
}: LPTrustScrollProps) {
  const bgClass = variant === "light"
    ? "bg-[var(--color-background-alt,#F3F4F6)]"
    : "bg-white";

  return (
    <section className={`py-4 border-b border-gray-200 ${bgClass}`}>
      <div
        className="flex gap-3 px-4 overflow-x-auto"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex-shrink-0 bg-[var(--color-background-alt,#F3F4F6)] rounded-full px-4 py-2 flex items-center gap-2"
            style={{ scrollSnapAlign: "start" }}
          >
            <span className="text-[var(--color-primary,#E63229)] font-bold whitespace-nowrap">
              {stat.value}
            </span>
            <span className="text-[var(--color-muted-foreground,#6B7280)] text-sm whitespace-nowrap">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
