import { useEffect, useMemo, useRef } from 'react'
import { useBlockStore } from '../store/blockStore.js'
import { fetchNearbyBlocks } from '../services/blockService.js'
import { distanceKm } from '../utils/geoUtils.js'

function centroid(polygon) {
  if (!polygon?.length) return { lat: 0, lng: 0 }
  const lat = polygon.reduce((s, p) => s + p.lat, 0) / polygon.length
  const lng = polygon.reduce((s, p) => s + p.lng, 0) / polygon.length
  return { lat, lng }
}

export function useNearbyBlocks(userLatLng, radius = 5000) {
  const blocks    = useBlockStore((s) => s.blocks)
  const setBlocks = useBlockStore((s) => s.setBlocks)
  const lastKey   = useRef(null)

  const lat = userLatLng?.lat
  const lng = userLatLng?.lng

  // Fetch from API when coords available
  useEffect(() => {
    if (!lat || !lng) return
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`
    if (lastKey.current === key) return
    lastKey.current = key
    fetchNearbyBlocks(lat, lng, radius)
      .then((data) => setBlocks(data || []))
      .catch(() => {/* keep existing mock/store data */})
  }, [lat, lng, radius])

  // Sort by distance, attach distanceKm
  return useMemo(() => {
    const hasCoords = typeof lat === 'number' && !Number.isNaN(lat)
    return blocks
      .map((b) => {
        const center = b.center_lat && b.center_lng
          ? { lat: b.center_lat, lng: b.center_lng }
          : centroid(b.polygon)
        return {
          ...b,
          distanceKm: hasCoords ? distanceKm(lat, lng, center.lat, center.lng) : null,
        }
      })
      .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
  }, [blocks, lat, lng])
}