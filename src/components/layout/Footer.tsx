"use client";

import { useState } from "react";

/**
 * Footer Component
 *
 * Access Hire Australia branded footer with red background.
 * Features location tabs and contact info.
 */

const locations = [
  { id: "wa", label: "WA", city: "Perth", phone: "08 9406 3888", address: "123 Industrial Dr, Wangara WA 6065" },
  { id: "nt", label: "NT", city: "Darwin", phone: "08 8947 1544", address: "45 Stuart Highway, Winnellie NT 0820" },
  { id: "qld", label: "QLD", city: "Brisbane", phone: "07 3277 5155", address: "78 Access Way, Acacia Ridge QLD 4110" },
  { id: "nsw", label: "NSW", city: "Sydney", phone: "02 9756 3688", address: "90 Equipment St, Wetherill Park NSW 2164" },
  { id: "vic", label: "VIC", city: "Melbourne", phone: "03 9357 8922", address: "56 Hire Lane, Campbellfield VIC 3061" },
  { id: "sa", label: "SA", city: "Adelaide", phone: "08 8349 7955", address: "34 Access Rd, Wingfield SA 5013" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com/accesshireaustralia",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/access-hire-australia",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  {
    label: "Instagram",
    href: "https://instagram.com/accesshireaustralia",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  },
  {
    label: "YouTube",
    href: "https://youtube.com/accesshireaustralia",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
];

export function Footer() {
  const [activeLocation, setActiveLocation] = useState("wa");
  const currentLocation = locations.find((l) => l.id === activeLocation) || locations[0];

  return (
    <footer className="bg-[#E31937] text-white">
      {/* Location Tabs */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setActiveLocation(location.id)}
                  className={`px-4 md:px-6 py-3 text-sm font-bold transition-colors ${
                    activeLocation === location.id
                      ? "bg-white text-[#E31937]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>
            <a
              href="tel:134000"
              className="hidden md:flex items-center gap-2 px-4 py-3 font-bold text-xl hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              13 4000
            </a>
          </div>
        </div>
      </div>

      {/* Location Info Bar - same red color */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-bold">{currentLocation.city}</span>
              <span className="text-white/80">{currentLocation.address}</span>
            </div>
            <a href={`tel:${currentLocation.phone.replace(/\s/g, "")}`} className="font-semibold hover:underline">
              {currentLocation.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Simplified */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div className="flex-shrink-0">
            {/* Placeholder for white/reversed logo */}
            <div className="w-[180px] h-[50px] bg-white/20 rounded flex items-center justify-center text-white/60 text-xs mb-4">
              Logo (white version)
            </div>
            <p className="text-white/80 text-sm max-w-xs">
              Australia&apos;s leading elevated work platform and materials handling equipment hire company.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <div>
                <p className="font-bold text-lg">13 4000</p>
                <p className="text-white/70 text-xs">24/7 Support</p>
              </div>
            </div>

            <a href="mailto:info@accesshire.net" className="flex items-center gap-3 hover:underline">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              info@accesshire.net
            </a>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-sm text-white/70 text-center md:text-left">
            &copy; {new Date().getFullYear()} Access Hire Australia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
