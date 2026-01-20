"use client";

/**
 * Builder.io Component Registration (Client-side)
 * Using Gen 1 SDK for better live editing support
 */

import { Builder, builder } from "@builder.io/react";
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
  LPStickyBottomCTA,
  LPFilterBar,
  LPFilterChips,
  LPQuoteModal,
  LPTrustScroll,
  LPLoadMore,
} from "../components/builder/lp";
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
} from "../components/builder/equipment";

// Initialize Builder
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
builder.init(BUILDER_API_KEY);

// Figma Components
Builder.registerComponent(FigmaButton, {
  name: "FigmaButton",
  friendlyName: "Figma - Button",
  inputs: [
    { name: "label", type: "string", defaultValue: "Button" },
    { name: "variant", type: "enum", enum: ["primary", "secondary", "outline"], defaultValue: "primary" },
    { name: "size", type: "enum", enum: ["sm", "md", "lg"], defaultValue: "md" },
    { name: "fullWidth", type: "boolean", defaultValue: false },
    { name: "href", type: "url" },
  ],
});

Builder.registerComponent(FigmaInput, {
  name: "FigmaInput",
  friendlyName: "Figma - Input Field",
  inputs: [
    { name: "label", type: "string", defaultValue: "Label" },
    { name: "placeholder", type: "string", defaultValue: "Enter value" },
    { name: "type", type: "enum", enum: ["text", "email", "tel", "password", "number"], defaultValue: "text" },
    { name: "required", type: "boolean", defaultValue: false },
    { name: "error", type: "boolean", defaultValue: false },
    { name: "errorMessage", type: "string" },
  ],
});

Builder.registerComponent(FigmaDialog, {
  name: "FigmaDialog",
  friendlyName: "Figma - Dialog/Modal",
  inputs: [
    { name: "title", type: "string", defaultValue: "Stay Ahead with Exclusive Deals & Updates!" },
    { name: "description", type: "longText", defaultValue: "Sign up for the latest offers!" },
    { name: "buttonText", type: "string", defaultValue: "Subscribe" },
    { name: "showCloseButton", type: "boolean", defaultValue: true },
  ],
});

Builder.registerComponent(FigmaProductCard, {
  name: "FigmaProductCard",
  friendlyName: "Figma - Product Card",
  inputs: [
    { name: "imageUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"] },
    { name: "logoUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"] },
    { name: "fuelType", type: "string", defaultValue: "Diesel" },
    { name: "modelNumber", type: "string", defaultValue: "340AJ" },
    { name: "title", type: "string", defaultValue: "33ft Articulating Boom Lift" },
    { name: "spec1", type: "string", defaultValue: "Reach: 19' 11\"/6.06M" },
    { name: "spec2", type: "string", defaultValue: "Height: 33' 9\"/10.28M" },
    { name: "dailyPrice", type: "string", defaultValue: "$149.00" },
    { name: "weeklyPrice", type: "string", defaultValue: "$301.00" },
    { name: "ctaText", type: "string", defaultValue: "View details" },
    { name: "ctaLink", type: "string", defaultValue: "/product" },
  ],
});

Builder.registerComponent(FigmaProductCardAPI, {
  name: "FigmaProductCardAPI",
  friendlyName: "Figma - Product Card (API Picker)",
  inputs: [
    { name: "productId", type: "string", helperText: "Enter product ID or model name (e.g., H48XM-12)" },
    { name: "ctaText", type: "string", defaultValue: "View Details" },
    { name: "productBaseUrl", type: "string", defaultValue: "/equipment" },
    { name: "showBrandLogo", type: "boolean", defaultValue: false },
    { name: "brandLogoUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"] },
  ],
});

Builder.registerComponent(FigmaProductGrid, {
  name: "FigmaProductGrid",
  friendlyName: "Figma - Product Grid (API)",
  inputs: [
    { name: "sectionTitle", type: "string", defaultValue: "Featured Equipment" },
    { name: "apiEndpoint", type: "string", defaultValue: "https://acccessproducts.netlify.app/api/products" },
    { name: "category", type: "string", helperText: "Filter by category (e.g., Forklift)" },
    { name: "columns", type: "enum", enum: ["2", "3", "4"], defaultValue: "3" },
    { name: "maxProducts", type: "number", defaultValue: 6 },
    { name: "viewAllLink", type: "string" },
    { name: "viewAllText", type: "string", defaultValue: "View All Equipment" },
  ],
});

Builder.registerComponent(FigmaHero, {
  name: "FigmaHero",
  friendlyName: "Figma - Hero Section",
  inputs: [
    { name: "backgroundImage", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"] },
    { name: "overlayOpacity", type: "number", defaultValue: 60 },
    { name: "headline", type: "string", defaultValue: "Equipment Hire Across Australia" },
    { name: "subheadline", type: "longText", defaultValue: "Get competitive quotes from Australia's largest fleet." },
    { name: "primaryCtaText", type: "string", defaultValue: "Get a Quote" },
    { name: "primaryCtaLink", type: "url", defaultValue: "#quote" },
    { name: "secondaryCtaText", type: "string", defaultValue: "Browse Equipment" },
    { name: "secondaryCtaLink", type: "url", defaultValue: "#equipment" },
  ],
});

// Category Hero
Builder.registerComponent(CategoryHeroCC, {
  name: "CategoryHeroCC",
  friendlyName: "Category Hero (CLG-39)",
  inputs: [
    { name: "categoryName", type: "string", defaultValue: "Equipment Hire" },
    { name: "valueProposition", type: "longText", defaultValue: "Access Australia's largest fleet" },
    { name: "benefits", type: "list", subFields: [{ name: "benefit", type: "string" }] },
    { name: "primaryButtonText", type: "string", defaultValue: "Get a Quote" },
    { name: "primaryButtonLink", type: "url", defaultValue: "/quote" },
    { name: "backgroundImage", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"] },
  ],
});

// LP Components
Builder.registerComponent(LPHeader, {
  name: "LPHeader",
  friendlyName: "LP - Header",
  inputs: [
    { name: "logoUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"] },
    { name: "companyName", type: "string", defaultValue: "ACCESS HIRE" },
    { name: "phoneNumber", type: "string", defaultValue: "13 4000" },
    { name: "ctaText", type: "string", defaultValue: "Get a Quote" },
    { name: "ctaLink", type: "url", defaultValue: "#quote-form" },
  ],
});

Builder.registerComponent(LPHero, {
  name: "LPHero",
  friendlyName: "LP - Hero Section",
  inputs: [
    { name: "variant", type: "enum", enum: ["standard", "squeeze", "product-focused"], defaultValue: "standard" },
    { name: "backgroundImage", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"] },
    { name: "headline", type: "string", defaultValue: "Equipment Hire Across Australia" },
    { name: "subheadline", type: "longText" },
    { name: "primaryCtaText", type: "string", defaultValue: "Get a Quote" },
    { name: "primaryCtaLink", type: "url", defaultValue: "#quote-form" },
  ],
});

Builder.registerComponent(LPTrustBadges, {
  name: "LPTrustBadges",
  friendlyName: "LP - Trust Badges / Stats",
  inputs: [
    { name: "stats", type: "list", subFields: [
      { name: "value", type: "string" },
      { name: "label", type: "string" },
    ]},
    { name: "variant", type: "enum", enum: ["light", "dark"], defaultValue: "light" },
  ],
});

Builder.registerComponent(LPBenefits, {
  name: "LPBenefits",
  friendlyName: "LP - Benefits Grid",
  inputs: [
    { name: "sectionTitle", type: "string", defaultValue: "Why Choose Access Hire?" },
    { name: "benefits", type: "list", subFields: [
      { name: "icon", type: "enum", enum: ["shield", "clock", "location", "badge"] },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
    ]},
    { name: "columns", type: "enum", enum: ["2", "3", "4"], defaultValue: "4" },
  ],
});

Builder.registerComponent(LPProductsGrid, {
  name: "LPProductsGrid",
  friendlyName: "LP - Products Grid",
  inputs: [
    { name: "sectionTitle", type: "string", defaultValue: "Featured Equipment" },
    { name: "apiEndpoint", type: "string", defaultValue: "https://acccessproducts.netlify.app/api/products" },
    { name: "category", type: "string", defaultValue: "Forklift" },
    { name: "maxProducts", type: "number", defaultValue: 6 },
  ],
});

Builder.registerComponent(LPTestimonials, {
  name: "LPTestimonials",
  friendlyName: "LP - Testimonials",
  inputs: [
    { name: "sectionTitle", type: "string", defaultValue: "What Our Customers Say" },
    { name: "testimonials", type: "list", subFields: [
      { name: "quote", type: "longText" },
      { name: "name", type: "string" },
      { name: "company", type: "string" },
    ]},
  ],
});

Builder.registerComponent(LPQuoteForm, {
  name: "LPQuoteForm",
  friendlyName: "LP - Quote Form",
  inputs: [
    { name: "title", type: "string", defaultValue: "Request a Quote" },
    { name: "subtitle", type: "string" },
    { name: "submitButtonText", type: "string", defaultValue: "Submit" },
  ],
});

Builder.registerComponent(LPFaq, {
  name: "LPFaq",
  friendlyName: "LP - FAQ Accordion",
  inputs: [
    { name: "sectionTitle", type: "string", defaultValue: "Frequently Asked Questions" },
    { name: "items", type: "list", subFields: [
      { name: "question", type: "string" },
      { name: "answer", type: "longText" },
    ]},
  ],
});

Builder.registerComponent(LPCtaBanner, {
  name: "LPCtaBanner",
  friendlyName: "LP - CTA Banner",
  inputs: [
    { name: "headline", type: "string", defaultValue: "Ready to Get Started?" },
    { name: "subtext", type: "string" },
    { name: "primaryCtaText", type: "string", defaultValue: "Get a Quote" },
    { name: "primaryCtaLink", type: "url", defaultValue: "#quote-form" },
  ],
});

Builder.registerComponent(LPFooter, {
  name: "LPFooter",
  friendlyName: "LP - Footer",
  inputs: [
    { name: "logoUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "svg", "webp"] },
    { name: "companyName", type: "string", defaultValue: "ACCESS HIRE" },
    { name: "phoneNumber", type: "string", defaultValue: "13 4000" },
    { name: "email", type: "string", defaultValue: "info@accesshire.net" },
  ],
});

Builder.registerComponent(LPBreadcrumb, {
  name: "LPBreadcrumb",
  friendlyName: "LP - Breadcrumb",
  inputs: [
    { name: "items", type: "list", subFields: [
      { name: "label", type: "string" },
      { name: "href", type: "url" },
    ]},
    { name: "currentPage", type: "string", defaultValue: "Current Page" },
  ],
});

Builder.registerComponent(LPStickyForm, {
  name: "LPStickyForm",
  friendlyName: "LP - Sticky Sidebar Form",
  inputs: [
    { name: "title", type: "string", defaultValue: "Get a Quick Quote" },
    { name: "submitButtonText", type: "string", defaultValue: "Get My Quote" },
    { name: "phoneNumber", type: "string", defaultValue: "13 4000" },
  ],
});

// Mobile-specific components
Builder.registerComponent(LPStickyBottomCTA, {
  name: "LPStickyBottomCTA",
  friendlyName: "LP - Sticky Bottom CTA (Mobile)",
  inputs: [
    { name: "phoneNumber", type: "string", defaultValue: "13 4000" },
    { name: "callText", type: "string", defaultValue: "Call" },
    { name: "quoteText", type: "string", defaultValue: "Get Quote" },
    { name: "quoteLink", type: "string", defaultValue: "#quote-form" },
  ],
});

Builder.registerComponent(LPFilterBar, {
  name: "LPFilterBar",
  friendlyName: "LP - Filter Bar (Desktop)",
  inputs: [
    { name: "filters", type: "list", subFields: [
      { name: "name", type: "string" },
      { name: "label", type: "string" },
      { name: "options", type: "list", subFields: [
        { name: "label", type: "string" },
        { name: "value", type: "string" },
      ]},
    ]},
  ],
});

Builder.registerComponent(LPFilterChips, {
  name: "LPFilterChips",
  friendlyName: "LP - Filter Chips (Mobile)",
  inputs: [
    { name: "chips", type: "list", subFields: [
      { name: "label", type: "string" },
      { name: "value", type: "string" },
    ]},
    { name: "showAllOption", type: "boolean", defaultValue: true },
  ],
});

Builder.registerComponent(LPQuoteModal, {
  name: "LPQuoteModal",
  friendlyName: "LP - Quote Modal (Mobile)",
  inputs: [
    { name: "title", type: "string", defaultValue: "Get a Quote" },
    { name: "submitText", type: "string", defaultValue: "Get My Quote" },
  ],
});

Builder.registerComponent(LPTrustScroll, {
  name: "LPTrustScroll",
  friendlyName: "LP - Trust Scroll (Mobile)",
  inputs: [
    { name: "stats", type: "list", subFields: [
      { name: "value", type: "string" },
      { name: "label", type: "string" },
    ]},
    { name: "variant", type: "enum", enum: ["light", "white"], defaultValue: "white" },
  ],
});

Builder.registerComponent(LPLoadMore, {
  name: "LPLoadMore",
  friendlyName: "LP - Load More Button",
  inputs: [
    { name: "text", type: "string", defaultValue: "Load More" },
    { name: "loadingText", type: "string", defaultValue: "Loading..." },
    { name: "variant", type: "enum", enum: ["primary", "outline"], defaultValue: "outline" },
  ],
});

// Equipment Components
Builder.registerComponent(EquipmentCard, {
  name: "EquipmentCard",
  friendlyName: "Equipment - Card",
  description: "Single equipment card with image, specs, pricing, and CTA",
  inputs: [
    { name: "id", type: "string", friendlyName: "Equipment ID" },
    { name: "imageUrl", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"], friendlyName: "Product Image" },
    { name: "brand", type: "string", friendlyName: "Brand", helperText: "Equipment manufacturer (e.g., Genie, JLG)" },
    { name: "model", type: "string", defaultValue: "Equipment", friendlyName: "Model Number" },
    { name: "name", type: "string", defaultValue: "Equipment Name", friendlyName: "Display Name" },
    { name: "category", type: "string", friendlyName: "Category" },
    { name: "spec1", type: "string", friendlyName: "Spec Line 1", helperText: "Primary specification (e.g., Capacity: 2.5T)" },
    { name: "spec2", type: "string", friendlyName: "Spec Line 2" },
    { name: "spec3", type: "string", friendlyName: "Spec Line 3" },
    { name: "priceFrom", type: "string", friendlyName: "Price From", helperText: "e.g., $149/day" },
    { name: "ctaText", type: "string", defaultValue: "Get Quote", friendlyName: "CTA Button Text" },
    { name: "ctaLink", type: "string", defaultValue: "#quote", friendlyName: "CTA Link" },
    { name: "variant", type: "enum", enum: ["default", "compact", "featured"], defaultValue: "default" },
  ],
});

Builder.registerComponent(EquipmentGrid, {
  name: "EquipmentGrid",
  friendlyName: "Equipment - Grid",
  description: "Grid of equipment cards with filtering and category tabs",
  inputs: [
    { name: "title", type: "string", defaultValue: "Our Equipment", friendlyName: "Section Title" },
    { name: "subtitle", type: "string", friendlyName: "Section Subtitle" },
    { name: "showCategoryTabs", type: "boolean", defaultValue: true, friendlyName: "Show Category Tabs" },
    { name: "showFilters", type: "boolean", defaultValue: true, friendlyName: "Show Filters" },
    { name: "columns", type: "enum", enum: ["2", "3", "4"], defaultValue: "3", friendlyName: "Grid Columns" },
    { name: "maxItems", type: "number", defaultValue: 12, friendlyName: "Max Items to Show" },
    { name: "category", type: "string", friendlyName: "Filter by Category", helperText: "Leave empty to show all" },
    { name: "showLoadMore", type: "boolean", defaultValue: true, friendlyName: "Show Load More Button" },
    { name: "ctaText", type: "string", defaultValue: "Get Quote", friendlyName: "Card CTA Text" },
    { name: "productBaseUrl", type: "string", defaultValue: "/equipment", friendlyName: "Product Detail URL Base" },
  ],
});

Builder.registerComponent(EquipmentSearch, {
  name: "EquipmentSearch",
  friendlyName: "Equipment - Search & Filter",
  description: "Full equipment search page with filters, search, and results grid",
  inputs: [
    { name: "title", type: "string", defaultValue: "Find Equipment", friendlyName: "Page Title" },
    { name: "subtitle", type: "string", friendlyName: "Page Subtitle" },
    { name: "showSearch", type: "boolean", defaultValue: true, friendlyName: "Show Search Bar" },
    { name: "showFilters", type: "boolean", defaultValue: true, friendlyName: "Show Filter Sidebar" },
    { name: "showCategoryNav", type: "boolean", defaultValue: true, friendlyName: "Show Category Navigation" },
    { name: "columns", type: "enum", enum: ["2", "3", "4"], defaultValue: "3", friendlyName: "Results Columns" },
    { name: "resultsPerPage", type: "number", defaultValue: 12, friendlyName: "Results Per Page" },
    { name: "defaultCategory", type: "string", friendlyName: "Default Category" },
    { name: "ctaText", type: "string", defaultValue: "Get Quote", friendlyName: "Card CTA Text" },
    { name: "productBaseUrl", type: "string", defaultValue: "/equipment", friendlyName: "Product Detail URL Base" },
  ],
});

export {};
