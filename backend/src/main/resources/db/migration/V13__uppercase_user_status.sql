-- V13__uppercase_user_status.sql

ALTER TABLE users
    ALTER COLUMN status TYPE VARCHAR(50) USING UPPER(status::text);

ALTER TABLE users
    ALTER COLUMN verification_status TYPE VARCHAR(50) USING UPPER(verification_status::text);

DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;