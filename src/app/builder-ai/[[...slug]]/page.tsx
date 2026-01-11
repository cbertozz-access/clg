import { BuilderContent } from "@/components/builder/BuilderContent";
import { getBuilderSearchParams } from "@builder.io/sdk-react-nextjs";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!.trim();
const MODEL_NAME = "builder-test-ai";

/**
 * Fetch from Builder.io CDN API with visual editor support
 */
async function fetchBuilderContent(
  urlPath: string,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    }
  }

  const builderParams = getBuilderSearchParams(urlSearchParams);

  const apiParams = new URLSearchParams({
    apiKey: BUILDER_API_KEY,
    "userAttributes.urlPath": urlPath,
    limit: "1",
  });

  if (builderParams) {
    for (const [key, value] of Object.entries(builderParams)) {
      if (value !== undefined) {
        apiParams.set(key, String(value));
      }
    }
  }

  const apiUrl = `https://cdn.builder.io/api/v3/content/${MODEL_NAME}?${apiParams.toString()}`;

  const response = await fetch(apiUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Builder.io API error:", response.status);
    return null;
  }

  const data = await response.json();
  return data.results?.[0] || null;
}

/**
 * Builder AI Test Page (CLG-38)
 *
 * Testing Builder.io AI approach for content creation.
 */

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BuilderAIPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = `/builder-ai${slug ? `/${slug}` : ""}`;

  const isPreviewMode =
    resolvedSearchParams["builder.preview"] !== undefined ||
    resolvedSearchParams["builder.frameEditing"] !== undefined;

  const content = await fetchBuilderContent(urlPath, resolvedSearchParams);

  return (
    <main className="min-h-screen">
      {(content || isPreviewMode) ? (
        <BuilderContent
          content={content}
          apiKey={BUILDER_API_KEY}
          model={MODEL_NAME}
        />
      ) : (
        <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Builder AI Test</h1>
          <p className="text-gray-500">No content found for this page</p>
          <p className="text-sm text-gray-400 mt-2">
            Add content in Builder.io editor for path: {urlPath}
          </p>
        </div>
      )}

      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        Page rendered via CLG-38
      </footer>
    </main>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = `/builder-ai${slug ? `/${slug}` : ""}`;

  const content = await fetchBuilderContent(urlPath, resolvedSearchParams);

  if (!content) {
    return {
      title: "Builder AI Test | Access Group",
    };
  }

  return {
    title: content.data?.title || "Builder AI Test | Access Group",
    description: content.data?.description || "Builder AI test page",
  };
}
