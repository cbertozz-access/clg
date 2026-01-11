import { fetchOneEntry } from "@builder.io/sdk-react-nextjs";
import { NextResponse } from "next/server";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

export async function GET() {
  const urlPath = "/equipment";

  try {
    const content = await fetchOneEntry({
      model: "cc-equipment-category",
      apiKey: BUILDER_API_KEY!,
      userAttributes: {
        urlPath,
      },
    });

    return NextResponse.json({
      apiKeyPresent: !!BUILDER_API_KEY,
      apiKeyPrefix: BUILDER_API_KEY?.substring(0, 8) + "...",
      urlPath,
      contentFound: !!content,
      contentId: content?.id || null,
      contentTitle: content?.data?.title || null,
    });
  } catch (error) {
    return NextResponse.json({
      apiKeyPresent: !!BUILDER_API_KEY,
      apiKeyPrefix: BUILDER_API_KEY?.substring(0, 8) + "...",
      urlPath,
      error: String(error),
    }, { status: 500 });
  }
}
