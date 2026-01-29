'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';

const IDENTITY_LINK_ENDPOINT = 'https://australia-southeast1-composable-lg.cloudfunctions.net/linkIdentity';
const DEBUG_EVENTS_ENDPOINT = 'https://australia-southeast1-composable-lg.cloudfunctions.net/debugEvents';

interface TestResult {
  status: 'pending' | 'running' | 'pass' | 'fail';
  result?: unknown;
}

interface DebugEvent {
  id: string;
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
}

// CLGVisitor type - uses any to avoid conflicts with other declarations
interface CLGVisitorSDK {
  visitorId?: string;
  sessionId?: string;
  initialized?: boolean;
  getDeviceId?: () => string;
  getBrand?: () => string;
  checkIdentity?: () => Promise<unknown>;
  linkIdentity?: (email: string, phone: string) => Promise<{ master_uid?: string }>;
  trackFormSubmit?: (formName: string, data: Record<string, unknown>) => Promise<unknown>;
  hashPII?: (value: string) => Promise<string>;
}

const getSDK = (): CLGVisitorSDK | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).CLGVisitor;
};

const getDataLayer = (): Array<Record<string, unknown>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).dataLayer;
};

type TabType = 'local' | 'live';

export default function SmokeTestPage() {
  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [visitorInfo, setVisitorInfo] = useState<string>('Loading SDK...');
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({
    test1: { status: 'pending' },
    test2: { status: 'pending' },
    test3: { status: 'pending' },
    test4: { status: 'pending' },
    test5: { status: 'pending' },
    test6: { status: 'pending' },
  });
  const [isRunning, setIsRunning] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [dataLayerEvents, setDataLayerEvents] = useState<Array<Record<string, unknown>>>([]);
  const [summary, setSummary] = useState<{ passed: number; failed: number; total: number } | null>(null);

  // Live debugging state
  const [debugSessionId, setDebugSessionId] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [liveEvents, setLiveEvents] = useState<DebugEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [debugUrl, setDebugUrl] = useState<string>('');

  // Generate debug session ID
  const generateDebugSession = useCallback(() => {
    const sessionId = `dbg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setDebugSessionId(sessionId);
    return sessionId;
  }, []);

  // Generate debug URL for target site
  const generateDebugUrl = useCallback(() => {
    if (!targetUrl) return;

    const session = debugSessionId || generateDebugSession();
    const url = new URL(targetUrl);
    url.searchParams.set('clg_debug', session);
    setDebugUrl(url.toString());
  }, [targetUrl, debugSessionId, generateDebugSession]);

  // Start listening for live events via polling (simpler than WebSocket for now)
  const startListening = useCallback(async () => {
    if (!debugSessionId) {
      generateDebugSession();
    }
    setIsListening(true);
    setLiveEvents([]);
  }, [debugSessionId, generateDebugSession]);

  // Poll for debug events (in production, this would be Firestore real-time)
  useEffect(() => {
    if (!isListening || !debugSessionId) return;

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
  }, [isListening, debugSessionId]);

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

  useEffect(() => {
    // Initialize dataLayer
    const dataLayer = getDataLayer();

    // Capture dataLayer pushes
    const originalPush = dataLayer.push.bind(dataLayer);
    dataLayer.push = function(data: Record<string, unknown>) {
      setDataLayerEvents(prev => [...prev, data]);
      return originalPush(data);
    };

    const checkSDK = () => {
      const sdk = getSDK();
      if (sdk?.visitorId) {
        setVisitorInfo(`
Visitor ID: ${sdk.visitorId}
Session ID: ${sdk.sessionId || 'N/A'}
Device ID: ${sdk.getDeviceId?.() || 'N/A'}
Brand: ${sdk.getBrand?.() || 'N/A'}
        `.trim());
        setSdkReady(true);
      } else {
        setVisitorInfo('Error: SDK not loaded or initialized');
      }
    };

    window.addEventListener('clg:visitor:ready', checkSDK);
    setTimeout(checkSDK, 2000);

    return () => {
      window.removeEventListener('clg:visitor:ready', checkSDK);
    };
  }, []);

  const updateTest = (testId: string, status: TestResult['status'], result?: unknown) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: { status, result }
    }));
  };

  const runTests = async () => {
    setIsRunning(true);
    setSummary(null);
    setDataLayerEvents([]);

    const sdk = getSDK();
    const testEmail = `smoke-test-${Date.now()}@test.com`;
    const testPhone = `0400${Date.now().toString().slice(-6)}`;

    // Test 1: SDK Initialization
    updateTest('test1', 'running');
    if (sdk?.visitorId) {
      updateTest('test1', 'pass', {
        visitor_id: sdk.visitorId,
        session_id: sdk.sessionId,
        initialized: sdk.initialized
      });
    } else {
      updateTest('test1', 'fail', 'SDK not initialized');
    }

    // Test 2: Check Identity
    updateTest('test2', 'running');
    try {
      const checkResult = await sdk?.checkIdentity?.();
      updateTest('test2', 'pass', checkResult);
    } catch (e) {
      updateTest('test2', 'fail', e instanceof Error ? e.message : 'Unknown error');
    }

    // Test 3: Link Identity (New)
    updateTest('test3', 'running');
    try {
      const linkResult = await sdk?.linkIdentity?.(testEmail, testPhone);
      if (linkResult?.master_uid) {
        updateTest('test3', 'pass', linkResult);
      } else {
        updateTest('test3', 'fail', linkResult);
      }
    } catch (e) {
      updateTest('test3', 'fail', e instanceof Error ? e.message : 'Unknown error');
    }

    // Test 4: Link Identity (Duplicate)
    updateTest('test4', 'running');
    try {
      const emailHash = await sdk?.hashPII?.(testEmail);
      const response = await fetch(IDENTITY_LINK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: 'different-visitor-' + Date.now(),
          device_id: 'DV-TEST-DIFFERENT',
          brand: 'smoke-test',
          email_hash: emailHash,
          phone_hash: 'different_phone_hash'
        })
      });
      const dupResult = await response.json();

      if (dupResult.is_duplicate && dupResult.match_sources?.includes('email')) {
        updateTest('test4', 'pass', dupResult);
      } else {
        updateTest('test4', 'fail', dupResult);
      }
    } catch (e) {
      updateTest('test4', 'fail', e instanceof Error ? e.message : 'Unknown error');
    }

    // Test 5: Track Form Submit
    updateTest('test5', 'running');
    try {
      const formResult = await sdk?.trackFormSubmit?.('smoke_test_form', {
        email: testEmail,
        phone: testPhone,
        contactType: 'Smoke Test'
      });
      updateTest('test5', 'pass', formResult);
    } catch (e) {
      updateTest('test5', 'fail', e instanceof Error ? e.message : 'Unknown error');
    }

    // Test 6: DataLayer Events
    updateTest('test6', 'running');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for events

    const identityEvents = dataLayerEvents.filter(e =>
      e.event && (String(e.event).includes('clg_') || String(e.event).includes('visitor'))
    );
    if (identityEvents.length > 0) {
      updateTest('test6', 'pass', {
        events_captured: identityEvents.length,
        events: identityEvents.map(e => e.event)
      });
    } else {
      updateTest('test6', 'fail', 'No identity events in dataLayer');
    }

    // Calculate summary
    const results = Object.values(testResults);
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    setSummary({ passed, failed, total: results.length });

    setIsRunning(false);
  };

  // Recalculate summary when test results change
  useEffect(() => {
    const statuses = Object.values(testResults).map(r => r.status);
    if (statuses.every(s => s === 'pass' || s === 'fail')) {
      const passed = statuses.filter(s => s === 'pass').length;
      const failed = statuses.filter(s => s === 'fail').length;
      setSummary({ passed, failed, total: statuses.length });
    }
  }, [testResults]);

  const tests = [
    { id: 'test1', title: '1. SDK Initialization', description: 'Verify SDK loads and gets a visitor ID from Firebase' },
    { id: 'test2', title: '2. Check Identity (Page Load)', description: 'Verify checkIdentity is called and responds' },
    { id: 'test3', title: '3. Link Identity (New User)', description: 'Create a new identity with email/phone hash' },
    { id: 'test4', title: '4. Link Identity (Duplicate Detection)', description: 'Submit same email hash, verify duplicate is detected' },
    { id: 'test5', title: '5. Track Form Submit', description: 'Test trackFormSubmit with email/phone data' },
    { id: 'test6', title: '6. DataLayer Events', description: 'Verify dataLayer receives identity events' },
  ];

  const statusColors = {
    pending: 'bg-gray-100 text-gray-600',
    running: 'bg-yellow-100 text-yellow-800',
    pass: 'bg-green-100 text-green-800',
    fail: 'bg-red-100 text-red-800',
  };

  const eventTypeColors: Record<string, string> = {
    'sdk_init': 'bg-blue-100 text-blue-800',
    'check_identity': 'bg-purple-100 text-purple-800',
    'link_identity': 'bg-green-100 text-green-800',
    'form_submit': 'bg-orange-100 text-orange-800',
    'dataLayer': 'bg-gray-100 text-gray-800',
  };

  return (
    <>
      <Script src="/clg-visitor.js" strategy="afterInteractive" />

      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CLG Identity System - Smoke Test</h1>
          <p className="text-gray-600 mb-6">Tests the SDK and Cloud Functions end-to-end</p>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('local')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'local'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Local Tests
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'live'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Debug Mode
            </button>
          </div>

          {activeTab === 'local' && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 mb-6 font-mono text-sm">
                <pre className="whitespace-pre-wrap text-blue-900">{visitorInfo}</pre>
              </div>

              <button
                onClick={runTests}
                disabled={!sdkReady || isRunning}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg mb-6 transition-colors"
              >
                {isRunning ? 'Running...' : 'Run All Tests'}
              </button>

              <div className="space-y-4">
                {tests.map(test => {
                  const result = testResults[test.id];
                  return (
                    <div key={test.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[result.status]}`}>
                          {result.status.toUpperCase()}
                        </span>
                        <h3 className="font-semibold text-gray-900">{test.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{test.description}</p>
                      {result.result !== undefined && result.result !== null ? (
                        <pre className="mt-3 bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                          {typeof result.result === 'object'
                            ? JSON.stringify(result.result, null, 2)
                            : String(result.result)}
                        </pre>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {summary && (
                <div className={`mt-6 rounded-lg p-6 text-center ${
                  summary.failed === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <h2 className="text-2xl font-bold mb-2">
                    {summary.failed === 0 ? 'All Tests Passed!' : `${summary.failed} Test(s) Failed`}
                  </h2>
                  <p className="text-gray-700">{summary.passed}/{summary.total} tests passed</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Setup Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Live Debug Setup</h2>
                <p className="text-gray-600 mb-4">
                  Enter a URL to debug. The page will open with a debug parameter, and events will appear here in real-time.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="https://your-site.com/page"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && targetUrl) {
                            // Launch on Enter key
                            const session = debugSessionId || generateDebugSession();
                            const url = new URL(targetUrl);
                            url.searchParams.set('clg_debug', session);
                            const finalUrl = url.toString();
                            setDebugUrl(finalUrl);
                            setIsListening(true);
                            setLiveEvents([]);
                            // Open minimal popup window
                            window.open(
                              finalUrl,
                              'clg_debug_window',
                              'width=1200,height=800,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes'
                            );
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (!targetUrl) return;
                          const session = debugSessionId || generateDebugSession();
                          const url = new URL(targetUrl);
                          url.searchParams.set('clg_debug', session);
                          const finalUrl = url.toString();
                          setDebugUrl(finalUrl);
                          setIsListening(true);
                          setLiveEvents([]);
                          // Open minimal popup window
                          window.open(
                            finalUrl,
                            'clg_debug_window',
                            'width=1200,height=800,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes'
                          );
                        }}
                        disabled={!targetUrl}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Launch Debug Session
                      </button>
                    </div>
                  </div>

                  {debugSessionId && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        <span className="font-medium">Debug Session Active:</span>{' '}
                        <code className="bg-green-100 px-2 py-0.5 rounded">{debugSessionId}</code>
                      </div>
                      {debugUrl && (
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
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Events Feed */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Live Events</h2>
                  {isListening && (
                    <span className="flex items-center gap-2 text-green-600 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Listening
                    </span>
                  )}
                </div>

                {liveEvents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No events yet</p>
                    <p className="text-sm">Events will appear here when the target page triggers identity actions</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {liveEvents.map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            eventTypeColors[event.type] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {liveEvents.length > 0 && (
                  <button
                    onClick={() => setLiveEvents([])}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Events
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">How it works</h3>
                <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                  <li>Enter the URL of the page you want to test</li>
                  <li>Click &quot;Launch Debug Session&quot; (or press Enter)</li>
                  <li>A popup window opens with the target page</li>
                  <li>Browse the site, submit forms, etc.</li>
                  <li>Watch identity events appear here in real-time</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
