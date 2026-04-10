
# 🚀 NearMe Connect

**NearMe Connect** is a location-based real-time social application that connects people within verified geographic blocks such as campuses, societies, and neighborhoods.

Users can post short-lived requests (help, talk, play, etc.), discover nearby activity on a live map, and interact securely through verified identity and controlled visibility.

---

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
| DevOps | Docker, AWS / Render |

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




----------------------------------------------------------------------------       NOT FOR CLONE STRICTLY PROBHITED     ----------------------------------------------------------------------------------