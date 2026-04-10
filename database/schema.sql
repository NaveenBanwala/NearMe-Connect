-- ============================================================
-- NearMe Connect — Full Database Schema
-- PostgreSQL 15 + PostGIS 3.3
-- Run: psql -U postgres -d nearme -f schema.sql
-- ============================================================

-- Enable PostGIS extension (must be done before creating tables)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_status         AS ENUM ('active', 'banned', 'deleted');
CREATE TYPE verification_status AS ENUM ('none', 'pending', 'approved', 'rejected');
CREATE TYPE block_category      AS ENUM ('campus', 'locality', 'society', 'market');
CREATE TYPE block_status        AS ENUM ('active', 'inactive', 'trial');
CREATE TYPE request_type        AS ENUM ('help', 'talk', 'play', 'free');
CREATE TYPE request_visibility  AS ENUM ('students_only', 'public');
CREATE TYPE request_status      AS ENUM ('open', 'accepted', 'closed', 'expired');
CREATE TYPE acceptance_status   AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE cluster_status      AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_type         AS ENUM ('user', 'request');
CREATE TYPE report_status       AS ENUM ('open', 'resolved', 'dismissed');

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
    user_id             UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100)    NOT NULL,
    phone               VARCHAR(20)     UNIQUE NOT NULL,
    email               VARCHAR(150)    UNIQUE,
    phone_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    student_verified    BOOLEAN         NOT NULL DEFAULT FALSE,
    college_name        VARCHAR(200),
    college_id_url      TEXT,                           -- Firebase Storage URL
    verification_status verification_status NOT NULL DEFAULT 'none',
    campus_block_id     UUID,                           -- FK to blocks (set after student verify)
    status              user_status     NOT NULL DEFAULT 'active',
    fcm_token           TEXT,                           -- Firebase Cloud Messaging token
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_seen_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone            ON users(phone);
CREATE INDEX idx_users_status           ON users(status);
CREATE INDEX idx_users_student_verified ON users(student_verified);
CREATE INDEX idx_users_verification     ON users(verification_status);
CREATE INDEX idx_users_last_seen        ON users(last_seen_at);
CREATE INDEX idx_users_campus_block     ON users(campus_block_id);

-- ============================================================
-- TABLE: blocks
-- ============================================================

CREATE TABLE blocks (
    block_id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200)    NOT NULL,
    category            block_category  NOT NULL,
    geo_polygon         GEOMETRY(POLYGON, 4326) NOT NULL,  -- WGS84 lat/lng polygon
    center_lat          DOUBLE PRECISION NOT NULL,
    center_lng          DOUBLE PRECISION NOT NULL,
    heat_score          INTEGER         NOT NULL DEFAULT 0,
    live_user_count     INTEGER         NOT NULL DEFAULT 0,
    open_request_count  INTEGER         NOT NULL DEFAULT 0,
    heat_updated_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    status              block_status    NOT NULL DEFAULT 'active',
    trial_expires_at    TIMESTAMPTZ,                    -- only for trial blocks
    created_by_admin    UUID            NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- PostGIS spatial index — critical for fast geo queries
CREATE INDEX idx_blocks_geo_polygon ON blocks USING GIST(geo_polygon);
CREATE INDEX idx_blocks_status      ON blocks(status);
CREATE INDEX idx_blocks_category    ON blocks(category);
CREATE INDEX idx_blocks_heat_score  ON blocks(heat_score DESC);
CREATE INDEX idx_blocks_center      ON blocks(center_lat, center_lng);

-- ============================================================
-- TABLE: requests
-- ============================================================

CREATE TABLE requests (
    request_id      UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID                NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    block_id        UUID                NOT NULL REFERENCES blocks(block_id) ON DELETE CASCADE,
    type            request_type        NOT NULL,
    title           VARCHAR(150)        NOT NULL,
    description     TEXT,
    image_url       TEXT,
    visibility      request_visibility  NOT NULL DEFAULT 'students_only',
    latitude        DOUBLE PRECISION    NOT NULL,
    longitude       DOUBLE PRECISION    NOT NULL,
    geo_point       GEOMETRY(POINT, 4326) NOT NULL,     -- computed from lat/lng
    expiry_time     TIMESTAMPTZ         NOT NULL,
    status          request_status      NOT NULL DEFAULT 'open',
    is_anonymous    BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_block_id      ON requests(block_id);
CREATE INDEX idx_requests_user_id       ON requests(user_id);
CREATE INDEX idx_requests_status        ON requests(status);
CREATE INDEX idx_requests_type          ON requests(type);
CREATE INDEX idx_requests_visibility    ON requests(visibility);
CREATE INDEX idx_requests_expiry        ON requests(expiry_time);
CREATE INDEX idx_requests_created_at    ON requests(created_at DESC);
CREATE INDEX idx_requests_geo_point     ON requests USING GIST(geo_point);

-- ============================================================
-- TABLE: acceptances
-- ============================================================

CREATE TABLE acceptances (
    acceptance_id       UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id          UUID            NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    accepted_user_id    UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status              acceptance_status NOT NULL DEFAULT 'active',
    accepted_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE(request_id, accepted_user_id)            -- one acceptance per user per request
);

CREATE INDEX idx_acceptances_request_id     ON acceptances(request_id);
CREATE INDEX idx_acceptances_user_id        ON acceptances(accepted_user_id);
CREATE INDEX idx_acceptances_status         ON acceptances(status);

-- ============================================================
-- TABLE: chat_messages
-- ============================================================

CREATE TABLE chat_messages (
    chat_id         UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id      UUID            NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    sender_id       UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message         TEXT            NOT NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    sent_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_request_id    ON chat_messages(request_id);
CREATE INDEX idx_chat_sender_id     ON chat_messages(sender_id);
CREATE INDEX idx_chat_sent_at       ON chat_messages(sent_at ASC);
CREATE INDEX idx_chat_is_read       ON chat_messages(is_read) WHERE is_read = FALSE;

-- ============================================================
-- TABLE: location_requests (vote clusters)
-- ============================================================

CREATE TABLE location_requests (
    cluster_id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    suggested_name      VARCHAR(200)    NOT NULL,
    geo_lat             DOUBLE PRECISION NOT NULL,
    geo_lng             DOUBLE PRECISION NOT NULL,
    geo_point           GEOMETRY(POINT, 4326) NOT NULL,
    category            block_category  NOT NULL,
    vote_count          INTEGER         NOT NULL DEFAULT 1,
    unique_voter_count  INTEGER         NOT NULL DEFAULT 1,
    threshold_required  INTEGER         NOT NULL DEFAULT 50,
    status              cluster_status  NOT NULL DEFAULT 'pending',
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    approved_at         TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_location_requests_status       ON location_requests(status);
CREATE INDEX idx_location_requests_vote_count   ON location_requests(vote_count DESC);
CREATE INDEX idx_location_requests_geo          ON location_requests USING GIST(geo_point);

-- ============================================================
-- TABLE: location_votes
-- ============================================================

CREATE TABLE location_votes (
    vote_id         UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cluster_id      UUID            NOT NULL REFERENCES location_requests(cluster_id) ON DELETE CASCADE,
    user_lat        DOUBLE PRECISION NOT NULL,          -- GPS at time of vote
    user_lng        DOUBLE PRECISION NOT NULL,          -- GPS at time of vote
    voted_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, cluster_id)                         -- one vote per user per cluster
);

CREATE INDEX idx_location_votes_cluster_id  ON location_votes(cluster_id);
CREATE INDEX idx_location_votes_user_id     ON location_votes(user_id);

-- ============================================================
-- TABLE: reports
-- ============================================================

CREATE TABLE reports (
    report_id       UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by     UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    against_type    report_type     NOT NULL,
    against_user_id UUID            REFERENCES users(user_id) ON DELETE SET NULL,
    against_request_id UUID         REFERENCES requests(request_id) ON DELETE SET NULL,
    reason          TEXT            NOT NULL,
    status          report_status   NOT NULL DEFAULT 'open',
    admin_notes     TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    CONSTRAINT chk_report_target CHECK (
        (against_type = 'user'    AND against_user_id    IS NOT NULL) OR
        (against_type = 'request' AND against_request_id IS NOT NULL)
    )
);

CREATE INDEX idx_reports_status         ON reports(status);
CREATE INDEX idx_reports_reported_by    ON reports(reported_by);
CREATE INDEX idx_reports_against_user   ON reports(against_user_id);
CREATE INDEX idx_reports_against_req    ON reports(against_request_id);
CREATE INDEX idx_reports_created_at     ON reports(created_at DESC);

-- ============================================================
-- TABLE: user_blocks (block/mute between users — not geographic blocks)
-- ============================================================

CREATE TABLE user_blocks (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id      UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id      UUID            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

-- ============================================================
-- FOREIGN KEY: users.campus_block_id → blocks.block_id
-- (added after blocks table exists)
-- ============================================================

ALTER TABLE users
    ADD CONSTRAINT fk_users_campus_block
    FOREIGN KEY (campus_block_id) REFERENCES blocks(block_id) ON DELETE SET NULL;

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_acceptances_updated_at
    BEFORE UPDATE ON acceptances
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_location_requests_updated_at
    BEFORE UPDATE ON location_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER — auto-compute geo_point from lat/lng on requests
-- ============================================================

CREATE OR REPLACE FUNCTION sync_request_geo_point()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geo_point = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_requests_geo_point
    BEFORE INSERT OR UPDATE OF latitude, longitude ON requests
    FOR EACH ROW EXECUTE FUNCTION sync_request_geo_point();

-- ============================================================
-- TRIGGER — auto-compute geo_point on location_requests
-- ============================================================

CREATE OR REPLACE FUNCTION sync_cluster_geo_point()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geo_point = ST_SetSRID(ST_MakePoint(NEW.geo_lng, NEW.geo_lat), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cluster_geo_point
    BEFORE INSERT OR UPDATE OF geo_lat, geo_lng ON location_requests
    FOR EACH ROW EXECUTE FUNCTION sync_cluster_geo_point();

-- ============================================================
-- TRIGGER — auto increment vote_count on location_requests
--           when a new vote is inserted
-- ============================================================

CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE location_requests
    SET
        vote_count         = vote_count + 1,
        unique_voter_count = unique_voter_count + 1,
        updated_at         = NOW()
    WHERE cluster_id = NEW.cluster_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_vote_count
    AFTER INSERT ON location_votes
    FOR EACH ROW EXECUTE FUNCTION increment_vote_count();

-- ============================================================
-- VIEW: active_requests_with_users
-- Used by request feed queries
-- ============================================================

CREATE VIEW active_requests_with_users AS
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
    r.geo_point,
    r.expiry_time,
    r.status,
    r.is_anonymous,
    r.created_at,
    CASE WHEN r.is_anonymous THEN NULL ELSE u.user_id  END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name END AS user_name,
    u.student_verified,
    u.college_name
FROM requests r
JOIN users u ON r.user_id = u.user_id
WHERE r.status = 'open'
  AND r.expiry_time > NOW();

-- ============================================================
-- VIEW: block_heat_summary
-- Used by heat score dashboard
-- ============================================================

CREATE VIEW block_heat_summary AS
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
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level
FROM blocks b
WHERE b.status = 'active';