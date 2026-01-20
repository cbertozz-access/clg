/**
 * Contact Request API Service
 *
 * Submits contact form data to the Access Group contact-request API
 */

const CONTACT_API_URL = 'https://dev-agws.aghost.au/api/contact-request';

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
 */
export async function submitContactRequest(
  data: Omit<ContactRequestData, 'contactRequestId'>
): Promise<ContactRequestResponse> {
  try {
    const utmParams = getUtmParams();
    const refererURL = typeof window !== 'undefined' ? window.location.href : undefined;

    const requestBody: ContactRequestData = {
      contactRequestId: generateUUID(),
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
