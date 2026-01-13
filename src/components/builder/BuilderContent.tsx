"use client";

import { useEffect, useState } from "react";
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
  // Track client-side preview state for hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enable live editing features in preview/edit mode
  const inEditorMode = isClient && (isPreviewing() || isEditing());
  const showContent = content || inEditorMode;

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
