-- ============================================================
-- vote_count.sql
-- All queries for block voting / location request clusters.
-- Used by: VoteController.java, AdminController.java
-- ============================================================

-- ── Query 1: Submit a new vote for a location cluster ──
-- First checks if a nearby cluster already exists.
-- If yes → inserts a vote row (trigger auto-increments vote_count).
-- If no  → creates new cluster then inserts vote.
-- Params: :user_id :user_lat :user_lng :suggested_name :category

-- Step A: Find existing cluster within 500 metres of user's GPS
SELECT
    cluster_id,
    suggested_name,
    vote_count,
    unique_voter_count,
    threshold_required,
    status,
    -- Distance in metres from user to cluster centre
    ST_Distance(
        ST_Transform(geo_point, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326), 3857)
    ) AS distance_meters
FROM location_requests
WHERE status = 'pending'
  AND ST_DWithin(
        ST_Transform(geo_point, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326), 3857),
        500                   -- 500 metres clustering radius
  )
ORDER BY distance_meters ASC
LIMIT 1;


-- Step B-1: If no cluster exists → insert new cluster
-- (geo_point auto-filled by trigger)
INSERT INTO location_requests
    (suggested_name, geo_lat, geo_lng, category, threshold_required)
VALUES
    (:suggested_name, :user_lat, :user_lng, :category::block_category, :threshold)
RETURNING cluster_id;


-- Step B-2: Insert the vote row (trigger increments vote_count)
INSERT INTO location_votes
    (user_id, cluster_id, user_lat, user_lng)
VALUES
    (:user_id, :cluster_id, :user_lat, :user_lng);
-- ON CONFLICT (user_id, cluster_id) DO NOTHING  ← prevents duplicate votes


-- ── Query 2: Check if user has already voted for a cluster ──

SELECT EXISTS (
    SELECT 1
    FROM location_votes
    WHERE user_id    = :user_id
      AND cluster_id = :cluster_id
) AS already_voted;


-- ── Query 3: Vote progress for a cluster (shown as progress bar) ──
-- Used by GET /api/blocks/vote/status?clusterId=

SELECT
    lr.cluster_id,
    lr.suggested_name,
    lr.geo_lat,
    lr.geo_lng,
    lr.category,
    lr.vote_count,
    lr.unique_voter_count,
    lr.threshold_required,
    lr.status,
    lr.created_at,
    -- Percentage progress
    ROUND((lr.vote_count::NUMERIC / lr.threshold_required) * 100, 1) AS progress_pct,
    -- Whether threshold has been reached
    (lr.vote_count >= lr.threshold_required) AS threshold_reached,
    -- Whether the calling user has voted
    EXISTS (
        SELECT 1 FROM location_votes
        WHERE cluster_id = lr.cluster_id
          AND user_id    = :user_id
    ) AS user_has_voted
FROM location_requests lr
WHERE lr.cluster_id = :cluster_id;


-- ── Query 4: All pending clusters for ADMIN review ──
-- Used by GET /api/admin/vote-clusters

SELECT
    lr.cluster_id,
    lr.suggested_name,
    lr.geo_lat,
    lr.geo_lng,
    lr.category,
    lr.vote_count,
    lr.unique_voter_count,
    lr.threshold_required,
    lr.status,
    lr.created_at,
    ROUND((lr.vote_count::NUMERIC / lr.threshold_required) * 100, 1) AS progress_pct,
    (lr.vote_count >= lr.threshold_required) AS threshold_reached
FROM location_requests lr
WHERE lr.status = 'pending'
ORDER BY
    (lr.vote_count >= lr.threshold_required) DESC,   -- threshold-reached first
    lr.vote_count DESC,                               -- then by vote count
    lr.created_at ASC;                                -- oldest first


-- ── Query 5: Admin APPROVES a cluster → creates new block ──
-- Run as a transaction in AdminService.java

BEGIN;

-- Mark cluster as approved
UPDATE location_requests
SET status      = 'approved',
    approved_at = NOW(),
    admin_notes = :admin_notes,
    updated_at  = NOW()
WHERE cluster_id = :cluster_id;

-- Create the new block
-- Note: geo_polygon is provided by admin from boundary drawing tool as WKT
INSERT INTO blocks
    (name, category, geo_polygon, center_lat, center_lng, status, created_by_admin)
VALUES (
    :block_name,
    :category::block_category,
    ST_GeomFromGeoJSON(:boundary_geojson),   -- polygon drawn by admin
    :center_lat,
    :center_lng,
    'active',
    :admin_user_id
)
RETURNING block_id;

COMMIT;


-- ── Query 6: Admin REJECTS a cluster ──

UPDATE location_requests
SET status      = 'rejected',
    admin_notes = :reason,
    updated_at  = NOW()
WHERE cluster_id = :cluster_id;


-- ── Query 7: Get all users who voted for a cluster ──
-- Used to send FCM notifications after approve/reject

SELECT
    u.user_id,
    u.name,
    u.fcm_token
FROM location_votes lv
JOIN users u ON lv.user_id = u.user_id
WHERE lv.cluster_id  = :cluster_id
  AND u.fcm_token    IS NOT NULL
  AND u.status       = 'active';


-- ── Query 8: Clusters near a GPS point that are still pending ──
-- Shown to user before they submit a vote, to join existing cluster

SELECT
    lr.cluster_id,
    lr.suggested_name,
    lr.category,
    lr.vote_count,
    lr.threshold_required,
    ROUND((lr.vote_count::NUMERIC / lr.threshold_required) * 100, 1) AS progress_pct,
    ST_Distance(
        ST_Transform(lr.geo_point, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326), 3857)
    ) AS distance_meters
FROM location_requests lr
WHERE lr.status = 'pending'
  AND ST_DWithin(
        ST_Transform(lr.geo_point, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:user_lng, :user_lat), 4326), 3857),
        2000           -- show clusters within 2km
  )
ORDER BY distance_meters ASC
LIMIT 5;