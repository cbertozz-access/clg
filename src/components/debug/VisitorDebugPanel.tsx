"use client";

import { useState, useEffect } from "react";

interface VisitorData {
  id?: string;
  visitorId?: string;
  visits?: number;
  firstVisit?: string;
  lastVisit?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  [key: string]: unknown;
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
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [cookieId, setCookieId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run in development or when debug param is present
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get("debug") === "true" || process.env.NODE_ENV === "development";

    if (!isDebug) return;

    try {
      // Get cookie ID
      const cid = getCookie(VISITOR_COOKIE_KEY);
      setCookieId(cid);

      // Get localStorage data
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setVisitorData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read visitor data");
    }
  }, []);

  // Only show in development or with ?debug=true
  const [shouldShow, setShouldShow] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShouldShow(urlParams.get("debug") === "true" || process.env.NODE_ENV === "development");
  }, []);

  if (!shouldShow) return null;

  const visitorId = visitorData?.id || visitorData?.visitorId || cookieId || "Not set";

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
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[9998] w-72 max-h-[80vh] overflow-y-auto bg-gray-900 text-white text-xs rounded-l-lg shadow-2xl mr-6">
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
            {error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <>
                {/* Visitor ID */}
                <div>
                  <div className="text-gray-400 mb-1">Visitor ID</div>
                  <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                    {visitorId}
                  </div>
                </div>

                {/* Cookie ID */}
                <div>
                  <div className="text-gray-400 mb-1">Cookie ({VISITOR_COOKIE_KEY})</div>
                  <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                    {cookieId || "Not set"}
                  </div>
                </div>

                {/* Visit Count */}
                {visitorData?.visits !== undefined && (
                  <div>
                    <div className="text-gray-400 mb-1">Visits</div>
                    <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                      {visitorData.visits}
                    </div>
                  </div>
                )}

                {/* First Visit */}
                {visitorData?.firstVisit && (
                  <div>
                    <div className="text-gray-400 mb-1">First Visit</div>
                    <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                      {new Date(visitorData.firstVisit).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Last Visit */}
                {visitorData?.lastVisit && (
                  <div>
                    <div className="text-gray-400 mb-1">Last Visit</div>
                    <div className="font-mono bg-gray-800 px-2 py-1 rounded">
                      {new Date(visitorData.lastVisit).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* UTM Params */}
                {(visitorData?.utmSource || visitorData?.utmMedium || visitorData?.utmCampaign) && (
                  <div>
                    <div className="text-gray-400 mb-1">UTM Params</div>
                    <div className="font-mono bg-gray-800 px-2 py-1 rounded space-y-1">
                      {visitorData.utmSource && <div>source: {visitorData.utmSource}</div>}
                      {visitorData.utmMedium && <div>medium: {visitorData.utmMedium}</div>}
                      {visitorData.utmCampaign && <div>campaign: {visitorData.utmCampaign}</div>}
                    </div>
                  </div>
                )}

                {/* Referrer */}
                {visitorData?.referrer && (
                  <div>
                    <div className="text-gray-400 mb-1">Referrer</div>
                    <div className="font-mono bg-gray-800 px-2 py-1 rounded break-all">
                      {visitorData.referrer}
                    </div>
                  </div>
                )}

                {/* Raw Data */}
                <div>
                  <div className="text-gray-400 mb-1">Raw localStorage</div>
                  <pre className="font-mono bg-gray-800 px-2 py-1 rounded overflow-x-auto text-[10px] max-h-32 overflow-y-auto">
                    {visitorData ? JSON.stringify(visitorData, null, 2) : "No data"}
                  </pre>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-gray-700 space-y-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem(VISITOR_STORAGE_KEY);
                      document.cookie = `${VISITOR_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                      setVisitorData(null);
                      setCookieId(null);
                    }}
                    className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-medium transition-colors"
                  >
                    Clear Visitor Data
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-medium transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default VisitorDebugPanel;
