import { useEffect, useRef, useCallback } from 'react'
import { useClusterStore }    from '../store/clusterStore.js'
import { useBrowserLocation } from './useLocation.js'

const REFETCH_THRESHOLD_METERS = 200
const PING_INTERVAL_MS = 3 * 60 * 1000

export function useNearbyClusters(mapCenter = null) {
  const fetchNearbyClusters = useClusterStore((s) => s.fetchNearbyClusters)
  const sendPing            = useClusterStore((s) => s.sendPing)
  const nearbyClusters      = useClusterStore((s) => s.nearbyClusters)
  const currentCluster      = useClusterStore((s) => s.currentCluster)
  const loadingNearby       = useClusterStore((s) => s.loadingNearby)
  const error               = useClusterStore((s) => s.error)
  const clearError          = useClusterStore((s) => s.clearError)

  const { coords } = useBrowserLocation()
  const lastFetched = useRef(null)
  const coordsRef   = useRef(coords)
  useEffect(() => { coordsRef.current = coords }, [coords])

  const activeLat = mapCenter?.lat ?? coords?.lat
  const activeLng = mapCenter?.lng ?? coords?.lng

  useEffect(() => {
    if (!activeLat || !activeLng) return
    const moved =
      !lastFetched.current ||
      getDistanceMeters(lastFetched.current, { lat: activeLat, lng: activeLng }) > REFETCH_THRESHOLD_METERS
    if (moved) {
      fetchNearbyClusters(activeLat, activeLng)
      lastFetched.current = { lat: activeLat, lng: activeLng }
    }
  }, [activeLat, activeLng, fetchNearbyClusters])

  useEffect(() => {
    if (!coords?.lat || !coords?.lng) return
    sendPing(coords.lat, coords.lng)
    const interval = setInterval(() => {
      if (coordsRef.current?.lat && coordsRef.current?.lng)
        sendPing(coordsRef.current.lat, coordsRef.current.lng)
    }, PING_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [coords?.lat, coords?.lng, sendPing])

  const refetch = useCallback(() => {
    if (activeLat && activeLng) fetchNearbyClusters(activeLat, activeLng)
  }, [activeLat, activeLng, fetchNearbyClusters])

  return { nearbyClusters, currentCluster, loading: loadingNearby, error, refetch, clearError }
}

function getDistanceMeters(a, b) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const toRad = (d) => (d * Math.PI) / 180

// import { useEffect, useRef, useCallback } from 'react'
// import { useClusterStore }    from '../store/clusterStore.js'
// import { useBrowserLocation } from './useLocation.js'

// const REFETCH_THRESHOLD_METERS = 200
// const PING_INTERVAL_MS = 3 * 60 * 1000

// export function useNearbyClusters(mapCenter = null) {  // ← accept mapCenter
//   const fetchNearbyClusters = useClusterStore((s) => s.fetchNearbyClusters)
//   const sendPing            = useClusterStore((s) => s.sendPing)
//   const nearbyClusters      = useClusterStore((s) => s.nearbyClusters)
//   const currentCluster      = useClusterStore((s) => s.currentCluster)
//   const loadingNearby       = useClusterStore((s) => s.loadingNearby)
//   const error               = useClusterStore((s) => s.error)
//   const clearError          = useClusterStore((s) => s.clearError)

//   const { coords } = useBrowserLocation()
//   const lastFetched = useRef(null)

//   // Use mapCenter if provided (user scrolled), else fall back to GPS
//   const activeLat = mapCenter?.lat ?? coords?.lat
//   const activeLng = mapCenter?.lng ?? coords?.lng

//   useEffect(() => {
//     if (!activeLat || !activeLng) return
//     const moved = !lastFetched.current
//       || getDistanceMeters(lastFetched.current, { lat: activeLat, lng: activeLng }) > REFETCH_THRESHOLD_METERS
//     if (moved) {
//       fetchNearbyClusters(activeLat, activeLng)
//       lastFetched.current = { lat: activeLat, lng: activeLng }
//     }
//   }, [activeLat, activeLng])

//   // Ping still uses real GPS only
//   useEffect(() => {
//     if (!coords?.lat || !coords?.lng) return
//     sendPing(coords.lat, coords.lng)
//     const interval = setInterval(() => {
//       if (coords?.lat && coords?.lng) sendPing(coords.lat, coords.lng)
//     }, PING_INTERVAL_MS)
//     return () => clearInterval(interval)
//   }, [coords?.lat, coords?.lng])

//   const refetch = useCallback(() => {
//     if (activeLat && activeLng) fetchNearbyClusters(activeLat, activeLng)
//   }, [activeLat, activeLng])

//   return { nearbyClusters, currentCluster, loading: loadingNearby, error, refetch, clearError }
// }

// function getDistanceMeters(a, b) {
//   const R = 6371000
//   const dLat = toRad(b.lat - a.lat)
//   const dLng = toRad(b.lng - a.lng)
//   const x =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
//   return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
// }
// const toRad = (d) => (d * Math.PI) / 180