/**
 * Dynamic Personalization Service
 *
 * Handles personalization via:
 * - Firebase UID (user profile lookup)
 * - URL parameters (geo, utm_term, uid)
 * - Cookies/localStorage (returning visitors)
 */

// Category mapping from utm_term keywords
export const categoryMapping: Record<string, string[]> = {
  'Forklift': ['forklift', 'fork lift', 'counterbalance', 'reach truck', 'pallet jack'],
  'Boom Lift': ['boom lift', 'boom-lift', 'cherry picker', 'knuckle boom', 'articulating'],
  'Scissor Lift': ['scissor lift', 'scissor-lift', 'ewp', 'elevated work platform'],
  'Telehandler': ['telehandler', 'tele handler', 'telescopic handler'],
};

// Category display labels
export const categoryLabels: Record<string, string> = {
  'Forklift': 'Forklifts',
  'Boom Lift': 'Boom Lifts',
  'Scissor Lift': 'Scissor Lifts',
  'Telehandler': 'Telehandlers',
  'default': 'Equipment',
};

// Hero content templates per category
export const heroContentTemplates: Record<string, { headline: string; subheadline: string }> = {
  'Forklift': {
    headline: 'Forklift Hire {{geo}}',
    subheadline: 'From 1.5T to 48T capacity – counterbalance, reach trucks, and warehouse forklifts available for short or long-term hire.',
  },
  'Boom Lift': {
    headline: 'Boom Lift Hire {{geo}}',
    subheadline: 'Articulating and telescopic options from 30ft to 180ft. Perfect for construction, maintenance, and industrial access.',
  },
  'Scissor Lift': {
    headline: 'Scissor Lift Hire {{geo}}',
    subheadline: 'Electric and diesel platforms from 19ft to 53ft. Indoor and outdoor models with same-day delivery available.',
  },
  'Telehandler': {
    headline: 'Telehandler Hire {{geo}}',
    subheadline: 'Versatile reach and lift capacity from 2.5T to 4T. Ideal for construction sites and agricultural applications.',
  },
  'default': {
    headline: 'Equipment Hire {{geo}}',
    subheadline: 'Browse our full range of forklifts, boom lifts, scissor lifts, and telehandlers. Same-day delivery available.',
  },
};

// State name mapping
export const stateNames: Record<string, string> = {
  'NSW': 'New South Wales',
  'VIC': 'Victoria',
  'QLD': 'Queensland',
  'WA': 'Western Australia',
  'SA': 'South Australia',
  'TAS': 'Tasmania',
  'NT': 'Northern Territory',
  'ACT': 'Australian Capital Territory',
};

export interface PersonalizationContext {
  // User identity
  uid?: string;
  name?: string;
  email?: string;
  company?: string;

  // Location
  geo?: string;
  geoFull?: string;

  // Category/Intent
  category: string;
  categoryLabel: string;

  // UTM tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;

  // Computed content
  headline: string;
  subheadline: string;
  greeting?: string;
}

export interface FirebaseUserData {
  uid: string;
  displayName?: string;
  email?: string;
  company?: string;
  preferences?: {
    category?: string;
    geo?: string;
  };
}

/**
 * Decode base64 uid to name
 */
export function decodeUid(uid: string): string | null {
  try {
    if (typeof window !== 'undefined') {
      return atob(uid);
    }
    return Buffer.from(uid, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

/**
 * Encode name to base64 uid
 */
export function encodeUid(name: string): string {
  if (typeof window !== 'undefined') {
    return btoa(name);
  }
  return Buffer.from(name).toString('base64');
}

/**
 * Detect category from utm_term
 */
export function detectCategory(utmTerm?: string | null): { category: string; matchedKeyword: string | null } {
  if (!utmTerm) return { category: 'default', matchedKeyword: null };

  const termLower = utmTerm.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryMapping)) {
    for (const keyword of keywords) {
      if (termLower.includes(keyword)) {
        return { category, matchedKeyword: keyword };
      }
    }
  }

  return { category: 'default', matchedKeyword: null };
}

/**
 * Get URL parameters (client-side only)
 */
export function getUrlParams(): Record<string, string | null> {
  if (typeof window === 'undefined') {
    return { uid: null, geo: null, utm_term: null, utm_source: null, utm_medium: null, utm_campaign: null };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    uid: params.get('uid'),
    geo: params.get('geo'),
    utm_term: params.get('utm_term'),
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
}

/**
 * Build personalization context from various sources
 */
export function buildPersonalizationContext(options: {
  urlParams?: Record<string, string | null>;
  firebaseUser?: FirebaseUserData | null;
  overrides?: Partial<PersonalizationContext>;
}): PersonalizationContext {
  const { urlParams = {}, firebaseUser, overrides = {} } = options;

  // Priority: overrides > firebaseUser > urlParams
  const uid = overrides.uid || firebaseUser?.uid || urlParams.uid || undefined;
  const name = overrides.name || firebaseUser?.displayName || (urlParams.uid ? decodeUid(urlParams.uid) : null) || undefined;
  const geo = overrides.geo || firebaseUser?.preferences?.geo || urlParams.geo || undefined;
  const utmTerm = urlParams.utm_term || undefined;

  // Detect category from utm_term or firebase preferences
  const categoryFromUtm = detectCategory(utmTerm);
  const category = overrides.category || firebaseUser?.preferences?.category || categoryFromUtm.category;
  const categoryLabel = categoryLabels[category] || categoryLabels['default'];

  // Get geo display text
  const geoFull = geo ? stateNames[geo] || geo : undefined;
  const geoText = geo ? `in ${geo}` : 'Across Australia';

  // Get content template
  const template = heroContentTemplates[category] || heroContentTemplates['default'];
  const headline = overrides.headline || template.headline.replace('{{geo}}', geoText);
  const subheadline = overrides.subheadline || template.subheadline;

  // Build greeting
  const greeting = name ? `G'day ${name}!` : undefined;

  return {
    uid,
    name,
    email: firebaseUser?.email,
    company: overrides.company || firebaseUser?.company,
    geo,
    geoFull,
    category,
    categoryLabel,
    utmSource: urlParams.utm_source || undefined,
    utmMedium: urlParams.utm_medium || undefined,
    utmCampaign: urlParams.utm_campaign || undefined,
    utmTerm,
    headline,
    subheadline,
    greeting,
  };
}

/**
 * React hook for personalization (client-side)
 */
export function usePersonalization(firebaseUser?: FirebaseUserData | null) {
  if (typeof window === 'undefined') {
    // SSR fallback
    return buildPersonalizationContext({ firebaseUser });
  }

  const urlParams = getUrlParams();
  return buildPersonalizationContext({ urlParams, firebaseUser });
}
