#!/bin/bash
# Smoke Test - CLG Identity Graph System
# Run: ./scripts/smoke-test-identity.sh

set -e

BASE_URL="https://australia-southeast1-composable-lg.cloudfunctions.net"
TEST_UID="smoke-test-$(date +%s)"
TEST_DEVICE="DV-SMOKE-TEST"
TEST_EMAIL_HASH="smoke_email_$(date +%s)"
TEST_PHONE_HASH="smoke_phone_$(date +%s)"

echo "========================================"
echo "CLG Identity Graph - Smoke Tests"
echo "========================================"
echo ""
echo "Test UID: $TEST_UID"
echo ""

# Test 1: visitorId GET
echo "1. Testing visitorId (GET)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/visitorId")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  VISITOR_ID=$(echo "$BODY" | grep -o '"visitor_id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   ✅ PASS - Got visitor_id: ${VISITOR_ID:0:20}..."
else
  echo "   ❌ FAIL - HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 2: checkIdentity (new visitor)
echo "2. Testing checkIdentity (new visitor)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/checkIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"$TEST_UID\",\"device_id\":\"$TEST_DEVICE\",\"brand\":\"smoke-test\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  IS_KNOWN=$(echo "$BODY" | grep -o '"is_known":false' || true)
  if [ -n "$IS_KNOWN" ]; then
    echo "   ✅ PASS - New visitor correctly identified as unknown"
  else
    echo "   ⚠️  WARN - Visitor might already exist"
  fi
else
  echo "   ❌ FAIL - HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 3: linkIdentity (create new identity)
echo "3. Testing linkIdentity (create identity)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/linkIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"$TEST_UID\",\"device_id\":\"$TEST_DEVICE\",\"brand\":\"smoke-test\",\"email_hash\":\"$TEST_EMAIL_HASH\",\"phone_hash\":\"$TEST_PHONE_HASH\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  IS_DUP=$(echo "$BODY" | grep -o '"is_duplicate":false' || true)
  MASTER=$(echo "$BODY" | grep -o '"master_uid":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$IS_DUP" ] && [ "$MASTER" = "$TEST_UID" ]; then
    echo "   ✅ PASS - Identity created, master_uid: $MASTER"
  else
    echo "   ⚠️  WARN - Unexpected response"
    echo "   Response: $BODY"
  fi
else
  echo "   ❌ FAIL - HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 4: linkIdentity (detect duplicate by email)
echo "4. Testing linkIdentity (duplicate detection - email)..."
DUP_UID="smoke-test-dup-$(date +%s)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/linkIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"$DUP_UID\",\"device_id\":\"DV-DIFFERENT\",\"brand\":\"smoke-test\",\"email_hash\":\"$TEST_EMAIL_HASH\",\"phone_hash\":\"different_phone\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  IS_DUP=$(echo "$BODY" | grep -o '"is_duplicate":true' || true)
  MATCH_EMAIL=$(echo "$BODY" | grep -o '"match_sources":\["email"\]' || true)
  MASTER=$(echo "$BODY" | grep -o '"master_uid":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$IS_DUP" ] && [ "$MASTER" = "$TEST_UID" ]; then
    echo "   ✅ PASS - Duplicate detected by email, linked to master: $MASTER"
  else
    echo "   ❌ FAIL - Duplicate not detected"
    echo "   Response: $BODY"
  fi
else
  echo "   ❌ FAIL - HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 5: checkIdentity (known device)
echo "5. Testing checkIdentity (known device)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/checkIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"new-visitor-123\",\"device_id\":\"$TEST_DEVICE\",\"brand\":\"smoke-test\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  IS_KNOWN=$(echo "$BODY" | grep -o '"is_known":true' || true)
  MATCH_TYPE=$(echo "$BODY" | grep -o '"match_type":"device"' || true)
  if [ -n "$IS_KNOWN" ] && [ -n "$MATCH_TYPE" ]; then
    echo "   ✅ PASS - Device recognized from identity graph"
  else
    echo "   ❌ FAIL - Device not recognized"
    echo "   Response: $BODY"
  fi
else
  echo "   ❌ FAIL - HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 6: mergeIdentity
echo "6. Testing mergeIdentity..."
MERGE_SOURCE="smoke-merge-source-$(date +%s)"
MERGE_TARGET="smoke-merge-target-$(date +%s)"

# First create source identity
curl -s -X POST "$BASE_URL/linkIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"$MERGE_SOURCE\",\"device_id\":\"DV-MERGE-SRC\",\"brand\":\"smoke-test\",\"email_hash\":\"merge_email_src\",\"phone_hash\":\"merge_phone_src\"}" > /dev/null

# Create target identity
curl -s -X POST "$BASE_URL/linkIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"uid\":\"$MERGE_TARGET\",\"device_id\":\"DV-MERGE-TGT\",\"brand\":\"smoke-test\",\"email_hash\":\"merge_email_tgt\",\"phone_hash\":\"merge_phone_tgt\"}" > /dev/null

# Now merge
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/mergeIdentity" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"merge\",\"source_uid\":\"$MERGE_SOURCE\",\"target_uid\":\"$MERGE_TARGET\",\"merged_by\":\"smoke-test\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  SUCCESS=$(echo "$BODY" | grep -o '"success":true' || true)
  MASTER=$(echo "$BODY" | grep -o '"master_uid":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$SUCCESS" ] && [ "$MASTER" = "$MERGE_TARGET" ]; then
    echo "   ✅ PASS - Merge successful, master: $MASTER"
  else
    echo "   ❌ FAIL - Merge failed"
    echo "   Response: $BODY"
  fi
else
  echo "   ❌ FAIL - HTTP $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Summary
echo "========================================"
echo "Smoke Tests Complete"
echo "========================================"
echo ""
echo "Test data created with prefix: smoke-test-*"
echo "You can view in Firebase Console:"
echo "https://console.firebase.google.com/project/composable-lg/firestore/databases/visitors/data"
