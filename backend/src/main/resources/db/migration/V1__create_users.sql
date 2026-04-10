-- V1__create_users.sql
-- Flyway migration — run automatically by Spring Boot on startup

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_status         AS ENUM ('active', 'banned', 'deleted');
CREATE TYPE verification_status AS ENUM ('none', 'pending', 'approved', 'rejected');

CREATE TABLE users (
    user_id             UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100)    NOT NULL,
    phone               VARCHAR(20)     UNIQUE NOT NULL,
    email               VARCHAR(150)    UNIQUE,
    phone_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    student_verified    BOOLEAN         NOT NULL DEFAULT FALSE,
    college_name        VARCHAR(200),
    college_id_url      TEXT,
    verification_status verification_status NOT NULL DEFAULT 'none',
    campus_block_id     UUID,
    status              user_status     NOT NULL DEFAULT 'active',
    fcm_token           TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_seen_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone            ON users(phone);
CREATE INDEX idx_users_status           ON users(status);
CREATE INDEX idx_users_student_verified ON users(student_verified);
CREATE INDEX idx_users_verification     ON users(verification_status);
CREATE INDEX idx_users_last_seen        ON users(last_seen_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();