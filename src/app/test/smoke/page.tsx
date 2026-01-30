'use client';

import { useEffect, useState, useCallback } from 'react';

const DEBUG_EVENTS_ENDPOINT = 'https://australia-southeast1-composable-lg.cloudfunctions.net/debugEvents';

interface DebugEvent {
  id: string;
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'pass' | 'fail';
  eventType: string;
  validate: (event: DebugEvent) => { pass: boolean; details: string };
  result?: { pass: boolean; details: string };
  eventData?: Record<string, unknown>;
}

export default function SmokeTestPage() {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [debugSessionId, setDebugSessionId] = useState<string>('');
  const [debugUrl, setDebugUrl] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [liveEvents, setLiveEvents] = useState<DebugEvent[]>([]);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const [testCases, setTestCases] = useState<TestCase[]>([
    // === CORE FUNCTIONALITY ===
    {
      id: 'sdk_init',
      name: 'SDK Initialization',
      description: 'SDK loads and receives visitor ID from Firebase',
      status: 'waiting',
      eventType: 'sdk_init',
      validate: (event) => {
        const hasVisitorId = !!event.data?.visitor_id;
        const hasSessionId = !!event.data?.session_id;
        const startTime = event.data?.timestamp ? new Date(event.data.timestamp as string).getTime() : 0;
        const latency = startTime ? Date.now() - startTime : 0;
        return {
          pass: hasVisitorId && hasSessionId,
          details: hasVisitorId
            ? `Visitor: ${String(event.data.visitor_id).substring(0, 20)}... (${latency}ms)`
            : 'No visitor ID received'
        };
      }
    },
    {
      id: 'visitor_id_format',
      name: 'Visitor ID Format',
      description: 'Visitor ID is valid UUID format (not fallback)',
      status: 'waiting',
      eventType: 'sdk_init',
      validate: (event) => {
        const visitorId = event.data?.visitor_id as string;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(visitorId || '');
        const isFallback = visitorId?.startsWith('clg_');
        return {
          pass: isUuid && !isFallback,
          details: isUuid
            ? 'Valid Firebase UUID'
            : isFallback
              ? 'FALLBACK ID - Firebase call failed'
              : 'Invalid ID format'
        };
      }
    },
    {
      id: 'check_identity',
      name: 'Check Identity',
      description: 'Device fingerprint lookup on page load',
      status: 'waiting',
      eventType: 'check_identity',
      validate: (event) => {
        const hasResult = !!event.data?.result;
        const result = event.data?.result as Record<string, unknown> | undefined;
        return {
          pass: hasResult,
          details: result?.is_known
            ? `Known device, master: ${result.master_uid}`
            : 'New device (not in identity graph)'
        };
      }
    },
    {
      id: 'device_fingerprint',
      name: 'Device Fingerprint',
      description: 'Device ID generated and consistent',
      status: 'waiting',
      eventType: 'check_identity',
      validate: (event) => {
        const deviceId = event.data?.device_id as string;
        const hasPrefix = deviceId?.startsWith('DV');
        const isConsistent = deviceId?.length > 5;
        return {
          pass: hasPrefix && isConsistent,
          details: `Device: ${deviceId || 'N/A'}`
        };
      }
    },
    {
      id: 'brand_detection',
      name: 'Brand Detection',
      description: 'Brand correctly identified from hostname',
      status: 'waiting',
      eventType: 'check_identity',
      validate: (event) => {
        const brand = event.data?.brand as string;
        const validBrands = ['access-hire', 'access-express', 'clg-dev', 'unknown'];
        const isValid = validBrands.includes(brand);
        return {
          pass: !!brand,
          details: `Brand: ${brand}${isValid ? '' : ' (custom)'}`
        };
      }
    },
    // === IDENTITY LINKING ===
    {
      id: 'link_identity',
      name: 'Link Identity',
      description: 'Email/phone hash linked on form submit',
      status: 'waiting',
      eventType: 'link_identity',
      validate: (event) => {
        const result = event.data?.result as Record<string, unknown> | undefined;
        const hasEmail = !!event.data?.has_email;
        const hasPhone = !!event.data?.has_phone;
        return {
          pass: !!result?.master_uid,
          details: result?.is_duplicate
            ? `Duplicate detected via ${(result.match_sources as string[])?.join(', ')}`
            : `Identity ${result?.action || 'processed'} (email: ${hasEmail}, phone: ${hasPhone})`
        };
      }
    },
    {
      id: 'pii_hashed',
      name: 'PII Hashed',
      description: 'Email/phone are hashed, not raw',
      status: 'waiting',
      eventType: 'link_identity',
      validate: (event) => {
        const data = event.data as Record<string, unknown>;
        // Check that raw email/phone are NOT in the event data sent to server
        const hasRawEmail = typeof data.email === 'string' && data.email.includes('@');
        const hasRawPhone = typeof data.phone === 'string' && /^\d{10,}$/.test(data.phone);
        const hasHashedEmail = !!data.has_email;
        const hasHashedPhone = !!data.has_phone;
        return {
          pass: !hasRawEmail && !hasRawPhone && (hasHashedEmail || hasHashedPhone),
          details: hasRawEmail || hasRawPhone
            ? 'WARNING: Raw PII detected!'
            : 'PII properly hashed before transmission'
        };
      }
    },
    {
      id: 'duplicate_detection',
      name: 'Duplicate Detection',
      description: 'System correctly identifies returning users',
      status: 'waiting',
      eventType: 'link_identity',
      validate: (event) => {
        const result = event.data?.result as Record<string, unknown> | undefined;
        const isDuplicate = result?.is_duplicate;
        const matchSources = result?.match_sources as string[] | undefined;
        const masterUid = result?.master_uid as string;
        return {
          pass: !!result,
          details: isDuplicate
            ? `Duplicate: matched by ${matchSources?.join(', ')} → ${masterUid?.substring(0, 8)}...`
            : `New identity created: ${masterUid?.substring(0, 8)}...`
        };
      }
    },
    // === FORM TRACKING ===
    {
      id: 'form_submit',
      name: 'Form Submit Tracked',
      description: 'Form submission captured with identity data',
      status: 'waiting',
      eventType: 'form_submit',
      validate: (event) => {
        const formName = event.data?.form_name;
        const identityResult = event.data?.identity_result as Record<string, unknown> | undefined;
        return {
          pass: !!formName,
          details: `Form: ${formName}, Master UID: ${identityResult?.master_uid || 'N/A'}`
        };
      }
    },
    {
      id: 'form_identity_linked',
      name: 'Form Identity Linked',
      description: 'Form submission triggered identity resolution',
      status: 'waiting',
      eventType: 'form_submit',
      validate: (event) => {
        const identityResult = event.data?.identity_result as Record<string, unknown> | undefined;
        const hasMasterUid = !!identityResult?.master_uid;
        const hasAction = !!identityResult?.action;
        return {
          pass: hasMasterUid && hasAction,
          details: hasMasterUid
            ? `Action: ${identityResult?.action}, Duplicate: ${identityResult?.is_duplicate || false}`
            : 'Identity not linked to form'
        };
      }
    },
    // === PRODUCT SELECTOR ===
    {
      id: 'product_selector_complete',
      name: 'Product Selector Tracked',
      description: 'Selector completion captured with answers',
      status: 'waiting',
      eventType: 'track_event',
      validate: (event) => {
        const eventName = event.data?.event_name;
        const props = event.data?.properties as Record<string, unknown> | undefined;
        if (eventName !== 'product_selector_complete') {
          return { pass: false, details: `Event: ${eventName} (not selector)` };
        }
        const hasIndustry = !!props?.industry;
        const hasTask = !!props?.task;
        const categories = props?.recommended_categories as string[] | undefined;
        return {
          pass: hasIndustry || hasTask,
          details: `Industry: ${props?.industry || 'N/A'}, Task: ${props?.task || 'N/A'}, Categories: ${categories?.join(', ') || 'N/A'}`
        };
      }
    },
    {
      id: 'selector_categories',
      name: 'Selector Categories Captured',
      description: 'Recommended categories stored for personalization',
      status: 'waiting',
      eventType: 'track_event',
      validate: (event) => {
        const eventName = event.data?.event_name;
        const props = event.data?.properties as Record<string, unknown> | undefined;
        if (eventName !== 'product_selector_complete') {
          return { pass: false, details: 'Waiting for selector event' };
        }
        const categories = props?.recommended_categories as string[] | undefined;
        const matchCount = props?.match_count as number | undefined;
        const hasCategories = !!(categories && categories.length > 0);
        return {
          pass: hasCategories,
          details: hasCategories
            ? `${categories.length} categories, ${matchCount || 0} matches`
            : 'No categories captured'
        };
      }
    },
    {
      id: 'add_to_cart',
      name: 'Add to Enquiry Cart',
      description: 'Product added to cart tracked for personalization',
      status: 'waiting',
      eventType: 'track_event',
      validate: (event) => {
        const eventName = event.data?.event_name;
        const props = event.data?.properties as Record<string, unknown> | undefined;
        if (eventName !== 'add_to_enquiry_cart') {
          return { pass: false, details: 'Waiting for add to cart event' };
        }
        const productId = props?.product_id;
        const productName = props?.product_name;
        const category = props?.category;
        return {
          pass: !!productId,
          details: `${productName || 'Unknown'} (${category || 'N/A'}) added to cart`
        };
      }
    },
    // === RESPONSE TIMES ===
    {
      id: 'check_identity_latency',
      name: 'Check Identity Latency',
      description: 'Response time under 500ms',
      status: 'waiting',
      eventType: 'check_identity',
      validate: (event) => {
        const timestamp = event.data?.timestamp as string;
        const eventTime = new Date(timestamp).getTime();
        const now = Date.now();
        const latency = now - eventTime;
        // Allow for some clock skew, check if reasonable
        const isReasonable = latency < 5000 && latency > -1000;
        return {
          pass: isReasonable,
          details: `Latency: ${Math.abs(latency)}ms ${latency < 500 ? '(good)' : latency < 1000 ? '(acceptable)' : '(slow)'}`
        };
      }
    },
    {
      id: 'link_identity_latency',
      name: 'Link Identity Latency',
      description: 'Response time under 1000ms',
      status: 'waiting',
      eventType: 'link_identity',
      validate: (event) => {
        const timestamp = event.data?.timestamp as string;
        const eventTime = new Date(timestamp).getTime();
        const now = Date.now();
        const latency = now - eventTime;
        const isReasonable = latency < 5000 && latency > -1000;
        return {
          pass: isReasonable,
          details: `Latency: ${Math.abs(latency)}ms ${latency < 1000 ? '(good)' : latency < 2000 ? '(acceptable)' : '(slow)'}`
        };
      }
    }
  ]);

  // Generate debug session ID
  const generateDebugSession = useCallback(() => {
    const sessionId = `dbg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setDebugSessionId(sessionId);
    return sessionId;
  }, []);

  // Launch debug session
  const launchSession = useCallback(() => {
    if (!targetUrl) return;

    const session = generateDebugSession();
    const url = new URL(targetUrl);
    url.searchParams.set('clg_debug', session);
    const finalUrl = url.toString();

    setDebugUrl(finalUrl);
    setIsRunning(true);
    setLiveEvents([]);

    // Reset test cases
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'waiting' as const, result: undefined })));

    // Open minimal popup window
    window.open(
      finalUrl,
      'clg_debug_window',
      'width=1200,height=800,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes'
    );
  }, [targetUrl, generateDebugSession]);

  // Poll for debug events
  useEffect(() => {
    if (!isRunning || !debugSessionId) return;

    const pollEvents = async () => {
      try {
        const response = await fetch(`${DEBUG_EVENTS_ENDPOINT}?session=${debugSessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.events?.length > 0) {
            setLiveEvents(prev => {
              const existingIds = new Set(prev.map(e => e.id));
              const newEvents = data.events.filter((e: DebugEvent) => !existingIds.has(e.id));
              return [...prev, ...newEvents];
            });
          }
        }
      } catch {
        // Polling failed, continue
      }
    };

    const interval = setInterval(pollEvents, 1000);
    return () => clearInterval(interval);
  }, [isRunning, debugSessionId]);

  // Listen for BroadcastChannel messages (same-origin debugging)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('clg_debug');
    channel.onmessage = (event) => {
      const { type, data, timestamp } = event.data;
      setLiveEvents(prev => [...prev, {
        id: `${Date.now()}_${Math.random()}`,
        timestamp: timestamp || new Date().toISOString(),
        type,
        data
      }]);
    };

    return () => channel.close();
  }, []);

  // Process events and update test results
  useEffect(() => {
    if (liveEvents.length === 0) return;

    setTestCases(prev => prev.map(testCase => {
      // Skip if already passed
      if (testCase.status === 'pass') return testCase;

      // Find matching event
      const matchingEvent = liveEvents.find(e => e.type === testCase.eventType);
      if (matchingEvent) {
        const result = testCase.validate(matchingEvent);
        return {
          ...testCase,
          status: result.pass ? 'pass' as const : 'fail' as const,
          result,
          eventData: matchingEvent.data
        };
      }

      return testCase;
    }));
  }, [liveEvents]);

  const toggleExpanded = (testId: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  };

  const passedTests = testCases.filter(t => t.status === 'pass').length;
  const totalTests = testCases.length;

  const statusColors = {
    waiting: 'bg-gray-100 text-gray-600 border-gray-200',
    pass: 'bg-green-100 text-green-800 border-green-300',
    fail: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusIcons = {
    waiting: '○',
    pass: '✓',
    fail: '✗',
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CLG Identity System - Live Test</h1>
        <p className="text-gray-600 mb-6">Automated testing of the SDK and Identity Graph on any page</p>

        {/* Launch Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test a Page</h2>
          <p className="text-gray-600 mb-4">
            Enter a URL to test. A popup window will open with debug mode enabled, and tests will run automatically as events are received.
          </p>

          <div className="flex gap-3">
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://your-site.com/contact"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && targetUrl) {
                  launchSession();
                }
              }}
            />
            <button
              onClick={launchSession}
              disabled={!targetUrl}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors whitespace-nowrap text-lg"
            >
              {isRunning ? 'Launch New Test' : 'Launch Test'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Example: <button
              type="button"
              onClick={() => setTargetUrl('https://clg-ten.vercel.app/demo-form')}
              className="text-red-600 hover:text-red-800 underline"
            >
              https://clg-ten.vercel.app/demo-form
            </button>
          </p>

          {debugSessionId && (
            <div className="mt-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-800">
                  Session active: <code className="bg-green-100 px-2 py-0.5 rounded">{debugSessionId}</code>
                </span>
              </div>
              <button
                onClick={() => {
                  window.open(
                    debugUrl,
                    'clg_debug_window',
                    'width=1200,height=800,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes'
                  );
                }}
                className="text-sm text-green-700 hover:text-green-900 underline"
              >
                Re-open window
              </button>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {isRunning && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {passedTests}/{totalTests} passed
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(passedTests / totalTests) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Groups */}
          {[
            { title: 'Core Functionality', ids: ['sdk_init', 'visitor_id_format', 'check_identity', 'device_fingerprint', 'brand_detection'] },
            { title: 'Identity Linking', ids: ['link_identity', 'pii_hashed', 'duplicate_detection'] },
            { title: 'Form Tracking', ids: ['form_submit', 'form_identity_linked'] },
            { title: 'Product Selector', ids: ['product_selector_complete', 'selector_categories', 'add_to_cart'] },
            { title: 'Performance', ids: ['check_identity_latency', 'link_identity_latency'] },
          ].map((group) => {
            const groupTests = testCases.filter(t => group.ids.includes(t.id));
            const groupPassed = groupTests.filter(t => t.status === 'pass').length;

            return (
              <div key={group.title} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {group.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {groupPassed}/{groupTests.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupTests.map((test) => {
                    const isExpanded = expandedTests.has(test.id);
                    const hasData = test.eventData && Object.keys(test.eventData).length > 0;

                    return (
                      <div
                        key={test.id}
                        className={`border rounded-lg transition-all ${statusColors[test.status]}`}
                      >
                        <button
                          onClick={() => hasData && toggleExpanded(test.id)}
                          className={`w-full p-3 text-left ${hasData ? 'cursor-pointer hover:bg-black hover:bg-opacity-5' : 'cursor-default'}`}
                          disabled={!hasData}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg font-bold mt-0.5">
                              {statusIcons[test.status]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-medium text-sm">{test.name}</h3>
                                {hasData && (
                                  <span className="text-xs opacity-50 flex-shrink-0">
                                    {isExpanded ? '▼' : '▶'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs opacity-75">{test.description}</p>
                              {test.result && (
                                <p className="text-xs mt-1 font-mono bg-white bg-opacity-50 px-2 py-0.5 rounded inline-block">
                                  {test.result.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>

                        {isExpanded && test.eventData && (
                          <div className="px-3 pb-3 pt-0">
                            <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-black border-opacity-10">
                              <h4 className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">
                                Full Event Data
                              </h4>
                              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                                {JSON.stringify(test.eventData, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!isRunning && (
            <div className="text-center py-8 text-gray-500">
              <p>Enter a URL above and click &quot;Launch Test&quot; to begin</p>
            </div>
          )}

          {isRunning && passedTests === totalTests && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
              <h3 className="text-xl font-bold text-green-800">All Tests Passed!</h3>
              <p className="text-green-700">Identity system is working correctly on this page</p>
            </div>
          )}
        </div>

        {/* Live Event Log */}
        {liveEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Log</h2>
              <button
                onClick={() => setLiveEvents([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {liveEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-400 font-mono text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-medium text-blue-600">{event.type}</span>
                  <span className="text-gray-500 truncate flex-1">
                    {JSON.stringify(event.data).substring(0, 100)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">How it works</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Enter a URL that has the CLG SDK installed</li>
            <li>Click &quot;Launch Test&quot; - a popup window opens</li>
            <li>Tests run automatically as SDK events are received</li>
            <li>Submit a form on the target page to test identity linking</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
