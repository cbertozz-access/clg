/**
 * Setup Builder.io Brand Data Model
 *
 * Run this script to create/update the Brand data model in Builder.io
 * with all the fields needed for the theming system.
 *
 * Usage:
 *   npx ts-node scripts/setup-builder-brand-model.ts
 *
 * Or add to package.json:
 *   "scripts": { "setup:brand-model": "npx ts-node scripts/setup-builder-brand-model.ts" }
 */

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

if (!BUILDER_PRIVATE_KEY) {
  console.error("Error: BUILDER_PRIVATE_KEY environment variable is required");
  console.error("Get it from: https://builder.io/account/settings");
  process.exit(1);
}

interface ModelField {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  helperText?: string;
  enum?: string[];
  subFields?: ModelField[];
}

const brandModelFields: ModelField[] = [
  // Core identity
  { name: "id", type: "text", required: true, helperText: "Unique identifier (e.g., 'access-hire')" },
  { name: "name", type: "text", required: true, helperText: "Display name (e.g., 'Access Hire Australia')" },
  { name: "slug", type: "text", required: true, helperText: "URL-friendly slug" },

  // Assets
  { name: "logoUrl", type: "file", helperText: "Primary logo" },
  { name: "logoUrlDark", type: "file", helperText: "Logo for dark backgrounds" },
  { name: "faviconUrl", type: "file", helperText: "Favicon" },

  // Brand color scale (50-950)
  { name: "colorBrand50", type: "color", defaultValue: "rgb(255 229 233)", helperText: "Lightest brand shade" },
  { name: "colorBrand100", type: "color", defaultValue: "rgb(255 204 211)" },
  { name: "colorBrand200", type: "color", defaultValue: "rgb(255 160 170)" },
  { name: "colorBrand300", type: "color", defaultValue: "rgb(255 109 127)" },
  { name: "colorBrand400", type: "color", defaultValue: "rgb(245 60 89)" },
  { name: "colorBrand500", type: "color", defaultValue: "rgb(227 25 55)", helperText: "Primary brand color" },
  { name: "colorBrand600", type: "color", defaultValue: "rgb(193 21 47)" },
  { name: "colorBrand700", type: "color", defaultValue: "rgb(161 18 40)" },
  { name: "colorBrand800", type: "color", defaultValue: "rgb(132 16 32)", helperText: "Hover state color" },
  { name: "colorBrand900", type: "color", defaultValue: "rgb(94 11 23)" },
  { name: "colorBrand950", type: "color", defaultValue: "rgb(94 11 23)", helperText: "Darkest brand shade" },

  // Semantic colors
  { name: "colorPrimary", type: "color", required: true, defaultValue: "rgb(227 25 55)", helperText: "Primary action color" },
  { name: "colorPrimaryHover", type: "color", defaultValue: "rgb(132 16 32)", helperText: "Primary hover state" },
  { name: "colorPrimaryForeground", type: "color", required: true, defaultValue: "rgb(255 229 233)", helperText: "Text on primary color" },

  { name: "colorSecondary", type: "color", defaultValue: "rgb(30 41 59)" },
  { name: "colorSecondaryHover", type: "color", defaultValue: "rgb(15 23 42)" },
  { name: "colorSecondaryForeground", type: "color", defaultValue: "rgb(248 250 252)" },

  { name: "colorAccent", type: "color", required: true, defaultValue: "rgb(30 41 59)" },
  { name: "colorAccentForeground", type: "color", required: true, defaultValue: "rgb(255 255 255)" },

  // Backgrounds
  { name: "colorBackground", type: "color", required: true, defaultValue: "rgb(255 255 255)" },
  { name: "colorBackgroundAlt", type: "color", required: true, defaultValue: "rgb(248 250 252)" },
  { name: "colorCard", type: "color", required: true, defaultValue: "rgb(255 255 255)" },
  { name: "colorCardForeground", type: "color", defaultValue: "rgb(15 23 42)" },

  // Text
  { name: "colorForeground", type: "color", required: true, defaultValue: "rgb(15 23 42)" },
  { name: "colorMutedForeground", type: "color", required: true, defaultValue: "rgb(100 116 139)" },

  // Borders
  { name: "colorBorder", type: "color", required: true, defaultValue: "rgb(226 232 240)" },
  { name: "colorInput", type: "color", required: true, defaultValue: "rgb(226 232 240)" },
  { name: "colorRing", type: "color", defaultValue: "rgb(227 25 55)", helperText: "Focus ring color" },

  // Status colors
  { name: "colorSuccess", type: "color", required: true, defaultValue: "rgb(34 197 94)" },
  { name: "colorSuccessHover", type: "color", defaultValue: "rgb(22 163 74)" },
  { name: "colorWarning", type: "color", required: true, defaultValue: "rgb(245 158 11)" },
  { name: "colorError", type: "color", required: true, defaultValue: "rgb(239 68 68)" },
  { name: "colorErrorHover", type: "color", defaultValue: "rgb(220 38 38)" },

  // Typography
  { name: "fontHeading", type: "text", required: true, defaultValue: "'Lato', system-ui, sans-serif" },
  { name: "fontBody", type: "text", required: true, defaultValue: "'Roboto', system-ui, sans-serif" },
  { name: "fontMono", type: "text", defaultValue: "'SF Mono', 'Monaco', monospace" },

  // Spacing
  { name: "radius", type: "text", required: true, defaultValue: "8px" },
  { name: "radiusSm", type: "text", required: true, defaultValue: "4px" },
  { name: "radiusLg", type: "text", required: true, defaultValue: "12px" },

  // Equipment brands (JSON object)
  {
    name: "equipmentBrands",
    type: "object",
    helperText: "Equipment manufacturer brand colors (optional)",
    subFields: [
      { name: "genie", type: "color", defaultValue: "#0064a7" },
      { name: "jlg", type: "color", defaultValue: "#f37123" },
      { name: "haulotte", type: "color", defaultValue: "#f1bd4b" },
      { name: "skyjack", type: "color", defaultValue: "#e41e26" },
      { name: "snorkel", type: "color", defaultValue: "#ff8200" },
      { name: "lgmg", type: "color", defaultValue: "#00a651" },
      { name: "dingli", type: "color", defaultValue: "#003da5" },
      { name: "manitou", type: "color", defaultValue: "#b22234" },
      { name: "zoomlion", type: "color", defaultValue: "#009b4c" },
      { name: "sunward", type: "color", defaultValue: "#ffc72c" },
      { name: "niftylift", type: "color", defaultValue: "#00a3e0" },
      { name: "aichi", type: "color", defaultValue: "#e60012" },
      { name: "tadano", type: "color", defaultValue: "#004c97" },
      { name: "sinoboom", type: "color", defaultValue: "#ed1c24" },
      { name: "xcmg", type: "color", defaultValue: "#ffc20e" },
      { name: "bobcat", type: "color", defaultValue: "#ff6600" },
      { name: "jcb", type: "color", defaultValue: "#ffc107" },
      { name: "merlo", type: "color", defaultValue: "#004d40" },
      { name: "magni", type: "color", defaultValue: "#00529f" },
      { name: "faresin", type: "color", defaultValue: "#e30613" },
      { name: "almac", type: "color", defaultValue: "#005bac" },
      { name: "airo", type: "color", defaultValue: "#0072bc" },
      { name: "atrium", type: "color", defaultValue: "#1a1a1a" },
      { name: "klubb", type: "color", defaultValue: "#00a0dc" },
      { name: "palfinger", type: "color", defaultValue: "#e30614" },
    ],
  },
];

const brandModel = {
  name: "Brand",
  kind: "data",
  fields: brandModelFields,
};

async function createOrUpdateModel() {
  console.log("Creating/updating Brand model in Builder.io...\n");

  try {
    // Use the Write API to create/update the model
    // Reference: https://www.builder.io/c/docs/write-api

    const response = await fetch("https://builder.io/api/v1/write/brand", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Brand Model Schema",
        data: {
          _schema: brandModelFields,
        },
        published: "draft",
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      // If model doesn't exist, we need to create it manually first
      if (error.includes("Model not found")) {
        console.log("❌ The 'brand' model does not exist in Builder.io yet.\n");
        console.log("To create it manually:");
        console.log("1. Go to https://builder.io/models");
        console.log("2. Click '+ Create Model'");
        console.log("3. Choose 'Data' as the model type");
        console.log("4. Name it 'brand' (lowercase)");
        console.log("5. Then run: npm run setup:access-hire");
        console.log("\nAlternatively, you can add fields manually. Here's the field list:\n");

        brandModelFields.forEach(field => {
          console.log(`  - ${field.name} (${field.type})${field.required ? ' [required]' : ''}`);
        });
        return;
      }

      throw new Error(`API Error: ${error}`);
    }

    console.log("✓ Brand model configured successfully!");
    console.log("\nNext steps:");
    console.log("1. Go to https://builder.io/models");
    console.log("2. Click on 'brand' to view the model");
    console.log("3. Run: npm run setup:access-hire");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createOrUpdateModel();
