-- V5__create_votes.sql

CREATE TYPE cluster_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_type    AS ENUM ('user', 'request');
CREATE TYPE report_status  AS ENUM ('open', 'resolved', 'dismissed');

-- Location requests (vote clusters)
CREATE TABLE location_requests (
    cluster_id          UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    suggested_name      VARCHAR(200)     NOT NULL,
    geo_lat             DOUBLE PRECISION NOT NULL,
    geo_lng             DOUBLE PRECISION NOT NULL,
    geo_point           GEOMETRY(POINT, 4326) NOT NULL,
    category            block_category   NOT NULL,
    vote_count          INTEGER          NOT NULL DEFAULT 1,
    unique_voter_count  INTEGER          NOT NULL DEFAULT 1,
    threshold_required  INTEGER          NOT NULL DEFAULT 50,
    status              cluster_status   NOT NULL DEFAULT 'pending',
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    approved_at         TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_location_requests_status     ON location_requests(status);
CREATE INDEX idx_location_requests_vote_count ON location_requests(vote_count DESC);
CREATE INDEX idx_location_requests_geo        ON location_requests USING GIST(geo_point);

CREATE TRIGGER trg_location_requests_updated_at
    BEFORE UPDATE ON location_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

-- Location votes
CREATE TABLE location_votes (
    vote_id     UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID             NOT NULL REFERENCES users(user_id)              ON DELETE CASCADE,
    cluster_id  UUID             NOT NULL REFERENCES location_requests(cluster_id) ON DELETE CASCADE,
    user_lat    DOUBLE PRECISION NOT NULL,
    user_lng    DOUBLE PRECISION NOT NULL,
    voted_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, cluster_id)
);

CREATE INDEX idx_location_votes_cluster_id ON location_votes(cluster_id);
CREATE INDEX idx_location_votes_user_id    ON location_votes(user_id);

CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE location_requests
    SET vote_count         = vote_count + 1,
        unique_voter_count = unique_voter_count + 1,
        updated_at         = NOW()
    WHERE cluster_id = NEW.cluster_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_vote_count
    AFTER INSERT ON location_votes
    FOR EACH ROW EXECUTE FUNCTION increment_vote_count();

-- Reports
CREATE TABLE reports (
    report_id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by         UUID          NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
    against_type        report_type   NOT NULL,
    against_user_id     UUID          REFERENCES users(user_id)             ON DELETE SET NULL,
    against_request_id  UUID          REFERENCES requests(request_id)       ON DELETE SET NULL,
    reason              TEXT          NOT NULL,
    status              report_status NOT NULL DEFAULT 'open',
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    CONSTRAINT chk_report_target CHECK (
        (against_type = 'user'    AND against_user_id    IS NOT NULL) OR
        (against_type = 'request' AND against_request_id IS NOT NULL)
    )
);

CREATE INDEX idx_reports_status      ON reports(status);
CREATE INDEX idx_reports_reported_by ON reports(reported_by);
CREATE INDEX idx_reports_created_at  ON reports(created_at DESC);