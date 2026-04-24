export const ROUTES = {
  splash:        '/splash',
  onboarding:    '/onboarding',
  login:         '/login',
  otp:           '/otp',
  collegeId:     '/college-id',
  home:          '/',
  search:        '/search',
  chats:         '/chats',
  profile:       '/profile',
  notifications: '/notifications',
  settings:      '/settings',
  verification:  '/verification',

  block:   (id)      => `/block/${id}`,
  request: (id)      => `/request/${id}`,
  chat:    (reqId)   => `/chat/${reqId}`,

  // Legacy: used by BlockDetailScreen's "post here" button only
  newRequest: (blockId) => `/block/${blockId}/new`,

  // Context-free create — use this from FAB / HomeMapScreen
  createRequest:  '/request/new',   // ← was a function, now a plain string
  newRequestFree: '/request/new',
}

// export const ROUTES = {
//   splash:        '/splash',
//   onboarding:    '/onboarding',
//   login:         '/login',
//   otp:           '/otp',
//   collegeId:     '/college-id',
//   home:          '/',
//   search:        '/search',
//   chats:         '/chats',
//   profile:       '/profile',
//   notifications: '/notifications',
//   settings:      '/settings',
//   verification:  '/verification',

//   block:         (id)      => `/block/${id}`,
//   request:       (id)      => `/request/${id}`,
//   chat:          (reqId)   => `/chat/${reqId}`,

//   // Block-scoped create (legacy, kept for BlockDetailScreen "post here" button)
//   newRequest:    (blockId) => `/block/${blockId}/new`,
//   createRequest: (blockId) => `/block/${blockId}/new`,

//   // ── New: context-free create ──────────────────────────────────
//   // Call with no args from HomeMapScreen. Pass clusterId via location.state.
//   newRequestFree: '/request/new',
// }