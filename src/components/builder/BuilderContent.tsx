"use client";

import { Content, isPreviewing } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  apiKey: string;
  model: string;
}

export function BuilderContent({ content, apiKey, model }: BuilderContentProps) {
  // Always render Content component immediately for visual editor to work
  // The Content component creates the drop zone for drag-and-drop
  return (
    <Content
      content={content}
      apiKey={apiKey}
      model={model}
      customComponents={customComponents}
    />
  );
}
