import { Content, fetchOneEntry } from "@builder.io/sdk-react-nextjs";
import { notFound } from "next/navigation";
import { customComponents } from "@/lib/builder-registry";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

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

  // Fetch content from Builder.io
  const content = await fetchOneEntry({
    model: "cc-equipment-category",
    apiKey: BUILDER_API_KEY,
    userAttributes: {
      urlPath,
    },
  });

  // If no content and not in preview mode, show 404
  if (!content && !isPreviewMode) {
    return notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Builder.io renders the page content with registered components */}
      <Content
        content={content}
        apiKey={BUILDER_API_KEY}
        model="cc-equipment-category"
        customComponents={customComponents}
      />

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

  const content = await fetchOneEntry({
    model: "cc-equipment-category",
    apiKey: BUILDER_API_KEY,
    userAttributes: {
      urlPath,
    },
  });

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
