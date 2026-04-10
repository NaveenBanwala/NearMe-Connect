/**
 * mockData.js — UI development mocks only.
 * Stores import these so the app isn't blank before the API responds.
 * None of these values are sent to the backend.
 */

export function mockBlocks() {
  const base   = { lat: 20.3535, lng: 85.8164 }
  const offset = 0.008
  const rect   = (dx, dy) => [
    { lat: base.lat + dy,          lng: base.lng + dx          },
    { lat: base.lat + dy,          lng: base.lng + dx + offset },
    { lat: base.lat + dy + offset, lng: base.lng + dx + offset },
    { lat: base.lat + dy + offset, lng: base.lng + dx          },
  ]
  return [
    {
      block_id: 'b1', name: 'KIIT University', category: 'campus',
      heat_score: 87, live_user_count: 42, open_request_count: 15,
      polygon: rect(0, 0), status: 'active',
      center_lat: 20.3579, center_lng: 85.8201,
    },
    {
      block_id: 'b2', name: 'Patia Market Lane', category: 'locality',
      heat_score: 12, live_user_count: 24, open_request_count: 3,
      polygon: rect(offset * 1.5, -offset * 0.5), status: 'active',
      center_lat: 20.3550, center_lng: 85.8225,
    },
    {
      block_id: 'b3', name: 'Khandagiri Society', category: 'society',
      heat_score: 45, live_user_count: 18, open_request_count: 6,
      polygon: rect(-offset * 1.2, offset * 0.8), status: 'active',
      center_lat: 20.3480, center_lng: 85.8110,
    },
  ]
}

export function mockRequests(blockId = 'b1') {
  const t = Date.now()
  return [
    {
      request_id: 'r1', block_id: blockId, type: 'help',
      title: 'OS mid-sem notes?',
      description: 'Anyone sharing Digital Logic & OS short notes? Can meet at library steps in 20 min.',
      visibility: 'students_only', status: 'open',
      created_at: new Date(t - 45 * 60000).toISOString(),
      expires_at: new Date(t + 45 * 60000).toISOString(),
      author_name: 'Arjun S.', author_verified: true,
    },
    {
      request_id: 'r2', block_id: blockId, type: 'play',
      title: 'Badminton doubles 🏸',
      description: 'Indoor court 3 — looking for one more player.',
      visibility: 'students_only', status: 'open',
      created_at: new Date(t - 15 * 60000).toISOString(),
      expires_at: new Date(t + 2 * 3600000).toISOString(),
      author_name: 'Priya M.', author_verified: true,
    },
    {
      request_id: 'r3', block_id: blockId, type: 'talk',
      title: 'Coffee walk after class ☕',
      description: 'Quick casual chat near campus 6 gate.',
      visibility: 'public', status: 'open',
      created_at: new Date(t - 120 * 60000).toISOString(),
      expires_at: new Date(t + 60 * 60000).toISOString(),
      author_name: 'Rahul K.', author_verified: true,
    },
    {
      request_id: 'r4', block_id: blockId, type: 'free',
      title: 'Extra USB desk lamp 💡',
      description: 'Giving away — pickup hostel block B.',
      visibility: 'public', status: 'open',
      created_at: new Date(t - 8 * 60000).toISOString(),
      expires_at: new Date(t + 180 * 60000).toISOString(),
      author_name: 'Sana A.', author_verified: false,
    },
    {
      request_id: 'r5', block_id: blockId, type: 'study',
      title: 'Group study — Data Structures 📚',
      description: 'Library room 204, 2 more seats free.',
      visibility: 'students_only', status: 'open',
      created_at: new Date(t - 5 * 60000).toISOString(),
      expires_at: new Date(t + 3600000).toISOString(),
      author_name: 'Dev P.', author_verified: true,
    },
  ]
}