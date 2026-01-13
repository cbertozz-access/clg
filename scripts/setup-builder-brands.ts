#!/usr/bin/env npx tsx
/**
 * Builder.io Brand Setup Script
 *
 * This script:
 * 1. Creates the 'brand' data model
 * 2. Creates all 20 brand entries
 * 3. Adds brand field to page models
 *
 * Usage:
 *   BUILDER_PRIVATE_KEY=xxx BUILDER_PUBLIC_KEY=xxx npm run setup:brands
 */

import brandSeedData from "../src/lib/builder/brand-seed-data.json";

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;
const BUILDER_PUBLIC_KEY = process.env.BUILDER_PUBLIC_KEY || process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (!BUILDER_PRIVATE_KEY) {
  console.error("❌ BUILDER_PRIVATE_KEY is required");
  process.exit(1);
}

if (!BUILDER_PUBLIC_KEY) {
  console.error("❌ BUILDER_PUBLIC_KEY is required (or NEXT_PUBLIC_BUILDER_API_KEY)");
  process.exit(1);
}

const brandModelFields = [
  { "@type": "@builder.io/core:Field", name: "id", type: "text", required: true },
  { "@type": "@builder.io/core:Field", name: "name", type: "text", required: true },
  { "@type": "@builder.io/core:Field", name: "slug", type: "text", required: true },
  { "@type": "@builder.io/core:Field", name: "logoUrl", type: "file" },
  { "@type": "@builder.io/core:Field", name: "logoUrlDark", type: "file" },
  { "@type": "@builder.io/core:Field", name: "colorPrimary", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorPrimaryDark", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorPrimaryForeground", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorAccent", type: "color" },
  { "@type": "@builder.io/core:Field", name: "colorAccentForeground", type: "color" },
  { "@type": "@builder.io/core:Field", name: "colorBackground", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorBackgroundAlt", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorCard", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorForeground", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorMutedForeground", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorBorder", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorInput", type: "color", required: true },
  { "@type": "@builder.io/core:Field", name: "colorSuccess", type: "color" },
  { "@type": "@builder.io/core:Field", name: "colorWarning", type: "color" },
  { "@type": "@builder.io/core:Field", name: "colorError", type: "color" },
  { "@type": "@builder.io/core:Field", name: "fontHeading", type: "text" },
  { "@type": "@builder.io/core:Field", name: "fontBody", type: "text" },
  { "@type": "@builder.io/core:Field", name: "radius", type: "text" },
  { "@type": "@builder.io/core:Field", name: "radiusSm", type: "text" },
  { "@type": "@builder.io/core:Field", name: "radiusLg", type: "text" },
];

async function getModels() {
  const response = await fetch(
    `https://builder.io/api/v2/admin?apiKey=${BUILDER_PUBLIC_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        query: `{ models { id name kind fields { name type } } }`
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.data?.models || null;
}

async function createBrandModel() {
  console.log("📦 Creating 'brand' data model...");

  const response = await fetch(
    `https://builder.io/api/v2/admin?apiKey=${BUILDER_PUBLIC_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        query: `
          mutation AddModel($body: JSONObject!) {
            addModel(body: $body) {
              id
              name
            }
          }
        `,
        variables: {
          body: {
            name: "brand",
            kind: "data",
            fields: brandModelFields,
          },
        },
      }),
    }
  );

  const data = await response.json();

  if (data.errors) {
    if (data.errors[0]?.message?.includes("already exists") ||
        data.errors[0]?.message?.includes("duplicate")) {
      console.log("   ✅ Brand model already exists");
      return true;
    }
    console.error("   ❌ Error:", data.errors[0]?.message);
    return false;
  }

  console.log("   ✅ Created 'brand' data model");
  return true;
}

async function addBrandFieldToModel(modelId: string, modelName: string, existingFields: unknown[]) {
  console.log(`📎 Adding 'brand' field to ${modelName}...`);

  const response = await fetch(
    `https://builder.io/api/v2/admin?apiKey=${BUILDER_PUBLIC_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        query: `
          mutation UpdateModel($id: ID!, $model: ModelInput!) {
            updateModel(id: $id, model: $model) {
              id
            }
          }
        `,
        variables: {
          id: modelId,
          model: {
            fields: [
              ...existingFields,
              {
                "@type": "@builder.io/core:Field",
                name: "brand",
                type: "reference",
                model: "brand",
                helperText: "Select brand theme for this page",
              },
            ],
          },
        },
      }),
    }
  );

  const data = await response.json();
  if (data.errors) {
    console.log(`   ⚠️  Could not add: ${data.errors[0]?.message}`);
    return false;
  }

  console.log(`   ✅ Added brand field to ${modelName}`);
  return true;
}

async function getExistingBrands(): Promise<Set<string>> {
  try {
    const response = await fetch(
      `https://cdn.builder.io/api/v3/content/brand?apiKey=${BUILDER_PUBLIC_KEY}&limit=100&fields=data.id`
    );
    if (!response.ok) return new Set();
    const data = await response.json();
    return new Set(data.results?.map((r: { data?: { id?: string } }) => r.data?.id).filter(Boolean) || []);
  } catch {
    return new Set();
  }
}

async function createBrandEntry(brand: typeof brandSeedData.brands[0]): Promise<boolean> {
  const response = await fetch(`https://builder.io/api/v1/write/brand?apiKey=${BUILDER_PUBLIC_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      name: brand.name,
      data: brand,
      published: "published",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }
  return true;
}

async function main() {
  console.log("🚀 Builder.io Brand Setup Script\n");
  console.log(`   Public Key: ${BUILDER_PUBLIC_KEY.substring(0, 8)}...`);
  console.log(`   Private Key: ${BUILDER_PRIVATE_KEY.substring(0, 8)}...\n`);

  // Step 1: Get existing models
  console.log("📋 Fetching existing models...");
  const models = await getModels();

  if (!models) {
    console.log("   ⚠️  Could not fetch models via GraphQL API");
    console.log("   Trying alternative approach...\n");
  } else {
    console.log(`   Found ${models.length} models`);
  }

  // Step 2: Create brand model if needed
  const brandModelExists = models?.some((m: { name: string }) => m.name === "brand");
  if (!brandModelExists) {
    await createBrandModel();
    await new Promise(r => setTimeout(r, 2000)); // Wait for propagation
  } else {
    console.log("📦 Brand model already exists");
  }

  // Step 3: Create brand entries
  console.log("\n📝 Creating brand entries...");
  const existingBrands = await getExistingBrands();
  console.log(`   Found ${existingBrands.size} existing brands`);

  let created = 0, skipped = 0, failed = 0;

  for (const brand of brandSeedData.brands) {
    if (existingBrands.has(brand.id)) {
      console.log(`   ⏭️  ${brand.name} (exists)`);
      skipped++;
      continue;
    }

    try {
      await createBrandEntry(brand);
      console.log(`   ✅ ${brand.name}`);
      created++;
      await new Promise(r => setTimeout(r, 300));
    } catch (error) {
      console.error(`   ❌ ${brand.name}: ${error}`);
      failed++;
    }
  }

  // Step 4: Add brand field to page models
  if (models) {
    console.log("\n📎 Adding brand field to page models...");
    const pageModelNames = ["cc-equipment-category", "builder-test-ai"];

    for (const modelName of pageModelNames) {
      const model = models.find((m: { name: string }) => m.name === modelName);
      if (!model) {
        console.log(`   ⚠️  Model '${modelName}' not found`);
        continue;
      }

      const hasBrand = model.fields?.some((f: { name: string }) => f.name === "brand");
      if (hasBrand) {
        console.log(`   ✅ ${modelName} already has brand field`);
        continue;
      }

      await addBrandFieldToModel(model.id, modelName, model.fields || []);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("✨ Setup Complete!\n");
  console.log(`   Brands created: ${created}`);
  console.log(`   Brands skipped: ${skipped}`);
  if (failed > 0) console.log(`   Brands failed: ${failed}`);

  if (created > 0 || skipped > 0) {
    console.log("\n📌 Next steps:");
    console.log("   1. Go to Builder.io → Content → brand");
    console.log("   2. Edit a page and select a brand");
    console.log("   3. Deploy to Vercel!");
  }
}

main().catch(console.error);
