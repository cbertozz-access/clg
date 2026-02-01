"use client";

import { useEffect } from "react";
import { initAmplitude } from "@/lib/analytics";

/**
 * Analytics Provider Component
 *
 * Initializes Amplitude on client-side mount.
 * Add this to your root layout to enable analytics.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAmplitude();
  }, []);

  return <>{children}</>;
}

export default AnalyticsProvider;
