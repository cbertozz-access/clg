import { NextRequest, NextResponse } from 'next/server';

const MKTG_PUB_EVENT_URL = 'https://prod01.aghost.au/azure/Public/MktgPubEvent';
const DEFAULT_TOKEN = '61b94ef0-0447-475c-9d27-cd3aaf7b9dad';

/**
 * Test endpoint to send events to the MktgPubEvent API
 * This proxies requests through Vercel (which is whitelisted by Cloudflare)
 *
 * Usage:
 * POST /api/test-amplitude-webhook
 * Body: { event_type, user_id, ... } or use default test payload
 * Query: ?token=xxx (optional, uses default if not provided)
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token') || DEFAULT_TOKEN;

    let body;
    try {
      body = await request.json();
    } catch {
      // Use default test payload if no body provided
      body = {
        event_type: 'test_amplitude_webhook',
        user_id: 'test-user-' + Date.now(),
        device_id: 'test-device-' + Date.now(),
        event_time: new Date().toISOString(),
        event_properties: {
          source: 'clg-webhook-test',
          test: true,
          timestamp: Date.now(),
        },
        user_properties: {
          test_user: true,
        },
      };
    }

    console.log('Testing MktgPubEvent with payload:', JSON.stringify(body, null, 2));

    const url = `${MKTG_PUB_EVENT_URL}?Token=${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      requestPayload: body,
      response: responseData,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    console.error('MktgPubEvent test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test MktgPubEvent',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token') || DEFAULT_TOKEN;

  // For GET, just return info about the endpoint
  return NextResponse.json({
    endpoint: `${MKTG_PUB_EVENT_URL}?Token=${token}`,
    method: 'POST',
    description: 'Test endpoint for MktgPubEvent webhook',
    usage: {
      test_with_default_payload: 'POST /api/test-amplitude-webhook',
      test_with_custom_payload: 'POST /api/test-amplitude-webhook with JSON body',
      custom_token: 'Add ?token=your-token query parameter',
    },
    sample_amplitude_payload: {
      event_type: 'cohort_updated',
      user_id: 'amplitude-user-123',
      device_id: 'device-456',
      event_time: new Date().toISOString(),
      event_properties: {
        cohort_id: 'cohort-123',
        cohort_name: 'High Value Customers',
        action: 'entered',
      },
      user_properties: {
        email: 'user@example.com',
        plan: 'premium',
      },
    },
  });
}
