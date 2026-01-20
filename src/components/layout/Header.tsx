"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Header Component
 *
 * Access Hire Australia branded header with white background.
 * Features service tabs, phone number, and mobile navigation.
 */

const navLinks = [
  { label: "Equipment", href: "/equipment" },
  { label: "Locations", href: "/locations" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar - Phone Number */}
      <div className="bg-[#E31937]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-end">
            {/* Phone Number */}
            <a
              href="tel:134000"
              className="flex items-center gap-2 py-2 px-4 text-white font-bold text-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              13 4000
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[#1A1A1A] font-medium hover:text-[#E31937] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/quote"
              className="ml-4 px-6 py-2.5 bg-[#E31937] text-white font-semibold rounded hover:bg-[#C42920] transition-colors"
            >
              Get a Quote
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1A1A] hover:text-[#E31937]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {/* Mobile Nav Links */}
          <nav className="py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-[#1A1A1A] font-medium hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-4">
              <Link
                href="/quote"
                className="block w-full py-3 text-center bg-[#E31937] text-white font-semibold rounded hover:bg-[#C42920] transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
