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
 * Usage:
 * <script src="https://clg-ten.vercel.app/clg-visitor.js" async></script>
 *
 * Or with GTM custom HTML tag
 */
(function(window, document) {
  'use strict';

  const ENDPOINT = 'https://australia-southeast1-composable-lg.cloudfunctions.net/visitorId';
  const COOKIE_NAME = 'clg_vid';
  const SESSION_COOKIE_NAME = 'clg_sid';
  const STORAGE_KEY = 'clg_visitor';
  const SESSION_STORAGE_KEY = 'clg_session';
  const UTM_STORAGE_KEY = 'clg_utm';

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  const CLGVisitor = {
    visitorId: null,
    sessionId: null,
    profile: null,
    session: null,
    initialized: false,

    /**
     * Generate a unique ID
     */
    generateId(prefix = '') {
      return prefix + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
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
        const url = ENDPOINT + '?' + params.toString();
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

      // Send to server
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
        const response = await fetch(ENDPOINT, {
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
     */
    async identify(userData = {}) {
      return this.track('identify', {
        email: userData.email,
        name: userData.name,
        company: userData.company,
        phone: userData.phone,
        ...userData
      });
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
