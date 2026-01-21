import { NextRequest, NextResponse } from "next/server";

/**
 * Admin API: Create Page in Builder.io
 *
 * Uses Builder.io Write API to programmatically create pages
 */

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;
const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

// Template configurations for different page types
const TEMPLATES: Record<string, object> = {
  "hero-contact": {
    blocks: [
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "Hero",
          options: {
            headline: "{{headline}}",
            subheadline: "{{subheadline}}",
            primaryCtaText: "{{ctaText}}",
            primaryCtaLink: "{{ctaLink}}",
            height: "large",
            overlayOpacity: 50,
          },
        },
      },
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "ContactForm",
          options: {
            title: "Get in Touch",
            subtitle: "Fill out the form below and we'll get back to you shortly",
            showCompanyField: true,
            showMessageField: true,
            width: "medium",
          },
        },
      },
    ],
  },
  "equipment-landing": {
    blocks: [
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "Hero",
          options: {
            headline: "{{headline}}",
            subheadline: "{{subheadline}}",
            primaryCtaText: "{{ctaText}}",
            primaryCtaLink: "{{ctaLink}}",
            height: "medium",
          },
        },
      },
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "EquipmentSearch",
          options: {
            title: "Browse Equipment",
            showFilters: true,
            columns: "3",
            useQuickView: true,
          },
        },
      },
    ],
  },
  "campaign-landing": {
    blocks: [
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "Hero",
          options: {
            headline: "{{headline}}",
            subheadline: "{{subheadline}}",
            primaryCtaText: "{{ctaText}}",
            primaryCtaLink: "{{ctaLink}}",
            height: "large",
          },
        },
      },
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "TextBlock",
          options: {
            content: "<h2>Why Choose Us</h2><p>Add your benefits content here.</p>",
          },
        },
      },
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "ContactForm",
          options: {
            title: "Request a Quote",
            width: "medium",
          },
        },
      },
    ],
  },
  "location-page": {
    blocks: [
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "Hero",
          options: {
            headline: "{{headline}}",
            subheadline: "{{subheadline}}",
            primaryCtaText: "Call Now",
            primaryCtaLink: "tel:134000",
            height: "medium",
          },
        },
      },
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "TextBlock",
          options: {
            content: "<h2>Visit Our Branch</h2><p>Add location details, hours, and contact info here.</p>",
          },
        },
      },
      {
        "@type": "@builder.io/sdk:Element",
        component: {
          name: "EquipmentGrid",
          options: {
            title: "Equipment Available at This Location",
            maxProducts: 6,
            columns: "3",
          },
        },
      },
    ],
  },
};

// Brand references in Builder.io
const BRAND_REFS: Record<string, string> = {
  "access-hire": "access-hire-australia",
  "access-express": "access-express",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, brand, name, urlPath, headline, subheadline, ctaText, ctaLink } = body;

    // Validate required fields
    if (!template || !name || !urlPath) {
      return NextResponse.json(
        { error: "Missing required fields: template, name, urlPath" },
        { status: 400 }
      );
    }

    // Get template configuration
    const templateConfig = TEMPLATES[template];
    if (!templateConfig) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    // Replace placeholders in template
    let blocksJson = JSON.stringify(templateConfig);
    blocksJson = blocksJson
      .replace(/\{\{headline\}\}/g, headline || name)
      .replace(/\{\{subheadline\}\}/g, subheadline || "")
      .replace(/\{\{ctaText\}\}/g, ctaText || "Get a Quote")
      .replace(/\{\{ctaLink\}\}/g, ctaLink || "#quote-form");

    const blocks = JSON.parse(blocksJson).blocks;

    // Build page data for Builder.io
    const pageData = {
      name,
      data: {
        title: name,
        description: subheadline || `${name} - Access Hire Australia`,
        url: urlPath,
        brand: brand ? { "@type": "@builder.io/core:Reference", id: BRAND_REFS[brand] || brand } : undefined,
        blocks,
      },
      published: "draft", // Start as draft
      query: [
        {
          property: "urlPath",
          operator: "is",
          value: urlPath,
        },
      ],
    };

    // Check if we have the private key for Write API
    if (!BUILDER_PRIVATE_KEY) {
      // For demo purposes, return success without actually creating
      console.log("Builder.io Write API key not configured. Page data:", pageData);
      return NextResponse.json({
        success: true,
        message: "Demo mode: Page would be created with this data",
        data: pageData,
        note: "Set BUILDER_PRIVATE_KEY env var to enable actual page creation",
      });
    }

    // Call Builder.io Write API
    const response = await fetch(
      `https://builder.io/api/v1/write/cc-equipment-category`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BUILDER_PRIVATE_KEY}`,
        },
        body: JSON.stringify(pageData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Builder.io API error:", errorText);
      return NextResponse.json(
        { error: `Builder.io API error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Page created successfully",
      pageId: result.id,
      editUrl: `https://builder.io/content/${result.id}`,
    });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
