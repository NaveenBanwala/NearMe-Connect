-- ============================================================
-- nearby_blocks.sql
-- Find all active blocks whose polygon contains or is near
-- a given user GPS point (lat, lng).
-- Used by: BlockController.java → GET /api/blocks/nearby
-- Params: :lat :lng :radius_meters
-- ============================================================

-- ── Query 1: Blocks whose boundary CONTAINS the user's point ──
-- Use this when user is inside a block (for mode switching etc.)

SELECT
    b.block_id,
    b.name,
    b.category,
    b.center_lat,
    b.center_lng,
    b.heat_score,
    b.live_user_count,
    b.open_request_count,
    b.status,
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level,
    -- Distance from user to block center in meters
    ST_Distance(
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(b.center_lng, b.center_lat), 4326), 3857)
    ) AS distance_meters,
    -- True if user is physically inside the block boundary
    ST_Contains(
        b.geo_polygon,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
    ) AS user_is_inside
FROM blocks b
WHERE b.status = 'active'
  AND ST_DWithin(
        ST_Transform(b.geo_polygon, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
        :radius_meters         -- e.g. 5000 for 5km radius
  )
ORDER BY distance_meters ASC;


-- ── Query 2: Nearby campus blocks only (for nearby campus mode) ──
-- Used when student switches to "Nearby Campuses" mode

SELECT
    b.block_id,
    b.name,
    b.category,
    b.center_lat,
    b.center_lng,
    b.heat_score,
    b.live_user_count,
    b.open_request_count,
    ST_AsGeoJSON(b.geo_polygon) AS boundary_geojson,
    ST_Distance(
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(b.center_lng, b.center_lat), 4326), 3857)
    ) AS distance_meters
FROM blocks b
WHERE b.status   = 'active'
  AND b.category = 'campus'
  AND ST_DWithin(
        ST_Transform(b.geo_polygon, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), 3857),
        :radius_meters
  )
ORDER BY distance_meters ASC;


-- ── Query 3: Single block with full boundary GeoJSON ──
-- Used when rendering block boundary on map

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
    b.status,
    ST_AsGeoJSON(b.geo_polygon)::json AS boundary_geojson,
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level
FROM blocks b
WHERE b.block_id = :block_id;


-- ── Query 4: Search blocks by name ──
-- Used by BlockSearchScreen search bar

SELECT
    b.block_id,
    b.name,
    b.category,
    b.center_lat,
    b.center_lng,
    b.heat_score,
    b.live_user_count,
    b.status,
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level
FROM blocks b
WHERE b.status = 'active'
  AND b.name ILIKE '%' || :query || '%'
ORDER BY b.heat_score DESC
LIMIT 20;


-- ── Query 5: Check if a GPS point is inside a specific block ──
-- Used at vote time and when user enters a block

SELECT EXISTS (
    SELECT 1
    FROM blocks
    WHERE block_id = :block_id
      AND ST_Contains(
            geo_polygon,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
          )
) AS is_inside;