import type { RegisteredComponent } from "@builder.io/sdk-react-nextjs";
import { CategoryHeroCC } from "../components/builder/CategoryHeroCC";

/**
 * Builder.io Component Registry
 *
 * Naming Convention:
 * - "CC" suffix = Claude Code created (CLG-39)
 * - No suffix = Builder.io AI created (CLG-38)
 */

// Define custom components for Builder.io
export const customComponents: RegisteredComponent[] = [
  {
    component: CategoryHeroCC,
    name: "CategoryHeroCC",
    friendlyName: "Category Hero (Claude Code)",
    description:
      "Equipment category hero section with value proposition, benefits, and CTAs. Created by Claude Code for AI Platform Comparison (CLG-39).",

    inputs: [
      // Content Section
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

      // CTA Section
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

      // Styling Section
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
];
