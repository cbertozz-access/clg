"use client";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface LPFooterProps {
  logoUrl?: string;
  companyName?: string;
  companyDescription?: string;
  columns?: FooterColumn[];
  phoneNumber?: string;
  email?: string;
  copyrightText?: string;
  variant?: "full" | "minimal";
}

export function LPFooter({
  logoUrl,
  companyName = "ACCESS HIRE",
  companyDescription = "Australia's largest privately-owned equipment hire company since 1985.",
  columns = [
    {
      title: "Equipment",
      links: [
        { label: "Forklifts", href: "#" },
        { label: "Boom Lifts", href: "#" },
        { label: "Scissor Lifts", href: "#" },
        { label: "Telehandlers", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Locations", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ],
  phoneNumber = "13 4000",
  email = "info@accesshire.net",
  copyrightText = "© 2024 Access Hire Australia. All rights reserved.",
  variant = "full",
}: LPFooterProps) {
  if (variant === "minimal") {
    return (
      <footer className="bg-[#1A1A1A] py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            {copyrightText} |{" "}
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-white">
              Terms
            </a>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#1A1A1A] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-10 w-auto" />
              ) : (
                <div className="w-10 h-10 bg-[#E63229] rounded flex items-center justify-center">
                  <span className="font-bold text-xl">A</span>
                </div>
              )}
              <span className="font-bold">{companyName}</span>
            </div>
            <p className="text-gray-400 text-sm">{companyDescription}</p>
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>{phoneNumber}</li>
              <li>{email}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
