"use client";

import { Content, type BuilderContent as BuilderContentType } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";
import React, { Component, type ReactNode } from "react";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: BuilderContentType | any;
  apiKey: string;
  model: string;
}

// Error boundary to catch Content component errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ContentErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Builder Content Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 p-8">
          <p className="text-red-800 font-bold">Content component error:</p>
          <p className="text-red-600 text-sm mt-2">{this.state.error?.message}</p>
          {this.props.fallback}
        </div>
      );
    }
    return this.props.children;
  }
}

export function BuilderContent({ content, apiKey, model }: BuilderContentProps) {
  const title = content?.data?.title || content?.name || "No title";

  const fallbackContent = (
    <div className="bg-green-100 p-8 text-center mt-4">
      <h1 className="text-2xl font-bold text-green-800 mb-2">{title}</h1>
      <p className="text-green-600">Fallback: Content loaded from Builder.io</p>
    </div>
  );

  return (
    <ContentErrorBoundary fallback={fallbackContent}>
      <Content
        content={content}
        apiKey={apiKey}
        model={model}
        customComponents={customComponents}
      />
    </ContentErrorBoundary>
  );
}
