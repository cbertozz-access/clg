/**
 * Create Access Express Brand Entry in Builder.io
 *
 * Usage:
 *   BUILDER_PRIVATE_KEY=xxx npx ts-node scripts/create-access-express-brand.ts
 */

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_PUBLIC_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (!BUILDER_PRIVATE_KEY) {
  console.error("Error: BUILDER_PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const accessExpressBrand = {
  name: "Access Express",
  data: {
    // Core identity
    id: "access-express",
    name: "Access Express",
    slug: "access-express",

    // Brand color scale (Deep Navy Blue)
    colorBrand50: "rgb(232 242 250)",
    colorBrand100: "rgb(192 216 236)",
    colorBrand200: "rgb(138 176 212)",
    colorBrand300: "rgb(90 132 176)",
    colorBrand400: "rgb(58 100 144)",
    colorBrand500: "rgb(35 74 114)",
    colorBrand600: "rgb(26 58 92)",    // #1a3a5c
    colorBrand700: "rgb(18 42 74)",    // #122a4a
    colorBrand800: "rgb(13 30 54)",    // #0d1e36
    colorBrand900: "rgb(10 22 40)",    // #0a1628
    colorBrand950: "rgb(5 12 20)",

    // Semantic colors - Navy/Black as primary
    colorPrimary: "rgb(10 22 40)",        // Navy/black #0a1628
    colorPrimaryHover: "rgb(18 42 74)",   // Lighter navy on hover
    colorPrimaryForeground: "rgb(255 255 255)",

    // Orange as secondary (for special CTAs)
    colorSecondary: "rgb(245 166 35)",    // Orange #f5a623
    colorSecondaryHover: "rgb(212 144 30)", // Orange pressed
    colorSecondaryForeground: "rgb(255 255 255)",

    // Blue accent for links and highlights
    colorAccent: "rgb(0 168 232)",        // #00a8e8
    colorAccentForeground: "rgb(255 255 255)",

    // Backgrounds - Light theme
    colorBackground: "rgb(255 255 255)",
    colorBackgroundAlt: "rgb(250 250 250)", // neutral-50
    colorCard: "rgb(255 255 255)",
    colorCardForeground: "rgb(38 38 38)",   // neutral-800

    // Header/Footer - Navy background (Access Express signature dark)
    colorHeader: "rgb(10 22 40)",           // #0a1628 - Deep Navy
    colorHeaderForeground: "rgb(255 255 255)", // white text
    colorFooter: "rgb(10 22 40)",           // #0a1628 - Deep Navy
    colorFooterForeground: "rgb(255 255 255)", // white text

    // Text
    colorForeground: "rgb(38 38 38)",       // neutral-800
    colorMutedForeground: "rgb(115 115 115)", // neutral-500

    // Borders
    colorBorder: "rgb(229 229 229)",        // neutral-200
    colorInput: "rgb(212 212 212)",         // neutral-300
    colorRing: "rgb(0 168 232)",            // accent blue for focus

    // Status colors
    colorSuccess: "rgb(34 197 94)",         // green-500
    colorSuccessHover: "rgb(22 163 74)",    // green-600
    colorWarning: "rgb(245 158 11)",        // amber-500
    colorError: "rgb(239 68 68)",           // red-500
    colorErrorHover: "rgb(220 38 38)",      // red-600

    // Typography
    fontHeading: "'Montserrat', system-ui, sans-serif",
    fontBody: "'Open Sans', system-ui, sans-serif",
    fontMono: "'Fira Code', 'Consolas', monospace",

    // Spacing
    radius: "8px",
    radiusSm: "4px",
    radiusLg: "12px",

    // Logo URLs
    logoUrl: "/images/logos/ae-logo-white.png",
    logoUrlDark: "/images/logos/ae-logo-white.png",

    // Equipment brand colors (shared)
    equipmentBrands: {
      genie: "#0064a7",
      jlg: "#f37123",
      haulotte: "#f1bd4b",
      skyjack: "#e41e26",
      snorkel: "#ff8200",
      lgmg: "#00a651",
      dingli: "#003da5",
      manitou: "#b22234",
      bobcat: "#ff6600",
      jcb: "#ffc107",
      merlo: "#004d40",
      toyota: "#eb0a1e",
      hyster: "#ff6600",
      crown: "#00529f",
    },
  },
};

async function createBrandEntry() {
  console.log("Creating Access Express brand entry in Builder.io...\n");

  try {
    // Check if entry already exists
    const checkResponse = await fetch(
      `https://cdn.builder.io/api/v3/content/brand?apiKey=${BUILDER_PUBLIC_KEY}&query.data.slug=access-express&limit=1`
    );

    const checkData = await checkResponse.json();

    if (checkData.results?.length > 0) {
      const existingId = checkData.results[0].id;
      console.log("Access Express brand entry exists. Updating...");
      console.log("Entry ID:", existingId);

      // Update the existing entry
      const updateResponse = await fetch(
        `https://builder.io/api/v1/write/brand/${existingId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...accessExpressBrand,
            published: "published",
          }),
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        throw new Error(`Failed to update entry: ${error}`);
      }

      console.log("✓ Access Express brand entry updated!");
      console.log("\nView it at: https://builder.io/content/" + existingId);
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
          ...accessExpressBrand,
          published: "published",
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create entry: ${error}`);
    }

    const result = await createResponse.json();
    console.log("✓ Access Express brand entry created!");
    console.log("Entry ID:", result.id);
    console.log("\nView it at: https://builder.io/content/" + result.id);
    console.log("\nYou can now select 'Access Express' when choosing a brand for your pages.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createBrandEntry();
