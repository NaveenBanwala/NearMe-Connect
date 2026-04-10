-- V4__create_chat.sql

CREATE TABLE chat_messages (
    chat_id     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id  UUID        NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    sender_id   UUID        NOT NULL REFERENCES users(user_id)       ON DELETE CASCADE,
    message     TEXT        NOT NULL,
    is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_request_id ON chat_messages(request_id);
CREATE INDEX idx_chat_sender_id  ON chat_messages(sender_id);
CREATE INDEX idx_chat_sent_at    ON chat_messages(sent_at ASC);
CREATE INDEX idx_chat_is_read    ON chat_messages(is_read) WHERE is_read = FALSE;