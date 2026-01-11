"use client";

import { Content, type BuilderContent as BuilderContentType } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: BuilderContentType | any;
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
