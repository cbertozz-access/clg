"use client";

import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";

// Register components with Builder.io visual editor (Gen 1)
import "@/lib/builder-register";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  apiKey: string;
  model: string;
}

// Initialize Builder with API key
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
builder.init(BUILDER_API_KEY);

export function BuilderContent({ content, model }: BuilderContentProps) {
  const isPreviewing = useIsPreviewing();
  const showContent = content || isPreviewing;

  if (!showContent) {
    return null;
  }

  return (
    <BuilderComponent
      content={content}
      model={model}
    />
  );
}
