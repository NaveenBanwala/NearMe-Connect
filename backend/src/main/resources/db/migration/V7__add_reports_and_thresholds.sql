-- V7__add_reports_and_thresholds.sql

DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('USER', 'REQUEST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS reports (
    report_id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by         UUID          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    against_type        report_type   NOT NULL,
    against_user_id     UUID          REFERENCES users(user_id) ON DELETE SET NULL,
    against_request_id  UUID          REFERENCES requests(request_id) ON DELETE SET NULL,
    reason              TEXT          NOT NULL,
    status              report_status NOT NULL DEFAULT 'OPEN',
    admin_notes         TEXT,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    CONSTRAINT chk_report_target CHECK (
        (against_type = 'USER'    AND against_user_id    IS NOT NULL) OR
        (against_type = 'REQUEST' AND against_request_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_reports_status     ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

CREATE TABLE IF NOT EXISTS block_thresholds (
    category    VARCHAR(20)  PRIMARY KEY,
    threshold   INTEGER      NOT NULL DEFAULT 25,
    description VARCHAR(300)
);

INSERT INTO block_thresholds (category, threshold, description) VALUES
  ('CAMPUS',   50, 'Large university or college campus'),
  ('LOCALITY', 25, 'Residential or commercial locality'),
  ('SOCIETY',  20, 'Gated society or housing complex'),
  ('MARKET',   30, 'Market area or shopping complex')
ON CONFLICT (category) DO NOTHING;