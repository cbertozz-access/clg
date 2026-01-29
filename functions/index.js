const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const firestore = new Firestore({
  projectId: 'composable-lg',
  databaseId: 'visitors'
});

const COLLECTION = 'visitors';
const IDENTITY_GRAPH = 'identity_graph';
const COOKIE_NAME = 'clg_vid';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

// ============================================================================
// CORS HELPER
// ============================================================================
function setCorsHeaders(req, res) {
  // When credentials are included, can't use wildcard - must echo the origin
  const origin = req.get('Origin') || '*';
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Credentials', 'true');
}

// ============================================================================
// IDENTITY GRAPH FUNCTIONS
// ============================================================================

/**
 * Check Identity - Called on page load
 * Checks if device fingerprint matches any existing visitor
 */
exports.checkIdentity = async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { uid, device_id, brand } = req.body;

    if (!uid || !device_id) {
      res.status(400).json({ error: 'uid and device_id are required' });
      return;
    }

    // Check device index
    const deviceDoc = await firestore
      .collection(IDENTITY_GRAPH)
      .doc(`device_${device_id}`)
      .get();

    if (deviceDoc.exists) {
      const deviceData = deviceDoc.data();
      const masterUid = deviceData.master_uid;

      // If device is linked to a different UID, return the master
      if (masterUid && masterUid !== uid) {
        const masterDoc = await firestore.collection(COLLECTION).doc(masterUid).get();
        const profile = masterDoc.exists ? masterDoc.data() : null;

        // Update last seen for this device
        await deviceDoc.ref.update({
          last_seen: Firestore.FieldValue.serverTimestamp(),
          [`brands`]: Firestore.FieldValue.arrayUnion(brand)
        });

        res.status(200).json({
          is_known: true,
          master_uid: masterUid,
          match_type: 'device',
          profile: profile ? {
            ns_lead_id: profile.ns_lead_id || null,
            brands: profile.brands || [],
            first_seen: profile.first_seen
          } : null
        });
        return;
      }
    }

    // No match found - new visitor or same device
    res.status(200).json({
      is_known: false,
      master_uid: null,
      match_type: null,
      profile: null
    });

  } catch (error) {
    console.error('checkIdentity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Link Identity - Called on form submission
 * Stores hashed PII and links UIDs if matches found
 */
exports.linkIdentity = async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { uid, device_id, brand, email_hash, phone_hash } = req.body;

    if (!uid) {
      res.status(400).json({ error: 'uid is required' });
      return;
    }

    const now = Firestore.FieldValue.serverTimestamp();
    const matchSources = [];
    let masterUid = uid;
    let isDuplicate = false;
    let existingNsLeadId = null;

    // Check email hash
    if (email_hash) {
      const emailDoc = await firestore
        .collection(IDENTITY_GRAPH)
        .doc(`email_${email_hash}`)
        .get();

      if (emailDoc.exists) {
        const emailData = emailDoc.data();
        if (emailData.master_uid && emailData.master_uid !== uid) {
          masterUid = emailData.master_uid;
          isDuplicate = true;
          matchSources.push('email');

          // Get NS lead ID from master
          const masterDoc = await firestore.collection(COLLECTION).doc(masterUid).get();
          if (masterDoc.exists) {
            existingNsLeadId = masterDoc.data().ns_lead_id || null;
          }
        }
      }
    }

    // Check phone hash (only if email didn't match)
    if (phone_hash && !isDuplicate) {
      const phoneDoc = await firestore
        .collection(IDENTITY_GRAPH)
        .doc(`phone_${phone_hash}`)
        .get();

      if (phoneDoc.exists) {
        const phoneData = phoneDoc.data();
        if (phoneData.master_uid && phoneData.master_uid !== uid) {
          masterUid = phoneData.master_uid;
          isDuplicate = true;
          matchSources.push('phone');

          const masterDoc = await firestore.collection(COLLECTION).doc(masterUid).get();
          if (masterDoc.exists) {
            existingNsLeadId = masterDoc.data().ns_lead_id || null;
          }
        }
      }
    }

    // Check device (only if nothing else matched)
    if (device_id && !isDuplicate) {
      const deviceDoc = await firestore
        .collection(IDENTITY_GRAPH)
        .doc(`device_${device_id}`)
        .get();

      if (deviceDoc.exists) {
        const deviceData = deviceDoc.data();
        if (deviceData.master_uid && deviceData.master_uid !== uid) {
          masterUid = deviceData.master_uid;
          isDuplicate = true;
          matchSources.push('device');
        }
      }
    }

    // Batch write for atomicity
    const batch = firestore.batch();

    if (isDuplicate) {
      // Mark current UID as merged into master
      const visitorRef = firestore.collection(COLLECTION).doc(uid);
      batch.set(visitorRef, {
        uid: uid,
        status: 'merged',
        merged_into: masterUid,
        device_id: device_id,
        brand: brand,
        created_at: now,
        updated_at: now
      }, { merge: true });

      // Add to master's merged_uids
      const masterRef = firestore.collection(COLLECTION).doc(masterUid);
      batch.update(masterRef, {
        merged_uids: Firestore.FieldValue.arrayUnion(uid),
        brands: Firestore.FieldValue.arrayUnion(brand),
        updated_at: now
      });
    } else {
      // Create/update visitor profile as master
      const visitorRef = firestore.collection(COLLECTION).doc(uid);
      batch.set(visitorRef, {
        uid: uid,
        status: 'master',
        email_hash: email_hash || null,
        phone_hash: phone_hash || null,
        devices: Firestore.FieldValue.arrayUnion({
          id: device_id,
          brand: brand,
          first_seen: new Date().toISOString()
        }),
        brands: Firestore.FieldValue.arrayUnion(brand),
        first_seen: now,
        updated_at: now
      }, { merge: true });
    }

    // Update identity graph indexes
    if (email_hash) {
      const emailRef = firestore.collection(IDENTITY_GRAPH).doc(`email_${email_hash}`);
      batch.set(emailRef, {
        hash: email_hash,
        master_uid: masterUid,
        uids: Firestore.FieldValue.arrayUnion(uid),
        updated_at: now
      }, { merge: true });
    }

    if (phone_hash) {
      const phoneRef = firestore.collection(IDENTITY_GRAPH).doc(`phone_${phone_hash}`);
      batch.set(phoneRef, {
        hash: phone_hash,
        master_uid: masterUid,
        uids: Firestore.FieldValue.arrayUnion(uid),
        updated_at: now
      }, { merge: true });
    }

    if (device_id) {
      const deviceRef = firestore.collection(IDENTITY_GRAPH).doc(`device_${device_id}`);
      batch.set(deviceRef, {
        fingerprint: device_id,
        master_uid: masterUid,
        uids: Firestore.FieldValue.arrayUnion(uid),
        brands: Firestore.FieldValue.arrayUnion(brand),
        updated_at: now
      }, { merge: true });
    }

    await batch.commit();

    res.status(200).json({
      is_duplicate: isDuplicate,
      match_sources: matchSources,
      master_uid: masterUid,
      ns_lead_id: existingNsLeadId,
      action: isDuplicate ? 'linked' : 'created'
    });

  } catch (error) {
    console.error('linkIdentity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Merge Identity - Called by NS Adapter webhook
 * Merges two UIDs after manual de-duplication in NetSuite
 */
exports.mergeIdentity = async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { action, source_uid, target_uid, ns_lead_id, merged_by } = req.body;

    if (action !== 'merge' || !source_uid || !target_uid) {
      res.status(400).json({ error: 'action=merge, source_uid, and target_uid are required' });
      return;
    }

    const now = Firestore.FieldValue.serverTimestamp();
    const batch = firestore.batch();

    // Get source visitor data
    const sourceDoc = await firestore.collection(COLLECTION).doc(source_uid).get();
    const sourceData = sourceDoc.exists ? sourceDoc.data() : {};

    // Update source visitor - mark as merged
    const sourceRef = firestore.collection(COLLECTION).doc(source_uid);
    batch.set(sourceRef, {
      status: 'merged',
      merged_into: target_uid,
      merged_at: now,
      merged_by: merged_by || 'system'
    }, { merge: true });

    // Update target visitor - add merged UID and carry over data
    const targetRef = firestore.collection(COLLECTION).doc(target_uid);
    const targetUpdates = {
      merged_uids: Firestore.FieldValue.arrayUnion(source_uid),
      updated_at: now
    };

    if (ns_lead_id) {
      targetUpdates.ns_lead_id = ns_lead_id;
    }

    // Carry over brands and devices from source
    if (sourceData.brands) {
      targetUpdates.brands = Firestore.FieldValue.arrayUnion(...sourceData.brands);
    }
    if (sourceData.devices) {
      for (const device of sourceData.devices) {
        targetUpdates.devices = Firestore.FieldValue.arrayUnion(device);
      }
    }

    batch.update(targetRef, targetUpdates);

    // Update identity graph - point all source's hashes to target
    if (sourceData.email_hash) {
      const emailRef = firestore.collection(IDENTITY_GRAPH).doc(`email_${sourceData.email_hash}`);
      batch.update(emailRef, {
        master_uid: target_uid,
        updated_at: now
      });
    }

    if (sourceData.phone_hash) {
      const phoneRef = firestore.collection(IDENTITY_GRAPH).doc(`phone_${sourceData.phone_hash}`);
      batch.update(phoneRef, {
        master_uid: target_uid,
        updated_at: now
      });
    }

    // Update all device indexes that pointed to source
    if (sourceData.devices) {
      for (const device of sourceData.devices) {
        const deviceRef = firestore.collection(IDENTITY_GRAPH).doc(`device_${device.id}`);
        batch.update(deviceRef, {
          master_uid: target_uid,
          updated_at: now
        });
      }
    }

    await batch.commit();

    res.status(200).json({
      success: true,
      merged_uid: source_uid,
      master_uid: target_uid,
      ns_lead_id: ns_lead_id || null
    });

  } catch (error) {
    console.error('mergeIdentity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
  setCorsHeaders(req, res);

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
