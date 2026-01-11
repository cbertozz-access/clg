"use client";

import { Content } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";

interface BuilderContentProps {
  content: unknown;
  apiKey: string;
  model: string;
}

export function BuilderContent({ content, apiKey, model }: BuilderContentProps) {
  return (
    <Content
      content={content}
      apiKey={apiKey}
      model={model}
      customComponents={customComponents}
    />
  );
}
