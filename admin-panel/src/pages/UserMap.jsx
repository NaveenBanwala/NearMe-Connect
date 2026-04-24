import { useEffect, useRef, useState } from 'react'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getBlocks } from '../services/adminApi.js'    // reuse same endpoint, or swap for a public one

// ============================================================
// UserMap.jsx
// Shows all blocks that have a saved boundary_geo_json on the
// user-facing map. Each polygon is color-coded by heat level.
// ============================================================

const HEAT_COLORS = {
  fire: '#DD2C00',
  hot:  '#FF6D00',
  warm: '#FFB300',
  mild: '#FFD54F',
  cold: '#90CAF9',
}
const heatKey = s => s >= 100 ? 'fire' : s >= 51 ? 'hot' : s >= 21 ? 'warm' : s >= 6 ? 'mild' : 'cold'

export default function UserMap({
  center      = [20.2961, 85.8245],
  zoom        = 13,
  onBlockClick,               // optional: (block) => void — called when user taps a polygon
}) {
  const { data, loading, error, reload } = useApi(getBlocks)
  const mapRef    = useRef(null)
  const mapElRef  = useRef(null)
  const layersRef = useRef([])   // track polygon layers so we can refresh them

  // ── 1. Init map ───────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return

    import('leaflet').then(L => {
      if (mapRef.current || !mapElRef.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapElRef.current, { center, zoom, zoomControl: true })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      setTimeout(() => map.invalidateSize(), 100)
      mapRef.current = map
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Render block boundaries whenever data loads ────────
  useEffect(() => {
    if (!data) return

    import('leaflet').then(L => {
      const map = mapRef.current
      if (!map) return

      // Remove old layers
      layersRef.current.forEach(l => map.removeLayer(l))
      layersRef.current = []

      data.forEach(block => {
        if (!block.boundary_geo_json) return   // ← skip blocks with no boundary yet

        let geo
        try {
          geo = typeof block.boundary_geo_json === 'string'
            ? JSON.parse(block.boundary_geo_json)
            : block.boundary_geo_json
        } catch { return }

        if (geo?.type !== 'Polygon' || !geo.coordinates?.[0]) return

        const hk    = heatKey(block.heat_score ?? 0)
        const color = HEAT_COLORS[hk]

        // GeoJSON coords are [lng, lat] — Leaflet needs [lat, lng]
        const latlngs = geo.coordinates[0].map(([lng, lat]) => [lat, lng])

        const polygon = L.polygon(latlngs, {
          color,
          weight:      2,
          fillColor:   color,
          fillOpacity: 0.18,
        })

        polygon.bindTooltip(
          `<b>${block.name}</b><br>
           <span style="font-size:11px;opacity:0.75">${block.category}</span><br>
           🔥 ${block.heat_score ?? 0} heat · ${block.live_user_count ?? 0} live`,
          { sticky: true }
        )

        if (onBlockClick) {
          polygon.on('click', () => onBlockClick(block))
        }

        polygon.addTo(map)
        layersRef.current.push(polygon)
      })
    })
  }, [data, onBlockClick])

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const boundaryCount = (data ?? []).filter(b => b.boundary_geo_json).length

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-xl overflow-hidden border border-base-500"
        style={{ height: 520 }}
      >
        <div ref={mapElRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <p className="text-[11px] text-slate-600 font-mono">
        Showing {boundaryCount} of {(data ?? []).length} blocks with boundaries · tap a zone for details
      </p>
    </div>
  )
}