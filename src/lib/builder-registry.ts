import type { RegisteredComponent } from "@builder.io/sdk-react-nextjs";
import { CategoryHeroCC } from "../components/builder/CategoryHeroCC";
import {
  LPHeader,
  LPHero,
  LPTrustBadges,
  LPBenefits,
  LPProductsGrid,
  LPTestimonials,
  LPQuoteForm,
  LPFaq,
  LPCtaBanner,
  LPFooter,
  LPBreadcrumb,
  LPStickyForm,
} from "../components/builder/lp";

/**
 * Builder.io Component Registry
 *
 * Naming Convention:
 * - "CC" suffix = CLG-39 created (CLG-39)
 * - "LP" prefix = Landing Page components (CLG-39)
 * - No suffix = Builder.io AI created (CLG-38)
 */

// Define custom components for Builder.io
export const customComponents: RegisteredComponent[] = [
  // ============================================
  // CATEGORY HERO (Original)
  // ============================================
  {
    component: CategoryHeroCC,
    name: "CategoryHeroCC",
    friendlyName: "Category Hero (CLG-39)",
    description:
      "Equipment category hero section with value proposition, benefits, and CTAs. Created by CLG-39 for AI Platform Comparison (CLG-39).",

    inputs: [
      {
        name: "categoryName",
        type: "string",
        defaultValue: "Equipment Hire",
        friendlyName: "Category Name",
        helperText:
          "Main heading for the category (e.g., 'Scissor Lifts', 'Excavators')",
      },
      {
        name: "valueProposition",
        type: "longText",
        defaultValue:
          "Access Australia's largest fleet of equipment for projects of any size",
        friendlyName: "Value Proposition",
        helperText: "Supporting text explaining the category value",
      },
      {
        name: "benefits",
        type: "list",
        defaultValue: [
          { benefit: "24/7 equipment support" },
          { benefit: "Flexible hire periods" },
          { benefit: "Delivery to any site" },
          { benefit: "Fully maintained fleet" },
        ],
        friendlyName: "Benefits List",
        helperText: "Key benefits shown with checkmarks",
        subFields: [
          {
            name: "benefit",
            type: "string",
            friendlyName: "Benefit Text",
          },
        ],
      },
      {
        name: "trustBadgeText",
        type: "string",
        defaultValue: "Available across 5 locations Australia-wide",
        friendlyName: "Trust Badge",
        helperText: "Trust-building statement shown below benefits",
      },
      {
        name: "primaryButtonText",
        type: "string",
        defaultValue: "Get a Quote",
        friendlyName: "Primary Button Text",
      },
      {
        name: "primaryButtonLink",
        type: "url",
        defaultValue: "/quote",
        friendlyName: "Primary Button Link",
      },
      {
        name: "secondaryButtonText",
        type: "string",
        defaultValue: "Browse Equipment",
        friendlyName: "Secondary Button Text",
      },
      {
        name: "secondaryButtonLink",
        type: "url",
        defaultValue: "#equipment-grid",
        friendlyName: "Secondary Button Link",
      },
      {
        name: "backgroundColor",
        type: "color",
        defaultValue: "#1F2937",
        friendlyName: "Background Color",
        helperText: "Fallback color when no image is set",
      },
      {
        name: "backgroundImage",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "webp"],
        friendlyName: "Background Image",
        helperText: "Hero background image (optional)",
      },
      {
        name: "overlayOpacity",
        type: "number",
        defaultValue: 60,
        friendlyName: "Overlay Opacity",
        helperText: "Darkness of overlay on background image (0-100)",
      },
      {
        name: "primaryButtonColor",
        type: "color",
        defaultValue: "#F97316",
        friendlyName: "Primary Button Color",
        helperText: "Access Group orange by default",
      },
    ],
  },

  // ============================================
  // LANDING PAGE COMPONENTS
  // ============================================

  // LP Header
  {
    component: LPHeader,
    name: "LPHeader",
    friendlyName: "LP - Header",
    description: "Landing page header with logo, navigation, and CTA",
    inputs: [
      {
        name: "logoUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"],
        friendlyName: "Logo Image",
      },
      {
        name: "companyName",
        type: "string",
        defaultValue: "ACCESS HIRE",
        friendlyName: "Company Name",
      },
      {
        name: "navLinks",
        type: "list",
        friendlyName: "Navigation Links",
        subFields: [
          { name: "label", type: "string", friendlyName: "Label" },
          { name: "href", type: "url", friendlyName: "Link" },
        ],
      },
      {
        name: "phoneNumber",
        type: "string",
        defaultValue: "13 4000",
        friendlyName: "Phone Number",
      },
      {
        name: "ctaText",
        type: "string",
        defaultValue: "Get a Quote",
        friendlyName: "CTA Button Text",
      },
      {
        name: "ctaLink",
        type: "url",
        defaultValue: "#quote-form",
        friendlyName: "CTA Button Link",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["full", "minimal"],
        defaultValue: "full",
        friendlyName: "Variant",
        helperText: "Full shows nav & CTA button, minimal shows only logo & phone",
      },
    ],
  },

  // LP Hero
  {
    component: LPHero,
    name: "LPHero",
    friendlyName: "LP - Hero Section",
    description: "Hero section with headline, subheadline, and CTAs. Supports standard, squeeze, and product-focused variants.",
    inputs: [
      {
        name: "variant",
        type: "enum",
        enum: ["standard", "squeeze", "product-focused"],
        defaultValue: "standard",
        friendlyName: "Variant",
        helperText: "standard: full hero, squeeze: side form layout, product-focused: minimal title",
      },
      {
        name: "backgroundImage",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "webp"],
        friendlyName: "Background Image",
      },
      {
        name: "overlayOpacity",
        type: "number",
        defaultValue: 60,
        friendlyName: "Overlay Opacity",
        helperText: "0-100",
      },
      {
        name: "headline",
        type: "string",
        defaultValue: "Equipment Hire Across Australia",
        friendlyName: "Headline",
      },
      {
        name: "highlightWord",
        type: "string",
        defaultValue: "Equipment",
        friendlyName: "Highlight Word",
        helperText: "Word in headline to highlight in red",
      },
      {
        name: "subheadline",
        type: "longText",
        defaultValue: "Get competitive quotes from Australia's largest privately-owned equipment fleet.",
        friendlyName: "Subheadline",
      },
      {
        name: "primaryCtaText",
        type: "string",
        defaultValue: "Get a Quote",
        friendlyName: "Primary CTA Text",
      },
      {
        name: "primaryCtaLink",
        type: "url",
        defaultValue: "#quote-form",
        friendlyName: "Primary CTA Link",
      },
      {
        name: "secondaryCtaText",
        type: "string",
        defaultValue: "Call 13 4000",
        friendlyName: "Secondary CTA Text",
      },
      {
        name: "secondaryCtaLink",
        type: "url",
        defaultValue: "tel:134000",
        friendlyName: "Secondary CTA Link",
      },
      {
        name: "benefits",
        type: "list",
        friendlyName: "Benefits (squeeze variant)",
        subFields: [{ name: "text", type: "string", friendlyName: "Benefit" }],
      },
      {
        name: "showBadge",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Show Badge",
      },
      {
        name: "badgeText",
        type: "string",
        defaultValue: "Fast Response Guaranteed",
        friendlyName: "Badge Text",
      },
    ],
  },

  // LP Trust Badges
  {
    component: LPTrustBadges,
    name: "LPTrustBadges",
    friendlyName: "LP - Trust Badges / Stats",
    description: "Row of stats/trust indicators",
    inputs: [
      {
        name: "stats",
        type: "list",
        friendlyName: "Stats",
        defaultValue: [
          { value: "7,500", label: "Equipment Units" },
          { value: "24/7", label: "Support Available" },
          { value: "20+", label: "Locations" },
          { value: "25+", label: "Years Experience" },
        ],
        subFields: [
          { name: "value", type: "string", friendlyName: "Value" },
          { name: "label", type: "string", friendlyName: "Label" },
        ],
      },
      {
        name: "variant",
        type: "enum",
        enum: ["light", "dark"],
        defaultValue: "light",
        friendlyName: "Background Variant",
      },
    ],
  },

  // LP Benefits
  {
    component: LPBenefits,
    name: "LPBenefits",
    friendlyName: "LP - Benefits Grid",
    description: "Grid of benefit cards with icons",
    inputs: [
      {
        name: "sectionTitle",
        type: "string",
        defaultValue: "Why Choose Access Hire?",
        friendlyName: "Section Title",
      },
      {
        name: "benefits",
        type: "list",
        friendlyName: "Benefits",
        defaultValue: [
          { icon: "shield", title: "Safety Certified", description: "All equipment meets strict Australian safety standards." },
          { icon: "clock", title: "24/7 Support", description: "Round-the-clock assistance whenever you need it." },
          { icon: "location", title: "Australia Wide", description: "Delivery and pickup from 20+ locations." },
          { icon: "badge", title: "25+ Years", description: "Industry expertise you can trust." },
        ],
        subFields: [
          { name: "icon", type: "enum", enum: ["shield", "clock", "location", "badge"], friendlyName: "Icon" },
          { name: "title", type: "string", friendlyName: "Title" },
          { name: "description", type: "string", friendlyName: "Description" },
        ],
      },
      {
        name: "columns",
        type: "enum",
        enum: ["2", "3", "4"],
        defaultValue: "4",
        friendlyName: "Columns",
      },
    ],
  },

  // LP Products Grid
  {
    component: LPProductsGrid,
    name: "LPProductsGrid",
    friendlyName: "LP - Products Grid",
    description: "Grid of products fetched from API",
    inputs: [
      {
        name: "sectionTitle",
        type: "string",
        defaultValue: "Featured Equipment",
        friendlyName: "Section Title",
      },
      {
        name: "apiEndpoint",
        type: "string",
        defaultValue: "https://acccessproducts.netlify.app/api/products",
        friendlyName: "API Endpoint",
      },
      {
        name: "category",
        type: "string",
        defaultValue: "Forklift",
        friendlyName: "Category Filter",
      },
      {
        name: "productsPerRow",
        type: "enum",
        enum: ["2", "3"],
        defaultValue: "3",
        friendlyName: "Products Per Row",
      },
      {
        name: "maxProducts",
        type: "number",
        defaultValue: 6,
        friendlyName: "Max Products",
      },
      {
        name: "viewAllLink",
        type: "url",
        friendlyName: "View All Link",
      },
      {
        name: "viewAllText",
        type: "string",
        defaultValue: "View All Equipment",
        friendlyName: "View All Text",
      },
      {
        name: "backgroundColor",
        type: "enum",
        enum: ["light", "white"],
        defaultValue: "light",
        friendlyName: "Background",
      },
    ],
  },

  // LP Testimonials
  {
    component: LPTestimonials,
    name: "LPTestimonials",
    friendlyName: "LP - Testimonials",
    description: "Customer testimonials grid or single highlight",
    inputs: [
      {
        name: "sectionTitle",
        type: "string",
        defaultValue: "What Our Customers Say",
        friendlyName: "Section Title",
      },
      {
        name: "testimonials",
        type: "list",
        friendlyName: "Testimonials",
        subFields: [
          { name: "quote", type: "longText", friendlyName: "Quote" },
          { name: "name", type: "string", friendlyName: "Name" },
          { name: "title", type: "string", friendlyName: "Job Title" },
          { name: "company", type: "string", friendlyName: "Company" },
          { name: "avatarUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"], friendlyName: "Avatar" },
        ],
      },
      {
        name: "variant",
        type: "enum",
        enum: ["grid", "single"],
        defaultValue: "grid",
        friendlyName: "Layout Variant",
        helperText: "grid: 3-column layout, single: centered highlight",
      },
    ],
  },

  // LP Quote Form
  {
    component: LPQuoteForm,
    name: "LPQuoteForm",
    friendlyName: "LP - Quote Form",
    description: "Lead capture form with configurable fields",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Request a Quote",
        friendlyName: "Form Title",
      },
      {
        name: "subtitle",
        type: "string",
        defaultValue: "Fill in your details and we'll get back to you within 24 hours.",
        friendlyName: "Subtitle",
      },
      {
        name: "submitButtonText",
        type: "string",
        defaultValue: "Submit",
        friendlyName: "Submit Button Text",
      },
      {
        name: "fields",
        type: "list",
        friendlyName: "Form Fields",
        subFields: [
          { name: "name", type: "string", friendlyName: "Field Name (ID)" },
          { name: "label", type: "string", friendlyName: "Label" },
          { name: "type", type: "enum", enum: ["text", "email", "tel", "select", "textarea"], friendlyName: "Type" },
          { name: "placeholder", type: "string", friendlyName: "Placeholder" },
          { name: "required", type: "boolean", friendlyName: "Required" },
          { name: "highlighted", type: "boolean", friendlyName: "Highlighted", helperText: "Show with red border emphasis" },
          { name: "options", type: "list", friendlyName: "Options (for select)", subFields: [{ name: "option", type: "string" }] },
          { name: "helperText", type: "string", friendlyName: "Helper Text" },
        ],
      },
      {
        name: "showPrivacyNote",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Privacy Note",
      },
      {
        name: "privacyNoteText",
        type: "string",
        defaultValue: "Your information is secure and will never be shared",
        friendlyName: "Privacy Note Text",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["standard", "compact"],
        defaultValue: "standard",
        friendlyName: "Variant",
      },
      {
        name: "backgroundColor",
        type: "enum",
        enum: ["dark", "light", "none"],
        defaultValue: "dark",
        friendlyName: "Background",
      },
    ],
  },

  // LP FAQ
  {
    component: LPFaq,
    name: "LPFaq",
    friendlyName: "LP - FAQ Accordion",
    description: "Expandable FAQ section",
    inputs: [
      {
        name: "sectionTitle",
        type: "string",
        defaultValue: "Frequently Asked Questions",
        friendlyName: "Section Title",
      },
      {
        name: "items",
        type: "list",
        friendlyName: "FAQ Items",
        subFields: [
          { name: "question", type: "string", friendlyName: "Question" },
          { name: "answer", type: "longText", friendlyName: "Answer" },
        ],
      },
      {
        name: "defaultOpenIndex",
        type: "number",
        defaultValue: 0,
        friendlyName: "Default Open Index",
        helperText: "Which item to show open by default (0 = first)",
      },
    ],
  },

  // LP CTA Banner
  {
    component: LPCtaBanner,
    name: "LPCtaBanner",
    friendlyName: "LP - CTA Banner",
    description: "Full-width call-to-action banner",
    inputs: [
      {
        name: "headline",
        type: "string",
        defaultValue: "Ready to Get Started?",
        friendlyName: "Headline",
      },
      {
        name: "subtext",
        type: "string",
        defaultValue: "Get a competitive quote for your equipment hire needs today.",
        friendlyName: "Subtext",
      },
      {
        name: "primaryCtaText",
        type: "string",
        defaultValue: "Get a Quote",
        friendlyName: "Primary CTA Text",
      },
      {
        name: "primaryCtaLink",
        type: "url",
        defaultValue: "#quote-form",
        friendlyName: "Primary CTA Link",
      },
      {
        name: "secondaryCtaText",
        type: "string",
        defaultValue: "Call 13 4000",
        friendlyName: "Secondary CTA Text",
      },
      {
        name: "secondaryCtaLink",
        type: "url",
        defaultValue: "tel:134000",
        friendlyName: "Secondary CTA Link",
      },
    ],
  },

  // LP Footer
  {
    component: LPFooter,
    name: "LPFooter",
    friendlyName: "LP - Footer",
    description: "Page footer with links and contact info",
    inputs: [
      {
        name: "logoUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"],
        friendlyName: "Logo Image",
      },
      {
        name: "companyName",
        type: "string",
        defaultValue: "ACCESS HIRE",
        friendlyName: "Company Name",
      },
      {
        name: "companyDescription",
        type: "string",
        defaultValue: "Australia's largest privately-owned equipment hire company since 1985.",
        friendlyName: "Company Description",
      },
      {
        name: "columns",
        type: "list",
        friendlyName: "Link Columns",
        subFields: [
          { name: "title", type: "string", friendlyName: "Column Title" },
          {
            name: "links",
            type: "list",
            friendlyName: "Links",
            subFields: [
              { name: "label", type: "string", friendlyName: "Label" },
              { name: "href", type: "url", friendlyName: "URL" },
            ],
          },
        ],
      },
      {
        name: "phoneNumber",
        type: "string",
        defaultValue: "13 4000",
        friendlyName: "Phone Number",
      },
      {
        name: "email",
        type: "string",
        defaultValue: "info@accesshire.net",
        friendlyName: "Email",
      },
      {
        name: "copyrightText",
        type: "string",
        defaultValue: "© 2024 Access Hire Australia. All rights reserved.",
        friendlyName: "Copyright Text",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["full", "minimal"],
        defaultValue: "full",
        friendlyName: "Variant",
      },
    ],
  },

  // LP Breadcrumb
  {
    component: LPBreadcrumb,
    name: "LPBreadcrumb",
    friendlyName: "LP - Breadcrumb",
    description: "Navigation breadcrumb trail",
    inputs: [
      {
        name: "items",
        type: "list",
        friendlyName: "Breadcrumb Items",
        subFields: [
          { name: "label", type: "string", friendlyName: "Label" },
          { name: "href", type: "url", friendlyName: "Link" },
        ],
      },
      {
        name: "currentPage",
        type: "string",
        defaultValue: "Current Page",
        friendlyName: "Current Page",
      },
    ],
  },

  // LP Sticky Form
  {
    component: LPStickyForm,
    name: "LPStickyForm",
    friendlyName: "LP - Sticky Sidebar Form",
    description: "Compact form that sticks to sidebar on scroll",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Get a Quick Quote",
        friendlyName: "Title",
      },
      {
        name: "subtitle",
        type: "string",
        defaultValue: "Tell us what you need and we'll respond within 2 hours",
        friendlyName: "Subtitle",
      },
      {
        name: "submitButtonText",
        type: "string",
        defaultValue: "Get My Quote",
        friendlyName: "Submit Button Text",
      },
      {
        name: "phoneNumber",
        type: "string",
        defaultValue: "13 4000",
        friendlyName: "Phone Number",
      },
      {
        name: "showPhoneCta",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Phone CTA",
      },
    ],
  },
];
