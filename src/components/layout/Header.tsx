"use client";

import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

/**
 * Header Component - Brand Aware
 *
 * Uses CSS variables from ThemeProvider for colors and logo.
 * Automatically adapts to the selected brand (Access Hire, Access Express, etc.)
 */

export function Header() {
  const { brand } = useTheme();

  // Get logo URL from brand assets, with fallback
  const logoUrl = brand.assets?.logoUrl || brand.assets?.logoUrlDark || "/images/brand/access-hire-logo.webp";
  const brandName = brand.name || "Access Hire Australia";

  return (
    <header
      className="sticky top-0 z-50 shadow-sm"
      style={{
        backgroundColor: "var(--color-header, white)",
        color: "var(--color-header-foreground, #1A1A1A)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - stays on current page */}
          <a
            href="#"
            className="flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Image
              src={logoUrl}
              alt={brandName}
              width={180}
              height={50}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </a>

          {/* Right side - Phone + CTA */}
          <div className="flex items-center gap-4">
            {/* Phone Number */}
            <a
              href="tel:134000"
              className="hidden sm:flex items-center gap-2 font-bold text-lg transition-colors"
              style={{ color: "var(--color-header-foreground)" }}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--color-primary)" }}
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              13 4000
            </a>

            {/* Get a Quote Button - uses primary color */}
            <a
              href="#quote-form"
              className="px-5 py-2.5 font-semibold rounded transition-colors"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              Get a Quote
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
