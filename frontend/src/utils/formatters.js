export function formatRelativeTime(date) {
  const d    = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const m    = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return d.toLocaleDateString()
}

export function formatDistanceKm(km) {
  if (km == null) return ''
  if (km < 1)    return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}