-- ============================================================
-- heat_score.sql
-- Heat score calculation and block update queries.
-- Run by HeatScoreScheduler.java every 2 minutes.
-- Formula: (live_users × 1.0) + (open_requests × 1.5) + (new_requests_last_hour × 0.5)
-- ============================================================

-- ── Query 1: Calculate and update heat scores for ALL active blocks ──
-- This is the main scheduled query. Run every 2 minutes.

WITH live_users AS (
    -- Count users whose last_seen_at is within 15 minutes, grouped by their campus block
    -- For non-students, we check which block's polygon contains their last known GPS
    SELECT
        campus_block_id AS block_id,
        COUNT(*)        AS user_count
    FROM users
    WHERE status       = 'active'
      AND last_seen_at > NOW() - INTERVAL '15 minutes'
      AND campus_block_id IS NOT NULL
    GROUP BY campus_block_id
),

open_reqs AS (
    -- Count currently open requests per block
    SELECT
        block_id,
        COUNT(*) AS req_count
    FROM requests
    WHERE status      = 'open'
      AND expiry_time > NOW()
    GROUP BY block_id
),

new_reqs_last_hour AS (
    -- Count requests created in the last 60 minutes per block
    SELECT
        block_id,
        COUNT(*) AS new_count
    FROM requests
    WHERE created_at > NOW() - INTERVAL '1 hour'
    GROUP BY block_id
)

UPDATE blocks b
SET
    live_user_count     = COALESCE(lu.user_count, 0),
    open_request_count  = COALESCE(orq.req_count, 0),
    heat_score          = ROUND(
                            COALESCE(lu.user_count, 0)  * 1.0 +
                            COALESCE(orq.req_count, 0)  * 1.5 +
                            COALESCE(nrh.new_count, 0)  * 0.5
                          ),
    heat_updated_at     = NOW()
FROM blocks blk
LEFT JOIN live_users            lu  ON lu.block_id  = blk.block_id
LEFT JOIN open_reqs             orq ON orq.block_id = blk.block_id
LEFT JOIN new_reqs_last_hour    nrh ON nrh.block_id = blk.block_id
WHERE b.block_id = blk.block_id
  AND b.status   = 'active';


-- ── Query 2: Get current heat score for a single block ──
-- Used by GET /api/blocks/:id/heat

SELECT
    b.block_id,
    b.name,
    b.heat_score,
    b.live_user_count,
    b.open_request_count,
    b.heat_updated_at,
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level,
    -- Seconds until next recalculation (2 min interval)
    EXTRACT(EPOCH FROM (b.heat_updated_at + INTERVAL '2 minutes' - NOW()))::INT
        AS next_refresh_in_seconds
FROM blocks b
WHERE b.block_id = :block_id;


-- ── Query 3: Top N hottest blocks right now ──
-- Used by admin heatmap dashboard

SELECT
    b.block_id,
    b.name,
    b.category,
    b.center_lat,
    b.center_lng,
    b.heat_score,
    b.live_user_count,
    b.open_request_count,
    b.heat_updated_at,
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level
FROM blocks b
WHERE b.status = 'active'
ORDER BY b.heat_score DESC
LIMIT :limit;


-- ── Query 4: Update last_seen_at for a user ──
-- Called every time the mobile app polls (every 2 min while open)

UPDATE users
SET last_seen_at = NOW()
WHERE user_id = :user_id;


-- ── Query 5: Clean up stale live users ──
-- Mark users as not-live by checking last_seen_at
-- This is used by LiveUserCleanupScheduler.java every 5 minutes

UPDATE blocks b
SET live_user_count = (
    SELECT COUNT(*)
    FROM users u
    WHERE u.campus_block_id = b.block_id
      AND u.status          = 'active'
      AND u.last_seen_at    > NOW() - INTERVAL '15 minutes'
)
WHERE b.status = 'active';


-- ── Query 6: Heat score history (for admin analytics chart) ──
-- Hourly aggregated heat per block for the last 24 hours
-- Requires a heat_history table (optional analytics table, not in core schema)

/*
SELECT
    block_id,
    DATE_TRUNC('hour', recorded_at) AS hour,
    AVG(heat_score)::INT            AS avg_heat,
    MAX(heat_score)                 AS peak_heat,
    MAX(live_user_count)            AS peak_users
FROM heat_history
WHERE block_id    = :block_id
  AND recorded_at > NOW() - INTERVAL '24 hours'
GROUP BY block_id, DATE_TRUNC('hour', recorded_at)
ORDER BY hour ASC;
*/