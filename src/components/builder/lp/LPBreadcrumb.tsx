"use client";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface LPBreadcrumbProps {
  items?: BreadcrumbItem[];
  currentPage?: string;
}

const defaultItems = [
  { label: "Lorem", href: "/" },
  { label: "Ipsum", href: "/ipsum" },
];

export function LPBreadcrumb(props: Partial<LPBreadcrumbProps>) {
  const items = props.items?.length ? props.items : defaultItems;
  const currentPage = props.currentPage || "Dolor Sit";
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="text-sm text-[#6B7280]">
          {items.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <a href={item.href} className="hover:text-[#E63229]">
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              <span className="mx-2">/</span>
            </span>
          ))}
          <span className="text-[#1A1A1A] font-medium">{currentPage}</span>
        </nav>
      </div>
    </div>
  );
}
