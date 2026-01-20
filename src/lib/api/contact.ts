/**
 * Contact Request API Service
 *
 * Submits contact form data to the Access Group contact-request API
 * Includes Firebase visitor ID integration for tracking
 */

const CONTACT_API_URL = 'https://dev-agws.aghost.au/api/contact-request';

// Cookie/localStorage keys for visitor ID (matches clg-visitor.js SDK)
const VISITOR_COOKIE_KEY = 'clg_vid';
const VISITOR_STORAGE_KEY = 'clg_visitor';

export interface ContactRequestData {
  // Required fields
  contactPhone: string;
  contactMessage: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactCompanyName: string;
  contactType: string;
  sourceDepot: string;

  // Optional fields
  contactRequestId?: string;
  visitorId?: string; // Firebase visitor ID for tracking
  contactCountry?: string;
  contactIndustry?: string;
  projectLocationSuburb?: string;
  productEnquiry?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  projectName?: string;
  refererURL?: string;
}

export interface ContactRequestResponse {
  success: boolean;
  contactRequestId?: string;
  message?: string;
  error?: string;
}

/**
 * Generate a UUID for the contact request
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Get Firebase visitor ID from cookie or localStorage
 * Matches the storage used by clg-visitor.js SDK
 */
export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first (set by clg-visitor.js)
  const cookieId = getCookie(VISITOR_COOKIE_KEY);
  if (cookieId) return cookieId;

  // Fall back to localStorage
  try {
    const stored = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.id || data.visitorId || null;
    }
  } catch {
    // localStorage not available or invalid JSON
  }

  return null;
}

/**
 * Get UTM parameters from URL
 */
function getUtmParams(): Partial<ContactRequestData> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

/**
 * Submit a contact request to the API
 * Automatically includes visitor ID if available
 */
export async function submitContactRequest(
  data: Omit<ContactRequestData, 'contactRequestId'>
): Promise<ContactRequestResponse> {
  try {
    const utmParams = getUtmParams();
    const refererURL = typeof window !== 'undefined' ? window.location.href : undefined;
    const visitorId = getVisitorId();

    const requestBody: ContactRequestData = {
      contactRequestId: generateUUID(),
      visitorId: visitorId || undefined,
      ...data,
      ...utmParams,
      refererURL,
    };

    const response = await fetch(CONTACT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      contactRequestId: result.contactRequestId,
      message: result.message || 'Contact request submitted successfully',
    };
  } catch (error) {
    console.error('Contact request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit contact request',
    };
  }
}

/**
 * Map form field names to API field names
 */
export function mapFormDataToContactRequest(formData: Record<string, string>): Omit<ContactRequestData, 'contactRequestId'> {
  return {
    contactFirstName: formData.firstName || '',
    contactLastName: formData.surname || formData.lastName || '',
    contactPhone: formData.phone || formData.mobile || '',
    contactEmail: formData.email || '',
    contactCompanyName: formData.company || formData.companyName || '',
    contactMessage: formData.message || formData.enquiry || '',
    contactType: formData.contactType || 'General Inquiry',
    sourceDepot: formData.branch || formData.depot || 'Website',
    contactCountry: formData.country || 'Australia',
    contactIndustry: formData.industry || undefined,
    projectLocationSuburb: formData.projectLocation || formData.suburb || undefined,
    productEnquiry: formData.product || formData.equipment || undefined,
    transactionType: formData.transactionType || 'hire',
  };
}
