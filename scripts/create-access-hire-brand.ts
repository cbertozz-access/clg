/**
 * Create Access Hire Australia Brand Entry in Builder.io
 *
 * Run this AFTER setup-builder-brand-model.ts to create the default brand entry.
 *
 * Usage:
 *   npx ts-node scripts/create-access-hire-brand.ts
 */

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

if (!BUILDER_PRIVATE_KEY) {
  console.error("Error: BUILDER_PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const accessHireBrand = {
  name: "Access Hire Australia",
  data: {
    // Core identity
    id: "access-hire",
    name: "Access Hire Australia",
    slug: "access-hire",

    // Brand color scale (AHA Red)
    colorBrand50: "rgb(255 229 233)",
    colorBrand100: "rgb(255 204 211)",
    colorBrand200: "rgb(255 160 170)",
    colorBrand300: "rgb(255 109 127)",
    colorBrand400: "rgb(245 60 89)",
    colorBrand500: "rgb(227 25 55)",
    colorBrand600: "rgb(193 21 47)",
    colorBrand700: "rgb(161 18 40)",
    colorBrand800: "rgb(132 16 32)",
    colorBrand900: "rgb(94 11 23)",
    colorBrand950: "rgb(94 11 23)",

    // Semantic colors
    colorPrimary: "rgb(227 25 55)",
    colorPrimaryHover: "rgb(132 16 32)",
    colorPrimaryForeground: "rgb(255 229 233)",

    colorSecondary: "rgb(30 41 59)",
    colorSecondaryHover: "rgb(15 23 42)",
    colorSecondaryForeground: "rgb(248 250 252)",

    colorAccent: "rgb(30 41 59)",
    colorAccentForeground: "rgb(255 255 255)",

    // Backgrounds
    colorBackground: "rgb(255 255 255)",
    colorBackgroundAlt: "rgb(248 250 252)",
    colorCard: "rgb(255 255 255)",
    colorCardForeground: "rgb(15 23 42)",

    // Text
    colorForeground: "rgb(15 23 42)",
    colorMutedForeground: "rgb(100 116 139)",

    // Borders
    colorBorder: "rgb(226 232 240)",
    colorInput: "rgb(226 232 240)",
    colorRing: "rgb(227 25 55)",

    // Status colors
    colorSuccess: "rgb(34 197 94)",
    colorSuccessHover: "rgb(22 163 74)",
    colorWarning: "rgb(245 158 11)",
    colorError: "rgb(239 68 68)",
    colorErrorHover: "rgb(220 38 38)",

    // Typography
    fontHeading: "'Lato', system-ui, sans-serif",
    fontBody: "'Roboto', system-ui, sans-serif",
    fontMono: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",

    // Spacing
    radius: "8px",
    radiusSm: "4px",
    radiusLg: "12px",

    // Equipment brand colors
    equipmentBrands: {
      genie: "#0064a7",
      jlg: "#f37123",
      haulotte: "#f1bd4b",
      skyjack: "#e41e26",
      snorkel: "#ff8200",
      lgmg: "#00a651",
      dingli: "#003da5",
      manitou: "#b22234",
      zoomlion: "#009b4c",
      sunward: "#ffc72c",
      niftylift: "#00a3e0",
      aichi: "#e60012",
      tadano: "#004c97",
      sinoboom: "#ed1c24",
      xcmg: "#ffc20e",
      bobcat: "#ff6600",
      jcb: "#ffc107",
      merlo: "#004d40",
      magni: "#00529f",
      faresin: "#e30613",
      almac: "#005bac",
      airo: "#0072bc",
      atrium: "#1a1a1a",
      klubb: "#00a0dc",
      palfinger: "#e30614",
    },
  },
};

async function createBrandEntry() {
  console.log("Creating Access Hire Australia brand entry...\n");

  try {
    // Check if entry already exists
    const checkResponse = await fetch(
      `https://cdn.builder.io/api/v3/content/brand?apiKey=${process.env.NEXT_PUBLIC_BUILDER_API_KEY}&query.data.slug=access-hire&limit=1`
    );

    const checkData = await checkResponse.json();

    if (checkData.results?.length > 0) {
      console.log("Access Hire brand entry already exists.");
      console.log("Entry ID:", checkData.results[0].id);
      console.log("\nView it at: https://builder.io/content/" + checkData.results[0].id);
      console.log("\nTo update, delete the existing entry first or update manually.");
      return;
    }

    // Create the entry using the Write API
    const createResponse = await fetch(
      `https://builder.io/api/v1/write/brand`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...accessHireBrand,
          published: "published",
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();

      if (error.includes("Model not found")) {
        console.error("❌ The 'brand' model does not exist in Builder.io.");
        console.error("\nCreate it first:");
        console.error("1. Go to https://builder.io/models");
        console.error("2. Click '+ Create Model'");
        console.error("3. Choose 'Data' as the model type");
        console.error("4. Name it 'brand' (lowercase)");
        console.error("5. Run this script again");
        process.exit(1);
      }

      throw new Error(`Failed to create entry: ${error}`);
    }

    const result = await createResponse.json();
    console.log("✓ Access Hire Australia brand entry created!");
    console.log("Entry ID:", result.id);
    console.log("\nView it at: https://builder.io/content/" + result.id);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createBrandEntry();
