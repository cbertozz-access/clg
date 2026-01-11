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

  // TODO: Debug why Builder.io Content component fails on Vercel
  // For now, render a simple placeholder that shows the content was loaded
  // The visual editor should still work via preview mode

  return (
    <div className="bg-gray-50 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">
        Builder.io content loaded successfully
      </p>
      <p className="text-sm text-gray-400 mt-4">
        Model: {model} | Content ID: {content?.id?.slice(0, 8)}...
      </p>
      <p className="text-xs text-gray-400 mt-2">
        Use Builder.io visual editor to add components
      </p>
    </div>
  );
}
