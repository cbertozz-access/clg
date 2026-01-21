import { BuilderContent } from "@/components/builder/BuilderContent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getBrandThemeFromContent } from "@/lib/builder/brand-model";
import { brands } from "@/lib/themes/brands";
import { fetchOneEntry, getBuilderSearchParams } from "@builder.io/sdk-react-nextjs";
import { EnquiryCartBubble } from "@/components/EnquiryCartBubble";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!.trim();
const MODEL_NAME = "cc-equipment-category";

// Force dynamic rendering for live editing support
export const dynamic = "force-dynamic";

/**
 * Fetch from Builder.io using SDK for proper visual editor support
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

  try {
    // Use SDK's fetchOneEntry for proper visual editor integration
    const content = await fetchOneEntry({
      model: MODEL_NAME,
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath,
      },
      options: getBuilderSearchParams(urlSearchParams),
    });

    return content;
  } catch (error) {
    console.error("Builder.io fetch error:", error);
    return null;
  }
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

  // Get brand theme from Builder.io content or URL parameter
  let brandTheme = await getBrandThemeFromContent(content);

  // Fallback: check URL parameter ?brandId=access-express
  if (!brandTheme && resolvedSearchParams.brandId) {
    const brandIdParam = Array.isArray(resolvedSearchParams.brandId)
      ? resolvedSearchParams.brandId[0]
      : resolvedSearchParams.brandId;
    if (brandIdParam && brands[brandIdParam]) {
      brandTheme = brands[brandIdParam];
    }
  }

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
      </main>
      {/* Enquiry Cart Bubble - inside ThemeProvider for brand-aware styling */}
      <EnquiryCartBubble />
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

  // Check if page allows indexing (default: noindex)
  const allowIndexing = content.data?.allowIndexing === true;

  return {
    title: content.data?.title || "Equipment | Access Group",
    description: content.data?.description || "Browse our equipment range",
    robots: allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
