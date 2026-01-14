"use client";

import { useEffect, useState, useCallback } from "react";
import { Content, isPreviewing, isEditing, fetchOneEntry } from "@builder.io/sdk-react-nextjs";
import { customComponents } from "@/lib/builder-registry";

// Register components with Builder.io visual editor
import "@/lib/builder-register";

interface BuilderContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  apiKey: string;
  model: string;
}

export function BuilderContent({ content: serverContent, apiKey, model }: BuilderContentProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<any>(serverContent);
  const [isClient, setIsClient] = useState(false);

  // Check if we're in Builder.io editor
  const inEditorMode = isClient && (isPreviewing() || isEditing());

  // Fetch content client-side for live updates
  const fetchContent = useCallback(async () => {
    if (!inEditorMode) return;

    try {
      const urlPath = window.location.pathname;
      const freshContent = await fetchOneEntry({
        model,
        apiKey,
        userAttributes: { urlPath },
      });
      if (freshContent) {
        setContent(freshContent);
      }
    } catch (err) {
      console.error("[BuilderContent] Fetch error:", err);
    }
  }, [inEditorMode, model, apiKey]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for Builder.io editor messages
  useEffect(() => {
    if (!inEditorMode) return;

    // Initial fetch when entering editor mode
    fetchContent();

    // Listen for content updates from Builder.io editor
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "builder.contentUpdate") {
        setContent(event.data.data.content);
      }
      // Refetch on various Builder events
      if (
        event.data?.type?.startsWith("builder.") &&
        (event.data.type.includes("save") ||
          event.data.type.includes("publish") ||
          event.data.type.includes("update"))
      ) {
        fetchContent();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [inEditorMode, fetchContent]);

  // Update when server content changes
  useEffect(() => {
    if (serverContent) {
      setContent(serverContent);
    }
  }, [serverContent]);

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
      enrich={true}
    />
  );
}
