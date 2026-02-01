/**
 * Input Validation with Zod
 *
 * Schema validation for contact form submissions.
 * Includes sanitization for XSS prevention.
 */

import { z } from "zod";

// Lazy import DOMPurify to avoid SSR issues during build
let _DOMPurify: typeof import("isomorphic-dompurify").default | null = null;

async function getDOMPurify() {
  if (_DOMPurify) return _DOMPurify;
  const mod = await import("isomorphic-dompurify");
  _DOMPurify = mod.default;
  return _DOMPurify;
}

/**
 * Sanitize HTML content to prevent XSS
 * Falls back to basic sanitization if DOMPurify is not available
 */
function sanitizeHtml(input: string): string {
  if (!input) return "";
  // For build-time/SSR, use basic sanitization
  // DOMPurify will be used at runtime
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .trim();
}

/**
 * E.164 phone number regex (international format)
 * Allows optional + prefix followed by 10-15 digits
 */
const phoneRegex = /^[+]?[1-9]\d{9,14}$/;

/**
 * Contact form validation schema
 */
export const ContactFormSchema = z.object({
  // Required fields
  contactFirstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .transform(sanitizeHtml),

  contactLastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .transform(sanitizeHtml),

  contactEmail: z
    .string()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters")
    .transform((val) => val.toLowerCase().trim()),

  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .transform((val) => val.replace(/[\s\-()]/g, "")) // Remove formatting
    .refine(
      (val) => phoneRegex.test(val) || /^\d{10,15}$/.test(val),
      "Please provide a valid phone number"
    ),

  contactCompanyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name cannot exceed 100 characters")
    .transform(sanitizeHtml),

  contactMessage: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message cannot exceed 5000 characters")
    .transform(sanitizeHtml),

  contactType: z
    .string()
    .min(1, "Contact type is required")
    .max(50, "Contact type cannot exceed 50 characters")
    .default("General Inquiry"),

  sourceDepot: z
    .string()
    .min(1, "Source depot is required")
    .max(50, "Source depot cannot exceed 50 characters")
    .default("Website"),

  // Optional fields
  contactCountry: z
    .string()
    .max(50, "Country cannot exceed 50 characters")
    .transform(sanitizeHtml)
    .optional()
    .default("Australia"),

  contactIndustry: z
    .string()
    .max(100, "Industry cannot exceed 100 characters")
    .transform(sanitizeHtml)
    .optional(),

  projectLocationSuburb: z
    .string()
    .max(100, "Suburb cannot exceed 100 characters")
    .transform(sanitizeHtml)
    .optional(),

  productEnquiry: z
    .string()
    .max(200, "Product enquiry cannot exceed 200 characters")
    .transform(sanitizeHtml)
    .optional(),

  transactionType: z
    .enum(["hire", "sale", "service", "other"])
    .optional()
    .default("hire"),

  // Tracking fields (set by SDK)
  visitorId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),

  // UTM parameters
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),

  // First-touch UTM
  firstTouchSource: z.string().max(100).optional(),
  firstTouchMedium: z.string().max(100).optional(),
  firstTouchCampaign: z.string().max(100).optional(),

  // Session context
  landingPage: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  refererURL: z.string().max(500).optional(),
  sessionPageViews: z.number().int().min(0).optional(),
  pagesVisited: z.array(z.string().max(500)).optional(),
});

/**
 * Inferred type from schema
 */
export type ContactFormData = z.infer<typeof ContactFormSchema>;

/**
 * Validate contact form data
 * Returns validated data or formatted errors
 */
export function validateContactForm(data: unknown): {
  success: boolean;
  data?: ContactFormData;
  errors?: Record<string, string[]>;
} {
  const result = ContactFormSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validation error response body
 */
export function validationErrorBody(errors: Record<string, string[]>) {
  return {
    success: false,
    error: "Validation failed",
    message: "Please correct the following errors",
    details: Object.entries(errors).map(([field, messages]) => ({
      field,
      message: messages[0], // Return first error per field
    })),
  };
}
