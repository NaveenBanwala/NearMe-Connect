-- ============================================================
-- V5__create_clusters.sql
-- Creates the activity_clusters table
-- Replaces the old location_requests and location_votes tables
-- ============================================================

CREATE TABLE activity_clusters (
    cluster_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Geographic center, auto-calculated from spread of active users
    center_lat          DOUBLE PRECISION    NOT NULL,
    center_lng          DOUBLE PRECISION    NOT NULL,

    -- Radius in meters, auto-calculated from user spread
    radius_meters       INTEGER             NOT NULL DEFAULT 500,

    -- Most-used name suggested by users inside this cluster
    -- NULL until at least one user suggests a name
    suggested_name      VARCHAR(100)        DEFAULT NULL,

    -- Activity counters used for threshold checks
    unique_user_count   INTEGER             NOT NULL DEFAULT 0,
    request_count       INTEGER             NOT NULL DEFAULT 0,
    active_days         INTEGER             NOT NULL DEFAULT 0,

    -- Heat score, recalculated every 2 minutes by ClusterHeatScheduler
    heat_score          DOUBLE PRECISION    NOT NULL DEFAULT 0.0,

    -- Lifecycle status
    -- forming          → just created, less than 2 verified users
    -- active           → 2+ users present, visible on map as blob
    -- flagged_for_admin → activity thresholds met, waiting for admin review
    -- converted        → admin approved, now an official block
    -- dismissed        → admin rejected, stops showing on map
    status              VARCHAR(30)         NOT NULL DEFAULT 'forming'
                            CHECK (status IN (
                                'forming',
                                'active',
                                'flagged_for_admin',
                                'converted',
                                'dismissed'
                            )),

    -- Set when status moves to flagged_for_admin
    flagged_at          TIMESTAMP           DEFAULT NULL,

    -- Set when status moves to converted — references the new official block
    converted_to_block_id UUID             DEFAULT NULL
                            REFERENCES blocks(block_id)
                            ON DELETE SET NULL,

    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    last_active_at      TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------

-- Geospatial proximity lookups (nearby clusters by lat/lng)
CREATE INDEX idx_clusters_location
    ON activity_clusters (center_lat, center_lng);

-- Scheduler queries active clusters for heat recalculation
CREATE INDEX idx_clusters_status
    ON activity_clusters (status);

-- Scheduler queries recently active clusters for threshold checks
CREATE INDEX idx_clusters_last_active
    ON activity_clusters (last_active_at DESC);

-- ---------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------

COMMENT ON TABLE activity_clusters IS
    'Auto-formed geographic clusters based on live user GPS activity. 
     Clusters form when 2+ verified users are active within ~500m of each other.
     They are visible on the map as soft heat blobs.
     When activity thresholds are met, admin is notified to promote to an official block.';

COMMENT ON COLUMN activity_clusters.suggested_name IS
    'Most-used name submitted by users inside this cluster via the name suggestion flow. 
     NULL until at least one suggestion is made.';

COMMENT ON COLUMN activity_clusters.status IS
    'forming → active → flagged_for_admin → converted | dismissed';

COMMENT ON COLUMN activity_clusters.converted_to_block_id IS
    'References the official block this cluster was promoted into. 
     NULL until admin approves and draws the boundary.';