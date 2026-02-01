/**
 * Next.js Instrumentation
 *
 * This file is automatically loaded by Next.js to set up
 * OpenTelemetry tracing for server-side code.
 *
 * Traces are exported to Datadog via OTLP protocol.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see ADR-0006 for observability architecture
 */

import { registerOTel } from "@vercel/otel";

export function register() {
  // Only register in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerOTel({
      serviceName: "clg-website",
      // Datadog accepts OTLP traces
      // Configure DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_HTTP_ENDPOINT in Datadog Agent
      // or use Datadog's OTLP endpoint directly
    });

    console.log("[Instrumentation] OpenTelemetry registered for Node.js runtime");
  }
}

/**
 * Edge runtime instrumentation (if needed)
 * Currently not fully supported by @vercel/otel
 */
export function onRequestError({
  error,
  request,
}: {
  error: Error;
  request: Request;
}) {
  // Log errors that occur during request handling
  console.error("[Instrumentation] Request error:", {
    message: error.message,
    url: request.url,
    method: request.method,
  });
}
