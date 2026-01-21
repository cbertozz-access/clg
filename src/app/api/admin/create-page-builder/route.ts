import { NextRequest, NextResponse } from "next/server";

/**
 * Admin API: Create Page from Page Builder
 *
 * Takes drag-and-drop blocks and creates a Builder.io page
 */

const BUILDER_PRIVATE_KEY = process.env.BUILDER_PRIVATE_KEY;

interface ComponentBlock {
  type: string;
  props: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blocks, brand, name, urlPath } = body;

    if (!name || !urlPath || !blocks || blocks.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: name, urlPath, blocks" },
        { status: 400 }
      );
    }

    // Convert PageBuilder blocks to Builder.io block format
    const builderBlocks = blocks.map((block: ComponentBlock) => ({
      "@type": "@builder.io/sdk:Element",
      component: {
        name: block.type,
        options: block.props,
      },
    }));

    // Add Header at the beginning
    builderBlocks.unshift({
      "@type": "@builder.io/sdk:Element",
      component: {
        name: "SiteHeader",
        options: {},
      },
    });

    // Add Footer at the end
    builderBlocks.push({
      "@type": "@builder.io/sdk:Element",
      component: {
        name: "SiteFooter",
        options: {},
      },
    });

    // Build page data
    const pageData = {
      name,
      published: "published",
      data: {
        title: name,
        brandId: brand || "access-hire", // Required for theming
        blocks: builderBlocks,
      },
      query: [
        {
          property: "urlPath",
          operator: "is",
          value: urlPath,
        },
      ],
    };

    if (!BUILDER_PRIVATE_KEY) {
      console.log("Demo mode - Page data:", JSON.stringify(pageData, null, 2));
      return NextResponse.json({
        success: true,
        message: "Demo mode: Page would be created",
        data: pageData,
      });
    }

    console.log("Creating page from builder:", JSON.stringify(pageData, null, 2));

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

    const responseText = await response.text();
    console.log("Builder.io response:", response.status, responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Builder.io API error: ${response.status}`, details: responseText },
        { status: response.status }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        success: true,
        message: "Page created",
        rawResponse: responseText,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Page created and published!",
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
