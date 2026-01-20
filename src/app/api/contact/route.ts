import { NextRequest, NextResponse } from 'next/server';

const CONTACT_API_URL = 'https://dev-agws.aghost.au/api/contact-request';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(CONTACT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || result.message || `Request failed with status ${response.status}`
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      contactRequestId: result.contactRequestId,
      message: result.message || 'Contact request submitted successfully',
    });
  } catch (error) {
    console.error('Contact API proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit contact request'
      },
      { status: 500 }
    );
  }
}
