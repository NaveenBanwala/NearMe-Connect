const GROUP_DISTANCE_M = 500   // requests within 500m → same group
const BASE_RADIUS      = 80    // meters for 1 request
const SCALE_PER_REQ    = 30    // each extra request adds 30m

function toRad(deg) { return deg * (Math.PI / 180) }

function haversineMeters(a, b) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sin2 = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(sin2))
}

function countToHeatLevel(count) {
  if (count >= 9) return 'on_fire'
  if (count >= 6) return 'hot'
  if (count >= 4) return 'warm'
  if (count >= 2) return 'mild'
  return 'cold'
}

export function groupRequestsIntoCircles(requests) {
  const valid = requests.filter(
    (r) => r.latitude != null && r.longitude != null
  )

  const groups = []  // [{ points: [{lat,lng}], count }]

  for (const req of valid) {
    const pt = { lat: req.latitude, lng: req.longitude }
    const nearest = groups.find((g) => haversineMeters(g.centroid, pt) <= GROUP_DISTANCE_M)

    if (nearest) {
      nearest.points.push(pt)
      // Recompute centroid
      nearest.centroid = {
        lat: nearest.points.reduce((s, p) => s + p.lat, 0) / nearest.points.length,
        lng: nearest.points.reduce((s, p) => s + p.lng, 0) / nearest.points.length,
      }
    } else {
      groups.push({ points: [pt], centroid: pt })
    }
  }

  return groups.map((g) => {
    const count = g.points.length
    return {
      center:       g.centroid,
      radiusMeters: BASE_RADIUS + (count - 1) * SCALE_PER_REQ,
      count,
      heatLevel:    countToHeatLevel(count),
    }
  })
}