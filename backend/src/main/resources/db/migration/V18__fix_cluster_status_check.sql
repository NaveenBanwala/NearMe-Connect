ALTER TABLE activity_clusters DROP CONSTRAINT activity_clusters_status_check;

ALTER TABLE activity_clusters ADD CONSTRAINT activity_clusters_status_check
    CHECK (status IN ('FORMING', 'ACTIVE', 'FLAGGED_FOR_ADMIN', 'CONVERTED', 'DISBANDED'));