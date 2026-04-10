// Mock data — replace all with real API calls via adminApi.js in production

export const MOCK_STATS = {
  total_users:       12847,
  verified_students: 7432,
  active_blocks:     23,
  live_users:        342,
  open_requests:     89,
  pending_votes:     6,
  pending_verify:    14,
  reports:           3,
}

export const MOCK_VOTE_CLUSTERS = [
  { cluster_id: 'c1', suggested_name: 'Xavier Institute of Management', geo_lat: 20.2961, geo_lng: 85.8245, category: 'campus',   vote_count: 47, threshold_required: 50, status: 'pending', unique_voters: 44, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { cluster_id: 'c2', suggested_name: 'Patia Market',                  geo_lat: 20.3467, geo_lng: 85.8147, category: 'market',   vote_count: 28, threshold_required: 30, status: 'pending', unique_voters: 26, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { cluster_id: 'c3', suggested_name: 'Infocity Tech Park',            geo_lat: 20.3553, geo_lng: 85.8169, category: 'locality', vote_count: 19, threshold_required: 25, status: 'pending', unique_voters: 18, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { cluster_id: 'c4', suggested_name: 'Acharya Vihar Society',         geo_lat: 20.2874, geo_lng: 85.8312, category: 'society',  vote_count: 21, threshold_required: 20, status: 'pending', unique_voters: 20, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { cluster_id: 'c5', suggested_name: 'CET Campus',                    geo_lat: 20.3058, geo_lng: 85.8150, category: 'campus',   vote_count: 12, threshold_required: 50, status: 'pending', unique_voters: 12, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { cluster_id: 'c6', suggested_name: 'Saheed Nagar Block',            geo_lat: 20.2744, geo_lng: 85.8441, category: 'locality', vote_count: 24, threshold_required: 25, status: 'pending', unique_voters: 22, created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
]

export const MOCK_BLOCKS = [
  { block_id: 'b1', name: 'KIIT Campus',     category: 'campus',   heat_score: 142, live_user_count: 142, open_request_count: 23, status: 'active', created_at: '2024-01-15' },
  { block_id: 'b2', name: 'Salt Lake Sec V', category: 'locality', heat_score: 34,  live_user_count: 34,  open_request_count: 8,  status: 'active', created_at: '2024-01-20' },
  { block_id: 'b3', name: 'New Town Blk 1',  category: 'locality', heat_score: 3,   live_user_count: 3,   open_request_count: 1,  status: 'active', created_at: '2024-02-01' },
  { block_id: 'b4', name: 'NISER Campus',    category: 'campus',   heat_score: 67,  live_user_count: 67,  open_request_count: 12, status: 'active', created_at: '2024-02-10' },
  { block_id: 'b5', name: 'IIT Bhubaneswar', category: 'campus',   heat_score: 89,  live_user_count: 89,  open_request_count: 17, status: 'active', created_at: '2024-02-15' },
  { block_id: 'b6', name: 'Patia Society',   category: 'society',  heat_score: 21,  live_user_count: 21,  open_request_count: 4,  status: 'active', created_at: '2024-03-01' },
]

export const MOCK_USERS = [
  { user_id: 'u1', name: 'Arjun Patra',    phone: '+91 98765 43210', college_name: 'KIIT University', student_verified: true,  phone_verified: true,  verification_status: 'approved', created_at: '2024-01-10', last_seen_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),  status: 'active', reports: 0 },
  { user_id: 'u2', name: 'Priya Mohanty',  phone: '+91 87654 32109', college_name: 'NISER',           student_verified: true,  phone_verified: true,  verification_status: 'approved', created_at: '2024-01-15', last_seen_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: 'active', reports: 0 },
  { user_id: 'u3', name: 'Ravi Kumar',     phone: '+91 76543 21098', college_name: null,              student_verified: false, phone_verified: true,  verification_status: 'none',     created_at: '2024-02-01', last_seen_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'active', reports: 1 },
  { user_id: 'u4', name: 'Sneha Das',      phone: '+91 65432 10987', college_name: 'IIT Bhubaneswar', student_verified: false, phone_verified: true,  verification_status: 'pending',  created_at: '2024-02-10', last_seen_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'active', reports: 0 },
  { user_id: 'u5', name: 'Amit Sahoo',     phone: '+91 54321 09876', college_name: 'KIIT University', student_verified: true,  phone_verified: true,  verification_status: 'approved', created_at: '2024-02-20', last_seen_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'active', reports: 0 },
  { user_id: 'u6', name: 'Deepthi Nair',   phone: '+91 43210 98765', college_name: null,              student_verified: false, phone_verified: true,  verification_status: 'none',     created_at: '2024-03-01', last_seen_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),  status: 'banned', reports: 3 },
  { user_id: 'u7', name: 'Rohit Behera',   phone: '+91 32109 87654', college_name: 'CET Bhubaneswar', student_verified: false, phone_verified: true,  verification_status: 'rejected', created_at: '2024-03-05', last_seen_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'active', reports: 0 },
]

export const MOCK_VERIFY_QUEUE = [
  { verify_id: 'v1', user_id: 'u4', name: 'Sneha Das',    phone: '+91 65432 10987', college_name: 'IIT Bhubaneswar', id_image_url: 'https://placehold.co/400x250/1e2a3e/f59e0b?text=College+ID', submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'pending' },
  { verify_id: 'v2', user_id: 'u8', name: 'Karishma Sen', phone: '+91 21098 76543', college_name: 'XAVIER IIM',      id_image_url: 'https://placehold.co/400x250/1e2a3e/f59e0b?text=Student+ID', submitted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), status: 'pending' },
  { verify_id: 'v3', user_id: 'u9', name: 'Tarun Mishra', phone: '+91 10987 65432', college_name: 'BPUT',            id_image_url: 'https://placehold.co/400x250/1e2a3e/f59e0b?text=ID+Card',    submitted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), status: 'pending' },
  { verify_id: 'v4', user_id: 'ua', name: 'Lipsa Rath',   phone: '+91 09876 54321', college_name: 'SOA University',  id_image_url: 'https://placehold.co/400x250/1e2a3e/f59e0b?text=Student+ID', submitted_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), status: 'pending' },
]

export const MOCK_REPORTS = [
  { report_id: 'r1', reported_by: 'Arjun Patra',  against_type: 'user',    against_name: 'Deepthi Nair',     reason: 'Spam requests',      status: 'open',     created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { report_id: 'r2', reported_by: 'Priya Mohanty', against_type: 'request', against_name: 'Need urgent help', reason: 'Inappropriate content', status: 'open',   created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { report_id: 'r3', reported_by: 'Ravi Kumar',   against_type: 'user',    against_name: 'Unknown User',    reason: 'Fake profile',        status: 'resolved', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
]

export const MOCK_ACTIVITY = [
  { time: '00:00', users: 12,  requests: 3  },
  { time: '03:00', users: 5,   requests: 1  },
  { time: '06:00', users: 18,  requests: 5  },
  { time: '09:00', users: 89,  requests: 22 },
  { time: '12:00', users: 178, requests: 45 },
  { time: '15:00', users: 234, requests: 61 },
  { time: '18:00', users: 342, requests: 89 },
  { time: '21:00', users: 198, requests: 52 },
  { time: 'Now',   users: 289, requests: 73 },
]

export const MOCK_WEEKLY = [
  { day: 'Mon', new_users: 42,  votes: 8  },
  { day: 'Tue', new_users: 61,  votes: 12 },
  { day: 'Wed', new_users: 38,  votes: 6  },
  { day: 'Thu', new_users: 74,  votes: 19 },
  { day: 'Fri', new_users: 93,  votes: 24 },
  { day: 'Sat', new_users: 128, votes: 31 },
  { day: 'Sun', new_users: 87,  votes: 18 },
]