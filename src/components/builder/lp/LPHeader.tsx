"use client";

interface NavLink {
  label: string;
  href: string;
}

export interface LPHeaderProps {
  logoUrl?: string;
  companyName?: string;
  navLinks?: NavLink[];
  phoneNumber?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: "full" | "minimal";
}

export function LPHeader(props: Partial<LPHeaderProps>) {
  const logoUrl = props.logoUrl;
  const companyName = props.companyName || "ACCESS HIRE";
  const navLinks = props.navLinks || [];
  const phoneNumber = props.phoneNumber || "13 4000";
  const ctaText = props.ctaText || "Get a Quote";
  const ctaLink = props.ctaLink || "#quote-form";
  const variant = props.variant || "full";

  const isMinimal = variant === "minimal";

  return (
    <header
      className={`bg-[#1A1A1A] text-white ${isMinimal ? "bg-opacity-80 backdrop-blur-sm border-b border-white/10" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="h-10 w-auto" />
            ) : (
              <div className="w-10 h-10 bg-[#E63229] rounded flex items-center justify-center">
                <span className="font-bold text-xl">A</span>
              </div>
            )}
            <span className="font-bold text-lg hidden sm:block">{companyName}</span>
          </div>

          {/* Navigation - only show on full variant */}
          {!isMinimal && navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="hover:text-[#E63229] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* CTA */}
          <div className="flex items-center gap-4">
            <a
              href={`tel:${phoneNumber.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm hover:text-[#E63229] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="hidden sm:inline">{phoneNumber}</span>
            </a>
            {!isMinimal && (
              <a
                href={ctaLink}
                className="bg-[#E63229] hover:bg-[#C42920] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
