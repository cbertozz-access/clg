/**
 * CLG Visitor ID SDK
 * Embeddable script for Builder.io sites
 *
 * Tracks:
 * - Visitor ID (persistent across sessions)
 * - Session ID (per browser session)
 * - UTM parameters (source, medium, campaign, term, content)
 * - Referrer and landing page
 * - Page views per session
 *
 * Integrations:
 * - Firebase Cloud Function (visitor profiles)
 * - Server-side GTM container (analytics)
 * - Client-side dataLayer (GTM)
 *
 * Usage:
 * <script src="https://clg-ten.vercel.app/clg-visitor.js" async></script>
 *
 * Or with GTM custom HTML tag
 */
(function(window, document) {
  'use strict';

  // Firebase endpoint for visitor profiles
  const FIREBASE_ENDPOINT = 'https://australia-southeast1-composable-lg.cloudfunctions.net/visitorId';

  // Server-side GTM endpoint (GCP App Engine)
  const SGTM_ENDPOINT = 'https://composable-lg.ts.r.appspot.com';
  const SGTM_PATH = '/clg/collect'; // Custom client path

  const COOKIE_NAME = 'clg_vid';
  const SESSION_COOKIE_NAME = 'clg_sid';
  const STORAGE_KEY = 'clg_visitor';
  const SESSION_STORAGE_KEY = 'clg_session';
  const UTM_STORAGE_KEY = 'clg_utm';

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  // Site identifier for GTM filtering - prevents CLG events from firing other tags
  const SITE_ID = 'clg_dev';

  // Push site identifier immediately so GTM can filter from the start
  window.dataLayer.push({
    'clg_site': true,
    'site_id': SITE_ID
  });

  const CLGVisitor = {
    visitorId: null,
    sessionId: null,
    profile: null,
    session: null,
    initialized: false,
    sgtmEnabled: true, // Enable/disable server-side GTM

    /**
     * Generate a unique ID
     */
    generateId(prefix = '') {
      return prefix + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    /**
     * Hash a string using SHA-256 (for PII protection)
     * Returns hex string, or null if input is empty
     */
    async hashPII(value) {
      if (!value || typeof value !== 'string') return null;

      // Normalize: lowercase and trim
      const normalized = value.toLowerCase().trim();
      if (!normalized) return null;

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(normalized);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        // Fallback for older browsers - simple hash
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
          const char = normalized.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return 'fallback_' + Math.abs(hash).toString(16);
      }
    },

    /**
     * Hash multiple PII fields, returns object with hashed values
     */
    async hashPIIFields(fields) {
      const result = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value) {
          result[key + '_hash'] = await this.hashPII(value);
        }
      }
      return result;
    },

    /**
     * Send event to Server-side GTM container
     * Uses sendBeacon for reliability, falls back to fetch
     * PII fields are automatically hashed before sending
     */
    async sendToSGTM(eventName, eventData = {}) {
      if (!this.sgtmEnabled) return;

      // Extract and hash any PII fields
      const piiFields = {
        email: eventData.email,
        phone: eventData.phone,
        name: eventData.name,
        company: eventData.company
      };

      // Remove raw PII from eventData
      const sanitizedEventData = { ...eventData };
      delete sanitizedEventData.email;
      delete sanitizedEventData.phone;
      delete sanitizedEventData.name;
      delete sanitizedEventData.company;
      delete sanitizedEventData.form_data; // Don't send raw form data

      // Hash PII fields
      const hashedPII = await this.hashPIIFields(piiFields);

      const payload = {
        event_name: eventName,
        client_id: this.visitorId,
        session_id: this.sessionId,
        timestamp: Date.now(),
        // Page context
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
        page_referrer: document.referrer,
        // Screen info
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        // User agent
        user_agent: navigator.userAgent,
        language: navigator.language,
        // Session context
        session_landing_page: this.session?.landing_page,
        session_referrer: this.session?.referrer,
        session_page_views: this.session?.page_views,
        is_new_session: this.session?.page_views === 1,
        // UTM parameters (last touch)
        utm_source: this.session?.utm?.utm_source,
        utm_medium: this.session?.utm?.utm_medium,
        utm_campaign: this.session?.utm?.utm_campaign,
        utm_term: this.session?.utm?.utm_term,
        utm_content: this.session?.utm?.utm_content,
        // First touch attribution
        first_touch_source: this.getFirstTouchUtm()?.utm_source,
        first_touch_medium: this.getFirstTouchUtm()?.utm_medium,
        first_touch_campaign: this.getFirstTouchUtm()?.utm_campaign,
        // Visitor profile
        lead_score: this.profile?.lead_score,
        segments: this.profile?.segments,
        total_visits: this.profile?.visits,
        // Hashed PII (safe to store)
        ...hashedPII,
        // Custom event data (sanitized)
        ...sanitizedEventData
      };

      const url = SGTM_ENDPOINT + SGTM_PATH;

      // Try sendBeacon first (works during page unload)
      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          const sent = navigator.sendBeacon(url, blob);
          if (sent) {
            console.log('[CLG] sGTM event sent via beacon:', eventName);
            return;
          }
        } catch (e) {
          // Fall through to fetch
        }
      }

      // Fall back to fetch
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true // Allows request to outlive page
      }).then(() => {
        console.log('[CLG] sGTM event sent via fetch:', eventName);
      }).catch(err => {
        console.warn('[CLG] sGTM send failed:', err);
      });
    },

    /**
     * Get cookie value
     */
    getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    },

    /**
     * Set cookie
     */
    setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax; Secure`;
    },

    /**
     * Set session cookie (expires when browser closes)
     */
    setSessionCookie(name, value) {
      document.cookie = `${name}=${value}; path=/; SameSite=Lax; Secure`;
    },

    /**
     * Get all UTM parameters from URL
     */
    getUtmParams() {
      const params = new URLSearchParams(window.location.search);
      const utm = {};

      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      utmKeys.forEach(key => {
        const value = params.get(key);
        if (value) {
          utm[key] = value;
        }
      });

      // Also check for common aliases
      if (!utm.utm_source && params.get('source')) {
        utm.utm_source = params.get('source');
      }
      if (!utm.utm_medium && params.get('medium')) {
        utm.utm_medium = params.get('medium');
      }

      return utm;
    },

    /**
     * Get or create session
     */
    getOrCreateSession() {
      // Check for existing session cookie
      let sessionId = this.getCookie(SESSION_COOKIE_NAME);
      let session = null;

      // Try to get session data from sessionStorage
      try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          session = JSON.parse(stored);
        }
      } catch (e) {
        // sessionStorage not available
      }

      const now = new Date().toISOString();
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;

      // If no session or session expired (30 min inactivity), create new one
      if (!sessionId || !session) {
        sessionId = this.generateId('ses_');

        // Capture UTMs on session start (first touch attribution)
        const utmParams = this.getUtmParams();

        // Store UTMs persistently if this is the first visit with UTMs
        if (Object.keys(utmParams).length > 0) {
          try {
            // Check if we already have stored UTMs (first touch)
            const existingUtm = localStorage.getItem(UTM_STORAGE_KEY);
            if (!existingUtm) {
              localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({
                ...utmParams,
                captured_at: now
              }));
            }
          } catch (e) {
            // localStorage not available
          }
        }

        session = {
          session_id: sessionId,
          started_at: now,
          last_activity: now,
          landing_page: currentUrl,
          landing_path: currentPath,
          referrer: document.referrer || null,
          referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
          utm: utmParams,
          page_views: 1,
          pages_visited: [currentPath],
          events: []
        };

        this.setSessionCookie(SESSION_COOKIE_NAME, sessionId);
      } else {
        // Update existing session
        session.last_activity = now;
        session.page_views = (session.page_views || 0) + 1;

        // Track unique pages visited
        if (!session.pages_visited) {
          session.pages_visited = [];
        }
        if (!session.pages_visited.includes(currentPath)) {
          session.pages_visited.push(currentPath);
        }
      }

      // Save session to sessionStorage
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        // sessionStorage not available
      }

      this.sessionId = sessionId;
      this.session = session;

      return session;
    },

    /**
     * Get first-touch UTM parameters (stored from first visit)
     */
    getFirstTouchUtm() {
      try {
        const stored = localStorage.getItem(UTM_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        // localStorage not available
      }
      return null;
    },

    /**
     * Get last-touch UTM parameters (current session)
     */
    getLastTouchUtm() {
      return this.session?.utm || this.getUtmParams();
    },

    /**
     * Initialize the visitor tracking
     */
    async init() {
      if (this.initialized) return this.profile;

      try {
        // Get or create session first
        const session = this.getOrCreateSession();

        // Try to get existing visitor ID from cookie or localStorage
        const existingId = this.getCookie(COOKIE_NAME) ||
                          localStorage.getItem(STORAGE_KEY);

        // Get first-touch and last-touch UTMs
        const firstTouchUtm = this.getFirstTouchUtm();
        const lastTouchUtm = this.getLastTouchUtm();

        // Build request URL with all tracking data
        const params = new URLSearchParams();

        if (existingId) {
          params.set('vid', existingId);
        }

        // Session data
        params.set('session_id', session.session_id);
        params.set('is_new_session', session.page_views === 1 ? 'true' : 'false');

        // Referrer
        if (session.referrer) {
          params.set('referrer', session.referrer);
        }
        if (session.referrer_domain) {
          params.set('referrer_domain', session.referrer_domain);
        }

        // Landing page
        if (session.landing_page) {
          params.set('landing_page', session.landing_page);
        }

        // Current page
        params.set('page_url', window.location.href);
        params.set('page_path', window.location.pathname);
        params.set('page_title', document.title || '');

        // UTM parameters - last touch (current session)
        if (lastTouchUtm) {
          Object.entries(lastTouchUtm).forEach(([key, value]) => {
            if (value && key !== 'captured_at') {
              params.set(key, value);
            }
          });
        }

        // First touch UTMs (for attribution)
        if (firstTouchUtm && firstTouchUtm.utm_source) {
          params.set('first_touch_source', firstTouchUtm.utm_source);
          if (firstTouchUtm.utm_medium) {
            params.set('first_touch_medium', firstTouchUtm.utm_medium);
          }
          if (firstTouchUtm.utm_campaign) {
            params.set('first_touch_campaign', firstTouchUtm.utm_campaign);
          }
        }

        // Source determination (for backwards compatibility)
        const source = lastTouchUtm?.utm_source ||
                      (session.referrer ? 'referral' : 'direct');
        params.set('source', source);

        // Fetch visitor profile
        const url = FIREBASE_ENDPOINT + '?' + params.toString();
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to get visitor profile');
        }

        const data = await response.json();

        this.visitorId = data.visitor_id;
        this.profile = data;
        this.initialized = true;

        // Store locally for persistence
        localStorage.setItem(STORAGE_KEY, this.visitorId);
        this.setCookie(COOKIE_NAME, this.visitorId, 365);

        // Build comprehensive dataLayer push
        const dataLayerData = {
          event: 'clg_visitor_ready',
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          is_new_visitor: !existingId,
          is_new_session: session.page_views === 1,
          // Visitor profile
          lead_score: data.lead_score,
          segments: data.segments,
          total_visits: data.visits,
          // Session data
          session_page_views: session.page_views,
          session_landing_page: session.landing_page,
          session_referrer: session.referrer,
          // UTM - Last touch
          utm_source: lastTouchUtm?.utm_source,
          utm_medium: lastTouchUtm?.utm_medium,
          utm_campaign: lastTouchUtm?.utm_campaign,
          utm_term: lastTouchUtm?.utm_term,
          utm_content: lastTouchUtm?.utm_content,
          // UTM - First touch
          first_touch_source: firstTouchUtm?.utm_source,
          first_touch_medium: firstTouchUtm?.utm_medium,
          first_touch_campaign: firstTouchUtm?.utm_campaign,
          // Merge any dataLayer from server
          ...(data.dataLayer || {})
        };

        // Push to GTM dataLayer
        window.dataLayer.push(dataLayerData);

        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('clg:visitor:ready', {
          detail: {
            ...data,
            session: session,
            dataLayer: dataLayerData
          }
        }));

        console.log('[CLG] Visitor initialized:', this.visitorId, 'Session:', this.sessionId);

        // Send to server-side GTM
        this.sendToSGTM(session.page_views === 1 ? 'session_start' : 'page_view', {
          is_new_visitor: !existingId
        });

        return data;

      } catch (error) {
        console.error('[CLG] Visitor init error:', error);
        // Fallback: generate local ID
        this.visitorId = this.generateId('clg_');
        this.sessionId = this.session?.session_id || this.generateId('ses_');
        localStorage.setItem(STORAGE_KEY, this.visitorId);

        // Still push to dataLayer on error
        window.dataLayer.push({
          event: 'clg_visitor_ready',
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          is_new_visitor: true,
          error: true
        });

        return { visitor_id: this.visitorId, session_id: this.sessionId, error: true };
      }
    },

    /**
     * Track a page view (called automatically on init, can be called manually for SPAs)
     */
    async trackPageView(customData = {}) {
      if (!this.visitorId) {
        await this.init();
        return; // init already tracks the page view
      }

      // Update session
      const session = this.getOrCreateSession();

      const pageViewData = {
        event: 'page_view',
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        page_url: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
        session_page_views: session.page_views,
        ...customData
      };

      window.dataLayer.push(pageViewData);

      // Send to server-side GTM
      this.sendToSGTM('page_view', customData);

      // Send to Firebase
      return this.track('page_view', pageViewData);
    },

    /**
     * Track an event
     */
    async track(event, properties = {}) {
      if (!this.visitorId) {
        await this.init();
      }

      // Add event to session
      if (this.session) {
        if (!this.session.events) {
          this.session.events = [];
        }
        this.session.events.push({
          event,
          timestamp: new Date().toISOString(),
          ...properties
        });

        // Update sessionStorage
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
        } catch (e) {
          // sessionStorage not available
        }
      }

      try {
        const response = await fetch(FIREBASE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitor_id: this.visitorId,
            session_id: this.sessionId,
            event,
            properties,
            page_url: window.location.href,
            page_path: window.location.pathname,
            timestamp: new Date().toISOString()
          })
        });

        const data = await response.json();

        // Update local profile
        if (data.lead_score) {
          this.profile.lead_score = data.lead_score;
        }
        if (data.segments) {
          this.profile.segments = data.segments;
        }

        // Push update to dataLayer
        if (data.dataLayer) {
          window.dataLayer.push(data.dataLayer);
        }

        console.log('[CLG] Event tracked:', event);
        return data;

      } catch (error) {
        console.error('[CLG] Track error:', error);
        // Push to dataLayer anyway for GTM
        window.dataLayer.push({
          event: event,
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          ...properties
        });
      }
    },

    /**
     * Track form submission with full context
     */
    async trackFormSubmit(formName, formData = {}) {
      const firstTouchUtm = this.getFirstTouchUtm();
      const lastTouchUtm = this.getLastTouchUtm();

      const formEventData = {
        form_name: formName,
        form_data: formData,
        // Attribution data
        first_touch_source: firstTouchUtm?.utm_source,
        first_touch_medium: firstTouchUtm?.utm_medium,
        first_touch_campaign: firstTouchUtm?.utm_campaign,
        last_touch_source: lastTouchUtm?.utm_source,
        last_touch_medium: lastTouchUtm?.utm_medium,
        last_touch_campaign: lastTouchUtm?.utm_campaign,
        // Session context
        session_landing_page: this.session?.landing_page,
        session_referrer: this.session?.referrer,
        session_page_views: this.session?.page_views,
        pages_visited: this.session?.pages_visited
      };

      // Send to server-side GTM
      this.sendToSGTM('form_submit', formEventData);

      return this.track('form_submit', {
        form_name: formName,
        form_data: formData,
        // Attribution data
        first_touch_source: firstTouchUtm?.utm_source,
        first_touch_medium: firstTouchUtm?.utm_medium,
        first_touch_campaign: firstTouchUtm?.utm_campaign,
        last_touch_source: lastTouchUtm?.utm_source,
        last_touch_medium: lastTouchUtm?.utm_medium,
        last_touch_campaign: lastTouchUtm?.utm_campaign,
        // Session context
        session_landing_page: this.session?.landing_page,
        session_referrer: this.session?.referrer,
        session_page_views: this.session?.page_views,
        pages_visited: this.session?.pages_visited
      });
    },

    /**
     * Get current visitor ID
     */
    getVisitorId() {
      return this.visitorId || localStorage.getItem(STORAGE_KEY);
    },

    /**
     * Get current session ID
     */
    getSessionId() {
      return this.sessionId || this.getCookie(SESSION_COOKIE_NAME);
    },

    /**
     * Get visitor profile
     */
    getProfile() {
      return this.profile;
    },

    /**
     * Get current session data
     */
    getSession() {
      return this.session;
    },

    /**
     * Get attribution data (for forms)
     */
    getAttribution() {
      return {
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        first_touch: this.getFirstTouchUtm(),
        last_touch: this.getLastTouchUtm(),
        landing_page: this.session?.landing_page,
        referrer: this.session?.referrer,
        pages_visited: this.session?.pages_visited,
        session_page_views: this.session?.page_views
      };
    },

    /**
     * Add visitor to segment
     */
    async addSegment(segment) {
      return this.track('segment_added', { segments: [segment] });
    },

    /**
     * Identify visitor (e.g., after form submission)
     * Hashes PII before sending to sGTM, but keeps raw in local dataLayer
     */
    async identify(userData = {}) {
      const identifyData = {
        email: userData.email,
        name: userData.name,
        company: userData.company,
        phone: userData.phone,
        ...userData
      };

      // Hash PII for dataLayer (allows matching without storing raw PII)
      const hashedPII = await this.hashPIIFields({
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        company: userData.company
      });

      // Push hashed identity to dataLayer
      window.dataLayer.push({
        event: 'clg_user_identified',
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        // Hashed PII (safe for analytics)
        ...hashedPII,
        // Include any non-PII fields from userData
        user_type: userData.user_type,
        industry: userData.industry
      });

      // Send to server-side GTM (PII will be hashed by sendToSGTM)
      await this.sendToSGTM('identify', identifyData);

      // Send to Firebase (raw data for CRM/profile)
      return this.track('identify', identifyData);
    }
  };

  // Auto-initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CLGVisitor.init());
  } else {
    CLGVisitor.init();
  }

  // Expose globally
  window.CLGVisitor = CLGVisitor;

})(window, document);
