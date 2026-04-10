DROP VIEW IF EXISTS active_requests_with_users;
DROP VIEW IF EXISTS block_heat_summary;

ALTER TABLE blocks
    ALTER COLUMN status   TYPE VARCHAR(50) USING status::text,
    ALTER COLUMN category TYPE VARCHAR(50) USING category::text;

ALTER TABLE requests
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text,
    ALTER COLUMN type   TYPE VARCHAR(50) USING type::text;

DROP TYPE IF EXISTS block_status CASCADE;
DROP TYPE IF EXISTS block_category CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS request_type CASCADE;

CREATE VIEW active_requests_with_users AS
SELECT r.request_id, r.block_id, r.type, r.title, r.description, r.image_url,
    r.visibility, r.latitude, r.longitude, r.geo_point, r.expiry_time, r.status,
    r.is_anonymous, r.created_at,
    CASE WHEN r.is_anonymous THEN NULL        ELSE u.user_id  END AS user_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous' ELSE u.name     END AS user_name,
    u.student_verified, u.college_name
FROM requests r JOIN users u ON r.user_id = u.user_id
WHERE r.status = 'OPEN' AND r.expiry_time > NOW();

CREATE VIEW block_heat_summary AS
SELECT b.block_id, b.name, b.category, b.center_lat, b.center_lng, b.heat_score,
    b.live_user_count, b.open_request_count, b.heat_updated_at, b.status,
    CASE
        WHEN b.heat_score >= 100 THEN 'fire'
        WHEN b.heat_score >= 51  THEN 'hot'
        WHEN b.heat_score >= 21  THEN 'warm'
        WHEN b.heat_score >= 6   THEN 'mild'
        ELSE 'cold'
    END AS heat_level
FROM blocks b WHERE b.status = 'ACTIVE';