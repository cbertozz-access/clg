"use client";

/**
 * Builder.io Component Registration (Client-side)
 *
 * This file registers components with Builder.io's visual editor.
 * It must run on the client side only.
 */

import { register } from "@builder.io/sdk-react-nextjs";
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
import {
  FigmaButton,
  FigmaInput,
  FigmaDialog,
  FigmaProductCard,
  FigmaHero,
} from "../components/builder/figma";

// Only register on client side
if (typeof window !== "undefined") {
  // Figma Components
  register("editor.component", {
    name: "FigmaButton",
    friendlyName: "Figma - Button",
    component: FigmaButton,
  });

  register("editor.component", {
    name: "FigmaInput",
    friendlyName: "Figma - Input Field",
    component: FigmaInput,
  });

  register("editor.component", {
    name: "FigmaDialog",
    friendlyName: "Figma - Dialog/Modal",
    component: FigmaDialog,
  });

  register("editor.component", {
    name: "FigmaProductCard",
    friendlyName: "Figma - Product Card",
    component: FigmaProductCard,
  });

  register("editor.component", {
    name: "FigmaHero",
    friendlyName: "Figma - Hero Section",
    component: FigmaHero,
  });

  // LP Components
  register("editor.component", {
    name: "CategoryHeroCC",
    friendlyName: "Category Hero (CLG-39)",
    component: CategoryHeroCC,
  });

  register("editor.component", {
    name: "LPHeader",
    friendlyName: "LP - Header",
    component: LPHeader,
  });

  register("editor.component", {
    name: "LPHero",
    friendlyName: "LP - Hero Section",
    component: LPHero,
  });

  register("editor.component", {
    name: "LPTrustBadges",
    friendlyName: "LP - Trust Badges / Stats",
    component: LPTrustBadges,
  });

  register("editor.component", {
    name: "LPBenefits",
    friendlyName: "LP - Benefits Grid",
    component: LPBenefits,
  });

  register("editor.component", {
    name: "LPProductsGrid",
    friendlyName: "LP - Products Grid",
    component: LPProductsGrid,
  });

  register("editor.component", {
    name: "LPTestimonials",
    friendlyName: "LP - Testimonials",
    component: LPTestimonials,
  });

  register("editor.component", {
    name: "LPQuoteForm",
    friendlyName: "LP - Quote Form",
    component: LPQuoteForm,
  });

  register("editor.component", {
    name: "LPFaq",
    friendlyName: "LP - FAQ Accordion",
    component: LPFaq,
  });

  register("editor.component", {
    name: "LPCtaBanner",
    friendlyName: "LP - CTA Banner",
    component: LPCtaBanner,
  });

  register("editor.component", {
    name: "LPFooter",
    friendlyName: "LP - Footer",
    component: LPFooter,
  });

  register("editor.component", {
    name: "LPBreadcrumb",
    friendlyName: "LP - Breadcrumb",
    component: LPBreadcrumb,
  });

  register("editor.component", {
    name: "LPStickyForm",
    friendlyName: "LP - Sticky Sidebar Form",
    component: LPStickyForm,
  });
}

export {};
