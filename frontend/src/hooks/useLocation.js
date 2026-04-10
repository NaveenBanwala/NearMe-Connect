import { useEffect, useState } from 'react'
import { DEFAULT_MAP_CENTER } from '../config/maps.js'

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000, ...options,
    })
  })
}

export function useBrowserLocation() {
  const [coords,  setCoords]  = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const pos = await getCurrentPosition()
        if (!cancelled) setCoords({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      } catch (e) {
        if (!cancelled) { setError(e); setCoords(DEFAULT_MAP_CENTER) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { coords, error, loading, fallbackCenter: DEFAULT_MAP_CENTER }
}