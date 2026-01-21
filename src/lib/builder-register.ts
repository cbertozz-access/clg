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
import { ContactForm } from "../components/builder/ContactForm";
import { TextBlock } from "../components/builder/TextBlock";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

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
    { name: "backgroundImage", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"], friendlyName: "Background Image", helperText: "Optional - uses campaign image if not set" },
    { name: "useCampaignImage", type: "boolean", defaultValue: true, friendlyName: "Use Campaign Image", helperText: "Use Big Red campaign hero image based on utm_campaign" },
    { name: "overlayIntensity", type: "enum", enum: ["none", "light", "medium", "dark"], defaultValue: "light", friendlyName: "Overlay Intensity", helperText: "Light overlay shows more of the image" },
    { name: "headline", type: "string", friendlyName: "Headline", helperText: "Leave blank to use campaign content" },
    { name: "subheadline", type: "longText", friendlyName: "Subheadline", helperText: "Leave blank to use campaign content" },
    { name: "highlightCategory", type: "boolean", defaultValue: true, friendlyName: "Highlight Category", helperText: "Highlight category keyword in brand color" },
    { name: "primaryCtaText", type: "string", defaultValue: "Get a Quote", friendlyName: "Primary Button Text" },
    { name: "primaryCtaLink", type: "url", defaultValue: "#quote", friendlyName: "Primary Button Link" },
    { name: "secondaryCtaText", type: "string", friendlyName: "Secondary Button Text" },
    { name: "secondaryCtaLink", type: "url", friendlyName: "Secondary Button Link" },
    { name: "buttonSize", type: "enum", enum: ["sm", "md", "lg"], defaultValue: "md", friendlyName: "Button Size" },
    { name: "minHeight", type: "enum", enum: ["sm", "md", "lg", "full"], defaultValue: "md", friendlyName: "Section Height" },
    { name: "textAlign", type: "enum", enum: ["left", "center"], defaultValue: "left", friendlyName: "Text Alignment" },
    { name: "contentMaxWidth", type: "enum", enum: ["sm", "md", "lg", "xl"], defaultValue: "lg", friendlyName: "Content Width" },
    { name: "showGreeting", type: "boolean", defaultValue: true, friendlyName: "Show Greeting", helperText: "Show personalized greeting when user is identified" },
    { name: "enablePersonalization", type: "boolean", defaultValue: true, friendlyName: "Enable Personalization", helperText: "Personalize content from URL params or Firebase" },
    { name: "showBadge", type: "boolean", defaultValue: true, friendlyName: "Show Badge", helperText: "Show 'Supporting Australian Business' badge" },
    { name: "badgeText", type: "string", defaultValue: "Supporting Australian Business", friendlyName: "Badge Text" },
    { name: "showContactInfo", type: "boolean", defaultValue: true, friendlyName: "Show Contact Info", helperText: "Show phone number and website in top right" },
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

Builder.registerComponent(ContactForm, {
  name: "ContactForm",
  friendlyName: "Contact Form",
  description: "Quote request form with grouped fields and modern card styling",
  inputs: [
    { name: "title", type: "string", defaultValue: "Request a Quote", friendlyName: "Form Title" },
    { name: "subtitle", type: "string", defaultValue: "Tell us about your project — we respond within 2 hours", friendlyName: "Subtitle" },
    { name: "submitButtonText", type: "string", defaultValue: "Get Your Quote", friendlyName: "Submit Button Text" },
    { name: "variant", type: "enum", enum: ["full", "compact"], defaultValue: "full", friendlyName: "Form Variant", helperText: "full: all fields, compact: essential fields only" },
    { name: "backgroundColor", type: "enum", enum: ["white", "gray", "none"], defaultValue: "gray", friendlyName: "Background Color" },
    { name: "showPhoneCta", type: "boolean", defaultValue: true, friendlyName: "Show Phone CTA" },
    { name: "phoneNumber", type: "string", defaultValue: "13 4000", friendlyName: "Phone Number" },
  ],
});

Builder.registerComponent(TextBlock, {
  name: "TextBlock",
  friendlyName: "Text Block",
  description: "Rich text component with WYSIWYG editing, vertical/horizontal centering",
  inputs: [
    { name: "text", type: "richText", defaultValue: "<p>Enter your text here</p>", friendlyName: "Text Content" },
    { name: "size", type: "enum", enum: ["sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"], defaultValue: "lg", friendlyName: "Text Size" },
    { name: "align", type: "enum", enum: ["left", "center", "right"], defaultValue: "center", friendlyName: "Horizontal Align" },
    { name: "verticalAlign", type: "enum", enum: ["top", "center", "bottom"], defaultValue: "center", friendlyName: "Vertical Align" },
    { name: "color", type: "enum", enum: ["default", "muted", "primary", "white"], defaultValue: "default", friendlyName: "Text Color" },
    { name: "weight", type: "enum", enum: ["normal", "medium", "semibold", "bold"], defaultValue: "normal", friendlyName: "Font Weight" },
    { name: "maxWidth", type: "enum", enum: ["none", "sm", "md", "lg", "xl", "2xl", "4xl", "full"], defaultValue: "4xl", friendlyName: "Max Width" },
    { name: "minHeight", type: "enum", enum: ["none", "sm", "md", "lg", "xl", "screen"], defaultValue: "none", friendlyName: "Min Height", helperText: "Set height for vertical centering" },
    { name: "padding", type: "enum", enum: ["none", "sm", "md", "lg", "xl"], defaultValue: "md", friendlyName: "Padding" },
    { name: "as", type: "enum", enum: ["div", "h1", "h2", "h3", "h4", "h5", "h6", "p"], defaultValue: "div", friendlyName: "HTML Element", advanced: true },
    { name: "marginTop", type: "enum", enum: ["none", "sm", "md", "lg", "xl"], defaultValue: "none", friendlyName: "Top Margin", advanced: true },
    { name: "marginBottom", type: "enum", enum: ["none", "sm", "md", "lg", "xl"], defaultValue: "none", friendlyName: "Bottom Margin", advanced: true },
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
    { name: "apiEndpoint", type: "string", defaultValue: "https://acccessproducts.netlify.app/api/products", friendlyName: "API Endpoint" },
    { name: "category", type: "string", friendlyName: "Filter by Category", helperText: "Leave empty to show all" },
    { name: "subcategory", type: "string", friendlyName: "Filter by Subcategory" },
    { name: "brand", type: "string", friendlyName: "Filter by Brand" },
    { name: "columns", type: "enum", enum: ["2", "3", "4"], defaultValue: "3", friendlyName: "Grid Columns" },
    { name: "maxProducts", type: "number", defaultValue: 12, friendlyName: "Max Products to Show" },
    { name: "showSearch", type: "boolean", defaultValue: false, friendlyName: "Show Search" },
    { name: "showCategoryFilter", type: "boolean", defaultValue: false, friendlyName: "Show Category Dropdown" },
    { name: "viewAllLink", type: "url", friendlyName: "View All Link" },
    { name: "viewAllText", type: "string", defaultValue: "View All", friendlyName: "View All Text" },
    { name: "cardCtaText", type: "string", defaultValue: "View Details", friendlyName: "Card CTA Text" },
    { name: "productBaseUrl", type: "string", defaultValue: "/equipment", friendlyName: "Product Detail URL Base" },
    { name: "cardVariant", type: "enum", enum: ["default", "compact", "featured"], defaultValue: "default", friendlyName: "Card Style" },
    { name: "showPricing", type: "boolean", defaultValue: true, friendlyName: "Show Pricing" },
    { name: "background", type: "enum", enum: ["white", "light", "none"], defaultValue: "none", friendlyName: "Background" },
  ],
});

Builder.registerComponent(EquipmentSearch, {
  name: "EquipmentSearch",
  friendlyName: "Equipment - Search & Filter",
  description: "Full equipment search page with Algolia-powered search, filters, and results grid",
  inputs: [
    { name: "title", type: "string", defaultValue: "Browse Equipment", friendlyName: "Page Title" },
    { name: "subtitle", type: "string", defaultValue: "Find the right equipment for your project", friendlyName: "Page Subtitle" },
    { name: "initialCategory", type: "string", friendlyName: "Initial Category Filter" },
    { name: "productsPerPage", type: "number", defaultValue: 12, friendlyName: "Products Per Page" },
    { name: "columns", type: "enum", enum: ["2", "3", "4"], defaultValue: "3", friendlyName: "Grid Columns" },
    { name: "showCategoryFilter", type: "boolean", defaultValue: true, friendlyName: "Show Category Filter" },
    { name: "showBrandFilter", type: "boolean", defaultValue: true, friendlyName: "Show Brand Filter" },
    { name: "showSort", type: "boolean", defaultValue: true, friendlyName: "Show Sort Options" },
    { name: "showViewToggle", type: "boolean", defaultValue: true, friendlyName: "Show Grid/List Toggle" },
    { name: "showResultsCount", type: "boolean", defaultValue: true, friendlyName: "Show Results Count" },
    { name: "showLoadMore", type: "boolean", defaultValue: true, friendlyName: "Show Load More Button" },
    { name: "cardCtaText", type: "string", defaultValue: "View Details", friendlyName: "Card CTA Text" },
    { name: "productBaseUrl", type: "string", defaultValue: "/equipment", friendlyName: "Product Detail URL Base" },
    { name: "filterPosition", type: "enum", enum: ["left", "top"], defaultValue: "left", friendlyName: "Filter Position" },
    { name: "isHire", type: "boolean", friendlyName: "Filter: Only Hire Equipment" },
    { name: "isSale", type: "boolean", friendlyName: "Filter: Only Sale Equipment" },
    { name: "inStockOnly", type: "boolean", friendlyName: "Filter: In Stock Only" },
    { name: "selectorUrl", type: "string", defaultValue: "/selector", friendlyName: "Equipment Selector URL" },
  ],
});

// Layout Components (can be added/removed per page)
Builder.registerComponent(Header, {
  name: "SiteHeader",
  friendlyName: "Site Header",
  description: "Landing page header with logo, phone number, and Get a Quote button",
  inputs: [],
});

Builder.registerComponent(Footer, {
  name: "SiteFooter",
  friendlyName: "Site Footer",
  description: "Red-branded footer with location tabs, contact info, and social links",
  inputs: [],
});

export {};
