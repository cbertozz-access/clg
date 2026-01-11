import { BuilderContent } from "@/components/builder/BuilderContent";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!.trim();
const MODEL_NAME = "cc-equipment-category";

/**
 * Direct fetch from Builder.io CDN API
 * Bypasses SDK's fetchOneEntry which has auth issues on Vercel
 */
async function fetchBuilderContent(urlPath: string) {
  const apiUrl = `https://cdn.builder.io/api/v3/content/${MODEL_NAME}?apiKey=${BUILDER_API_KEY}&userAttributes.urlPath=${encodeURIComponent(urlPath)}&limit=1`;

  const response = await fetch(apiUrl, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    console.error("Builder.io API error:", response.status);
    return null;
  }

  const data = await response.json();
  return data.results?.[0] || null;
}

/**
 * Equipment Category Page - Claude Code Version (CLG-39)
 *
 * Dynamic routing for equipment category landing pages.
 * Fetches content from Builder.io cc-equipment-category model.
 *
 * Routes:
 *   /equipment                    → Equipment hub page
 *   /equipment/scissor-lifts      → Scissor Lifts category
 *   /equipment/excavators         → Excavators category
 *   etc.
 */

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EquipmentPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = `/equipment${slug ? `/${slug}` : ""}`;

  // Check if Builder.io is in preview mode via URL params
  const isPreviewMode =
    resolvedSearchParams["builder.preview"] !== undefined ||
    resolvedSearchParams["builder.frameEditing"] !== undefined;

  // Fetch content from Builder.io using direct API
  const content = await fetchBuilderContent(urlPath);

  return (
    <main className="min-h-screen">
      {/* Always render BuilderContent in preview mode for drag-drop to work */}
      {(content || isPreviewMode) ? (
        <BuilderContent
          content={content}
          apiKey={BUILDER_API_KEY}
          model={MODEL_NAME}
        />
      ) : (
        <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">Equipment</h1>
          <p className="text-gray-500">No content found for this page</p>
          <p className="text-sm text-gray-400 mt-2">
            Add content in Builder.io editor for path: {urlPath}
          </p>
        </div>
      )}

      {/* Attribution footer for AI comparison */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        Page rendered via Claude Code approach (CLG-39)
      </footer>
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = `/equipment${slug ? `/${slug}` : ""}`;

  const content = await fetchBuilderContent(urlPath);

  if (!content) {
    return {
      title: "Equipment | Access Group",
    };
  }

  return {
    title: content.data?.title || "Equipment | Access Group",
    description: content.data?.description || "Browse our equipment range",
  };
}
