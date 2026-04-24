# 🚀 NearMe Connect

**NearMe Connect** is a real-time, location-based social platform that connects people within **micro-geographic clusters** such as campuses, villages, markets, and neighborhoods.

Unlike traditional social apps, it focuses on **hyperlocal interaction**, enabling users to request help, connect, and collaborate with people **physically nearby**.

---

## 🌍 Core Idea

> Connect people **based on proximity, not followers.**

* Real-time map-based interactions
* Temporary, intent-driven requests
* Privacy-first architecture
* Dynamic **AI-driven cluster formation**

---

## 🔥 Key Innovation: Dynamic Cluster System

Traditional apps rely on **manually created regions**.

NearMe Connect introduces:

### 🧠 Smart Cluster Formation

* User activity automatically creates **temporary clusters**
* Based on:

  * GPS proximity
  * Request density
  * Active users

### 🔴 Heat-Based Growth

* Clusters grow dynamically as activity increases
* Color changes from:

  * Low → Yellow → Orange → 🔥 Red
* Size and intensity reflect **real-world engagement**

### 🏛️ Admin Approval Layer

* High-activity clusters become **eligible for promotion**
* Admin can:

  * Approve cluster
  * Assign name
  * Define boundary
* Converts into permanent **Block**

---

## 📍 Block System (Admin + System Driven)

Blocks are **verified geographic zones** like:

* Colleges (e.g., campus zones)
* Villages
* Markets
* Societies

### Two Ways Blocks Are Created:

1. ✅ Admin manually creates
2. 🤖 System suggests via cluster growth

---

## 📝 Request System

Users can create short-lived requests:

* Help (e.g., bike issue)
* Talk
* Play
* Free (custom)

### Features:

* Expiry-based (15 mins → custom)
* Location-based visibility
* Optional image
* Privacy protected

---

## 🔐 Privacy & Safety

### 🛡️ Location Protection

* Exact location **hidden by default**
* Shared only after request acceptance

### 🚨 Safe Mode

* Instantly hides:

  * Location
  * Requests
  * Visibility

---

## 💬 Real-Time Chat

* Activated only after request acceptance
* Built using:

  * WebSockets / Firebase
* Secure + context-based conversations

---

## 🗺️ Live Map Experience

Users can:

* See nearby requests
* View active clusters
* Explore nearby blocks
* Switch between map modes

---

## 🔔 Notifications

* New nearby activity
* Request accepted
* Cluster promoted
* Request expiry alerts

---

## 🧑‍💻 Tech Stack

| Layer       | Technology            |
| ----------- | --------------------- |
| Frontend    | React                 |
| Admin Panel | React                 |
| Backend     | Spring Boot           |
| Database    | PostgreSQL + PostGIS  |
| Auth        | JWT + Firebase        |
| Realtime    | WebSockets / Firebase |
| Storage     | Firebase Storage      |
| DevOps      | Docker, AWS, Jenkins  |

---

## 🧠 System Architecture Highlights

* Spatial queries using **PostGIS**
* Background jobs:

  * Cluster formation
  * Heat updates
* Event-driven design
* Modular service architecture

---

## 🏗️ Core Modules

### 🔹 Cluster Engine

* Detects activity hotspots
* Creates dynamic clusters
* Triggers promotion logic

### 🔹 Heat Engine

* Updates every 2 minutes
* Based on:

  * Active users
  * Requests
  * Interaction

### 🔹 Admin Panel

* Review clusters
* Approve / reject
* Visualize user density

---

## 📸 Screenshots

*(Keep your images — they are strong proof of work)*

---

## 🚀 Status

✅ Fully functional
✅ All major features tested
✅ Production-ready architecture

---

## 🔮 Future Scope

* AI-based intent prediction
* Smart recommendations
* Monetization via local businesses
* Hyperlocal marketplace integration

---

## 👨‍💻 Author

**Naveen Banwala**
B.Tech CSE | Backend + System Design Focus

---

## ⭐ Why This Project Stands Out

* Not a clone — **new interaction model**
* Real-world problem solving (hyperlocal connectivity)
* Strong backend + system design
* Scalable architecture with spatial intelligence

---



# 🚀 NearMe Connect

**NearMe Connect** is a location-based real-time social application that connects people within verified geographic blocks such as campuses, societies, and neighborhoods.

Users can post short-lived requests (help, talk, play, etc.), discover nearby activity on a live map, and interact securely through verified identity and controlled visibility.

Admin- can make cluster if they want to launch their website in particular areaa  based on location VILLAGE, CAMPUS, MARKET,LOCALITY etc.. like in KIIT so he can create many blocks like on KIIT road with different design  or on campus 25 on another design(You can see in images).

Admin can make these blocks by own and this are visible to other neaby user which looks good and can request for anything kind. 

AND ****
Like Admin cannot create all blocks by own so-- 
if someone user do actitity in others area they coordinates are **captured** and on that locations temprory circle which can be grown as per location/ user increases and its color of that area also increase to red as per user request grown and also it size also dynamically increase.
Which indicates there is more users .

***
After capturing there coordinates-- which this happens for a limit then In admin(have a option to approve or rejecrt) panel have a request is generate to make that place as a block by own desigm.

# Exact Location is not shown before requested user confirmation


##  SAFE MODE is there 
if Anybody feels not good then that user have option immediately on safe mode so its location, request and anything will disapper 

# Request in Particualr block by someone need bike help
<img width="500" height="835" alt="image" src="https://github.com/user-attachments/assets/266f325e-b5cf-4e2e-8fd5-f509bdba2a97" />

Anybody can accept and can chat with them other user also have option 


---
#EVery things is working good- i am etsted all the features

# REQUEST IN USER PANEL NEARBY
<img width="513" height="848" alt="image" src="https://github.com/user-attachments/assets/25ed6731-ee08-4100-8351-409a0eadb5d9" />



ADMIN-PANEL-IMAGES
<img width="1919" height="1062" alt="image" src="https://github.com/user-attachments/assets/fb57a5bc-b7f7-4387-9e6b-861ed1f77197" />

<img width="1909" height="836" alt="image" src="https://github.com/user-attachments/assets/a8c5a4c3-5ed5-4de4-9be5-a6a3fa826f0a" />

<img width="1888" height="830" alt="image" src="https://github.com/user-attachments/assets/d6d6b7ab-3cf6-412a-9e5c-5be72d3d44b8" />

# Option to SEE NEABY BlOCKS

<img width="520" height="841" alt="image" src="https://github.com/user-attachments/assets/f0d3a895-2296-44de-88d3-4fc2fb71c8f1" />


MY ViLLAGE CLUSTER
<img width="1903" height="817" alt="image" src="https://github.com/user-attachments/assets/354ed043-762b-4759-b6e1-712fbcb640a9" />

BLOCKS SEARCHING
<img width="514" height="820" alt="image" src="https://github.com/user-attachments/assets/e041daff-3c03-4dd2-a87b-d5ede2e9de1a" />



KIIT
UNIVERSITY -CLUSTER
<img width="1913" height="845" alt="image" src="https://github.com/user-attachments/assets/f5c0e147-c9ee-4a7c-b183-3593207f9f30" />


# USER-SIDE-IMAGES

#Side Side Blocks/Clusters which is created by admin
<img width="1919" height="843" alt="image" src="https://github.com/user-attachments/assets/24ffbda5-d10b-42f5-bed9-95072e91a3c2" />

<img width="877" height="822" alt="image" src="https://github.com/user-attachments/assets/c400a846-46b6-43e5-aff9-b7a232579592" />

#Help for BIke
<img width="969" height="843" alt="image" src="https://github.com/user-attachments/assets/1f75798e-ea6d-4420-aaa7-d8dfa6b918da" />

# CHAT Page
<img width="501" height="824" alt="image" src="https://github.com/user-attachments/assets/16cbb87d-4942-4da6-9922-4339c6568a83" />

#SETTINGS
<img width="403" height="837" alt="image" src="https://github.com/user-attachments/assets/1e4238fb-01aa-4c74-aa85-bc33e88a8170" />

#PROFILE
<img width="387" height="830" alt="image" src="https://github.com/user-attachments/assets/f055d422-7939-4e53-8017-4310215993bb" />







<img width="1310" height="843" alt="image" src="https://github.com/user-attachments/assets/e7d4d2b3-e024-4f85-86f4-9808d42d49ba" />




## 🌍 Key Idea

> Connect people **within proximity**, not globally.

- Real-time **map-based interaction**
- **Verified communities** (OTP + College ID)
- **Temporary requests** instead of permanent posts
- **Privacy-first design** (no location until acceptance)

---

## ✨ Core Features

### 📍 Block-Based System
- Geographic areas defined as **blocks (polygons)**
- Each block shows a **live heat score**
- Search and discover nearby blocks
- Request new blocks via voting system

---

### 🔥 Heat Score System
- Updated every 2 minutes
- Based on:
  - Active users
  - Open requests
  - Recent activity
- Levels:
  - Cold ❄️ → On Fire 🔥

---

### ✅ Verification System
- Phone OTP (mandatory)
- College ID (optional → unlocks student features)
- Verified badge for trusted users

---

### 📝 Request System
- Types: Help | Talk | Play | Free
- Features:
  - Expiry-based (15 min → custom)
  - Map-based pins
  - Visibility control (students/public)
  - Optional image upload

---

### 💬 Real-Time Chat
- Chat opens only after request acceptance
- Built using WebSockets / Firebase
- Location shared only after acceptance

---

### 🗳️ Block Voting System
- Users request new blocks
- GPS-based voting (anti-spam)
- Threshold-based approval
- Admin draws final boundary

---

### 🗺️ Smart Map Modes (Students)
- My Campus
- Nearby Campuses
- Radius-based exploration

---

### 🔔 Notifications
- New nearby requests
- Request accepted
- Vote threshold reached
- Request expiry alerts

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|------|-----------|
| Web App | React(frontend) |
| Admin Panel | React (Web) |
| Backend | Spring Boot (Java) |
| Database | PostgreSQL + PostGIS |
| Authentication | JWT + Firebase Auth |
| Real-time Chat | Firebase / WebSockets |
| Notifications | Firebase Cloud Messaging |
| Storage | Firebase Storage |
| DevOps | Docker, AWS|
| JENkins

---

## 🏗️ Project Structure
(This folder Structure may vary slightly)
nearme-connect/
│
├── frontend/                          
│   ├── src/
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   │   ├── pin-help.svg
│   │   │   │   ├── pin-play.svg
│   │   │   │   ├── pin-talk.svg
│   │   │   │   ├── pin-free.svg
│   │   │   │   ├── fire.svg
│   │   │   │   └── verified-badge.svg
│   │   │   ├── images/
│   │   │   │   └── logo.png
│   │   │   └── fonts/
│   │   │
│   │   ├── components/
│   │   │   ├── map/
│   │   │   │   ├── MapView.jsx
│   │   │   │   ├── BlockBoundary.jsx
│   │   │   │   ├── RequestPin.jsx
│   │   │   │   ├── HeatBadge.jsx
│   │   │   │   ├── RadiusCircle.jsx
│   │   │   │   └── ModeSwitcher.jsx
│   │   │   │
│   │   │   ├── blocks/
│   │   │   │   ├── BlockCard.jsx
│   │   │   │   ├── BlockSearchBar.jsx
│   │   │   │   ├── BlockList.jsx
│   │   │   │   ├── BlockVoteButton.jsx
│   │   │   │   └── VoteProgressBar.jsx
│   │   │   │
│   │   │   ├── requests/
│   │   │   │   ├── RequestCard.jsx
│   │   │   │   ├── RequestFeed.jsx
│   │   │   │   ├── CreateRequestSheet.jsx
│   │   │   │   ├── RequestTypeSelector.jsx
│   │   │   │   ├── VisibilityToggle.jsx
│   │   │   │   ├── ExpirySelector.jsx
│   │   │   │   └── RequestFilters.jsx
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── ChatScreen.jsx
│   │   │   │   ├── ChatBubble.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   └── ChatList.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── PhoneOTPScreen.jsx
│   │   │   │   ├── OTPInput.jsx
│   │   │   │   ├── CollegeIDUpload.jsx
│   │   │   │   ├── VerificationGate.jsx
│   │   │   │   └── VerificationBadge.jsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── BottomSheet.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── Avatar.jsx
│   │   │       ├── Pill.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── EmptyState.jsx
│   │   │
│   │   ├── screens/
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── OnboardingScreen.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── HomeMapScreen.jsx
│   │   │   ├── BlockSearchScreen.jsx
│   │   │   ├── BlockDetailScreen.jsx
│   │   │   ├── RequestDetailScreen.jsx
│   │   │   ├── CreateRequestScreen.jsx
│   │   │   ├── ChatScreen.jsx
│   │   │   ├── ProfileScreen.jsx
│   │   │   ├── VerificationScreen.jsx
│   │   │   ├── NotificationsScreen.jsx
│   │   │   └── SettingsScreen.jsx
│   │   │
│   │   ├── navigation/
│   │   │   ├── AppNavigator.jsx
│   │   │   ├── AuthNavigator.jsx
│   │   │   ├── MainTabNavigator.jsx
│   │   │   └── routes.js
│   │   │
│   │   ├── store/                     # State management (Redux / Zustand)
│   │   │   ├── index.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── blockSlice.js
│   │   │   │   ├── requestSlice.js
│   │   │   │   ├── chatSlice.js
│   │   │   │   └── mapSlice.js
│   │   │   └── middleware/
│   │   │       └── firebaseMiddleware.js
│   │   │
│   │   ├── services/                  # API call functions
│   │   │   ├── api.js                 # Axios base config
│   │   │   ├── authService.js
│   │   │   ├── blockService.js
│   │   │   ├── requestService.js
│   │   │   ├── chatService.js
│   │   │   ├── locationService.js
│   │   │   ├── notificationService.js
│   │   │   └── uploadService.js
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useLocation.js
│   │   │   ├── useHeatScore.js
│   │   │   ├── useVerification.js
│   │   │   ├── useNearbyBlocks.js
│   │   │   ├── useChat.js
│   │   │   └── useRequests.js
│   │   │
│   │   ├── utils/
│   │   │   ├── geoUtils.js            # distance, polygon checks
│   │   │   ├── heatUtils.js           # heat score calculation
│   │   │   ├── formatters.js          # time, distance display
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   │
│   │   └── config/
│   │       ├── firebase.js
│   │       ├── maps.js
│   │       └── env.js
│   │
│   ├── android/
│   ├── ios/
│   ├── app.json
│   ├── package.json
│   └── .env
│
│
├── backend/                           # Spring Boot
│   └── src/
│       └── main/
│           ├── java/com/nearme/
│           │   │
│           │   ├── NearMeApplication.java
│           │   │
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   ├── JwtConfig.java
│           │   │   ├── CorsConfig.java
│           │   │   ├── FirebaseConfig.java
│           │   │   └── WebSocketConfig.java
│           │   │
│           │   ├── controller/
│           │   │   ├── AuthController.java
│           │   │   ├── BlockController.java
│           │   │   ├── RequestController.java
│           │   │   ├── ChatController.java
│           │   │   ├── UserController.java
│           │   │   ├── VoteController.java
│           │   │   ├── HeatController.java
│           │   │   └── AdminController.java
│           │   │
│           │   ├── service/
│           │   │   ├── AuthService.java
│           │   │   ├── BlockService.java
│           │   │   ├── RequestService.java
│           │   │   ├── ChatService.java
│           │   │   ├── UserService.java
│           │   │   ├── VoteService.java
│           │   │   ├── HeatService.java
│           │   │   ├── GeoService.java
│           │   │   ├── NotificationService.java
│           │   │   ├── VerificationService.java
│           │   │   └── UploadService.java
│           │   │
│           │   ├── repository/
│           │   │   ├── UserRepository.java
│           │   │   ├── BlockRepository.java
│           │   │   ├── RequestRepository.java
│           │   │   ├── AcceptanceRepository.java
│           │   │   ├── ChatRepository.java
│           │   │   ├── VoteRepository.java
│           │   │   └── LocationRequestRepository.java
│           │   │
│           │   ├── model/             # Database entities
│           │   │   ├── User.java
│           │   │   ├── Block.java
│           │   │   ├── Request.java
│           │   │   ├── Acceptance.java
│           │   │   ├── ChatMessage.java
│           │   │   ├── LocationVote.java
│           │   │   └── LocationRequest.java
│           │   │
│           │   ├── dto/               # Request / Response objects
│           │   │   ├── request/
│           │   │   │   ├── LoginRequest.java
│           │   │   │   ├── RegisterRequest.java
│           │   │   │   ├── CreateRequestDto.java
│           │   │   │   ├── CreateBlockDto.java
│           │   │   │   └── VoteRequestDto.java
│           │   │   └── response/
│           │   │       ├── AuthResponse.java
│           │   │       ├── BlockResponse.java
│           │   │       ├── RequestResponse.java
│           │   │       ├── HeatResponse.java
│           │   │       └── UserResponse.java
│           │   │
│           │   ├── security/
│           │   │   ├── JwtTokenProvider.java
│           │   │   ├── JwtAuthFilter.java
│           │   │   └── UserDetailsServiceImpl.java
│           │   │
│           │   ├── scheduler/         # Background jobs
│           │   │   ├── HeatScoreScheduler.java
│           │   │   ├── RequestExpiryScheduler.java
│           │   │   └── LiveUserCleanupScheduler.java
│           │   │
│           │   └── exception/
│           │       ├── GlobalExceptionHandler.java
│           │       ├── BlockNotFoundException.java
│           │       ├── UnauthorizedException.java
│           │       └── VerificationException.java
│           │
│           └── resources/
│               ├── application.yml
│               ├── application-dev.yml
│               ├── application-prod.yml
│               └── db/
│                   └── migration/     # Flyway migrations
│                       ├── V1__create_users.sql
│                       ├── V2__create_blocks.sql
│                       ├── V3__create_requests.sql
│                       ├── V4__create_chat.sql
│                       ├── V5__create_votes.sql
│                       └── V6__add_heat_columns.sql
                        | hVE around 20 total Migrations
                        |
│
│
├── database/
│   ├── schema.sql                     # Full DB schema
│   ├── seed.sql                       # Sample data for testing
│   └── queries/
│       ├── nearby_blocks.sql          # PostGIS geo queries
│       ├── heat_score.sql
│       ├── nearby_requests.sql
│       └── vote_count.sql
│
│
├── admin-panel/                       # Web dashboard (React)
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx          # Overview + stats
│       │   ├── BlockRequests.jsx      # Pending vote approvals
│       │   ├── BlockEditor.jsx        # Draw boundary on map
│       │   ├── UserManagement.jsx
│       │   ├── VerificationQueue.jsx  # College ID reviews
│       │   ├── HeatMap.jsx            # Live heat overview
│       │   └── Reports.jsx
│       │
│       ├── components/
│       │   ├── BoundaryDrawer.jsx     # Google Maps polygon tool
│       │   ├── ApprovalCard.jsx
│       │   ├── StatsWidget.jsx
│       │   └── ThresholdEditor.jsx    # Set vote thresholds
│       │
│       └── services/
│           └── adminApi.js
│
│
├── docs/
│   ├── PROJECT_SCRIPT.md              # Full project document
│   ├── API_DOCS.md                    # All API endpoints
│   ├── DATABASE_SCHEMA.md             # Tables + relationships
│   ├── SYSTEM_DESIGN.md              # Architecture decisions
│   └── DEPLOYMENT.md
│
│
├── docker-compose.yml                 # PostgreSQL + PostGIS + Backend
├── .gitignore
└── README.md

Updated 

nearme-connect/
│
├── frontend/                          
│   └── src/
│       ├── components/
│       │   ├── map/
│       │   │   ├── MapView.jsx
│       │   │   ├── BlockBoundary.jsx
│       │   │   ├── RequestPin.jsx
│       │   │   ├── HeatBadge.jsx
│       │   │   ├── RadiusCircle.jsx
│       │   │   ├── ClusterOverlay.jsx          ✅ NEW
│       │   │   └── RequestClusterCircle.jsx    ✅ NEW
│       │   │
│       │   ├── clusters/                      ✅ NEW (IMPORTANT)
│       │   │   ├── ClusterBlob.jsx
│       │   │   ├── ClusterCard.jsx
│       │   │   ├── ClusterOverlay.jsx
│       │   │   ├── NameSuggestionSheet.jsx
│       │   │   └── ClusterBlob.module.css
│       │   │
│       │   ├── requests/
│       │   ├── chat/
│       │   ├── auth/
│       │   └── shared/
│       │
│       ├── hooks/
│       │   ├── useClusterHeat.js       ✅ NEW
│       │   ├── useNearbyClusters.js    ✅ NEW
│       │   └── useAllBlocks.js         ✅ NEW
│       │
│       ├── services/
│       │   └── clusterService.js       ✅ NEW
│       │
│       ├── store/
│       │   └── clusterStore.js         ✅ NEW
│       │
│       └── utils/
│           └── requestClusterUtils.js  ✅ NEW
│
│
├── backend/
│   └── src/main/java/com/nearme/
│       ├── config/
│       │   ├── JacksonConfig.java      ✅ NEW
│       │   └── SpatialConfig.java      ✅ NEW
│       │
│       ├── controller/
│       │   ├── ClusterController.java        ✅ NEW
│       │   ├── AdminClusterController.java   ✅ NEW
│       │   └── (VoteController ❌ removed)
│       │
│       ├── service/
│       │   ├── ClusterService.java           ✅ NEW
│       │   ├── ClusterPromotionService.java  ✅ NEW
│       │   └── (VoteService ❌ removed)
│       │
│       ├── repository/
│       │   ├── ClusterRepository.java        ✅ NEW
│       │   └── (VoteRepository ❌ removed)
│       │
│       ├── model/
│       │   ├── ActivityCluster.java          ✅ NEW CORE MODEL
│       │   └── (LocationVote ❌ removed)
│       │
│       ├── scheduler/
│       │   ├── ClusterFormationScheduler.java  ✅ NEW
│       │   └── ClusterHeatScheduler.java       ✅ NEW
│       │
│       ├── dto/
│       │   ├── request/
│       │   │   ├── ApproveClusterRequest.java  ✅ NEW
│       │   │   └── NameSuggestionDto.java      ✅ NEW
│       │   │
│       │   └── response/
│       │       └── ClusterResponse.java        ✅ NEW
│       │
│       └── exception/
│           └── UserNotFoundException.java      ✅ NEW
│
│
├── database/
│   └── queries/
│       ├── cluster_heat.sql           ✅ NEW
│       ├── cluster_threshold_check.sql
│       └── nearby_clusters.sql        ✅ NEW
│
│
├── admin-panel/
│   └── src/
│       ├── pages/
│       │   ├── ClusterReview.jsx      ✅ NEW (replaces BlockRequests)
│       │   ├── UserMap.jsx            ✅ NEW
│       │
│       ├── components/
│       │   ├── ClusterPreviewMap.jsx  ✅ NEW
│       │   ├── ClusterStatsCard.jsx   ✅ NEW
│       │   └── (ApprovalCard ❌ removed)
│
│
├── docs/
│   └── folder.md                     ✅ NEW
│
└── README.md


----------------------------------------------------------------------------       NOT FOR CLONE STRICTLY PROBHITED     ----------------------------------------------------------------------------------
