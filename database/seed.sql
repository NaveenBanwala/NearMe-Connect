-- ============================================================
-- NearMe Connect — Seed Data
-- Run AFTER schema.sql
-- psql -U postgres -d nearme -f seed.sql
-- ============================================================

-- ============================================================
-- SEED: blocks (with real Bhubaneswar coordinates)
-- ============================================================

INSERT INTO blocks (block_id, name, category, geo_polygon, center_lat, center_lng, heat_score, live_user_count, open_request_count, status, created_by_admin) VALUES

-- KIIT University Campus
(
    'b1000000-0000-0000-0000-000000000001',
    'KIIT Campus',
    'campus',
    ST_GeomFromText('POLYGON((
        85.8150 20.2900,
        85.8280 20.2900,
        85.8280 20.3020,
        85.8150 20.3020,
        85.8150 20.2900
    ))', 4326),
    20.2961, 85.8215,
    142, 142, 23,
    'active',
    'a0000000-0000-0000-0000-000000000001'
),

-- Salt Lake Sector V
(
    'b1000000-0000-0000-0000-000000000002',
    'Salt Lake Sector V',
    'locality',
    ST_GeomFromText('POLYGON((
        85.8100 20.3400,
        85.8200 20.3400,
        85.8200 20.3550,
        85.8100 20.3550,
        85.8100 20.3400
    ))', 4326),
    20.3467, 85.8147,
    34, 34, 8,
    'active',
    'a0000000-0000-0000-0000-000000000001'
),

-- New Town Block 1
(
    'b1000000-0000-0000-0000-000000000003',
    'New Town Block 1',
    'locality',
    ST_GeomFromText('POLYGON((
        85.8120 20.3500,
        85.8220 20.3500,
        85.8220 20.3620,
        85.8120 20.3620,
        85.8120 20.3500
    ))', 4326),
    20.3553, 85.8169,
    3, 3, 1,
    'active',
    'a0000000-0000-0000-0000-000000000001'
),

-- NISER Campus
(
    'b1000000-0000-0000-0000-000000000004',
    'NISER Campus',
    'campus',
    ST_GeomFromText('POLYGON((
        85.0940 20.1480,
        85.1060 20.1480,
        85.1060 20.1580,
        85.0940 20.1580,
        85.0940 20.1480
    ))', 4326),
    20.1530, 85.1000,
    67, 67, 12,
    'active',
    'a0000000-0000-0000-0000-000000000001'
),

-- IIT Bhubaneswar
(
    'b1000000-0000-0000-0000-000000000005',
    'IIT Bhubaneswar',
    'campus',
    ST_GeomFromText('POLYGON((
        85.6620 20.1490,
        85.6740 20.1490,
        85.6740 20.1590,
        85.6620 20.1590,
        85.6620 20.1490
    ))', 4326),
    20.1540, 85.6680,
    89, 89, 17,
    'active',
    'a0000000-0000-0000-0000-000000000001'
),

-- Patia Society
(
    'b1000000-0000-0000-0000-000000000006',
    'Patia Society',
    'society',
    ST_GeomFromText('POLYGON((
        85.8240 20.3420,
        85.8310 20.3420,
        85.8310 20.3500,
        85.8240 20.3500,
        85.8240 20.3420
    ))', 4326),
    20.3460, 85.8275,
    21, 21, 4,
    'active',
    'a0000000-0000-0000-0000-000000000001'
);

-- ============================================================
-- SEED: users
-- ============================================================

INSERT INTO users (user_id, name, phone, email, phone_verified, student_verified, college_name, verification_status, campus_block_id, status) VALUES

-- Verified student at KIIT
(
    'u1000000-0000-0000-0000-000000000001',
    'Arjun Patra',
    '+919876543210',
    'arjun@kiit.ac.in',
    TRUE, TRUE,
    'KIIT University',
    'approved',
    'b1000000-0000-0000-0000-000000000001',
    'active'
),

-- Verified student at NISER
(
    'u1000000-0000-0000-0000-000000000002',
    'Priya Mohanty',
    '+918765432109',
    'priya@niser.ac.in',
    TRUE, TRUE,
    'NISER',
    'approved',
    'b1000000-0000-0000-0000-000000000004',
    'active'
),

-- Verified local (no student)
(
    'u1000000-0000-0000-0000-000000000003',
    'Ravi Kumar',
    '+917654321098',
    NULL,
    TRUE, FALSE,
    NULL,
    'none',
    NULL,
    'active'
),

-- Pending student verification
(
    'u1000000-0000-0000-0000-000000000004',
    'Sneha Das',
    '+916543210987',
    'sneha@iitbbs.ac.in',
    TRUE, FALSE,
    'IIT Bhubaneswar',
    'pending',
    NULL,
    'active'
),

-- Verified student at KIIT
(
    'u1000000-0000-0000-0000-000000000005',
    'Amit Sahoo',
    '+915432109876',
    'amit@kiit.ac.in',
    TRUE, TRUE,
    'KIIT University',
    'approved',
    'b1000000-0000-0000-0000-000000000001',
    'active'
),

-- Banned user
(
    'u1000000-0000-0000-0000-000000000006',
    'Deepthi Nair',
    '+914321098765',
    NULL,
    TRUE, FALSE,
    NULL,
    'none',
    NULL,
    'banned'
);

-- ============================================================
-- SEED: requests
-- ============================================================

INSERT INTO requests (request_id, user_id, block_id, type, title, description, visibility, latitude, longitude, geo_point, expiry_time, status) VALUES

-- Help request inside KIIT
(
    'r1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'help',
    'Need help carrying stuff from hostel',
    'Moving some boxes from D1 hostel to academic block. 10 mins work.',
    'students_only',
    20.2961, 85.8215,
    ST_SetSRID(ST_MakePoint(85.8215, 20.2961), 4326),
    NOW() + INTERVAL '2 hours',
    'open'
),

-- Play request inside KIIT
(
    'r1000000-0000-0000-0000-000000000002',
    'u1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000001',
    'play',
    'Need 2 players for badminton',
    'Court near sports complex. Rackets available. Just come.',
    'students_only',
    20.2950, 85.8200,
    ST_SetSRID(ST_MakePoint(85.8200, 20.2950), 4326),
    NOW() + INTERVAL '1 hour',
    'open'
),

-- Talk request — public inside KIIT
(
    'r1000000-0000-0000-0000-000000000003',
    'u1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'talk',
    'Anyone free to chat near cafeteria?',
    'Feeling a bit low. Just want to talk to someone.',
    'public',
    20.2970, 85.8220,
    ST_SetSRID(ST_MakePoint(85.8220, 20.2970), 4326),
    NOW() + INTERVAL '30 minutes',
    'open'
),

-- Local help request in Salt Lake
(
    'r1000000-0000-0000-0000-000000000004',
    'u1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000002',
    'help',
    'Need directions to CBI office',
    'New to the area. Can someone guide me?',
    'public',
    20.3467, 85.8147,
    ST_SetSRID(ST_MakePoint(85.8147, 20.3467), 4326),
    NOW() + INTERVAL '15 minutes',
    'open'
),

-- Free / available at NISER
(
    'r1000000-0000-0000-0000-000000000005',
    'u1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000004',
    'free',
    'Free for next 1 hour — up for anything!',
    'Near main gate. Can join for walk, food, or just chat.',
    'students_only',
    20.1530, 85.1000,
    ST_SetSRID(ST_MakePoint(85.1000, 20.1530), 4326),
    NOW() + INTERVAL '1 hour',
    'open'
);

-- ============================================================
-- SEED: acceptances
-- ============================================================

INSERT INTO acceptances (acceptance_id, request_id, accepted_user_id, status, accepted_at) VALUES
(
    'ac100000-0000-0000-0000-000000000001',
    'r1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000005',
    'active',
    NOW() - INTERVAL '5 minutes'
);

-- ============================================================
-- SEED: chat_messages
-- ============================================================

INSERT INTO chat_messages (request_id, sender_id, message, sent_at) VALUES
(
    'r1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000005',
    'Hey! I can help. Where exactly in D1 hostel?',
    NOW() - INTERVAL '4 minutes'
),
(
    'r1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000001',
    'Ground floor, room 104. Come from the main entrance.',
    NOW() - INTERVAL '3 minutes'
),
(
    'r1000000-0000-0000-0000-000000000001',
    'u1000000-0000-0000-0000-000000000005',
    'On my way, 5 mins.',
    NOW() - INTERVAL '2 minutes'
);

-- ============================================================
-- SEED: location_requests (vote clusters)
-- ============================================================

INSERT INTO location_requests (cluster_id, suggested_name, geo_lat, geo_lng, geo_point, category, vote_count, unique_voter_count, threshold_required, status) VALUES
(
    'cl100000-0000-0000-0000-000000000001',
    'Xavier Institute of Management',
    20.2961, 85.8245,
    ST_SetSRID(ST_MakePoint(85.8245, 20.2961), 4326),
    'campus',
    47, 44, 50,
    'pending'
),
(
    'cl100000-0000-0000-0000-000000000002',
    'Patia Market',
    20.3467, 85.8147,
    ST_SetSRID(ST_MakePoint(85.8147, 20.3467), 4326),
    'market',
    28, 26, 30,
    'pending'
),
(
    'cl100000-0000-0000-0000-000000000003',
    'Infocity Tech Park',
    20.3553, 85.8169,
    ST_SetSRID(ST_MakePoint(85.8169, 20.3553), 4326),
    'locality',
    19, 18, 25,
    'pending'
);

-- ============================================================
-- SEED: reports
-- ============================================================

INSERT INTO reports (reported_by, against_type, against_user_id, reason, status) VALUES
(
    'u1000000-0000-0000-0000-000000000001',
    'user',
    'u1000000-0000-0000-0000-000000000006',
    'Sending spam requests multiple times a day',
    'open'
);