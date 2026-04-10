-- V10__add_admin_flag.sql

-- V10__add_admin_flag.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users SET is_admin = TRUE WHERE phone = '+919518147540';

INSERT INTO users (name, phone, phone_verified, is_admin)
VALUES ('Super Admin', '+919518147540', TRUE, TRUE)
ON CONFLICT (phone) DO UPDATE SET is_admin = TRUE;