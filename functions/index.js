const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');

const firestore = new Firestore({
  projectId: 'composable-lg',
  databaseId: 'visitors'
});

const COLLECTION = 'visitors';
const COOKIE_NAME = 'clg_vid';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Visitor ID Cloud Function
 *
 * Endpoints:
 * - GET /visitorId?vid=xxx  - Get or create visitor profile
 * - POST /visitorId         - Update visitor behavioral data
 *
 * Returns visitor ID and profile data for GTM dataLayer
 */
exports.visitorId = async (req, res) => {
  // CORS headers for cross-origin requests from Builder.io sites
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    } else if (req.method === 'POST') {
      return await handlePost(req, res);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET - Retrieve or create visitor profile
 */
async function handleGet(req, res) {
  let visitorId = req.query.vid || req.cookies?.[COOKIE_NAME];
  let isNewVisitor = false;
  let visitorData;

  if (visitorId) {
    // Try to get existing visitor
    const doc = await firestore.collection(COLLECTION).doc(visitorId).get();
    if (doc.exists) {
      visitorData = doc.data();
      // Update last seen
      await doc.ref.update({
        lastSeen: new Date().toISOString(),
        pageViews: Firestore.FieldValue.increment(1)
      });
    } else {
      // ID provided but not found - create new
      visitorId = null;
    }
  }

  if (!visitorId) {
    // Create new visitor
    visitorId = uuidv4();
    isNewVisitor = true;
    visitorData = {
      id: visitorId,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      pageViews: 1,
      sessions: 1,
      source: req.query.source || 'direct',
      referrer: req.query.referrer || null,
      userAgent: req.get('User-Agent') || null,
      behaviors: [],
      segments: [],
      leadScore: 0
    };
    await firestore.collection(COLLECTION).doc(visitorId).set(visitorData);
  }

  // Set cookie header for persistence
  res.set('Set-Cookie', `${COOKIE_NAME}=${visitorId}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`);

  // Return data formatted for GTM dataLayer
  const response = {
    visitor_id: visitorId,
    is_new_visitor: isNewVisitor,
    page_views: visitorData.pageViews,
    sessions: visitorData.sessions,
    lead_score: visitorData.leadScore,
    segments: visitorData.segments,
    first_seen: visitorData.createdAt,
    // GTM dataLayer format
    dataLayer: {
      event: 'visitor_identified',
      visitor_id: visitorId,
      visitor_type: isNewVisitor ? 'new' : 'returning',
      visitor_page_views: visitorData.pageViews,
      visitor_sessions: visitorData.sessions,
      visitor_lead_score: visitorData.leadScore,
      visitor_segments: visitorData.segments.join(',')
    }
  };

  res.status(200).json(response);
}

/**
 * POST - Update visitor behavioral data
 */
async function handlePost(req, res) {
  const { visitor_id, event, properties } = req.body;

  if (!visitor_id) {
    res.status(400).json({ error: 'visitor_id is required' });
    return;
  }

  const docRef = firestore.collection(COLLECTION).doc(visitor_id);
  const doc = await docRef.get();

  if (!doc.exists) {
    res.status(404).json({ error: 'Visitor not found' });
    return;
  }

  const updates = {
    lastSeen: new Date().toISOString()
  };

  // Handle different event types
  if (event) {
    updates.behaviors = Firestore.FieldValue.arrayUnion({
      event,
      properties: properties || {},
      timestamp: new Date().toISOString()
    });

    // Update lead score based on events
    const scoreMap = {
      'page_view': 1,
      'form_start': 5,
      'form_complete': 20,
      'cta_click': 3,
      'video_play': 2,
      'video_complete': 5,
      'download': 10,
      'contact': 25
    };

    if (scoreMap[event]) {
      updates.leadScore = Firestore.FieldValue.increment(scoreMap[event]);
    }
  }

  // Handle segment updates
  if (properties?.segments) {
    updates.segments = Firestore.FieldValue.arrayUnion(...properties.segments);
  }

  await docRef.update(updates);

  // Get updated data
  const updatedDoc = await docRef.get();
  const visitorData = updatedDoc.data();

  res.status(200).json({
    success: true,
    visitor_id,
    lead_score: visitorData.leadScore,
    segments: visitorData.segments,
    dataLayer: {
      event: 'visitor_updated',
      visitor_id,
      visitor_lead_score: visitorData.leadScore,
      visitor_segments: visitorData.segments.join(',')
    }
  });
}
