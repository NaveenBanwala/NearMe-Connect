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
  block:         (id)       => `/block/${id}`,
  newRequest:    (blockId)  => `/block/${blockId}/new`,
  createRequest: (blockId)  => `/block/${blockId}/new`,  // alias
  request:       (id)       => `/request/${id}`,
  chat:          (reqId)    => `/chat/${reqId}`,
  notifications: '/notifications',
  settings:      '/settings',
  verification:  '/verification',
}