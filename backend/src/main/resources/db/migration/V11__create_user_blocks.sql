CREATE TABLE IF NOT EXISTS user_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (blocker_id, blocked_id)
);