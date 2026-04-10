-- V2__create_blocks.sql

CREATE TYPE block_category AS ENUM ('campus', 'locality', 'society', 'market');
CREATE TYPE block_status   AS ENUM ('active', 'inactive', 'trial');

CREATE TABLE blocks (
    block_id            UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(200)     NOT NULL,
    category            block_category   NOT NULL,
    geo_polygon         GEOMETRY(POLYGON, 4326) NOT NULL,
    center_lat          DOUBLE PRECISION NOT NULL,
    center_lng          DOUBLE PRECISION NOT NULL,
    heat_score          INTEGER          NOT NULL DEFAULT 0,
    live_user_count     INTEGER          NOT NULL DEFAULT 0,
    open_request_count  INTEGER          NOT NULL DEFAULT 0,
    heat_updated_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    status              block_status     NOT NULL DEFAULT 'active',
    trial_expires_at    TIMESTAMPTZ,
    created_by_admin    UUID             NOT NULL,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocks_geo_polygon ON blocks USING GIST(geo_polygon);
CREATE INDEX idx_blocks_status      ON blocks(status);
CREATE INDEX idx_blocks_category    ON blocks(category);
CREATE INDEX idx_blocks_heat_score  ON blocks(heat_score DESC);
CREATE INDEX idx_blocks_center      ON blocks(center_lat, center_lng);

CREATE TRIGGER trg_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- FK from users to blocks (now blocks exists)
ALTER TABLE users
    ADD CONSTRAINT fk_users_campus_block
    FOREIGN KEY (campus_block_id) REFERENCES blocks(block_id) ON DELETE SET NULL;

CREATE INDEX idx_users_campus_block ON users(campus_block_id);