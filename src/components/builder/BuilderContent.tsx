"use client";

import { Content } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";
import { useState, useEffect } from "react";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  apiKey: string;
  model: string;
}

export function BuilderContent({ content, apiKey, model }: BuilderContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const title = content?.data?.title || content?.name || "Equipment";

  // Only render Content component after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading placeholder during SSR and initial hydration
  if (!isMounted) {
    return (
      <div className="bg-gray-50 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-600">Loading content...</p>
      </div>
    );
  }

  // Always render Content component - it handles null content in editing mode
  // The Content component creates the drop zone for the visual editor
  return (
    <Content
      content={content}
      apiKey={apiKey}
      model={model}
      customComponents={customComponents}
    />
  );
}
