import { NextResponse } from "next/server";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

export async function GET() {
  const urlPath = "/equipment";
  const model = "cc-equipment-category";

  try {
    // Try direct API fetch instead of SDK
    const apiUrl = `https://cdn.builder.io/api/v3/content/${model}?apiKey=${BUILDER_API_KEY}&userAttributes.urlPath=${encodeURIComponent(urlPath)}&limit=1`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({
        apiKeyPresent: !!BUILDER_API_KEY,
        apiKeyPrefix: BUILDER_API_KEY?.substring(0, 8) + "...",
        urlPath,
        directApiStatus: response.status,
        directApiError: await response.text(),
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.results?.[0];

    return NextResponse.json({
      apiKeyPresent: !!BUILDER_API_KEY,
      apiKeyPrefix: BUILDER_API_KEY?.substring(0, 8) + "...",
      urlPath,
      contentFound: !!content,
      contentId: content?.id || null,
      contentTitle: content?.data?.title || null,
      resultCount: data.results?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      apiKeyPresent: !!BUILDER_API_KEY,
      apiKeyPrefix: BUILDER_API_KEY?.substring(0, 8) + "...",
      urlPath,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
