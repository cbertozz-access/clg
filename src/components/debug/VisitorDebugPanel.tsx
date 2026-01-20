"use client";

import { useState, useEffect } from "react";

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

interface CLGVisitorSDK {
  visitorId: string | null;
  profile: VisitorProfile | null;
  initialized: boolean;
  init: () => Promise<VisitorProfile | null>;
  getVisitorId: () => string | null;
  getProfile: () => VisitorProfile | null;
}

declare global {
  interface Window {
    CLGVisitor?: CLGVisitorSDK;
    dataLayer?: Record<string, unknown>[];
  }
}

const VISITOR_COOKIE_KEY = "clg_vid";
const VISITOR_STORAGE_KEY = "clg_visitor";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function VisitorDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [cookieId, setCookieId] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [sdkStatus, setSdkStatus] = useState<"loading" | "ready" | "not-loaded">("loading");
  const [dataLayer, setDataLayer] = useState<Record<string, unknown>[] | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

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
      // Get cookie ID
      const cid = getCookie(VISITOR_COOKIE_KEY);
      setCookieId(cid);

      // Get localStorage ID (SDK stores just the ID string, not JSON)
      const sid = localStorage.getItem(VISITOR_STORAGE_KEY);
      setStorageId(sid);

      // Check for CLGVisitor SDK
      if (window.CLGVisitor) {
        setSdkStatus(window.CLGVisitor.initialized ? "ready" : "loading");
        setVisitorId(window.CLGVisitor.getVisitorId());
        setProfile(window.CLGVisitor.getProfile());
      } else {
        setSdkStatus("not-loaded");
        // Use cookie/storage as fallback
        setVisitorId(cid || sid || null);
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
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[9998] w-80 max-h-[80vh] overflow-y-auto bg-gray-900 text-white text-xs rounded-l-lg shadow-2xl mr-6">
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

          <div className="p-3 space-y-3">
            {/* SDK Status */}
            <div>
              <div className="text-gray-400 mb-1">SDK Status</div>
              <div className={`font-mono px-2 py-1 rounded ${
                sdkStatus === "ready" ? "bg-green-900 text-green-300" :
                sdkStatus === "loading" ? "bg-yellow-900 text-yellow-300" :
                "bg-red-900 text-red-300"
              }`}>
                {sdkStatus === "ready" && "✓ Ready"}
                {sdkStatus === "loading" && "⏳ Loading..."}
                {sdkStatus === "not-loaded" && "✗ SDK not loaded"}
              </div>
              {sdkStatus === "not-loaded" && (
                <p className="text-gray-500 text-[10px] mt-1">
                  Add clg-visitor.js to page or GTM
                </p>
              )}
            </div>

            {/* Visitor ID */}
            <div>
              <div className="text-gray-400 mb-1">Visitor ID</div>
              <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                {displayId}
              </div>
            </div>

            {/* Cookie */}
            <div>
              <div className="text-gray-400 mb-1">Cookie ({VISITOR_COOKIE_KEY})</div>
              <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                {cookieId || "Not set"}
              </div>
            </div>

            {/* LocalStorage */}
            <div>
              <div className="text-gray-400 mb-1">LocalStorage ({VISITOR_STORAGE_KEY})</div>
              <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                {storageId || "Not set"}
              </div>
            </div>

            {/* Profile Data (from SDK) */}
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
                    <div className="text-gray-400 mb-1">Visits</div>
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

            {/* DataLayer */}
            {dataLayer && dataLayer.length > 0 && (
              <div>
                <div className="text-gray-400 mb-1">DataLayer ({dataLayer.length} items)</div>
                <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-32 overflow-y-auto">
                  {JSON.stringify(dataLayer.slice(-5), null, 2)}
                </pre>
                <p className="text-gray-500 text-[10px] mt-1">Showing last 5 entries</p>
              </div>
            )}

            {/* URL Params */}
            <div>
              <div className="text-gray-400 mb-1">URL Params</div>
              <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-24 overflow-y-auto">
                {typeof window !== "undefined"
                  ? JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)
                  : "{}"}
              </pre>
            </div>

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
                  document.cookie = `${VISITOR_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                  setVisitorId(null);
                  setCookieId(null);
                  setStorageId(null);
                  setProfile(null);
                }}
                className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
              >
                Clear Visitor Data
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
