"use client";

import { Content, isPreviewing, isEditing } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";

// Register components with Builder.io visual editor
import "@/lib/builder-register";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  apiKey: string;
  model: string;
}

export function BuilderContent({ content, apiKey, model }: BuilderContentProps) {
  // Enable live editing features in preview/edit mode
  const showContent = content || isPreviewing() || isEditing();

  if (!showContent) {
    return null;
  }

  return (
    <Content
      content={content}
      apiKey={apiKey}
      model={model}
      customComponents={customComponents}
      // Enable live preview updates
      enrich={true}
    />
  );
}
