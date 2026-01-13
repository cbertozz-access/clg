import { BuilderContent } from "@/components/builder/BuilderContent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getBrandThemeFromContent } from "@/lib/builder/brand-model";
import { getBuilderSearchParams } from "@builder.io/sdk-react-nextjs";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!.trim();
const MODEL_NAME = "cc-equipment-category";

/**
 * Fetch from Builder.io CDN API with visual editor support
 */
async function fetchBuilderContent(
  urlPath: string,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  // Convert searchParams to URLSearchParams for Builder SDK
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

  // Get Builder.io search params for visual editor support
  const builderParams = getBuilderSearchParams(urlSearchParams);

  // Build API URL
  const apiParams = new URLSearchParams({
    apiKey: BUILDER_API_KEY,
    "userAttributes.urlPath": urlPath,
    limit: "1",
  });

  // Add builder params if any
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
    cache: "no-store", // Don't cache in editing mode
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

  // Fetch content from Builder.io using direct API with visual editor params
  const content = await fetchBuilderContent(urlPath, resolvedSearchParams);

  // Get brand theme from Builder.io content (supports both reference and simple ID)
  const brandTheme = await getBrandThemeFromContent(content);

  return (
    <ThemeProvider theme={brandTheme}>
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
            <h1 className="text-2xl font-semibold text-[var(--color-foreground)] mb-4">Equipment</h1>
            <p className="text-[var(--color-muted-foreground)]">No content found for this page</p>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              Add content in Builder.io editor for path: {urlPath}
            </p>
          </div>
        )}

        {/* Attribution footer for AI comparison */}
        <footer className="bg-[var(--color-background-alt)] py-4 text-center text-sm text-[var(--color-muted-foreground)]">
          Page rendered via CLG-39
        </footer>
      </main>
    </ThemeProvider>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = `/equipment${slug ? `/${slug}` : ""}`;

  const content = await fetchBuilderContent(urlPath, resolvedSearchParams);

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
