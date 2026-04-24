-- ============================================================
-- V7__add_cluster_id_to_requests.sql
-- Adds cluster_id column to the requests table
-- A request belongs to EITHER a block OR a cluster — never both
-- ============================================================

ALTER TABLE requests
    ADD COLUMN cluster_id UUID DEFAULT NULL
        REFERENCES activity_clusters(cluster_id)
        ON DELETE SET NULL;

-- ---------------------------------------------------------------
-- Constraint: a request must belong to exactly one of block or cluster
-- block_id NULL + cluster_id NOT NULL = cluster request
-- block_id NOT NULL + cluster_id NULL = block request
-- both NULL or both NOT NULL = invalid
-- ---------------------------------------------------------------

ALTER TABLE requests
    ADD CONSTRAINT chk_request_belongs_to_one
        CHECK (
            (block_id IS NOT NULL AND cluster_id IS NULL)
            OR
            (block_id IS NULL AND cluster_id IS NOT NULL)
        );

-- ---------------------------------------------------------------
-- Index for fetching all requests inside a cluster
-- ---------------------------------------------------------------

CREATE INDEX idx_requests_cluster_id
    ON requests (cluster_id)
    WHERE cluster_id IS NOT NULL;

-- ---------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------

COMMENT ON COLUMN requests.cluster_id IS
    'The unofficial cluster this request belongs to.
     Mutually exclusive with block_id — exactly one must be set.
     Set to NULL if the cluster is later dismissed or converted.';