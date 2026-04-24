# NearMe Connect — Complete Project Script

---

## 1. Project Overview

NearMe Connect is a location-based mobile application that connects people within verified geographic areas — such as college campuses, localities, and societies. These areas exist in two tiers: **Official Blocks** designed by admins with hard polygon boundaries, and **Unofficial Clusters** that form automatically from real user activity on the ground.

Users can raise short-lived requests for help, sports, conversation, or meetups — inside either official blocks or active unofficial clusters. Both are shown on a live map with a real-time heat score. Official blocks display as colored boundary polygons; unofficial clusters appear as soft glowing heat blobs. Entry into any area requires phone verification, and students get additional access by uploading a college ID.

---

## 2. User Types

### Verified Local
- Verified via phone OTP only
- Can see and post public requests inside any official block or active cluster
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
- Designs and draws official block boundaries on the map
- Reviews and promotes flagged unofficial clusters to official blocks
- Sets activity thresholds per block category
- Reviews college ID verifications
- Monitors heat and live activity across both blocks and clusters

---

## 3. Core Features

### 3.1 Block & Cluster System

#### Official Blocks
- Each official block is a named geographic area with a polygon boundary drawn by admin
- Blocks are visible on the home map before entering, shown as colored boundary polygons
- Each block shows a heat badge: Cold / Mild / Warm / Hot / On Fire
- Users can search for an official block by name
- Full feature access — requests, map modes (students), heat score, everything

#### Unofficial Clusters
- Form automatically when 2+ verified users are active within ~500m of each other within 15 minutes — no admin action needed
- Shown on the home map as soft glowing heat blobs with no hard boundary
- Visually distinct from official blocks — faint yellow to deep orange glow based on activity intensity
- Users inside an active cluster get full request functionality immediately — no dead zone
- Users can optionally suggest a name for a cluster; the most-used suggestion is displayed as the cluster label
- Unnamed clusters display as "Active Area"

---

### 3.2 Cluster Auto-Formation & Promotion Pipeline

**Auto-Formation**
- When 2+ verified users are active in the same area (within ~500m, within 15 minutes of each other), the system automatically creates an activity cluster centered on their GPS spread
- Cluster radius is auto-calculated from the geographic spread of active users
- No user action required — the cluster simply appears on the map
- Users inside a cluster can post requests, accept, and chat immediately

**Naming**
- Users inside an active cluster can optionally tap "Suggest a name" for it
- The most-used suggested name is displayed as the cluster label
- Naming is optional — a cluster works fully without a name

**Activity Thresholds (admin-configurable per category)**

| Category     | Unique Users | Requests | Active Days |
|--------------|-------------|----------|-------------|
| Campus       | 20+         | 10+      | 3+          |
| Locality     | 10+         | 5+       | 2+          |
| Small Lane   | 5+          | 3+       | 1+          |

**Promotion Pipeline**
- Background scheduler checks all active clusters every hour against thresholds
- When all three conditions are met for a cluster, its status changes to `flagged_for_admin`
- Admin receives a push notification: *"New area showing consistent activity — 12 users, 8 requests over 3 days — Center: 20.2961°N, 85.8245°E"*
- Admin opens the map, sees the cluster blob with a system-suggested circular boundary
- Admin can accept the auto-boundary as-is, or drag and reshape it before approving
- On approval, cluster converts to an official block — all users who were active in that cluster are notified
- Admin can dismiss a cluster if it does not qualify as a block

---

### 3.3 Heat Score System
- Heat score applies to both official blocks and unofficial clusters
- Recalculated every 2 minutes by a background scheduler
- Formula: (live users × 1.0) + (open requests × 1.5) + (new requests last hour × 0.5)
- A user counts as live if their `last_seen_at` is within 15 minutes
- Heat decays automatically when users leave — no manual cleanup needed
- **Official Blocks** — Heat levels: Cold (1–5), Mild (6–20), Warm (21–50), Hot (51–100), On Fire (100+) — shown as colored polygon fill with named badge
- **Unofficial Clusters** — Same formula but displayed as soft glow intensity (faint yellow → deep orange) with no hard boundary and no badge label
- Heat badge color and label update on frontend every 2 minutes

---

### 3.4 Verification Gate
- When a user taps any block or cluster for the first time, they hit the verification gate
- Step 1: Phone OTP — mandatory for all users
- Step 2: College ID upload — optional, unlocks student access
- Verification is one-time — stored on account permanently
- College ID is reviewed by admin or auto-checked via OCR
- Verified badge is shown on user profile and on their requests

---

### 3.5 Request System
- Request types: Help / Talk / Play / Free (available)
- Each request has: title, description, optional image, expiry time, visibility
- Requests can be posted inside an official block or inside an active unofficial cluster
- Visibility options for students: Students Only (default) / Public
- Locals can only post Public requests
- Requests auto-expire after selected duration (15 min / 1 hr / 3 hrs / custom)
- Requests are shown as pins on the map inside the block or cluster area
- Different pin icons per request type

---

### 3.6 Map Modes (Students Only)
- My Campus: shows only requests inside the student's registered campus boundary
- Nearby Campuses: shows own campus + nearby registered campuses, each with visible boundary
- Radius: shows a draggable circle — all requests (campus + public) within that radius
- Each mode clearly draws the boundary on the map so users know exactly what area they are viewing

---

### 3.7 Request Acceptance and Chat
- Any eligible user can accept a request
- On acceptance, an in-app chat thread opens between requester and accepter
- Exact location is only shared after acceptance
- Request closes automatically on completion or expiry
- Requester can close the request manually once done

---

### 3.8 Notifications
- New request near you — push notification
- Your request was accepted — push notification
- New area flagged for review (admin only) — push notification
- Your area was approved as an official block — push notification
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
- Home Map Screen — main map showing official blocks as colored polygons and unofficial clusters as glowing blobs
- Block Search Screen — search bar + list of all official blocks
- Block / Cluster Detail Screen — heat display, request feed, mode switcher (students), name suggestion option (clusters only)
- Create Request Screen — form with type, title, description, image, expiry, visibility
- Request Detail Screen — full request card + accept button
- Chat Screen — message thread after acceptance
- Chat List Screen — all active chats
- Notifications Screen
- Profile Screen — name, verification badge, request history
- Settings Screen — account, notifications, privacy
- Verification Screen — for users who skipped ID upload

### Admin Panel (Web)
- Dashboard — live stats, heat map overview showing both official blocks and active clusters
- Cluster Review Page — list of clusters flagged for promotion, with unique user count, request count, active days, and map preview with suggested boundary
- Block Editor — map with polygon drawing tool; opens pre-loaded with cluster's suggested boundary for admin to confirm or reshape
- Verification Queue — college ID review page
- User Management — search, ban, unban users
- Threshold Editor — set unique user / request / active day thresholds per block category
- Reports Page — flagged requests and reported users

---

## 5. API Endpoints

### Auth
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/upload-college-id
GET  /api/auth/me
```

### Blocks
```
GET  /api/blocks/nearby?lat=&lng=&radius=
GET  /api/blocks/search?q=
GET  /api/blocks/:id
GET  /api/blocks/:id/heat
```

### Clusters
```
GET  /api/clusters/nearby?lat=&lng=&radius=
GET  /api/clusters/:id
GET  /api/clusters/:id/heat
POST /api/clusters/:id/suggest-name
```

### Requests
```
GET  /api/requests?blockId=&clusterId=&mode=&type=
POST /api/requests
GET  /api/requests/:id
POST /api/requests/:id/accept
PATCH /api/requests/:id/close
DELETE /api/requests/:id
```

### Chat
```
GET  /api/chat/:requestId/messages
POST /api/chat/:requestId/messages
WebSocket: /ws/chat/:requestId
```

### Users
```
GET  /api/users/:id
PATCH /api/users/profile
POST /api/users/report
POST /api/users/block
```

### Admin
```
GET  /api/admin/clusters/flagged
POST /api/admin/blocks                  (approve cluster + draw boundary → creates official block)
DELETE /api/admin/clusters/:id          (dismiss cluster)
GET  /api/admin/verification-queue
PATCH /api/admin/verify/:userId
GET  /api/admin/stats
```

---

## 6. Database Tables

### users
```
user_id, name, phone, email, phone_verified, student_verified, college_name,
college_id_url, verification_status, campus_block_id, created_at, last_seen_at
```

### blocks
```
block_id, name, category, geo_polygon (PostGIS geometry), heat_score,
live_user_count, open_request_count, heat_updated_at, status,
created_by_admin, created_at
```

### activity_clusters
```
cluster_id
center_lat, center_lng
radius_meters              -- auto-calculated from spread of active users
suggested_name             -- most-used name submitted by users in this cluster
unique_user_count
request_count
active_days
heat_score
status                     -- forming / active / flagged_for_admin / converted / dismissed
flagged_at
converted_to_block_id      -- null until promoted to official block
created_at
last_active_at
```

### requests
```
request_id, user_id, block_id, cluster_id,     -- cluster_id added, nullable
type, title, description, image_url, visibility,
latitude, longitude, expiry_time, status, created_at

-- block_id is null when request is inside an unofficial cluster
-- cluster_id is null when request is inside an official block
```

### acceptances
```
acceptance_id, request_id, accepted_user_id, status, accepted_at
```

### chat_messages
```
chat_id, request_id, sender_id, message, sent_at
```

---

## 7. Technology Stack

| Layer               | Technology                        |
|---------------------|-----------------------------------|
| Mobile Frontend     | React Native                      |
| Maps                | Google Maps SDK                   |
| State Management    | Redux Toolkit or Zustand          |
| Backend             | Spring Boot (Java)                |
| Authentication      | JWT + Firebase Auth               |
| Database            | PostgreSQL + PostGIS extension    |
| Real-time Chat      | Firebase Realtime Database        |
| Push Notifications  | Firebase Cloud Messaging (FCM)    |
| Image Storage       | Firebase Storage                  |
| Background Jobs     | Spring Scheduler                  |
| Admin Panel         | React (web)                       |
| Backend Hosting     | Render or AWS EC2                 |
| Database Hosting    | Supabase or AWS RDS               |

---

## 8. Development Phases

### Phase 1 — Core MVP (6–8 weeks)
- User auth with phone OTP
- Official block display on map with polygon boundary
- Request creation and feed inside official blocks
- PostGIS geo queries for nearby blocks and requests
- Basic request acceptance flow

### Phase 2 — Heat + Verification (3–4 weeks)
- Heat score calculator and scheduler for official blocks
- Heat badge on blocks
- Phone + college ID verification gate
- Student vs local access rules
- Mode switcher (My Campus / Nearby / Radius)

### Phase 3 — Chat + Notifications (2–3 weeks)
- Firebase real-time chat after acceptance
- Push notifications via FCM
- Chat list screen

### Phase 4 — Cluster System (2–3 weeks)
- GPS-based auto cluster formation when 2+ users are nearby
- Cluster heat score calculation and blob rendering on map
- User name suggestion flow for clusters
- Requests inside unofficial clusters
- Background scheduler checking activity thresholds per cluster per category
- Admin flagging notification when thresholds are met
- Cluster-to-block promotion flow with boundary suggestion pre-loaded in block editor

### Phase 5 — Admin Panel (2 weeks)
- Full admin web dashboard
- Cluster review page with map preview and suggested boundary
- Block editor with polygon drawing tool
- Verification queue
- Threshold editor per block category
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
- Cluster formation is passive — users do not submit GPS explicitly; it is derived from in-app activity only
- GPS data used for cluster formation is never exposed to other users
- Admin can dismiss any cluster or remove any official block at any time
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