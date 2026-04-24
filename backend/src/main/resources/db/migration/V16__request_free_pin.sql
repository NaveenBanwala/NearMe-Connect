-- V16__request_free_pin.sql

ALTER TABLE requests
    ALTER COLUMN block_id DROP NOT NULL;

-- ✅ safe add
ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES activity_clusters(cluster_id);

-- ✅ safe indexes
CREATE INDEX IF NOT EXISTS idx_requests_cluster ON requests(cluster_id);

-- ⚠️ careful: this may already exist
CREATE INDEX IF NOT EXISTS idx_requests_geo ON requests USING GIST(geo_point);