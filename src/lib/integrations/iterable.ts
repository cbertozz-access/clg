/**
 * Iterable Email Marketing Integration
 *
 * Syncs contact form submissions to Iterable for email campaigns.
 * Server-side only - API key is never exposed to browser.
 */

const ITERABLE_API_KEY = process.env.ITERABLE_API_KEY;
const ITERABLE_API_URL = "https://api.iterable.com/api";

interface IterableUser {
  email: string;
  dataFields?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    industry?: string;
    country?: string;
    transactionType?: string;
    sourceDepot?: string;
    visitorId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    signupSource?: string;
    signupDate?: string;
  };
}

interface IterableEvent {
  email: string;
  eventName: string;
  createdAt?: number;
  dataFields?: Record<string, unknown>;
}

/**
 * Check if Iterable is configured
 */
export function isIterableConfigured(): boolean {
  return !!ITERABLE_API_KEY;
}

/**
 * Update or create a user in Iterable
 */
export async function upsertUser(user: IterableUser): Promise<boolean> {
  if (!ITERABLE_API_KEY) {
    console.warn("[Iterable] API key not configured - skipping user upsert");
    return false;
  }

  try {
    const response = await fetch(`${ITERABLE_API_URL}/users/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": ITERABLE_API_KEY,
      },
      body: JSON.stringify({
        email: user.email,
        dataFields: user.dataFields,
        preferUserId: false,
        mergeNestedObjects: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Iterable] Failed to upsert user:", error);
      return false;
    }

    console.log("[Iterable] User upserted:", user.email);
    return true;
  } catch (error) {
    console.error("[Iterable] Error upserting user:", error);
    return false;
  }
}

/**
 * Track an event in Iterable
 */
export async function trackEvent(event: IterableEvent): Promise<boolean> {
  if (!ITERABLE_API_KEY) {
    console.warn("[Iterable] API key not configured - skipping event track");
    return false;
  }

  try {
    const response = await fetch(`${ITERABLE_API_URL}/events/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": ITERABLE_API_KEY,
      },
      body: JSON.stringify({
        email: event.email,
        eventName: event.eventName,
        createdAt: event.createdAt || Date.now(),
        dataFields: event.dataFields,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Iterable] Failed to track event:", error);
      return false;
    }

    console.log("[Iterable] Event tracked:", event.eventName, event.email);
    return true;
  } catch (error) {
    console.error("[Iterable] Error tracking event:", error);
    return false;
  }
}

/**
 * Sync a contact form submission to Iterable
 * Creates/updates user and tracks the submission event
 */
export async function syncContactSubmission(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  industry?: string;
  country?: string;
  contactType: string;
  transactionType?: string;
  sourceDepot?: string;
  productEnquiry?: string;
  message?: string;
  visitorId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<boolean> {
  if (!ITERABLE_API_KEY) {
    return false;
  }

  // Upsert user with profile data
  const userSuccess = await upsertUser({
    email: data.email,
    dataFields: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      company: data.company,
      industry: data.industry,
      country: data.country,
      transactionType: data.transactionType,
      sourceDepot: data.sourceDepot,
      visitorId: data.visitorId,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      signupSource: "contact_form",
      signupDate: new Date().toISOString(),
    },
  });

  // Track contact form submission event
  const eventSuccess = await trackEvent({
    email: data.email,
    eventName: "contactFormSubmitted",
    dataFields: {
      contactType: data.contactType,
      transactionType: data.transactionType,
      sourceDepot: data.sourceDepot,
      productEnquiry: data.productEnquiry,
      hasMessage: !!data.message,
      messageLength: data.message?.length || 0,
    },
  });

  return userSuccess && eventSuccess;
}
