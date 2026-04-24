ALTER TABLE requests DROP CONSTRAINT chk_request_belongs_to_one;

ALTER TABLE requests ADD CONSTRAINT chk_request_belongs_to_one
    CHECK (
        (block_id IS NOT NULL AND cluster_id IS NULL)
        OR (block_id IS NULL AND cluster_id IS NOT NULL)
        OR (block_id IS NULL AND cluster_id IS NULL)
    );