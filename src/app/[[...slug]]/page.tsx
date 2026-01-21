import { BuilderContent } from "@/components/builder/BuilderContent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getBrandThemeFromContent } from "@/lib/builder/brand-model";
import { fetchOneEntry, getBuilderSearchParams } from "@builder.io/sdk-react-nextjs";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!.trim();

// Model to use for general pages
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
 * Root Catch-All Page
 *
 * Handles any URL path not caught by more specific routes.
 * Fetches content from Builder.io cc-equipment-category model.
 */

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatchAllPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = slug ? `/${slug}` : "/";

  // Check if Builder.io is in preview mode
  const isPreviewMode =
    resolvedSearchParams["builder.preview"] !== undefined ||
    resolvedSearchParams["builder.frameEditing"] !== undefined;

  const content = await fetchBuilderContent(urlPath, resolvedSearchParams);

  // Get brand theme from Builder.io content
  const brandTheme = await getBrandThemeFromContent(content);

  return (
    <ThemeProvider theme={brandTheme}>
      <main className="min-h-screen">
        {(content || isPreviewMode) ? (
          <BuilderContent
            content={content}
            apiKey={BUILDER_API_KEY}
            model={MODEL_NAME}
          />
        ) : (
          <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <h1 className="text-2xl font-semibold text-[var(--color-foreground)] mb-4">Page Not Found</h1>
            <p className="text-[var(--color-muted-foreground)]">No content found for this page</p>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              Path requested: <code className="bg-slate-100 px-2 py-1 rounded">{urlPath}</code>
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Model: <code className="bg-slate-100 px-2 py-1 rounded">{MODEL_NAME}</code>
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Ensure your Builder.io page URL matches this path and uses the correct model.
            </p>
          </div>
        )}
      </main>
    </ThemeProvider>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug?.join("/") || "";
  const urlPath = slug ? `/${slug}` : "/";

  const content = await fetchBuilderContent(urlPath, resolvedSearchParams);

  if (!content) {
    return {
      title: "Page Not Found | Access Hire",
    };
  }

  return {
    title: content.data?.title || "Access Hire Australia",
    description: content.data?.description || "Equipment hire across Australia",
  };
}
