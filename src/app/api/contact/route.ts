/**
 * Contact Form API Route
 *
 * Security layers applied:
 * 1. Rate limiting (5 req/min per IP)
 * 2. CSRF token validation
 * 3. Input validation & sanitization
 * 4. Security headers (via middleware)
 *
 * Flow: Validate → NS Adapter → Firebase linkIdentity → Iterable → Response
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitErrorBody,
  validateCSRFToken,
  csrfErrorResponse,
  validateContactForm,
  validationErrorBody,
} from "@/lib/security";
import { syncContactSubmission } from "@/lib/integrations/iterable";

const NS_ADAPTER_URL =
  process.env.NS_ADAPTER_URL || "https://dev-agws.aghost.au/api/contact-request";

const FIREBASE_LINK_IDENTITY_URL =
  process.env.FIREBASE_LINK_IDENTITY_URL ||
  "https://australia-southeast1-composable-lg.cloudfunctions.net/linkIdentity";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ========================================
    // 1. Rate Limiting
    // ========================================
    const clientIp = await getClientIp();
    const rateLimitResult = await checkRateLimit(clientIp);

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );
      return NextResponse.json(rateLimitErrorBody(resetInSeconds), {
        status: 429,
        headers: { ...rateLimitResult.headers },
      });
    }

    // ========================================
    // 2. Parse Request Body
    // ========================================
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    // ========================================
    // 3. CSRF Validation
    // ========================================
    const csrfToken =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).csrfToken
        : undefined;

    if (typeof csrfToken !== "string") {
      return NextResponse.json(csrfErrorResponse(), { status: 403 });
    }

    const csrfValid = await validateCSRFToken(csrfToken);
    if (!csrfValid) {
      return NextResponse.json(csrfErrorResponse(), { status: 403 });
    }

    // ========================================
    // 4. Input Validation & Sanitization
    // ========================================
    const validation = validateContactForm(body);

    if (!validation.success) {
      return NextResponse.json(validationErrorBody(validation.errors!), {
        status: 400,
      });
    }

    const validatedData = validation.data!;

    // ========================================
    // 5. Submit to NS Adapter
    // ========================================
    const nsResponse = await fetch(NS_ADAPTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(process.env.NS_ADAPTER_API_KEY && {
          "X-API-Key": process.env.NS_ADAPTER_API_KEY,
        }),
      },
      body: JSON.stringify({
        contactFirstName: validatedData.contactFirstName,
        contactLastName: validatedData.contactLastName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        contactCompanyName: validatedData.contactCompanyName,
        contactMessage: validatedData.contactMessage,
        contactType: validatedData.contactType,
        sourceDepot: validatedData.sourceDepot,
        contactCountry: validatedData.contactCountry,
        contactIndustry: validatedData.contactIndustry,
        projectLocationSuburb: validatedData.projectLocationSuburb,
        productEnquiry: validatedData.productEnquiry,
        transactionType: validatedData.transactionType,
      }),
    });

    const nsResult = await nsResponse.json();

    if (!nsResponse.ok) {
      console.error("[Contact API] NS Adapter error:", {
        status: nsResponse.status,
        error: nsResult,
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          success: false,
          error: nsResult.error || "Submission failed",
          message:
            nsResult.message ||
            "Unable to process your request. Please try again.",
        },
        { status: nsResponse.status >= 500 ? 502 : nsResponse.status }
      );
    }

    // ========================================
    // 6. Link Identity in Firebase (non-blocking)
    // ========================================
    if (validatedData.visitorId) {
      // Fire and forget - don't block response
      fetch(FIREBASE_LINK_IDENTITY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: validatedData.visitorId,
          email: validatedData.contactEmail,
          phone: validatedData.contactPhone,
          netsuiteEntityId: nsResult.entityId || nsResult.contactRequestId,
          metadata: {
            firstName: validatedData.contactFirstName,
            lastName: validatedData.contactLastName,
            company: validatedData.contactCompanyName,
            source: "contact_form",
          },
        }),
      }).catch((err) => {
        console.error("[Contact API] Firebase linkIdentity error:", err);
      });
    }

    // ========================================
    // 7. Sync to Iterable for email marketing (non-blocking)
    // ========================================
    syncContactSubmission({
      email: validatedData.contactEmail,
      firstName: validatedData.contactFirstName,
      lastName: validatedData.contactLastName,
      phone: validatedData.contactPhone,
      company: validatedData.contactCompanyName,
      industry: validatedData.contactIndustry,
      country: validatedData.contactCountry,
      contactType: validatedData.contactType,
      transactionType: validatedData.transactionType,
      sourceDepot: validatedData.sourceDepot,
      productEnquiry: validatedData.productEnquiry,
      message: validatedData.contactMessage,
      visitorId: validatedData.visitorId,
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
    }).catch((err) => {
      console.error("[Contact API] Iterable sync error:", err);
    });

    // ========================================
    // 8. Success Response
    // ========================================
    console.log("[Contact API] Success:", {
      contactRequestId: nsResult.contactRequestId,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: true,
        contactRequestId: nsResult.contactRequestId,
        message: nsResult.message || "Thank you! We'll be in touch soon.",
      },
      {
        headers: {
          "X-RateLimit-Remaining":
            rateLimitResult.headers["X-RateLimit-Remaining"],
        },
      }
    );
  } catch (error) {
    console.error("[Contact API] Unexpected error:", {
      error: error instanceof Error ? error.message : error,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
