/**
 * CLG Visitor ID SDK
 * Embeddable script for Builder.io sites
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
  const STORAGE_KEY = 'clg_visitor';

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  const CLGVisitor = {
    visitorId: null,
    profile: null,
    initialized: false,

    /**
     * Initialize the visitor tracking
     */
    async init() {
      if (this.initialized) return this.profile;

      try {
        // Try to get existing visitor ID from cookie or localStorage
        const existingId = this.getCookie(COOKIE_NAME) ||
                          localStorage.getItem(STORAGE_KEY);

        // Build request URL
        let url = ENDPOINT;
        const params = new URLSearchParams();

        if (existingId) {
          params.set('vid', existingId);
        }

        // Add referrer and source
        if (document.referrer) {
          params.set('referrer', document.referrer);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('utm_source') ||
                      urlParams.get('source') ||
                      (document.referrer ? 'referral' : 'direct');
        params.set('source', source);

        if (params.toString()) {
          url += '?' + params.toString();
        }

        // Fetch visitor profile
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

        // Push to GTM dataLayer
        window.dataLayer.push(data.dataLayer);

        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('clg:visitor:ready', {
          detail: data
        }));

        console.log('[CLG] Visitor initialized:', this.visitorId);
        return data;

      } catch (error) {
        console.error('[CLG] Visitor init error:', error);
        // Fallback: generate local ID
        this.visitorId = this.generateLocalId();
        localStorage.setItem(STORAGE_KEY, this.visitorId);
        return { visitor_id: this.visitorId, error: true };
      }
    },

    /**
     * Track an event
     */
    async track(event, properties = {}) {
      if (!this.visitorId) {
        await this.init();
      }

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitor_id: this.visitorId,
            event,
            properties
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
          ...properties
        });
      }
    },

    /**
     * Get current visitor ID
     */
    getVisitorId() {
      return this.visitorId || localStorage.getItem(STORAGE_KEY);
    },

    /**
     * Get visitor profile
     */
    getProfile() {
      return this.profile;
    },

    /**
     * Add visitor to segment
     */
    async addSegment(segment) {
      return this.track('segment_added', { segments: [segment] });
    },

    /**
     * Helper: Get cookie value
     */
    getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    },

    /**
     * Helper: Set cookie
     */
    setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax; Secure`;
    },

    /**
     * Helper: Generate fallback local ID
     */
    generateLocalId() {
      return 'clg_' + Math.random().toString(36).substr(2, 9) +
             Date.now().toString(36);
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
