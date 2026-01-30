"use client";

import { useState, useEffect, useRef } from "react";

interface VisitorProfile {
  visitor_id?: string;
  lead_score?: number;
  segments?: string[];
  visits?: number;
  first_visit?: string;
  last_visit?: string;
  dataLayer?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SessionData {
  session_id: string;
  started_at: string;
  last_activity: string;
  landing_page: string;
  landing_path: string;
  referrer: string | null;
  referrer_domain: string | null;
  utm: Record<string, string>;
  page_views: number;
  pages_visited: string[];
  events: Array<{ event: string; timestamp: string }>;
}

interface Attribution {
  visitor_id: string | null;
  session_id: string | null;
  first_touch: Record<string, string> | null;
  last_touch: Record<string, string> | null;
  landing_page: string | null;
  referrer: string | null;
  pages_visited: string[];
  session_page_views: number;
}

interface CLGVisitorSDK {
  visitorId: string | null;
  sessionId: string | null;
  profile: VisitorProfile | null;
  session: SessionData | null;
  initialized: boolean;
  init: () => Promise<VisitorProfile | null>;
  getVisitorId: () => string | null;
  getSessionId: () => string | null;
  getProfile: () => VisitorProfile | null;
  getSession: () => SessionData | null;
  getAttribution: () => Attribution;
  getFirstTouchUtm: () => Record<string, string> | null;
  getLastTouchUtm: () => Record<string, string> | null;
}

// Use module augmentation to extend Window without conflict
declare const window: Window & {
  CLGVisitor?: CLGVisitorSDK;
  dataLayer?: Record<string, unknown>[];
};

const VISITOR_COOKIE_KEY = "clg_vid";
const SESSION_COOKIE_KEY = "clg_sid";
const VISITOR_STORAGE_KEY = "clg_visitor";
const SESSION_STORAGE_KEY = "clg_session";
const UTM_STORAGE_KEY = "clg_utm";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Safe JSON stringify that handles circular references and functions
function safeStringify(obj: unknown, indent = 2): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_key, value) => {
      // Handle functions
      if (typeof value === "function") {
        return "[Function]";
      }
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    },
    indent
  );
}

export function VisitorDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cookieId, setCookieId] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [firstTouchUtm, setFirstTouchUtm] = useState<Record<string, string> | null>(null);
  const [sdkStatus, setSdkStatus] = useState<"loading" | "ready" | "not-loaded">("loading");
  const [dataLayer, setDataLayer] = useState<Record<string, unknown>[] | null>(null);
  const [shouldShow, setShouldShow] = useState(false);
  const [activeTab, setActiveTab] = useState<"visitor" | "session" | "events" | "utm" | "datalayer">("visitor");

  // Track if we've ever achieved "ready" status to prevent regression
  const hasBeenReadyRef = useRef(false);

  // Check if should show panel
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShouldShow(urlParams.get("debug") === "true" || process.env.NODE_ENV === "development");
  }, []);

  // Fetch visitor data directly from API as fallback
  const fetchVisitorDirect = async () => {
    try {
      const existingId = getCookie(VISITOR_COOKIE_KEY) || localStorage.getItem(VISITOR_STORAGE_KEY);
      const params = new URLSearchParams();
      if (existingId) params.set("vid", existingId);
      params.set("source", "debug-panel");

      const response = await fetch(
        `https://australia-southeast1-composable-lg.cloudfunctions.net/visitorId?${params}`,
        { method: "GET" } // No credentials to avoid CORS issue
      );

      if (response.ok) {
        const data = await response.json();
        setVisitorId(data.visitor_id);
        setProfile(data);
        setSdkStatus("ready");
        hasBeenReadyRef.current = true;

        // Store locally
        if (data.visitor_id) {
          localStorage.setItem(VISITOR_STORAGE_KEY, data.visitor_id);
          document.cookie = `${VISITOR_COOKIE_KEY}=${data.visitor_id}; path=/; max-age=31536000; SameSite=Lax`;
          setStorageId(data.visitor_id);
          setCookieId(data.visitor_id);
        }
      }
    } catch (err) {
      console.error("[Debug] Direct fetch failed:", err);
    }
  };

  // Load visitor data
  useEffect(() => {
    if (!shouldShow) return;

    const loadData = () => {
      // Get cookie IDs
      const cid = getCookie(VISITOR_COOKIE_KEY);
      setCookieId(cid);
      const sidCookie = getCookie(SESSION_COOKIE_KEY);

      // Get localStorage ID (SDK stores just the ID string, not JSON)
      const vid = localStorage.getItem(VISITOR_STORAGE_KEY);
      setStorageId(vid);

      // Get session data from sessionStorage
      try {
        const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionData) {
          setSession(JSON.parse(sessionData));
        }
      } catch (e) {
        // sessionStorage not available
      }

      // Get first-touch UTM from localStorage
      try {
        const utmData = localStorage.getItem(UTM_STORAGE_KEY);
        if (utmData) {
          setFirstTouchUtm(JSON.parse(utmData));
        }
      } catch (e) {
        // localStorage not available
      }

      // Check for CLGVisitor SDK - but never regress from "ready" to "loading"
      if (window.CLGVisitor) {
        const sdkInitialized = window.CLGVisitor.initialized;
        const sdkProfile = window.CLGVisitor.getProfile();
        const sdkSession = window.CLGVisitor.getSession?.();

        // Only update status if SDK has better data, or we don't have data yet
        if (sdkInitialized && sdkProfile) {
          setSdkStatus("ready");
          hasBeenReadyRef.current = true;
          setVisitorId(window.CLGVisitor.getVisitorId());
          setSessionId(window.CLGVisitor.getSessionId?.() || sidCookie || null);
          setProfile(sdkProfile);
          if (sdkSession) setSession(sdkSession);
          if (window.CLGVisitor.getFirstTouchUtm) {
            setFirstTouchUtm(window.CLGVisitor.getFirstTouchUtm());
          }
        } else if (!hasBeenReadyRef.current) {
          // Only set loading if we haven't already achieved ready status
          setSdkStatus(sdkInitialized ? "ready" : "loading");
          if (sdkInitialized) hasBeenReadyRef.current = true;
          setVisitorId(window.CLGVisitor.getVisitorId() || cid || vid || null);
          setSessionId(sidCookie || null);
        }
      } else if (!hasBeenReadyRef.current) {
        setSdkStatus("not-loaded");
        // Use cookie/storage as fallback
        setVisitorId(cid || vid || null);
        setSessionId(sidCookie || null);
      }

      // Get dataLayer
      if (window.dataLayer) {
        setDataLayer(window.dataLayer);
      }
    };

    // Initial load
    loadData();

    // If no visitor data after 2 seconds, try direct fetch
    const fallbackTimeout = setTimeout(() => {
      if (!visitorId && !cookieId && !storageId) {
        fetchVisitorDirect();
      }
    }, 2000);

    // Listen for SDK ready event
    const handleVisitorReady = (e: CustomEvent) => {
      setSdkStatus("ready");
      hasBeenReadyRef.current = true;
      setVisitorId(e.detail?.visitor_id);
      setProfile(e.detail);
      loadData();
    };

    window.addEventListener("clg:visitor:ready", handleVisitorReady as EventListener);

    // Poll for updates (SDK might initialize after this component)
    const interval = setInterval(loadData, 2000);

    return () => {
      window.removeEventListener("clg:visitor:ready", handleVisitorReady as EventListener);
      clearInterval(interval);
      clearTimeout(fallbackTimeout);
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  const displayId = visitorId || cookieId || storageId || "Not set";

  return (
    <>
      {/* Floating Tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] bg-gray-900 text-white text-xs px-1 py-3 rounded-l-md shadow-lg hover:bg-gray-800 transition-colors"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        {isOpen ? "Close" : "Debug"}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[9998] w-96 max-h-[80vh] overflow-y-auto bg-gray-900 text-white text-xs rounded-l-lg shadow-2xl mr-6">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-sm">Visitor Debug</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* SDK Status Bar */}
          <div className="px-3 py-2 border-b border-gray-700">
            <div className={`font-mono px-2 py-1 rounded text-center ${
              sdkStatus === "ready" ? "bg-green-900 text-green-300" :
              sdkStatus === "loading" ? "bg-yellow-900 text-yellow-300" :
              "bg-red-900 text-red-300"
            }`}>
              {sdkStatus === "ready" && "✓ SDK Ready"}
              {sdkStatus === "loading" && "⏳ Loading..."}
              {sdkStatus === "not-loaded" && "✗ SDK not loaded"}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {(["visitor", "session", "events", "utm", "datalayer"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-2 py-2 text-xs font-medium capitalize ${
                  activeTab === tab
                    ? "bg-gray-800 text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-3 space-y-3">
            {/* Visitor Tab */}
            {activeTab === "visitor" && (
              <>
                <div>
                  <div className="text-gray-400 mb-1">Visitor ID</div>
                  <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                    {displayId}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">Cookie ({VISITOR_COOKIE_KEY})</div>
                  <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                    {cookieId || "Not set"}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 mb-1">LocalStorage</div>
                  <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                    {storageId || "Not set"}
                  </div>
                </div>

                {profile && (
                  <>
                    {profile.lead_score !== undefined && (
                      <div>
                        <div className="text-gray-400 mb-1">Lead Score</div>
                        <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {profile.lead_score}
                        </div>
                      </div>
                    )}

                    {profile.segments && profile.segments.length > 0 && (
                      <div>
                        <div className="text-gray-400 mb-1">Segments</div>
                        <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {profile.segments.join(", ")}
                        </div>
                      </div>
                    )}

                    {profile.visits !== undefined && (
                      <div>
                        <div className="text-gray-400 mb-1">Total Visits</div>
                        <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {profile.visits}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-gray-400 mb-1">Full Profile</div>
                      <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-32 overflow-y-auto">
                        {JSON.stringify(profile, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Session Tab */}
            {activeTab === "session" && (
              <>
                <div>
                  <div className="text-gray-400 mb-1">Session ID</div>
                  <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                    {sessionId || session?.session_id || "Not set"}
                  </div>
                </div>

                {session && (
                  <>
                    <div>
                      <div className="text-gray-400 mb-1">Landing Page</div>
                      <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all text-[10px]">
                        {session.landing_page || "Not set"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 mb-1">Referrer</div>
                      <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all text-[10px]">
                        {session.referrer || "Direct"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-gray-400 mb-1">Page Views</div>
                        <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {session.page_views}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Pages Visited</div>
                        <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {session.pages_visited?.length || 0}
                        </div>
                      </div>
                    </div>

                    {session.pages_visited && session.pages_visited.length > 0 && (
                      <div>
                        <div className="text-gray-400 mb-1">Pages</div>
                        <div className="font-mono bg-gray-800 px-2 py-1 rounded text-[10px] max-h-20 overflow-y-auto">
                          {session.pages_visited.map((p, i) => (
                            <div key={i}>{p}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-gray-400 mb-1">Session Started</div>
                      <div className="font-mono bg-gray-800 px-2 py-1 rounded text-[10px]">
                        {session.started_at ? new Date(session.started_at).toLocaleString() : "Unknown"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 mb-1">Full Session Data</div>
                      <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-32 overflow-y-auto">
                        {JSON.stringify(session, null, 2)}
                      </pre>
                    </div>
                  </>
                )}

                {!session && (
                  <div className="text-gray-500 text-center py-4">No session data available</div>
                )}
              </>
            )}

            {/* UTM Tab */}
            {activeTab === "utm" && (
              <>
                <div>
                  <div className="text-gray-400 mb-1 font-semibold">First Touch (Stored)</div>
                  {firstTouchUtm ? (
                    <div className="space-y-1">
                      {Object.entries(firstTouchUtm).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-500">{key}:</span>
                          <span className="font-mono bg-gray-800 px-2 rounded">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No first-touch UTM stored</div>
                  )}
                </div>

                <div>
                  <div className="text-gray-400 mb-1 font-semibold">Last Touch (Session)</div>
                  {session?.utm && Object.keys(session.utm).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(session.utm).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-500">{key}:</span>
                          <span className="font-mono bg-gray-800 px-2 rounded">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No session UTM parameters</div>
                  )}
                </div>

                <div>
                  <div className="text-gray-400 mb-1 font-semibold">Current URL Params</div>
                  <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-24 overflow-y-auto">
                    {typeof window !== "undefined"
                      ? JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)
                      : "{}"}
                  </pre>
                </div>
              </>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <>
                <div className="text-gray-400 mb-2 font-semibold">Tracked Events</div>
                {session?.events && session.events.length > 0 ? (
                  <div className="space-y-2">
                    {session.events.slice().reverse().map((evt, i) => (
                      <div key={i} className="bg-gray-800 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-blue-400">{evt.event}</span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-[10px] text-gray-300 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries(evt).filter(([k]) => k !== 'event' && k !== 'timestamp')
                            ),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">No events tracked yet</div>
                )}
                <p className="text-[10px] text-gray-500 mt-2">
                  Events are stored in session and sent to Firebase
                </p>
              </>
            )}

            {/* DataLayer Tab */}
            {activeTab === "datalayer" && (
              <>
                {dataLayer && dataLayer.length > 0 ? (
                  <>
                    <div className="text-gray-400 mb-1">DataLayer ({dataLayer.length} items)</div>
                    <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-64 overflow-y-auto">
                      {safeStringify(dataLayer.slice(-10))}
                    </pre>
                    <p className="text-gray-500 text-[10px]">Showing last 10 entries</p>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-4">No dataLayer entries</div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-700 space-y-2">
              <button
                onClick={fetchVisitorDirect}
                className="w-full px-2 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white text-xs font-medium transition-colors"
              >
                Fetch Visitor Data
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(VISITOR_STORAGE_KEY);
                  localStorage.removeItem(UTM_STORAGE_KEY);
                  sessionStorage.removeItem(SESSION_STORAGE_KEY);
                  document.cookie = `${VISITOR_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                  document.cookie = `${SESSION_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                  setVisitorId(null);
                  setSessionId(null);
                  setCookieId(null);
                  setStorageId(null);
                  setProfile(null);
                  setSession(null);
                  setFirstTouchUtm(null);
                }}
                className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
              >
                Clear All Data
              </button>
              <button
                onClick={() => {
                  if (window.CLGVisitor) {
                    window.CLGVisitor.init?.();
                  }
                }}
                className="w-full px-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-medium transition-colors"
              >
                Re-init SDK
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-medium transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VisitorDebugPanel;
