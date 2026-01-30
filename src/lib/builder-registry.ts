import type { RegisteredComponent } from "@builder.io/sdk-react-nextjs";
import { CategoryHeroCC } from "../components/builder/CategoryHeroCC";
import {
  LPHero,
  LPTrustBadges,
  LPBenefits,
  LPProductsGrid,
  LPTestimonials,
  LPFaq,
  LPCtaBanner,
  LPBreadcrumb,
  LPStickyForm,
  LPStickyBottomCTA,
  LPFilterBar,
  LPFilterChips,
  LPQuoteModal,
  LPTrustScroll,
  LPLoadMore,
} from "../components/builder/lp";
import { ContactForm } from "../components/builder/ContactForm";
import {
  FigmaButton,
  FigmaInput,
  FigmaDialog,
  FigmaProductCard,
  FigmaProductCardAPI,
  FigmaProductGrid,
  FigmaHero,
} from "../components/builder/figma";
import {
  EquipmentCard,
  EquipmentGrid,
  EquipmentSearch,
  EquipmentSelector,
} from "../components/builder/equipment";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

/**
 * Builder.io Component Registry
 *
 * Naming Convention:
 * - "Figma" prefix = Figma-generated components with CSS variable theming
 * - "CC" suffix = CLG-39 created (CLG-39)
 * - "LP" prefix = Landing Page components (CLG-39)
 * - No suffix = Builder.io AI created (CLG-38)
 */

// Define custom components for Builder.io
export const customComponents: RegisteredComponent[] = [
  // ============================================
  // FIGMA COMPONENTS (Whitelabel/Multi-brand)
  // Uses CSS variables for theming
  // ============================================

  // Figma Button
  {
    component: FigmaButton,
    name: "FigmaButton",
    friendlyName: "Figma - Button",
    description: "Multi-brand button component with CSS variable theming. Supports primary, secondary, and outline variants.",
    inputs: [
      {
        name: "label",
        type: "string",
        defaultValue: "Button",
        friendlyName: "Label",
        helperText: "Button text",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["primary", "secondary", "outline"],
        defaultValue: "primary",
        friendlyName: "Variant",
        helperText: "Visual style of the button",
      },
      {
        name: "size",
        type: "enum",
        enum: ["sm", "md", "lg"],
        defaultValue: "md",
        friendlyName: "Size",
      },
      {
        name: "fullWidth",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Full Width",
        helperText: "Make button span full container width",
      },
      {
        name: "href",
        type: "url",
        friendlyName: "Link URL",
        helperText: "If set, button renders as a link",
      },
      {
        name: "type",
        type: "enum",
        enum: ["button", "submit", "reset"],
        defaultValue: "button",
        friendlyName: "Button Type",
        helperText: "HTML button type (for forms)",
      },
    ],
  },

  // Figma Input
  {
    component: FigmaInput,
    name: "FigmaInput",
    friendlyName: "Figma - Input Field",
    description: "Multi-brand form input with label, validation states, and CSS variable theming.",
    inputs: [
      {
        name: "label",
        type: "string",
        defaultValue: "Label",
        friendlyName: "Label",
      },
      {
        name: "placeholder",
        type: "string",
        defaultValue: "Enter value",
        friendlyName: "Placeholder",
      },
      {
        name: "type",
        type: "enum",
        enum: ["text", "email", "tel", "password", "number"],
        defaultValue: "text",
        friendlyName: "Input Type",
      },
      {
        name: "name",
        type: "string",
        friendlyName: "Field Name",
        helperText: "Form field name/ID",
      },
      {
        name: "required",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Required",
      },
      {
        name: "helperText",
        type: "string",
        friendlyName: "Helper Text",
        helperText: "Help text shown below input",
      },
      {
        name: "error",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Error State",
      },
      {
        name: "errorMessage",
        type: "string",
        friendlyName: "Error Message",
        helperText: "Shown when error is true",
      },
    ],
  },

  // Figma Dialog
  {
    component: FigmaDialog,
    name: "FigmaDialog",
    friendlyName: "Figma - Dialog/Modal",
    description: "Email subscription dialog with CSS variable theming. Includes title, description, email input, and submit button.",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Stay Ahead with Exclusive Deals & Updates!",
        friendlyName: "Title",
      },
      {
        name: "description",
        type: "longText",
        defaultValue: "Sign up for the latest offers on forklift, generator, and earthmover hires and sales—plus expert tips and industry news!",
        friendlyName: "Description",
      },
      {
        name: "inputPlaceholder",
        type: "string",
        defaultValue: "Your Email",
        friendlyName: "Input Placeholder",
      },
      {
        name: "buttonText",
        type: "string",
        defaultValue: "Subscribe",
        friendlyName: "Button Text",
      },
      {
        name: "showCloseButton",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Close Button",
      },
      {
        name: "formAction",
        type: "url",
        friendlyName: "Form Action URL",
        helperText: "URL to submit the form to",
      },
    ],
  },

  // Figma Product Card
  {
    component: FigmaProductCard,
    name: "FigmaProductCard",
    friendlyName: "Figma - Product Card",
    description: "Equipment product listing card with image, specs, pricing, and CTA. Uses CSS variable theming.",
    inputs: [
      {
        name: "imageUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "webp"],
        friendlyName: "Product Image",
      },
      {
        name: "logoUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"],
        friendlyName: "Brand Logo",
        helperText: "Optional brand logo shown above product",
      },
      {
        name: "fuelType",
        type: "string",
        defaultValue: "Diesel",
        friendlyName: "Fuel Type",
      },
      {
        name: "modelNumber",
        type: "string",
        defaultValue: "340AJ",
        friendlyName: "Model Number",
      },
      {
        name: "title",
        type: "string",
        defaultValue: "33ft Articulating Boom Lift",
        friendlyName: "Title",
      },
      {
        name: "spec1",
        type: "string",
        defaultValue: "Reach: 19' 11\"/6.06M",
        friendlyName: "Spec Line 1",
      },
      {
        name: "spec2",
        type: "string",
        defaultValue: "Height: 33' 9\"/10.28M",
        friendlyName: "Spec Line 2",
      },
      {
        name: "dailyPrice",
        type: "string",
        defaultValue: "$149.00",
        friendlyName: "Daily Price",
      },
      {
        name: "weeklyPrice",
        type: "string",
        defaultValue: "$301.00",
        friendlyName: "Weekly Price",
      },
      {
        name: "ctaText",
        type: "string",
        defaultValue: "View details",
        friendlyName: "CTA Text",
      },
      {
        name: "ctaLink",
        type: "string",
        defaultValue: "/product",
        friendlyName: "CTA Link",
        helperText: "Link to product details page",
      },
    ],
  },

  // Figma Product Card (API Connected - Single Product Picker)
  {
    component: FigmaProductCardAPI,
    name: "FigmaProductCardAPI",
    friendlyName: "Figma - Product Card (API Picker)",
    description: "Select a specific product from the API to display.",
    inputs: [
      {
        name: "productId",
        type: "string",
        friendlyName: "Product ID",
        helperText: "Enter product ID (e.g., H48XM-12). View all products at: acccessproducts.netlify.app/api/products",
        required: true,
      },
      {
        name: "ctaText",
        type: "string",
        defaultValue: "View Details",
        friendlyName: "CTA Text",
      },
      {
        name: "productBaseUrl",
        type: "string",
        defaultValue: "/equipment",
        friendlyName: "Product Base URL",
        advanced: true,
      },
      {
        name: "showBrandLogo",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Show Brand Logo",
      },
      {
        name: "brandLogoUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"],
        friendlyName: "Brand Logo",
        showIf: "options.get('showBrandLogo')",
      },
    ],
  },

  // Figma Product Grid (API Connected)
  {
    component: FigmaProductGrid,
    name: "FigmaProductGrid",
    friendlyName: "Figma - Product Grid (API)",
    description: "Product grid that fetches from live API. Uses CSS variable theming.",
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
        helperText: "URL to fetch products from",
      },
      {
        name: "category",
        type: "string",
        friendlyName: "Category Filter",
        helperText: "Filter by category (e.g., Forklift, Scissor Lift)",
      },
      {
        name: "subcategory",
        type: "string",
        friendlyName: "Subcategory Filter",
      },
      {
        name: "columns",
        type: "enum",
        enum: ["2", "3", "4"],
        defaultValue: "3",
        friendlyName: "Columns",
      },
      {
        name: "maxProducts",
        type: "number",
        defaultValue: 6,
        friendlyName: "Max Products",
      },
      {
        name: "viewAllLink",
        type: "string",
        friendlyName: "View All Link",
      },
      {
        name: "viewAllText",
        type: "string",
        defaultValue: "View All Equipment",
        friendlyName: "View All Text",
      },
      {
        name: "cardCtaText",
        type: "string",
        defaultValue: "View Details",
        friendlyName: "Card CTA Text",
      },
      {
        name: "productBaseUrl",
        type: "string",
        defaultValue: "/equipment",
        friendlyName: "Product Base URL",
        helperText: "Base URL for product detail pages",
      },
      {
        name: "showBrandLogo",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Show Brand Logo",
      },
      {
        name: "brandLogoUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"],
        friendlyName: "Brand Logo",
        helperText: "Logo shown on each card (if enabled)",
      },
    ],
  },

  // Figma Hero
  {
    component: FigmaHero,
    name: "FigmaHero",
    friendlyName: "Figma - Hero Section",
    description: "Full-width hero with background image, headline, subheadline, and CTAs. Uses CSS variable theming for multi-brand support.",
    inputs: [
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
        helperText: "Darkness of overlay (0-100)",
      },
      {
        name: "headline",
        type: "string",
        defaultValue: "Equipment Hire Across Australia",
        friendlyName: "Headline",
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
        defaultValue: "Browse Equipment",
        friendlyName: "Secondary CTA Text",
      },
      {
        name: "secondaryCtaLink",
        type: "url",
        defaultValue: "#equipment",
        friendlyName: "Secondary CTA Link",
      },
      {
        name: "minHeight",
        type: "enum",
        enum: ["sm", "md", "lg", "full"],
        defaultValue: "md",
        friendlyName: "Minimum Height",
        helperText: "sm: 300px, md: 450px, lg: 600px, full: 100vh",
      },
    ],
  },

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

  // Contact Form
  {
    component: ContactForm,
    name: "ContactForm",
    friendlyName: "Contact Form",
    description: "Self-contained quote request form with grouped fields and responsive layout",
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
        defaultValue: "Tell us about your project — we respond within 2 hours",
        friendlyName: "Subtitle",
      },
      {
        name: "submitButtonText",
        type: "string",
        defaultValue: "Get Your Quote",
        friendlyName: "Submit Button Text",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["full", "compact"],
        defaultValue: "full",
        friendlyName: "Form Variant",
        helperText: "full: all fields, compact: essential fields only",
      },
      {
        name: "backgroundColor",
        type: "enum",
        enum: ["white", "gray", "none"],
        defaultValue: "gray",
        friendlyName: "Background Color",
      },
      {
        name: "showPhoneCta",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Phone CTA",
      },
      {
        name: "phoneNumber",
        type: "string",
        defaultValue: "13 4000",
        friendlyName: "Phone Number",
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

  // ============================================
  // MOBILE-SPECIFIC COMPONENTS
  // ============================================

  // LP Sticky Bottom CTA (Mobile)
  {
    component: LPStickyBottomCTA,
    name: "LPStickyBottomCTA",
    friendlyName: "LP - Sticky Bottom CTA (Mobile)",
    description: "Fixed bottom bar with call and quote buttons for mobile pages",
    inputs: [
      {
        name: "phoneNumber",
        type: "string",
        defaultValue: "13 4000",
        friendlyName: "Phone Number",
      },
      {
        name: "callText",
        type: "string",
        defaultValue: "Call",
        friendlyName: "Call Button Text",
      },
      {
        name: "quoteText",
        type: "string",
        defaultValue: "Get Quote",
        friendlyName: "Quote Button Text",
      },
      {
        name: "quoteLink",
        type: "string",
        defaultValue: "#quote-form",
        friendlyName: "Quote Button Link",
      },
      {
        name: "showProductCount",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Show Product Count",
      },
      {
        name: "productCount",
        type: "number",
        friendlyName: "Product Count",
        showIf: "options.get('showProductCount')",
      },
      {
        name: "productCountLabel",
        type: "string",
        defaultValue: "products available",
        friendlyName: "Product Count Label",
        showIf: "options.get('showProductCount')",
      },
    ],
  },

  // LP Filter Bar (Desktop)
  {
    component: LPFilterBar,
    name: "LPFilterBar",
    friendlyName: "LP - Filter Bar (Desktop)",
    description: "Horizontal filter bar with dropdown selects for product filtering",
    inputs: [
      {
        name: "filters",
        type: "list",
        friendlyName: "Filters",
        subFields: [
          { name: "name", type: "string", friendlyName: "Filter ID" },
          { name: "label", type: "string", friendlyName: "Label" },
          {
            name: "options",
            type: "list",
            friendlyName: "Options",
            subFields: [
              { name: "label", type: "string", friendlyName: "Option Label" },
              { name: "value", type: "string", friendlyName: "Option Value" },
            ],
          },
        ],
      },
      {
        name: "showApiBadge",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show API Badge",
      },
      {
        name: "apiBadgeText",
        type: "string",
        defaultValue: "Live API",
        friendlyName: "API Badge Text",
      },
      {
        name: "productCount",
        type: "number",
        friendlyName: "Product Count",
      },
      {
        name: "productCountSuffix",
        type: "string",
        defaultValue: "products",
        friendlyName: "Count Suffix",
      },
    ],
  },

  // LP Filter Chips (Mobile)
  {
    component: LPFilterChips,
    name: "LPFilterChips",
    friendlyName: "LP - Filter Chips (Mobile)",
    description: "Horizontal scrolling filter pills for mobile product filtering",
    inputs: [
      {
        name: "chips",
        type: "list",
        friendlyName: "Filter Chips",
        subFields: [
          { name: "label", type: "string", friendlyName: "Chip Label" },
          { name: "value", type: "string", friendlyName: "Chip Value" },
        ],
      },
      {
        name: "showAllOption",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show 'All' Option",
      },
      {
        name: "allOptionLabel",
        type: "string",
        defaultValue: "All",
        friendlyName: "'All' Option Label",
      },
      {
        name: "selectedValue",
        type: "string",
        friendlyName: "Default Selected",
        helperText: "Value of the chip to select by default",
      },
    ],
  },

  // LP Quote Modal (Mobile)
  {
    component: LPQuoteModal,
    name: "LPQuoteModal",
    friendlyName: "LP - Quote Modal (Mobile)",
    description: "Slide-up modal form for mobile quote requests",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Get a Quote",
        friendlyName: "Modal Title",
      },
      {
        name: "subtitle",
        type: "string",
        friendlyName: "Modal Subtitle",
      },
      {
        name: "submitText",
        type: "string",
        defaultValue: "Get My Quote",
        friendlyName: "Submit Button Text",
      },
      {
        name: "equipmentOptions",
        type: "list",
        friendlyName: "Equipment Options",
        subFields: [
          { name: "label", type: "string", friendlyName: "Option Label" },
          { name: "value", type: "string", friendlyName: "Option Value" },
        ],
      },
      {
        name: "formAction",
        type: "string",
        friendlyName: "Form Action URL",
      },
    ],
  },

  // LP Trust Scroll (Mobile)
  {
    component: LPTrustScroll,
    name: "LPTrustScroll",
    friendlyName: "LP - Trust Scroll (Mobile)",
    description: "Horizontal scrolling trust badges/stats for mobile",
    inputs: [
      {
        name: "stats",
        type: "list",
        friendlyName: "Trust Stats",
        defaultValue: [
          { value: "7,500", label: "Equipment Units" },
          { value: "24/7", label: "Support" },
          { value: "20+", label: "Locations" },
          { value: "Same Day", label: "Delivery" },
        ],
        subFields: [
          { name: "value", type: "string", friendlyName: "Value" },
          { name: "label", type: "string", friendlyName: "Label" },
        ],
      },
      {
        name: "variant",
        type: "enum",
        enum: ["light", "white"],
        defaultValue: "white",
        friendlyName: "Background",
      },
    ],
  },

  // LP Load More Button
  {
    component: LPLoadMore,
    name: "LPLoadMore",
    friendlyName: "LP - Load More Button",
    description: "Button for loading more items in a list/grid",
    inputs: [
      {
        name: "text",
        type: "string",
        defaultValue: "Load More",
        friendlyName: "Button Text",
      },
      {
        name: "loadingText",
        type: "string",
        defaultValue: "Loading...",
        friendlyName: "Loading Text",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["primary", "outline"],
        defaultValue: "outline",
        friendlyName: "Button Style",
      },
    ],
  },

  // ============================================
  // EQUIPMENT COMPONENTS (Theming-aware)
  // Uses CSS variables for multi-brand theming
  // ============================================

  // Equipment Card
  {
    component: EquipmentCard,
    name: "EquipmentCard",
    friendlyName: "Equipment - Card",
    description: "Single equipment card with image, specs, pricing, and CTA. Uses CSS variable theming.",
    inputs: [
      {
        name: "id",
        type: "string",
        friendlyName: "Equipment ID",
      },
      {
        name: "imageUrl",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "webp"],
        friendlyName: "Product Image",
      },
      {
        name: "brand",
        type: "string",
        friendlyName: "Brand",
        helperText: "Equipment manufacturer (e.g., Genie, JLG)",
      },
      {
        name: "model",
        type: "string",
        defaultValue: "Equipment",
        friendlyName: "Model Number",
      },
      {
        name: "name",
        type: "string",
        defaultValue: "Equipment Name",
        friendlyName: "Display Name",
      },
      {
        name: "category",
        type: "string",
        friendlyName: "Category",
        helperText: "Equipment category (e.g., Scissor Lift, Forklift)",
      },
      {
        name: "spec1",
        type: "string",
        friendlyName: "Spec Line 1",
        helperText: "Primary specification (e.g., Capacity: 2.5T)",
      },
      {
        name: "spec2",
        type: "string",
        friendlyName: "Spec Line 2",
        helperText: "Secondary specification (e.g., Working Height: 12m)",
      },
      {
        name: "dailyPrice",
        type: "string",
        defaultValue: "POA",
        friendlyName: "Daily Price",
      },
      {
        name: "weeklyPrice",
        type: "string",
        defaultValue: "POA",
        friendlyName: "Weekly Price",
      },
      {
        name: "ctaText",
        type: "string",
        defaultValue: "View Details",
        friendlyName: "CTA Text",
      },
      {
        name: "ctaLink",
        type: "url",
        defaultValue: "#",
        friendlyName: "CTA Link",
      },
      {
        name: "variant",
        type: "enum",
        enum: ["default", "compact", "featured"],
        defaultValue: "default",
        friendlyName: "Card Variant",
        helperText: "default: full card, compact: smaller, featured: highlighted",
      },
      {
        name: "showPricing",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Pricing",
      },
      {
        name: "showSpecs",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Specs",
      },
    ],
  },

  // Equipment Grid
  {
    component: EquipmentGrid,
    name: "EquipmentGrid",
    friendlyName: "Equipment - Grid",
    description: "Grid of equipment cards with search and category filtering. Fetches from live API.",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Equipment",
        friendlyName: "Section Title",
      },
      {
        name: "subtitle",
        type: "string",
        friendlyName: "Subtitle",
      },
      {
        name: "apiEndpoint",
        type: "string",
        defaultValue: "https://acccessproducts.netlify.app/api/products",
        friendlyName: "API Endpoint",
        advanced: true,
      },
      {
        name: "category",
        type: "string",
        friendlyName: "Category Filter",
        helperText: "Filter by category (e.g., Forklift, Scissor Lift)",
      },
      {
        name: "subcategory",
        type: "string",
        friendlyName: "Subcategory Filter",
      },
      {
        name: "brand",
        type: "string",
        friendlyName: "Brand Filter",
      },
      {
        name: "columns",
        type: "enum",
        enum: ["2", "3", "4"],
        defaultValue: "3",
        friendlyName: "Columns",
      },
      {
        name: "maxProducts",
        type: "number",
        defaultValue: 12,
        friendlyName: "Max Products",
      },
      {
        name: "showSearch",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Show Search",
      },
      {
        name: "showCategoryFilter",
        type: "boolean",
        defaultValue: false,
        friendlyName: "Show Category Dropdown",
      },
      {
        name: "viewAllLink",
        type: "url",
        friendlyName: "View All Link",
      },
      {
        name: "viewAllText",
        type: "string",
        defaultValue: "View All",
        friendlyName: "View All Text",
      },
      {
        name: "cardCtaText",
        type: "string",
        defaultValue: "View Details",
        friendlyName: "Card CTA Text",
      },
      {
        name: "productBaseUrl",
        type: "string",
        defaultValue: "/equipment",
        friendlyName: "Product Base URL",
        advanced: true,
      },
      {
        name: "cardVariant",
        type: "enum",
        enum: ["default", "compact", "featured"],
        defaultValue: "default",
        friendlyName: "Card Style",
      },
      {
        name: "showPricing",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Pricing",
      },
      {
        name: "background",
        type: "enum",
        enum: ["white", "light", "none"],
        defaultValue: "light",
        friendlyName: "Background",
      },
    ],
  },

  // Equipment Search (Full Browse Page)
  {
    component: EquipmentSearch,
    name: "EquipmentSearch",
    friendlyName: "Equipment - Search/Browse",
    description: "Full-featured equipment browser with search, filters, sort, and grid/list views. Perfect for equipment listing pages.",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Browse Equipment",
        friendlyName: "Page Title",
      },
      {
        name: "subtitle",
        type: "string",
        defaultValue: "Find the right equipment for your project",
        friendlyName: "Subtitle",
      },
      {
        name: "apiEndpoint",
        type: "string",
        defaultValue: "https://acccessproducts.netlify.app/api/products",
        friendlyName: "API Endpoint",
        advanced: true,
      },
      {
        name: "initialCategory",
        type: "string",
        friendlyName: "Initial Category",
        helperText: "Pre-select a category filter",
      },
      {
        name: "productsPerPage",
        type: "number",
        defaultValue: 12,
        friendlyName: "Products Per Page",
      },
      {
        name: "columns",
        type: "enum",
        enum: ["2", "3", "4"],
        defaultValue: "3",
        friendlyName: "Grid Columns",
      },
      {
        name: "showCategoryFilter",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Category Filter",
      },
      {
        name: "showBrandFilter",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Brand Filter",
      },
      {
        name: "showSort",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Sort Options",
      },
      {
        name: "showViewToggle",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Grid/List Toggle",
      },
      {
        name: "showResultsCount",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Results Count",
      },
      {
        name: "showLoadMore",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Load More Button",
      },
      {
        name: "cardCtaText",
        type: "string",
        defaultValue: "View Details",
        friendlyName: "Card CTA Text",
      },
      {
        name: "productBaseUrl",
        type: "string",
        defaultValue: "/equipment",
        friendlyName: "Product Base URL",
        advanced: true,
      },
      {
        name: "showPricing",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Pricing",
      },
      {
        name: "filterPosition",
        type: "enum",
        enum: ["left", "top"],
        defaultValue: "left",
        friendlyName: "Filter Position",
        helperText: "left: sidebar, top: horizontal bar",
      },
      {
        name: "showHeader",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Header",
        helperText: "Show the page header with title and subtitle",
      },
      {
        name: "showFilters",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Filters",
        helperText: "Show the filter sidebar/mobile filters",
      },
      {
        name: "allowedCategories",
        type: "list",
        friendlyName: "Allowed Categories",
        helperText: "Limit to specific categories. Leave empty for all.",
        subFields: [
          { name: "category", type: "string", friendlyName: "Category Name" },
        ],
      },
      {
        name: "useQuickView",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Use Quick View Modal",
        helperText: "Open details in modal instead of navigating to page",
      },
    ],
  },

  // Product Selector Wizard
  {
    component: EquipmentSelector,
    name: "ProductSelector",
    friendlyName: "Product Selector",
    description: "6-step questionnaire wizard that guides users to recommended products based on their industry, task, and preferences.",
    inputs: [
      {
        name: "title",
        type: "string",
        defaultValue: "Product Selector",
        friendlyName: "Title",
      },
      {
        name: "subtitle",
        type: "string",
        defaultValue: "Answer a few questions to find the right equipment for your project",
        friendlyName: "Subtitle",
      },
      {
        name: "resultsUrl",
        type: "string",
        defaultValue: "/equipment",
        friendlyName: "Results Page URL",
        helperText: "Where to link for full results",
      },
      {
        name: "showInlineResults",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Inline Results",
        helperText: "Display recommended equipment on this page",
      },
      {
        name: "inlineResultsCount",
        type: "number",
        defaultValue: 6,
        friendlyName: "Inline Results Count",
      },
      {
        name: "viewAllText",
        type: "string",
        defaultValue: "View All Matches",
        friendlyName: "View All Button Text",
      },
      {
        name: "background",
        type: "enum",
        enum: ["white", "gray"],
        defaultValue: "white",
        friendlyName: "Background Color",
      },
      {
        name: "showSkip",
        type: "boolean",
        defaultValue: true,
        friendlyName: "Show Skip Link",
      },
      {
        name: "skipUrl",
        type: "string",
        defaultValue: "/equipment",
        friendlyName: "Skip Link URL",
      },
    ],
  },

  // ============================================
  // LAYOUT COMPONENTS
  // Header and Footer can be added/removed per page
  // ============================================

  // Site Header
  {
    component: Header,
    name: "Header",
    friendlyName: "Site Header",
    description: "Landing page header with logo, phone number, and Get a Quote button. Can be added/removed per page.",
    inputs: [],
  },

  // Site Footer
  {
    component: Footer,
    name: "Footer",
    friendlyName: "Site Footer",
    description: "Red-branded footer with location tabs, contact info, and social links. Can be added/removed per page.",
    inputs: [],
  },
];

