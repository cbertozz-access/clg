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

const defaultColumns = [
  {
    title: "Lorem Ipsum",
    links: [
      { label: "Dolor Sit", href: "#" },
      { label: "Amet Consectetur", href: "#" },
      { label: "Adipiscing Elit", href: "#" },
      { label: "Sed Eiusmod", href: "#" },
    ],
  },
  {
    title: "Dolor Amet",
    links: [
      { label: "Tempor Incididunt", href: "#" },
      { label: "Ut Labore", href: "#" },
      { label: "Et Dolore", href: "#" },
      { label: "Magna Aliqua", href: "#" },
    ],
  },
];

export function LPFooter(props: Partial<LPFooterProps>) {
  const logoUrl = props.logoUrl || "https://placehold.co/40x40/E63229/white?text=L";
  const companyName = props.companyName || "LOREM IPSUM";
  const companyDescription = props.companyDescription || "Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const columns = props.columns?.length ? props.columns : defaultColumns;
  const phoneNumber = props.phoneNumber || "13 4000";
  const email = props.email || "info@accesshire.net";
  const copyrightText = props.copyrightText || "© 2024 Lorem Ipsum Dolor. Sit amet consectetur.";
  const variant = props.variant || "full";

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
              <img src={logoUrl} alt={companyName} className="h-10 w-auto rounded" />
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
