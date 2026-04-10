-- V3__create_requests.sql

CREATE TYPE request_type       AS ENUM ('help', 'talk', 'play', 'free');
CREATE TYPE request_visibility AS ENUM ('students_only', 'public');
CREATE TYPE request_status     AS ENUM ('open', 'accepted', 'closed', 'expired');
CREATE TYPE acceptance_status  AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TABLE requests (
    request_id      UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID                NOT NULL REFERENCES users(user_id)   ON DELETE CASCADE,
    block_id        UUID                NOT NULL REFERENCES blocks(block_id) ON DELETE CASCADE,
    type            request_type        NOT NULL,
    title           VARCHAR(150)        NOT NULL,
    description     TEXT,
    image_url       TEXT,
    visibility      request_visibility  NOT NULL DEFAULT 'students_only',
    latitude        DOUBLE PRECISION    NOT NULL,
    longitude       DOUBLE PRECISION    NOT NULL,
    geo_point       GEOMETRY(POINT, 4326) NOT NULL,
    expiry_time     TIMESTAMPTZ         NOT NULL,
    status          request_status      NOT NULL DEFAULT 'open',
    is_anonymous    BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_block_id   ON requests(block_id);
CREATE INDEX idx_requests_user_id    ON requests(user_id);
CREATE INDEX idx_requests_status     ON requests(status);
CREATE INDEX idx_requests_type       ON requests(type);
CREATE INDEX idx_requests_visibility ON requests(visibility);
CREATE INDEX idx_requests_expiry     ON requests(expiry_time);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_geo_point  ON requests USING GIST(geo_point);

CREATE TRIGGER trg_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

-- Acceptances
CREATE TABLE acceptances (
    acceptance_id       UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id          UUID              NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    accepted_user_id    UUID              NOT NULL REFERENCES users(user_id)       ON DELETE CASCADE,
    status              acceptance_status NOT NULL DEFAULT 'active',
    accepted_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    UNIQUE(request_id, accepted_user_id)
);

CREATE INDEX idx_acceptances_request_id ON acceptances(request_id);
CREATE INDEX idx_acceptances_user_id    ON acceptances(accepted_user_id);
CREATE INDEX idx_acceptances_status     ON acceptances(status);

CREATE TRIGGER trg_acceptances_updated_at
    BEFORE UPDATE ON acceptances
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- User blocks (mute/block between users)
CREATE TABLE user_blocks (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id  UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id  UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);