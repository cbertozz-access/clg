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
  // Test without Builder Content component first
  const title = content?.data?.title || content?.name || "No title";

  // Temporarily disable Content component to debug
  const useBuilderContent = false;

  if (!useBuilderContent) {
    return (
      <div className="bg-green-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">{title}</h1>
        <p className="text-green-600">Content loaded successfully from Builder.io</p>
        <p className="text-sm text-green-500 mt-2">Model: {model}</p>
      </div>
    );
  }

  return (
    <Content
      content={content}
      apiKey={apiKey}
      model={model}
      customComponents={customComponents}
    />
  );
}
