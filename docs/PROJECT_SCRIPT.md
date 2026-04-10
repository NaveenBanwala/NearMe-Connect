# NearMe Connect — Complete Project Script

---

## 1. Project Overview

NearMe Connect is a location-based mobile application that connects people within verified geographic blocks — such as college campuses, localities, and societies. Users can raise short-lived requests for help, sports, conversation, or meetups. Blocks are shown on a live map with a real-time heat score based on active users. Entry into any block requires phone verification, and students get additional access by uploading a college ID.

---

## 2. User Types

### Verified Local
- Verified via phone OTP only
- Can see and post public requests inside any block
- Cannot access campus feeds
- No mode switching

### Verified Student
- Verified via phone OTP + college ID upload
- Can switch between My Campus, Nearby Campuses, and Radius modes
- Can see campus-only requests
- Can choose to include local public feed
- Can set visibility on their own posts (students only / public)

### Admin
- Web dashboard only
- Approves or rejects block requests
- Draws block boundaries on map
- Sets vote thresholds per block category
- Reviews college ID verifications
- Monitors heat and live activity

---

## 3. Core Features

### 3.1 Block System
- Each block is a named geographic area with a polygon boundary drawn by admin
- Blocks are visible on the home map before entering
- Each block shows a heat badge: Cold / Mild / Warm / Hot / On Fire
- Users can search for a block by name
- Users can vote to request a new block if their area is not listed

### 3.2 Block Voting System
- Any verified user can tap "Request this as a block" if their area has no block
- They name it and submit — this creates or increments a vote cluster
- GPS is checked at time of voting — only users physically near the area can vote
- One vote per user per cluster — no spam voting
- Vote progress is visible to all voters as a progress bar
- When votes reach the admin-set threshold, admin is notified
- Admin reviews, draws boundary, approves or rejects
- All voters are notified when block goes live or is declined
- Thresholds are set per category: campus needs more votes than a small lane

### 3.3 Heat Score System
- Heat score is recalculated every 2 minutes by a background scheduler
- Formula: (live users × 1.0) + (open requests × 1.5) + (new requests last hour × 0.5)
- A user counts as live if their last_seen_at is within 15 minutes
- Heat decays automatically when users leave — no manual cleanup needed
- Heat levels: Cold (1–5), Mild (6–20), Warm (21–50), Hot (51–100), On Fire (100+)
- Heat badge color and label update on frontend every 2 minutes

### 3.4 Verification Gate
- When a user taps any block for the first time, they hit the verification gate
- Step 1: Phone OTP — mandatory for all users
- Step 2: College ID upload — optional, unlocks student access
- Verification is one-time — stored on account permanently
- College ID is reviewed by admin or auto-checked via OCR
- Verified badge is shown on user profile and on their requests

### 3.5 Request System
- Request types: Help / Talk / Play / Free (available)
- Each request has: title, description, optional image, expiry time, visibility
- Visibility options for students: Students Only (default) / Public
- Locals can only post Public requests
- Requests auto-expire after selected duration (15 min / 1 hr / 3 hrs / custom)
- Requests are shown as pins on the map inside the block
- Different pin icons per request type

### 3.6 Map Modes (Students Only)
- My Campus: shows only requests inside the student's registered campus boundary
- Nearby Campuses: shows own campus + nearby registered campuses, each with visible boundary
- Radius: shows a draggable circle — all requests (campus + public) within that radius
- Each mode clearly draws the boundary on the map so users know exactly what area they are viewing

### 3.7 Request Acceptance and Chat
- Any eligible user can accept a request
- On acceptance, an in-app chat thread opens between requester and accepter
- Exact location is only shared after acceptance
- Request closes automatically on completion or expiry
- Requester can close the request manually once done

### 3.8 Notifications
- New request near you — push notification
- Your request was accepted — push notification
- Block vote reached threshold — push notification
- Your block request was approved or declined — push notification
- Expiry warning — push notification 10 minutes before your request expires

---

## 4. Screen List

### Auth Flow
- Splash Screen
- Onboarding Screen (3 slides explaining the app)
- Login Screen (phone number entry)
- OTP Verification Screen
- College ID Upload Screen (skippable)

### Main App
- Home Map Screen — main map with blocks shown as colored areas
- Block Search Screen — search bar + list of all blocks
- Block Detail Screen — heat badge, request feed, mode switcher (students)
- Create Request Screen — form with type, title, description, image, expiry, visibility
- Request Detail Screen — full request card + accept button
- Chat Screen — message thread after acceptance
- Chat List Screen — all active chats
- Notifications Screen
- Profile Screen — name, verification badge, request history
- Settings Screen — account, notifications, privacy
- Verification Screen — for users who skipped ID upload

### Admin Panel (Web)
- Dashboard — live stats, heat map overview
- Block Requests Page — list of pending vote clusters with vote counts
- Block Editor — map with polygon drawing tool to set boundary
- Verification Queue — college ID review page
- User Management — search, ban, unban users
- Threshold Editor — set vote count needed per block category
- Reports Page — flagged requests and reported users

---

## 5. API Endpoints

### Auth
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/upload-college-id
- GET  /api/auth/me

### Blocks
- GET  /api/blocks/nearby?lat=&lng=&radius=
- GET  /api/blocks/search?q=
- GET  /api/blocks/:id
- GET  /api/blocks/:id/heat
- POST /api/blocks/vote
- GET  /api/blocks/vote/status?clusterId=

### Requests
- GET  /api/requests?blockId=&mode=&type=
- POST /api/requests
- GET  /api/requests/:id
- POST /api/requests/:id/accept
- PATCH /api/requests/:id/close
- DELETE /api/requests/:id

### Chat
- GET  /api/chat/:requestId/messages
- POST /api/chat/:requestId/messages
- WebSocket: /ws/chat/:requestId

### Users
- GET  /api/users/:id
- PATCH /api/users/profile
- POST /api/users/report
- POST /api/users/block

### Admin
- GET  /api/admin/vote-clusters
- POST /api/admin/blocks (approve + create block)
- DELETE /api/admin/vote-clusters/:id (reject)
- GET  /api/admin/verification-queue
- PATCH /api/admin/verify/:userId
- GET  /api/admin/stats

---

## 6. Database Tables

### users
user_id, name, phone, email, phone_verified, student_verified, college_name, college_id_url, verification_status, campus_block_id, created_at, last_seen_at

### blocks
block_id, name, category, geo_polygon (PostGIS geometry), heat_score, live_user_count, open_request_count, heat_updated_at, status, created_by_admin, created_at

### requests
request_id, user_id, block_id, type, title, description, image_url, visibility, latitude, longitude, expiry_time, status, created_at

### acceptances
acceptance_id, request_id, accepted_user_id, status, accepted_at

### chat_messages
chat_id, request_id, sender_id, message, sent_at

### location_requests (voting)
cluster_id, suggested_name, geo_lat, geo_lng, category, vote_count, threshold_required, status, admin_notes, created_at, approved_at

### location_votes
vote_id, user_id, cluster_id, user_lat, user_lng, voted_at

---

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native |
| Maps | Google Maps SDK |
| State Management | Redux Toolkit or Zustand |
| Backend | Spring Boot (Java) |
| Authentication | JWT + Firebase Auth |
| Database | PostgreSQL + PostGIS extension |
| Real-time Chat | Firebase Realtime Database |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Image Storage | Firebase Storage |
| Background Jobs | Spring Scheduler |
| Admin Panel | React (web) |
| Backend Hosting | Render or AWS EC2 |
| Database Hosting | Supabase or AWS RDS |

---

## 8. Development Phases

### Phase 1 — Core MVP (6–8 weeks)
- User auth with phone OTP
- Block display on map with boundary
- Request creation and feed
- PostGIS geo queries for nearby blocks and requests
- Basic request acceptance flow

### Phase 2 — Heat + Verification (3–4 weeks)
- Heat score calculator and scheduler
- Heat badge on blocks
- Phone + college ID verification gate
- Student vs local access rules
- Mode switcher (My Campus / Nearby / Radius)

### Phase 3 — Chat + Notifications (2–3 weeks)
- Firebase real-time chat after acceptance
- Push notifications via FCM
- Chat list screen

### Phase 4 — Block Voting System (2–3 weeks)
- Vote cluster creation from user GPS
- Vote counting and threshold check
- Admin notification and approval flow
- Boundary drawing tool in admin panel

### Phase 5 — Admin Panel (2 weeks)
- Full admin web dashboard
- Verification queue
- Block management
- Stats and reports

### Phase 6 — Polish + Launch (2 weeks)
- Performance optimization
- Onboarding screens
- App Store / Play Store submission
- First campus launch (KIIT)

---

## 9. Safety and Privacy Rules

- No exact location shown until request is accepted
- Anonymous posting option for sensitive requests
- Report and block system for users
- Requests auto-expire — no permanent public posts
- GPS verified at vote time — no remote vote abuse
- One vote per user per location cluster
- Admin can remove any block or request at any time
- Student ID images stored encrypted and only visible to admin

---

## 10. Future Features

- AI matching — suggest requests you are most likely to help with
- Reputation and rating system after each completed request
- Event-mode blocks — temporary blocks for fests and events
- Inter-campus mode — students from partner colleges can connect
- Trial blocks — 30-day auto blocks that go permanent based on activity
- Heatmap analytics dashboard for admins
- NGO and emergency service integration
