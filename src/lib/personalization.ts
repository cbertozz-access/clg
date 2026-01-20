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

// Campaign content mapping (based on utm_campaign parameter)
export interface CampaignContent {
  headline: string;
  subheadline: string;
  heroImage: string;
  altImages?: string[];
}

export const campaignContentMap: Record<string, CampaignContent> = {
  'building-australia-safely': {
    headline: 'Building Australia Safely',
    subheadline: 'Our rigorous maintenance schedules and comprehensive operator training ensure every job site meets the highest safety standards.',
    heroImage: '/images/campaigns/big-red-wide-2.png',
  },
  'safety-priority': {
    headline: 'Safety Is Our Priority',
    subheadline: 'From pre-start inspections to ongoing equipment monitoring, we\'re committed to keeping your workers protected.',
    heroImage: '/images/campaigns/big-red-wide-10.png',
    altImages: ['/images/campaigns/big-red-wide-7.png'],
  },
  'right-machine': {
    headline: 'The Right Machine For The Job, Every Time',
    subheadline: 'Access to 15,000+ items of equipment across Australia. From scissor lifts to telehandlers, we match the equipment to your project requirements.',
    heroImage: '/images/campaigns/big-red-wide-3b.png',
    altImages: ['/images/campaigns/big-red-wide-9.png'],
  },
};

// Default campaign content (no utm_campaign or unknown campaign)
export const defaultCampaignContent: CampaignContent = {
  headline: 'Australia\'s Equipment Hire Specialists',
  subheadline: 'Access to 15,000+ items of equipment across Australia. Expert advice. Rapid delivery.',
  heroImage: '/images/campaigns/big-red-wide-8.png',
};

/**
 * Get campaign content based on utm_campaign parameter
 */
export function getCampaignContent(utmCampaign?: string | null): CampaignContent {
  if (!utmCampaign) return defaultCampaignContent;
  return campaignContentMap[utmCampaign.toLowerCase()] || defaultCampaignContent;
}

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

  // Campaign content
  campaignContent?: CampaignContent;

  // Computed content
  headline: string;
  subheadline: string;
  heroImage?: string;
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
  const utmCampaign = urlParams.utm_campaign || undefined;

  // Detect category from utm_term or firebase preferences
  const categoryFromUtm = detectCategory(utmTerm);
  const category = overrides.category || firebaseUser?.preferences?.category || categoryFromUtm.category;
  const categoryLabel = categoryLabels[category] || categoryLabels['default'];

  // Get geo display text
  const geoFull = geo ? stateNames[geo] || geo : undefined;
  const geoText = geo ? `in ${geo}` : 'Across Australia';

  // Get campaign content if utm_campaign is present
  const campaignContent = getCampaignContent(utmCampaign);
  const hasCampaign = utmCampaign && campaignContentMap[utmCampaign.toLowerCase()];

  // Content priority: overrides > campaign content > category template
  let headline: string;
  let subheadline: string;
  let heroImage: string | undefined;

  if (overrides.headline) {
    headline = overrides.headline;
  } else if (hasCampaign) {
    headline = campaignContent.headline;
  } else {
    const template = heroContentTemplates[category] || heroContentTemplates['default'];
    headline = template.headline.replace('{{geo}}', geoText);
  }

  if (overrides.subheadline) {
    subheadline = overrides.subheadline;
  } else if (hasCampaign) {
    subheadline = campaignContent.subheadline;
  } else {
    const template = heroContentTemplates[category] || heroContentTemplates['default'];
    subheadline = template.subheadline;
  }

  // Hero image from campaign
  heroImage = campaignContent.heroImage;

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
    utmCampaign,
    utmTerm,
    campaignContent,
    headline,
    subheadline,
    heroImage,
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
