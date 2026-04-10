NearMeApplication.java          ← @SpringBootApplication + @EnableScheduling

config/         (5 files)
  SecurityConfig       ← JWT filter chain, route permissions, stateless sessions
  JwtConfig            ← @ConfigurationProperties binding
  CorsConfig           ← allows all origins in dev, tighten in prod
  FirebaseConfig       ← initialises Firebase Admin SDK on startup
  WebSocketConfig      ← STOMP broker on /topic, endpoint /ws/chat

security/       (3 files)
  JwtTokenProvider     ← generate + validate + extract userId from JWT
  JwtAuthFilter        ← OncePerRequestFilter, reads Bearer token per request
  UserDetailsServiceImpl ← loads user by UUID, assigns ROLE_STUDENT or ROLE_LOCAL

model/          (7 files)       ← JPA entities with PostGIS geometry types
repository/     (7 files)       ← Spring Data JPA + native PostGIS SQL queries

service/        (12 files)
  AuthService          ← sendOtp, verifyOtp, getMe, updateFcmToken
  TwilioService        ← OTP send/verify, dev mode logs 123456 to console
  BlockService         ← nearby, search, getBlock, getHeat
  RequestService       ← feed (student/local), create, accept, close, delete
  ChatService          ← getMessages, sendMessage, WebSocket broadcast
  UserService          ← getUser, updateProfile, report, block
  VoteService          ← submitVote, getVoteStatus, cluster find-or-create
  HeatService          ← recalculateAll (called by scheduler every 2 min)
  NotificationService  ← FCM push for accept, expiry, block approved/rejected
  VerificationService  ← submitCollegeId, getPendingQueue, approve, reject
  UploadService        ← S3 presigned PUT URL generation
  AdminService         ← stats, clusters, approveCluster, rejectCluster, ban

controller/     (9 files)
  AuthController       ← /auth/* (send-otp, verify-otp, upload-college-id, me)
  BlockController      ← /blocks/* (nearby, nearby/campus, search, :id, :id/heat)
  RequestController    ← /requests/* (feed, radius, create, :id, accept, close, delete)
  ChatController       ← /chat/:id/messages + WebSocket @MessageMapping
  UserController       ← /users/* (get, profile, report, block)
  VoteController       ← /blocks/vote, /blocks/vote/status, /blocks/vote/nearby
  HeatController       ← /heat/top
  AdminController      ← /admin/* (stats, clusters, approve, reject, verify, ban)
  UploadController     ← /uploads/presign

scheduler/      (3 files)
  HeatScoreScheduler       ← every 2 min → HeatService.recalculateAll()
  RequestExpiryScheduler   ← every 5 min → expires overdue open requests
  LiveUserCleanupScheduler ← every 5 min → recounts live users per block

exception/      (4 files)
  GlobalExceptionHandler   ← handles all exceptions, returns clean JSON errors
  BlockNotFoundException
  UnauthorizedException
  VerificationException

resources/      (3 files)
  application.yml          ← all config with env variable fallbacks
  application-dev.yml      ← SQL logging on, Twilio dummy mode
  application-prod.yml     ← stack traces hidden, minimal logging