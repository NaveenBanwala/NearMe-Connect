-- ============================================================
-- nearby_requests.sql
-- Fetch requests for a block filtered by user type,
-- mode (campus / nearby / radius), visibility, type, and expiry.
-- Used by: RequestController.java → GET /api/requests
-- ============================================================

-- ── Query 1: Requests inside a block for a VERIFIED STUDENT ──
-- mode = 'campus' → show students_only + public within their campus block
-- Params: :block_id :user_id :type (nullable) :limit :offset

SELECT
    r.request_id,
    r.block_id,
    r.type,
    r.title,
    r.description,
    r.image_url,
    r.visibility,
    r.latitude,
    r.longitude,
    r.expiry_time,
    r.status,
    r.is_anonymous,
    r.created_at,
    -- Hide user info if anonymous
    CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id   END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name END AS user_name,
    u.student_verified,
    u.college_name,
    -- Time remaining until expiry in seconds
    EXTRACT(EPOCH FROM (r.expiry_time - NOW()))::INT AS expires_in_seconds,
    -- Whether the calling user has already accepted this request
    EXISTS (
        SELECT 1 FROM acceptances a
        WHERE a.request_id      = r.request_id
          AND a.accepted_user_id = :user_id
          AND a.status IN ('pending', 'active')
    ) AS already_accepted
FROM requests r
JOIN users u ON r.user_id = u.user_id
WHERE r.block_id     = :block_id
  AND r.status       = 'open'
  AND r.expiry_time  > NOW()
  AND (r.visibility = 'students_only' OR r.visibility = 'public')
  AND (:type IS NULL OR r.type = :type::request_type)
  -- Exclude requests from blocked users
  AND r.user_id NOT IN (
        SELECT blocked_id FROM user_blocks WHERE blocker_id = :user_id
  )
ORDER BY r.created_at DESC
LIMIT  :limit
OFFSET :offset;


-- ── Query 2: Requests inside a block for a VERIFIED LOCAL ──
-- Locals only see public requests, never students_only

SELECT
    r.request_id,
    r.block_id,
    r.type,
    r.title,
    r.description,
    r.image_url,
    r.visibility,
    r.latitude,
    r.longitude,
    r.expiry_time,
    r.status,
    r.is_anonymous,
    r.created_at,
    CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id    END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name END AS user_name,
    EXTRACT(EPOCH FROM (r.expiry_time - NOW()))::INT AS expires_in_seconds
FROM requests r
JOIN users u ON r.user_id = u.user_id
WHERE r.block_id     = :block_id
  AND r.status       = 'open'
  AND r.expiry_time  > NOW()
  AND r.visibility   = 'public'
  AND (:type IS NULL OR r.type = :type::request_type)
  AND r.user_id NOT IN (
        SELECT blocked_id FROM user_blocks WHERE blocker_id = :user_id
  )
ORDER BY r.created_at DESC
LIMIT  :limit
OFFSET :offset;


-- ── Query 3: Requests in RADIUS mode (student only) ──
-- Returns all requests (campus + public) within a given radius circle
-- Params: :lat :lng :radius_meters :user_id :type

SELECT
    r.request_id,
    r.block_id,
    b.name          AS block_name,
    r.type,
    r.title,
    r.description,
    r.image_url,
    r.visibility,
    r.latitude,
    r.longitude,
    r.expiry_time,
    r.status,
    r.is_anonymous,
    r.created_at,
    CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id    END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name END AS user_name,
    u.student_verified,
    ST_Distance(
        ST_Transform(r.geo_point, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857)
    ) AS distance_meters,
    EXTRACT(EPOCH FROM (r.expiry_time - NOW()))::INT AS expires_in_seconds
FROM requests r
JOIN users u  ON r.user_id  = u.user_id
JOIN blocks b ON r.block_id = b.block_id
WHERE r.status       = 'open'
  AND r.expiry_time  > NOW()
  AND (r.visibility = 'public' OR r.visibility = 'students_only')
  AND ST_DWithin(
        ST_Transform(r.geo_point, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
        :radius_meters
  )
  AND (:type IS NULL OR r.type = :type::request_type)
  AND r.user_id NOT IN (
        SELECT blocked_id FROM user_blocks WHERE blocker_id = :user_id
  )
ORDER BY distance_meters ASC, r.created_at DESC
LIMIT :limit;


-- ── Query 4: Requests in NEARBY CAMPUSES mode (student only) ──
-- Shows requests from all campus blocks within a radius

SELECT
    r.request_id,
    r.block_id,
    b.name          AS block_name,
    b.category,
    r.type,
    r.title,
    r.description,
    r.visibility,
    r.latitude,
    r.longitude,
    r.expiry_time,
    r.status,
    r.is_anonymous,
    r.created_at,
    CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id    END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name END AS user_name,
    EXTRACT(EPOCH FROM (r.expiry_time - NOW()))::INT AS expires_in_seconds
FROM requests r
JOIN users u  ON r.user_id  = u.user_id
JOIN blocks b ON r.block_id = b.block_id
WHERE r.status      = 'open'
  AND r.expiry_time > NOW()
  AND b.category    = 'campus'
  AND b.status      = 'active'
  AND ST_DWithin(
        ST_Transform(b.geo_polygon, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
        :radius_meters
  )
  AND r.user_id NOT IN (
        SELECT blocked_id FROM user_blocks WHERE blocker_id = :user_id
  )
ORDER BY r.created_at DESC
LIMIT :limit;


-- ── Query 5: Single request detail with acceptance info ──
-- Used by GET /api/requests/:id

SELECT
    r.request_id,
    r.block_id,
    b.name          AS block_name,
    r.type,
    r.title,
    r.description,
    r.image_url,
    r.visibility,
    r.latitude,
    r.longitude,
    r.expiry_time,
    r.status,
    r.is_anonymous,
    r.created_at,
    CASE WHEN r.is_anonymous THEN NULL ELSE r.user_id    END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name END AS user_name,
    u.student_verified,
    u.college_name,
    EXTRACT(EPOCH FROM (r.expiry_time - NOW()))::INT AS expires_in_seconds,
    -- Acceptance info
    a.acceptance_id,
    a.accepted_user_id,
    au.name         AS accepted_user_name,
    a.status        AS acceptance_status,
    a.accepted_at
FROM requests r
JOIN users u  ON r.user_id  = u.user_id
JOIN blocks b ON r.block_id = b.block_id
LEFT JOIN acceptances a  ON a.request_id = r.request_id AND a.status IN ('pending', 'active')
LEFT JOIN users       au ON au.user_id   = a.accepted_user_id
WHERE r.request_id = :request_id;


-- ── Query 6: Auto-expire overdue requests ──
-- Run by RequestExpiryScheduler.java every 5 minutes

UPDATE requests
SET status     = 'expired',
    updated_at = NOW()
WHERE status       = 'open'
  AND expiry_time <= NOW();