"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Header Component
 *
 * Simplified landing page header with logo, phone number, and Get a Quote button.
 */

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/brand/access-hire-logo.webp"
              alt="Access Hire Australia"
              width={180}
              height={50}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Right side - Phone + CTA */}
          <div className="flex items-center gap-4">
            {/* Phone Number */}
            <a
              href="tel:134000"
              className="hidden sm:flex items-center gap-2 text-[#1A1A1A] font-bold text-lg hover:text-[#E31937] transition-colors"
            >
              <svg className="w-5 h-5 text-[#E31937]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              13 4000
            </a>

            {/* Get a Quote Button - scrolls to form */}
            <a
              href="#quote-form"
              className="px-5 py-2.5 bg-[#E31937] text-white font-semibold rounded hover:bg-[#C42920] transition-colors"
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
