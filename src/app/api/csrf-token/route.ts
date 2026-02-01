/**
 * CSRF Token API Route
 *
 * Returns a CSRF token for client-side form submissions.
 * Sets the token cookie if not already present.
 *
 * GET /api/csrf-token
 * Response: { token: string }
 */

import { NextResponse } from "next/server";
import { getCSRFToken } from "@/lib/security";

export async function GET() {
  try {
    const token = await getCSRFToken();

    return NextResponse.json(
      { token },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[CSRF Token API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
