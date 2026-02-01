"use client";

/**
 * Datadog RUM (Real User Monitoring) Component
 *
 * Initializes Datadog RUM SDK for browser performance monitoring.
 * Include this component in your root layout.
 *
 * Features:
 * - Core Web Vitals tracking
 * - User session recording (20% sample)
 * - User interaction tracking
 * - Resource timing
 * - Long task detection
 *
 * @see ADR-0006 for observability architecture decisions
 */

import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";

interface DatadogRumProps {
  /**
   * Optional user identification for session correlation
   */
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export function DatadogRum({ userId, userEmail, userName }: DatadogRumProps) {
  useEffect(() => {
    // Only initialize in browser and if not already initialized
    if (typeof window === "undefined") return;
    if (datadogRum.getInitConfiguration()) return;

    const appId = process.env.NEXT_PUBLIC_DD_APP_ID;
    const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN;

    // Skip if credentials not configured
    if (!appId || !clientToken) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Datadog RUM] Skipped - credentials not configured");
      }
      return;
    }

    datadogRum.init({
      applicationId: appId,
      clientToken: clientToken,
      site: process.env.NEXT_PUBLIC_DD_SITE || "datadoghq.com",
      service: "clg-website",
      env: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

      // Session sampling
      sessionSampleRate: 100, // Collect 100% of sessions
      sessionReplaySampleRate: 20, // Record 20% of sessions

      // Feature flags
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,

      // Privacy settings
      defaultPrivacyLevel: "mask-user-input",

      // Performance
      allowedTracingUrls: [
        // Allow tracing to our own API
        { match: /https:\/\/.*\.clg\.com\.au/, propagatorTypes: ["tracecontext"] },
        { match: /https:\/\/.*\.vercel\.app/, propagatorTypes: ["tracecontext"] },
      ],
    });

    // Start session replay recording
    datadogRum.startSessionReplayRecording();

    console.log("[Datadog RUM] Initialized");
  }, []);

  // Set user context when user info changes
  useEffect(() => {
    if (!userId) return;

    datadogRum.setUser({
      id: userId,
      email: userEmail,
      name: userName,
    });
  }, [userId, userEmail, userName]);

  // This component doesn't render anything
  return null;
}

/**
 * Track a custom action in Datadog RUM
 */
export function trackAction(name: string, context?: Record<string, unknown>) {
  if (typeof window !== "undefined" && datadogRum.getInitConfiguration()) {
    datadogRum.addAction(name, context);
  }
}

/**
 * Track an error in Datadog RUM
 */
export function trackError(error: Error, context?: Record<string, unknown>) {
  if (typeof window !== "undefined" && datadogRum.getInitConfiguration()) {
    datadogRum.addError(error, context);
  }
}

/**
 * Set global context that will be attached to all events
 */
export function setGlobalContext(context: Record<string, unknown>) {
  if (typeof window !== "undefined" && datadogRum.getInitConfiguration()) {
    datadogRum.setGlobalContextProperty("custom", context);
  }
}
