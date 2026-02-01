/**
 * Amplitude Analytics Integration
 *
 * Provides type-safe event tracking with automatic initialization.
 * Uses the browser SDK for client-side analytics.
 */

import * as amplitude from "@amplitude/analytics-browser";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let isInitialized = false;

/**
 * Initialize Amplitude SDK
 * Safe to call multiple times - will only initialize once
 */
export function initAmplitude(): void {
  if (isInitialized || typeof window === "undefined") return;

  if (!AMPLITUDE_API_KEY) {
    console.warn("[Amplitude] API key not configured - analytics disabled");
    return;
  }

  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      fileDownloads: true,
    },
    // Respect user privacy
    trackingOptions: {
      ipAddress: false, // Don't track IP
    },
  });

  isInitialized = true;
  console.log("[Amplitude] Initialized");
}

/**
 * Identify a user with their properties
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialized) initAmplitude();
  if (!AMPLITUDE_API_KEY) return;

  amplitude.setUserId(userId);

  if (properties) {
    const identify = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        identify.set(key, value as string | number | boolean | string[]);
      }
    });
    amplitude.identify(identify);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialized) initAmplitude();
  if (!AMPLITUDE_API_KEY) return;

  amplitude.track(eventName, properties);
}

/**
 * Set user properties without tracking an event
 */
export function setUserProperties(
  properties: Record<string, unknown>
): void {
  if (!isInitialized) initAmplitude();
  if (!AMPLITUDE_API_KEY) return;

  const identify = new amplitude.Identify();
  Object.entries(properties).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      identify.set(key, value as string | number | boolean | string[]);
    }
  });
  amplitude.identify(identify);
}

/**
 * Track page view (called automatically with defaultTracking)
 */
export function trackPageView(
  pageName?: string,
  properties?: Record<string, unknown>
): void {
  if (!isInitialized) initAmplitude();
  if (!AMPLITUDE_API_KEY) return;

  trackEvent("Page View", {
    page_name: pageName,
    page_url: typeof window !== "undefined" ? window.location.href : undefined,
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    ...properties,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(
  formName: string,
  success: boolean,
  properties?: Record<string, unknown>
): void {
  trackEvent("Form Submitted", {
    form_name: formName,
    success,
    ...properties,
  });
}

/**
 * Track contact form submission specifically
 */
export function trackContactFormSubmission(properties: {
  contactType: string;
  sourceDepot?: string;
  industry?: string;
  transactionType?: string;
  hasProductEnquiry: boolean;
  success: boolean;
}): void {
  trackEvent("Contact Form Submitted", {
    contact_type: properties.contactType,
    source_depot: properties.sourceDepot,
    industry: properties.industry,
    transaction_type: properties.transactionType,
    has_product_enquiry: properties.hasProductEnquiry,
    success: properties.success,
  });
}

/**
 * Track equipment enquiry
 */
export function trackEquipmentEnquiry(properties: {
  equipmentId: string;
  equipmentName: string;
  category?: string;
  action: "view" | "add_to_cart" | "remove_from_cart" | "enquire";
}): void {
  trackEvent("Equipment Interaction", {
    equipment_id: properties.equipmentId,
    equipment_name: properties.equipmentName,
    category: properties.category,
    action: properties.action,
  });
}

/**
 * Reset user identity (for logout)
 */
export function resetUser(): void {
  if (!isInitialized) return;
  amplitude.reset();
}

/**
 * Get the current device ID
 */
export function getDeviceId(): string | undefined {
  if (!isInitialized) return undefined;
  return amplitude.getDeviceId();
}

/**
 * Get the current session ID
 */
export function getSessionId(): number | undefined {
  if (!isInitialized) return undefined;
  return amplitude.getSessionId();
}
