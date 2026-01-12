"use client";

interface StatItem {
  value: string;
  label: string;
}

export interface LPTrustBadgesProps {
  stats?: StatItem[];
  variant?: "light" | "dark";
}

const defaultStats = [
  { value: "1,234", label: "Lorem Ipsum" },
  { value: "24/7", label: "Dolor Sit" },
  { value: "50+", label: "Amet Consectetur" },
  { value: "99%", label: "Adipiscing Elit" },
];

export function LPTrustBadges(props: Partial<LPTrustBadgesProps>) {
  const stats = props.stats?.length ? props.stats : defaultStats;
  const variant = props.variant || "light";

  const isDark = variant === "dark";

  return (
    <section
      className={`py-8 border-b ${
        isDark ? "bg-[#1A1A1A] border-white/10" : "bg-[#F3F4F6] border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div
                className={`text-3xl md:text-4xl font-bold ${
                  isDark ? "text-[#E63229]" : "text-[#E63229]"
                }`}
              >
                {stat.value}
              </div>
              <div
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-[#6B7280]"
                }`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
