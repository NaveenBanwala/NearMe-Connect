import { useState, useEffect, useRef } from 'react'
import { MousePointer, RotateCcw, Check, Info } from 'lucide-react'
import clsx from 'clsx'

// ============================================================
// BoundaryDrawer.jsx
// ============================================================

const CLUSTER_HEAT_COLOR = {
  cold:    '#FFF176',
  mild:    '#FFD54F',
  warm:    '#FFB300',
  hot:     '#FF6D00',
  on_fire: '#DD2C00',
}

function buildCirclePolygon(lat, lng, radiusMeters, sides = 12) {
  const R = radiusMeters / 111320
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * 2 * Math.PI
    return {
      lat: lat + R * Math.cos(angle),
      lng: lng + R * Math.sin(angle) / Math.cos((lat * Math.PI) / 180),
    }
  })
}

// ✅ NEW: Parse a saved GeoJSON Polygon string back into [{lat, lng}] points
function geoJsonToPoints(geoJsonStr) {
  try {
    // ← handle both string AND already-parsed object
    const geo = typeof geoJsonStr === 'string' ? JSON.parse(geoJsonStr) : geoJsonStr
    if (geo?.type !== 'Polygon' || !geo.coordinates?.[0]) return null
    const ring = geo.coordinates[0]
    const pts = ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng }))
    return pts.length >= 3 ? pts : null
  } catch {
    return null
  }
}

export default function BoundaryDrawer({
  clusterName,
  cluster,
  initialGeoJson = null,   // ✅ NEW: existing saved boundary from DB
  onSave,
  readOnly = false,
  center = [20.2961, 85.8245],
  zoom   = 15,
}) {
  const mapRef          = useRef(null)
  const mapElRef        = useRef(null)
  const markersRef      = useRef([])
  const polylineRef     = useRef(null)
  const polygonRef      = useRef(null)
  const clusterLayerRef = useRef(null)

  const [drawing,        setDrawing]        = useState(false)
  const [points,         setPoints]         = useState([])
  const [saved,          setSaved]          = useState(false)
  const [usingSuggested, setUsingSuggested] = useState(false)
  // ✅ Track whether we're showing the existing saved boundary
  const [usingExisting,  setUsingExisting]  = useState(false)

  const heatColor = CLUSTER_HEAT_COLOR[cluster?.heatLevel] ?? '#FFD54F'

  // ── 1. Init Leaflet map once ──────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return

    let mapInstance = null

    Promise.all([
      import('leaflet'),
      import('leaflet-control-geocoder'),
      import('leaflet-control-geocoder/dist/Control.Geocoder.css'),
    ]).then(([L]) => {
      if (mapRef.current || !mapElRef.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const initialCenter = cluster
        ? [cluster.centerLat, cluster.centerLng]
        : center

      mapInstance = L.map(mapElRef.current, {
        center: initialCenter,
        zoom,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance)

      // Search control
      L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Search location…',
      })
        .on('markgeocode', (e) => {
          const bbox = e.geocode.bbox
          mapInstance.fitBounds([
            [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
            [bbox.getNorthWest().lat, bbox.getNorthWest().lng],
          ])
        })
        .addTo(mapInstance)

      setTimeout(() => mapInstance.invalidateSize(), 100)
      mapRef.current = mapInstance
    })

    return () => {
      if (mapInstance) { mapInstance.remove(); mapRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Click handler ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const onClick = (e) => {
      if (!drawing || readOnly || saved) return
      setPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
    }
    map.on('click', onClick)
    return () => map.off('click', onClick)
  }, [drawing, readOnly, saved])

  // ── 3. Cursor style ───────────────────────────────────────
  useEffect(() => {
    if (!mapElRef.current) return
    mapElRef.current.style.cursor = drawing ? 'crosshair' : ''
  }, [drawing])

  // ── 4. Re-render markers + polygon ───────────────────────
  useEffect(() => {
    import('leaflet').then(L => {
      const map = mapRef.current
      if (!map) return

      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current = []
      if (polylineRef.current) { map.removeLayer(polylineRef.current); polylineRef.current = null }
      if (polygonRef.current)  { map.removeLayer(polygonRef.current);  polygonRef.current  = null }

      if (points.length === 0) return

      const latlngs = points.map(p => [p.lat, p.lng])
      // ✅ Use green for existing saved boundary, amber for suggested, yellow for custom
      const color = usingExisting ? '#22c55e' : usingSuggested ? heatColor : '#f59e0b'

      points.forEach(p => {
        const dot = L.circleMarker([p.lat, p.lng], {
          radius: 5, color: '#0f172a', weight: 1.5,
          fillColor: color, fillOpacity: 1,
        }).addTo(map)
        markersRef.current.push(dot)
      })

      if (points.length >= 3) {
        polygonRef.current = L.polygon(latlngs, {
          color, weight: 2,
          dashArray: saved ? undefined : '8 4',
          fillColor: color, fillOpacity: 0.15,
        }).addTo(map)

        // Fly to the polygon bounds so admin can see it
        if (usingExisting) {
          map.fitBounds(polygonRef.current.getBounds(), { padding: [40, 40] })
        }
      } else if (points.length === 2) {
        polylineRef.current = L.polyline(latlngs, { color, weight: 2, dashArray: '8 4' }).addTo(map)
      }
    })
  }, [points, saved, usingSuggested, usingExisting, heatColor])

  // ── 5. Cluster ring overlay ───────────────────────────────
  useEffect(() => {
    import('leaflet').then(L => {
      const map = mapRef.current
      if (!map || !cluster || saved) return

      if (clusterLayerRef.current) map.removeLayer(clusterLayerRef.current)

      const { centerLat, centerLng, radiusMeters, displayName, heatLevel } = cluster
      const color = CLUSTER_HEAT_COLOR[heatLevel] ?? '#FFD54F'
      const group = L.layerGroup()

      L.circle([centerLat, centerLng], {
        radius: radiusMeters * 1.6, color: 'transparent',
        fillColor: color, fillOpacity: 0.08,
      }).addTo(group)

      L.circle([centerLat, centerLng], {
        radius: radiusMeters, color, weight: 1.5,
        dashArray: '6 4', fillColor: color, fillOpacity: 0.12,
      }).addTo(group)

      const pulseIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;animation:nm-pulse 1.2s ease-in-out infinite;"></div>
               <style>@keyframes nm-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}</style>`,
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      })

      L.marker([centerLat, centerLng], { icon: pulseIcon })
        .bindPopup(`<b>${displayName ?? 'Active Area'}</b><br>Heat: <b>${heatLevel}</b>`)
        .addTo(group)

      group.addTo(map)
      clusterLayerRef.current = group
      map.setView([centerLat, centerLng], zoom)
    })
  }, [cluster, saved, zoom])

  // ── 6. ✅ NEW: Load existing saved boundary on mount ──────
  useEffect(() => {
    const existing = geoJsonToPoints(initialGeoJson)
    if (existing) {
      setPoints(existing)
      setUsingExisting(true)
      setSaved(false)
      setDrawing(false)
      setUsingSuggested(false)
      return
    }
    // No saved boundary — fall back to suggested circle if cluster is present
    if (cluster) {
      setPoints(buildCirclePolygon(cluster.centerLat, cluster.centerLng, cluster.radiusMeters, 12))
      setUsingSuggested(true)
      setSaved(false)
      setDrawing(false)
    }
  }, [initialGeoJson, cluster]) // re-run only when the block changes (key prop in parent forces remount)

  // Actions
  const reset = () => {
    const existing = geoJsonToPoints(initialGeoJson)
    if (existing) {
      setPoints(existing); setUsingExisting(true)
      setUsingSuggested(false)
    } else if (cluster) {
      setPoints(buildCirclePolygon(cluster.centerLat, cluster.centerLng, cluster.radiusMeters, 12))
      setUsingSuggested(true); setUsingExisting(false)
    } else {
      setPoints([]); setUsingSuggested(false); setUsingExisting(false)
    }
    setDrawing(false); setSaved(false)
  }

  const handleSave = () => {
    if (points.length >= 3) {
      onSave?.(points)
      setSaved(true)
      setDrawing(false)
      setUsingExisting(false)
    }
  }

  const startCustomDraw = () => {
    setPoints([])
    setUsingSuggested(false)
    setUsingExisting(false)
    setDrawing(true)
    setSaved(false)
  }

  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Show existing boundary controls */}
          {usingExisting && !saved ? (
            <>
              <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                ● Existing boundary loaded
              </span>
              <button onClick={handleSave} className="btn-success">
                <Check size={14} /> Keep This Boundary
              </button>
              <button onClick={startCustomDraw} className="btn-secondary">
                <MousePointer size={14} /> Redraw
              </button>
            </>
          ) : cluster && usingSuggested && !saved ? (
            <>
              <button
                onClick={() => { onSave?.(points); setSaved(true); setUsingSuggested(false) }}
                className="btn-success"
              >
                <Check size={14} /> Accept Suggested
              </button>
              <button onClick={startCustomDraw} className="btn-secondary">
                <MousePointer size={14} /> Draw Custom
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setSaved(false); setDrawing(d => !d) }}
                className={clsx('flex items-center gap-1.5', drawing ? 'btn-primary' : 'btn-secondary')}
              >
                <MousePointer size={14} /> {drawing ? 'Drawing… (click map)' : 'Draw Boundary'}
              </button>
              {points.length > 0 && (
                <button onClick={reset} className="btn-secondary">
                  <RotateCcw size={14} /> Reset
                </button>
              )}
              {points.length >= 3 && !saved && (
                <button onClick={handleSave} className="btn-primary">
                  <Check size={14} /> Save
                </button>
              )}
            </>
          )}
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Check size={11}/> Saved
            </span>
          )}
        </div>
      )}

      {/* MAP */}
      <div className="relative rounded-xl overflow-hidden border border-base-500" style={{ height: 400 }}>
        <div ref={mapElRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <p className="text-[11px] text-slate-600 font-mono">
        OpenStreetMap · Search to navigate · Click map points to draw a boundary ·{' '}
        {points.length >= 3 ? `${points.length} points` : 'need ≥ 3 points to save'}
      </p>
    </div>
  )
}

// import { useState, useEffect } from 'react'
// import { MousePointer, RotateCcw, Check, Info, Radio } from 'lucide-react'
// import clsx from 'clsx'

// // ============================================================
// // BoundaryDrawer.jsx
// // Mock map boundary drawer for the admin Block Editor.
// //
// // Changes from previous version:
// //   - Accepts a `cluster` prop (ClusterResponse object)
// //   - When cluster is provided, pre-loads a suggested circular
// //     boundary centered on cluster's center lat/lng
// //   - Admin can accept the suggestion as-is or reset and draw manually
// //   - Cluster blob glow shown as a pulsing circle before drawing
// //
// // In production, replace the canvas mock with Google Maps JS API
// // using DrawingManager and Polygon overlays.
// // Cluster center maps to a real lat/lng marker on the real map.
// // ============================================================

// const MOCK_BLOCKS = [
//   { id: 1, name: 'KIIT Campus',     x: 42, y: 30, w: 22, h: 28, color: '#f59e0b' },
//   { id: 2, name: 'Salt Lake Sec V', x: 68, y: 48, w: 18, h: 20, color: '#3b82f6' },
//   { id: 3, name: 'New Town',         x: 20, y: 58, w: 15, h: 16, color: '#22c55e' },
// ]

// // Heat level → glow color for the cluster blob preview
// const CLUSTER_HEAT_COLOR = {
//   cold:    '#FFF176',
//   mild:    '#FFD54F',
//   warm:    '#FFB300',
//   hot:     '#FF6D00',
//   on_fire: '#DD2C00',
// }

// // When a cluster is passed in, we place its center at this
// // mock position on the canvas so admin can see it
// // In production this is replaced by real lat/lng → pixel mapping
// const CLUSTER_MOCK_CENTER = { x: 52, y: 52 }

// // Suggested boundary radius as % of canvas width
// // In production this is calculated from cluster.radiusMeters + map zoom
// const CLUSTER_MOCK_RADIUS = 10

// export default function BoundaryDrawer({
//   clusterName,    // legacy prop — kept for backwards compat (non-cluster block creation)
//   cluster,        // NEW: ClusterResponse object — when set, pre-loads suggested boundary
//   onSave,
//   readOnly = false,
// }) {
//   const [drawing, setDrawing]               = useState(false)
//   const [points, setPoints]                 = useState([])
//   const [saved, setSaved]                   = useState(false)
//   const [usingSuggested, setUsingSuggested] = useState(false)

//   // -------------------------------------------------------
//   // When a cluster is passed in, pre-load the suggested
//   // circular boundary as a starting polygon (octagon approx)
//   // Admin can accept it or reset and draw their own
//   // -------------------------------------------------------
//   useEffect(() => {
//     if (!cluster) return

//     // Build an 8-point polygon approximating the suggested circle
//     const cx = CLUSTER_MOCK_CENTER.x
//     const cy = CLUSTER_MOCK_CENTER.y
//     const r  = CLUSTER_MOCK_RADIUS

//     const suggested = Array.from({ length: 8 }, (_, i) => {
//       const angle = (i / 8) * 2 * Math.PI
//       return {
//         x: cx + r * Math.cos(angle),
//         y: cy + r * Math.sin(angle),
//       }
//     })

//     setPoints(suggested)
//     setUsingSuggested(true)
//     setSaved(false)
//   }, [cluster])

//   // -------------------------------------------------------
//   // Map click — add a boundary point
//   // -------------------------------------------------------
//   const handleMapClick = (e) => {
//     if (readOnly || !drawing) return
//     const rect = e.currentTarget.getBoundingClientRect()
//     const x = ((e.clientX - rect.left) / rect.width)  * 100
//     const y = ((e.clientY - rect.top)  / rect.height) * 100
//     setPoints(prev => [...prev, { x, y }])
//   }

//   // -------------------------------------------------------
//   // Reset — clears drawn points
//   // If cluster is present, resets back to suggested boundary
//   // -------------------------------------------------------
//   const reset = () => {
//     if (cluster) {
//       // Re-load suggested boundary
//       const cx = CLUSTER_MOCK_CENTER.x
//       const cy = CLUSTER_MOCK_CENTER.y
//       const r  = CLUSTER_MOCK_RADIUS
//       const suggested = Array.from({ length: 8 }, (_, i) => {
//         const angle = (i / 8) * 2 * Math.PI
//         return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
//       })
//       setPoints(suggested)
//       setUsingSuggested(true)
//     } else {
//       setPoints([])
//     }
//     setDrawing(false)
//     setSaved(false)
//   }

//   // -------------------------------------------------------
//   // Save boundary
//   // -------------------------------------------------------
//   const handleSave = () => {
//     if (points.length < 3) return
//     onSave?.(points)
//     setSaved(true)
//     setDrawing(false)
//   }

//   // -------------------------------------------------------
//   // Accept suggested boundary as-is (no drawing needed)
//   // -------------------------------------------------------
//   const handleAcceptSuggested = () => {
//     onSave?.(points)
//     setSaved(true)
//     setUsingSuggested(false)
//   }

//   // -------------------------------------------------------
//   // Start drawing custom boundary (override suggestion)
//   // -------------------------------------------------------
//   const handleDrawCustom = () => {
//     setPoints([])
//     setUsingSuggested(false)
//     setDrawing(true)
//     setSaved(false)
//   }

//   const polyPath = points.map(p => `${p.x}%,${p.y}%`).join(' ')
//   const heatColor = CLUSTER_HEAT_COLOR[cluster?.heatLevel] ?? '#FFD54F'

//   return (
//     <div className="space-y-3">

//       {/* ── Toolbar ── */}
//       {!readOnly && (
//         <div className="flex items-center gap-2 flex-wrap">

//           {/* Suggested boundary actions — only shown when cluster is present */}
//           {cluster && usingSuggested && !saved && (
//             <>
//               <button
//                 onClick={handleAcceptSuggested}
//                 className="btn-success flex items-center gap-1.5"
//               >
//                 <Check size={14} />
//                 Accept Suggested Boundary
//               </button>
//               <button
//                 onClick={handleDrawCustom}
//                 className="btn-secondary flex items-center gap-1.5"
//               >
//                 <MousePointer size={14} />
//                 Draw Custom Instead
//               </button>
//             </>
//           )}

//           {/* Manual drawing controls */}
//           {!usingSuggested && (
//             <>
//               <button
//                 onClick={() => setDrawing(d => !d)}
//                 className={clsx(
//                   'flex items-center gap-1.5',
//                   drawing ? 'btn-primary' : 'btn-secondary'
//                 )}
//               >
//                 <MousePointer size={14} />
//                 {drawing ? 'Drawing… click map' : 'Draw Boundary'}
//               </button>

//               {points.length > 0 && (
//                 <>
//                   <button
//                     onClick={reset}
//                     className="btn-secondary flex items-center gap-1.5"
//                   >
//                     <RotateCcw size={14} />
//                     {cluster ? 'Reset to Suggested' : 'Reset'}
//                   </button>

//                   {points.length >= 3 && (
//                     <button
//                       onClick={handleSave}
//                       className={clsx(
//                         'flex items-center gap-1.5',
//                         saved ? 'btn-success' : 'btn-primary'
//                       )}
//                     >
//                       <Check size={14} />
//                       {saved ? 'Boundary Saved' : 'Save Boundary'}
//                     </button>
//                   )}
//                 </>
//               )}
//             </>
//           )}

//           {/* Saved state — reset option */}
//           {saved && (
//             <button
//               onClick={reset}
//               className="btn-secondary flex items-center gap-1.5"
//             >
//               <RotateCcw size={14} />
//               Redraw
//             </button>
//           )}

//           <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
//             <Info size={11} />
//             <span className="hidden sm:inline">
//               {cluster
//                 ? 'Suggested boundary pre-loaded from cluster activity'
//                 : 'Click on map to place boundary points (min 3)'
//               }
//             </span>
//           </div>
//         </div>
//       )}

//       {/* ── Map canvas ── */}
//       <div
//         className={clsx(
//           'relative bg-base-700 rounded-xl overflow-hidden border border-base-500',
//           drawing && 'cursor-crosshair border-amber-500/40',
//           'select-none'
//         )}
//         style={{ height: 360 }}
//         onClick={handleMapClick}
//       >
//         {/* Grid texture */}
//         <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />
//         </svg>

//         {/* Mock roads */}
//         <svg className="absolute inset-0 w-full h-full opacity-20">
//           <line x1="0"   y1="50%" x2="100%" y2="50%" stroke="#64748b" strokeWidth="2"/>
//           <line x1="50%" y1="0"   x2="50%"  y2="100%" stroke="#64748b" strokeWidth="2"/>
//           <line x1="25%" y1="0"   x2="25%"  y2="100%" stroke="#64748b" strokeWidth="1"/>
//           <line x1="75%" y1="0"   x2="75%"  y2="100%" stroke="#64748b" strokeWidth="1"/>
//           <line x1="0"   y1="25%" x2="100%" y2="25%"  stroke="#64748b" strokeWidth="1"/>
//           <line x1="0"   y1="75%" x2="100%" y2="75%"  stroke="#64748b" strokeWidth="1"/>
//         </svg>

//         {/* Existing official blocks */}
//         {MOCK_BLOCKS.map(block => (
//           <div
//             key={block.id}
//             className="absolute rounded border-2 flex items-center justify-center"
//             style={{
//               left: `${block.x}%`, top: `${block.y}%`,
//               width: `${block.w}%`, height: `${block.h}%`,
//               borderColor: block.color,
//               backgroundColor: block.color + '18',
//             }}
//           >
//             <span
//               className="text-[10px] font-mono text-center px-1"
//               style={{ color: block.color }}
//             >
//               {block.name}
//             </span>
//           </div>
//         ))}

//         {/* ── Cluster blob glow (shown before boundary is saved) ── */}
//         {cluster && !saved && (
//           <>
//             {/* Outer glow ring */}
//             <div
//               className="absolute rounded-full pointer-events-none"
//               style={{
//                 left:   `${CLUSTER_MOCK_CENTER.x - CLUSTER_MOCK_RADIUS * 1.6}%`,
//                 top:    `${CLUSTER_MOCK_CENTER.y - CLUSTER_MOCK_RADIUS * 1.6}%`,
//                 width:  `${CLUSTER_MOCK_RADIUS * 3.2}%`,
//                 height: `${CLUSTER_MOCK_RADIUS * 3.2}%`,
//                 background: `radial-gradient(circle, ${heatColor}22 0%, transparent 70%)`,
//               }}
//             />
//             {/* Center dot */}
//             <div
//               className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse pointer-events-none"
//               style={{
//                 left:            `${CLUSTER_MOCK_CENTER.x}%`,
//                 top:             `${CLUSTER_MOCK_CENTER.y}%`,
//                 backgroundColor: heatColor,
//               }}
//             />
//             {/* Cluster name label */}
//             <div
//               className="absolute -translate-x-1/2 pointer-events-none"
//               style={{
//                 left: `${CLUSTER_MOCK_CENTER.x}%`,
//                 top:  `${CLUSTER_MOCK_CENTER.y + CLUSTER_MOCK_RADIUS + 2}%`,
//               }}
//             >
//               <span
//                 className="text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap"
//                 style={{
//                   color:           heatColor,
//                   backgroundColor: 'rgba(15,23,42,0.85)',
//                   border:          `1px solid ${heatColor}44`,
//                 }}
//               >
//                 {cluster.displayName ?? 'Active Area'} · {cluster.heatLevel}
//               </span>
//             </div>
//           </>
//         )}

//         {/* ── Drawn / suggested polygon ── */}
//         {points.length >= 3 && (
//           <svg className="absolute inset-0 w-full h-full pointer-events-none">
//             <polygon
//               points={polyPath}
//               fill={usingSuggested ? `${heatColor}22` : 'rgba(245,158,11,0.15)'}
//               stroke={usingSuggested ? heatColor : '#f59e0b'}
//               strokeWidth="2"
//               strokeDasharray={saved ? '0' : '6,3'}
//             />
//           </svg>
//         )}

//         {/* Polyline while still drawing (< 3 points) */}
//         {points.length >= 2 && points.length < 3 && (
//           <svg className="absolute inset-0 w-full h-full pointer-events-none">
//             <polyline
//               points={polyPath}
//               fill="none"
//               stroke="#f59e0b"
//               strokeWidth="2"
//               strokeDasharray="6,3"
//             />
//           </svg>
//         )}

//         {/* Boundary point dots */}
//         {points.map((p, i) => (
//           <div
//             key={i}
//             className="absolute w-2.5 h-2.5 rounded-full border-2 border-base-900 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
//             style={{
//               left:            `${p.x}%`,
//               top:             `${p.y}%`,
//               backgroundColor: usingSuggested ? heatColor : '#f59e0b',
//             }}
//           />
//         ))}

//         {/* Legacy: cluster name marker when no cluster prop and no points */}
//         {!cluster && clusterName && points.length === 0 && (
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
//             <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1 animate-pulse" />
//             <span className="text-amber-400 text-xs font-mono bg-base-800/80 px-2 py-0.5 rounded">
//               {clusterName}
//             </span>
//           </div>
//         )}

//         {/* Corner label */}
//         <div className="absolute top-2 left-2 bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-base-600">
//           Mock Map · Bhubaneswar, Odisha
//         </div>

//         {/* Suggested boundary pill */}
//         {cluster && usingSuggested && !saved && (
//           <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded border border-amber-500/30">
//             <Radio size={10} className="text-amber-400" />
//             <span className="text-[10px] font-mono text-amber-400">Suggested boundary</span>
//           </div>
//         )}

//         {/* Point count */}
//         {points.length > 0 && !usingSuggested && (
//           <div className="absolute bottom-2 right-2 bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/20">
//             {points.length} point{points.length !== 1 ? 's' : ''} placed
//           </div>
//         )}

//         {/* Saved state overlay */}
//         {saved && (
//           <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-green-900/80 backdrop-blur-sm px-2 py-1 rounded border border-green-500/30">
//             <Check size={10} className="text-green-400" />
//             <span className="text-[10px] font-mono text-green-400">Boundary saved</span>
//           </div>
//         )}
//       </div>

//       {/* Footer note */}
//       <p className="text-[11px] text-slate-600 font-mono">
//         {cluster
//           ? `Cluster center: ${cluster.centerLat?.toFixed(4)}°N, ${cluster.centerLng?.toFixed(4)}°E · radius ~${cluster.radiusMeters}m · In production, boundary pre-loads from real cluster GPS data.`
//           : 'Note: In production this uses Google Maps Drawing Manager API for precise polygon boundaries.'
//         }
//       </p>
//     </div>
//   )
// }
// import { useState, useEffect, useRef } from 'react'
// import { MousePointer, RotateCcw, Check, Info, Radio } from 'lucide-react'
// import clsx from 'clsx'

// // ============================================================
// // BoundaryDrawer.jsx
// // Real map boundary drawer using Leaflet + OpenStreetMap.
// //
// // Install dependencies:
// //   npm install leaflet
// //   npm install -D @types/leaflet   (if using TypeScript)
// //
// // Add to your global CSS (index.css or App.css):
// //   @import 'leaflet/dist/leaflet.css';
// //
// // Props:
// //   clusterName  — legacy label shown when no cluster + no points
// //   cluster      — ClusterResponse object; pre-loads suggested boundary
// //   onSave(latlngs) — called with array of { lat, lng } on save
// //   readOnly     — disables all editing
// //   center       — [lat, lng] default map center (fallback if no cluster)
// //   zoom         — default zoom level (default 15)
// // ============================================================

// const CLUSTER_HEAT_COLOR = {
//   cold:    '#FFF176',
//   mild:    '#FFD54F',
//   warm:    '#FFB300',
//   hot:     '#FF6D00',
//   on_fire: '#DD2C00',
// }

// // Build an N-point polygon approximating a circle given center + radiusMeters
// function buildCirclePolygon(lat, lng, radiusMeters, sides = 12) {
//   const R = radiusMeters / 111320          // degrees per meter (lat)
//   return Array.from({ length: sides }, (_, i) => {
//     const angle = (i / sides) * 2 * Math.PI
//     return {
//       lat: lat + R * Math.cos(angle),
//       lng: lng + R * Math.sin(angle) / Math.cos((lat * Math.PI) / 180),
//     }
//   })
// }

// export default function BoundaryDrawer({
//   clusterName,
//   cluster,
//   onSave,
//   readOnly = false,
//   center = [20.2961, 85.8245],   // Bhubaneswar default
//   zoom   = 15,
// }) {
//   const mapRef        = useRef(null)   // Leaflet map instance
//   const mapElRef      = useRef(null)   // DOM div
//   const markersRef    = useRef([])     // L.circleMarker array
//   const polylineRef   = useRef(null)   // L.polyline (< 3 pts)
//   const polygonRef    = useRef(null)   // L.polygon  (≥ 3 pts)
//   const clusterLayerRef = useRef(null) // L.layerGroup for cluster blob

//   const [drawing,        setDrawing]        = useState(false)
//   const [points,         setPoints]         = useState([])   // [{ lat, lng }]
//   const [saved,          setSaved]          = useState(false)
//   const [usingSuggested, setUsingSuggested] = useState(false)

//   const heatColor = CLUSTER_HEAT_COLOR[cluster?.heatLevel] ?? '#FFD54F'

//   // ── Init Leaflet map once ──────────────────────────────────


//     // Dynamically import Leaflet so SSR environments don't break
// // ── Init Leaflet map once ──────────────────────────────────
//   useEffect(() => {
//     if (mapRef.current || !mapElRef.current) return;

//     let mapInstance = null;

//     // We use Promise.all to load Leaflet and the Geocoder at the same time
//     Promise.all([
//       import('leaflet'),
//       import('leaflet-control-geocoder'),
//       // Import the geocoder CSS directly so it loads with the map
//       import('leaflet-control-geocoder/dist/Control.Geocoder.css') 
//     ]).then(([L]) => {
//       if (mapRef.current || !mapElRef.current) return;

//       // Fix default marker icons
//       delete L.Icon.Default.prototype._getIconUrl;
//       L.Icon.Default.mergeOptions({
//         iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
//         iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
//       });

//       const initialCenter = cluster ? [cluster.centerLat, cluster.centerLng] : center;

//       // Initialize map
//       mapInstance = L.map(mapElRef.current, {
//         center: initialCenter,
//         zoom,
//         zoomControl: true,
//       });

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors',
//         maxZoom: 19,
//       }).addTo(mapInstance);

//       // ── ADD SEARCH CONTROL HERE ──
//       const geocoder = L.Control.geocoder({
//         defaultMarkGeocode: false, // Don't drop a marker, just move the map
//         placeholder: "Search location...",
//       })
//         .on('markgeocode', function(e) {
//           const bbox = e.geocode.bbox;
//           // Zoom the map to the found area
//           mapInstance.fitBounds([
//             [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
//             [bbox.getNorthWest().lat, bbox.getNorthWest().lng]
//           ]);
//         })
//         .addTo(mapInstance);

//       // Force layout recalculation
//       setTimeout(() => {
//         mapInstance.invalidateSize();
//       }, 100);

//       mapRef.current = mapInstance;
//     });

//     return () => {
//       if (mapInstance) {
//         mapInstance.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);
//   // 1. If we already have a map, don't try to create another one
//  // Empty dependency array keeps this to mount/unmount only

//   // ── Map click handler (add point while drawing) ────────────
//   useEffect(() => {
//     const map = mapRef.current
//     if (!map) return

//     const onClick = (e) => {
//       if (!drawing || readOnly || saved) return
//       const { lat, lng } = e.latlng
//       setPoints(prev => [...prev, { lat, lng }])
//     }

//     map.on('click', onClick)
//     return () => map.off('click', onClick)
//   }, [drawing, readOnly, saved])

//   // ── Cursor style ───────────────────────────────────────────
//   useEffect(() => {
//     if (!mapElRef.current) return
//     mapElRef.current.style.cursor = drawing ? 'crosshair' : ''
//   }, [drawing])

//   // ── Re-render markers + polygon when points change ─────────
//   useEffect(() => {
//     import('leaflet').then(L => {
//       const map = mapRef.current
//       if (!map) return

//       // Clear old markers
//       markersRef.current.forEach(m => map.removeLayer(m))
//       markersRef.current = []
//       if (polylineRef.current) { map.removeLayer(polylineRef.current); polylineRef.current = null }
//       if (polygonRef.current)  { map.removeLayer(polygonRef.current);  polygonRef.current  = null }

//       if (points.length === 0) return

//       const latlngs = points.map(p => [p.lat, p.lng])
//       const color   = usingSuggested ? heatColor : '#f59e0b'

//       // Draw dots for each point
//       points.forEach(p => {
//         const dot = L.circleMarker([p.lat, p.lng], {
//           radius:      5,
//           color:       '#0f172a',
//           weight:      1.5,
//           fillColor:   color,
//           fillOpacity: 1,
//         }).addTo(map)
//         markersRef.current.push(dot)
//       })

//       if (points.length >= 3) {
//         polygonRef.current = L.polygon(latlngs, {
//           color,
//           weight:      2,
//           dashArray:   saved ? undefined : '8 4',
//           fillColor:   color,
//           fillOpacity: 0.15,
//         }).addTo(map)
//       } else if (points.length === 2) {
//         polylineRef.current = L.polyline(latlngs, {
//           color,
//           weight:    2,
//           dashArray: '8 4',
//         }).addTo(map)
//       }
//     })
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [points, saved, usingSuggested, heatColor])

//   // ── Cluster blob + suggested boundary on cluster prop ──────
//   useEffect(() => {
//     import('leaflet').then(L => {
//       const map = mapRef.current
//       if (!map) return

//       // Remove old cluster layers
//       if (clusterLayerRef.current) {
//         map.removeLayer(clusterLayerRef.current)
//         clusterLayerRef.current = null
//       }

//       if (!cluster || saved) return

//       const { centerLat, centerLng, radiusMeters, displayName, heatLevel } = cluster
//       const color = CLUSTER_HEAT_COLOR[heatLevel] ?? '#FFD54F'

//       const group = L.layerGroup()

//       // Soft glow circle
//       L.circle([centerLat, centerLng], {
//         radius:      radiusMeters * 1.6,
//         color:       'transparent',
//         fillColor:   color,
//         fillOpacity: 0.08,
//       }).addTo(group)

//       // Hard boundary circle (the suggested boundary preview)
//       L.circle([centerLat, centerLng], {
//         radius:      radiusMeters,
//         color,
//         weight:      1.5,
//         dashArray:   '6 4',
//         fillColor:   color,
//         fillOpacity: 0.12,
//       }).addTo(group)

//       // Pulsing center marker using a DivIcon
//       const pulseIcon = L.divIcon({
//         html: `<div style="
//           width:14px;height:14px;border-radius:50%;
//           background:${color};border:2px solid #fff;
//           animation:nm-pulse 1.2s ease-in-out infinite;
//         "></div>
//         <style>
//           @keyframes nm-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
//         </style>`,
//         className:  '',
//         iconSize:   [14, 14],
//         iconAnchor: [7, 7],
//       })

//       L.marker([centerLat, centerLng], { icon: pulseIcon })
//         .bindPopup(
//           `<b>${displayName ?? 'Active Area'}</b><br>
//            Heat: <b>${heatLevel}</b><br>
//            ${cluster.uniqueUserCount ?? '?'} users · ${cluster.requestCount ?? '?'} requests · ${cluster.activeDays ?? '?'} days<br>
//            <span style="color:#888;font-size:11px">${centerLat.toFixed(4)}°N, ${centerLng.toFixed(4)}°E · ~${radiusMeters}m radius</span>`,
//           { maxWidth: 240 }
//         )
//         .addTo(group)
//         .openPopup()

//       group.addTo(map)
//       clusterLayerRef.current = group

//       map.setView([centerLat, centerLng], zoom)
//     })
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [cluster, saved])

//   // Remove cluster glow once saved
//   useEffect(() => {
//     if (saved && clusterLayerRef.current && mapRef.current) {
//       mapRef.current.removeLayer(clusterLayerRef.current)
//       clusterLayerRef.current = null
//     }
//   }, [saved])

//   // ── Pre-load suggested boundary when cluster arrives ───────
//   useEffect(() => {
//     if (!cluster) return
//     const pts = buildCirclePolygon(
//       cluster.centerLat,
//       cluster.centerLng,
//       cluster.radiusMeters,
//       12
//     )
//     setPoints(pts)
//     setUsingSuggested(true)
//     setSaved(false)
//     setDrawing(false)
//   }, [cluster])

//   // ── Actions ────────────────────────────────────────────────
//   const reset = () => {
//     if (cluster) {
//       const pts = buildCirclePolygon(cluster.centerLat, cluster.centerLng, cluster.radiusMeters, 12)
//       setPoints(pts)
//       setUsingSuggested(true)
//     } else {
//       setPoints([])
//       setUsingSuggested(false)
//     }
//     setDrawing(false)
//     setSaved(false)
//   }

//   const handleSave = () => {
//     if (points.length < 3) return
//     onSave?.(points)
//     setSaved(true)
//     setDrawing(false)
//   }

//   const handleAcceptSuggested = () => {
//     onSave?.(points)
//     setSaved(true)
//     setUsingSuggested(false)
//   }

//   const handleDrawCustom = () => {
//     setPoints([])
//     setUsingSuggested(false)
//     setDrawing(true)
//     setSaved(false)
//   }

//   // ── Render ─────────────────────────────────────────────────
//   return (
//     <div className="space-y-3">

//       {/* ── Toolbar ── */}
//       {!readOnly && (
//         <div className="flex items-center gap-2 flex-wrap">

//           {cluster && usingSuggested && !saved && (
//             <>
//               <button
//                 onClick={handleAcceptSuggested}
//                 className="btn-success flex items-center gap-1.5"
//               >
//                 <Check size={14} />
//                 Accept Suggested Boundary
//               </button>
//               <button
//                 onClick={handleDrawCustom}
//                 className="btn-secondary flex items-center gap-1.5"
//               >
//                 <MousePointer size={14} />
//                 Draw Custom Instead
//               </button>
//             </>
//           )}

//           {!usingSuggested && (
//             <>
//               <button
//                 onClick={() => {
//                   setSaved(false)
//                   setDrawing(d => !d)
//                 }}
//                 className={clsx(
//                   'flex items-center gap-1.5',
//                   drawing ? 'btn-primary' : 'btn-secondary'
//                 )}
//               >
//                 <MousePointer size={14} />
//                 {drawing ? 'Drawing… click map' : 'Draw Boundary'}
//               </button>

//               {points.length > 0 && (
//                 <>
//                   <button onClick={reset} className="btn-secondary flex items-center gap-1.5">
//                     <RotateCcw size={14} />
//                     {cluster ? 'Reset to Suggested' : 'Reset'}
//                   </button>

//                   {points.length >= 3 && !saved && (
//                     <button onClick={handleSave} className="btn-primary flex items-center gap-1.5">
//                       <Check size={14} />
//                       Save Boundary
//                     </button>
//                   )}
//                 </>
//               )}
//             </>
//           )}

//           {saved && (
//             <button onClick={reset} className="btn-secondary flex items-center gap-1.5">
//               <RotateCcw size={14} />
//               Redraw
//             </button>
//           )}

//           {saved && (
//             <span className="flex items-center gap-1.5 text-xs text-green-400">
//               <Check size={11} />
//               Boundary saved
//             </span>
//           )}

//           <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
//             <Info size={11} />
//             <span className="hidden sm:inline">
//               {cluster
//                 ? 'Suggested boundary pre-loaded from cluster activity'
//                 : 'Click on map to place boundary points (min 3)'}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* ── Leaflet Map ── */}
//       <div className="relative rounded-xl overflow-hidden border border-base-500" style={{ height: 400 }}>
//         <div ref={mapElRef} style={{ width: '100%', height: '100%' }} />

//         {/* Suggested boundary pill overlay */}
//         {cluster && usingSuggested && !saved && (
//           <div className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded border border-amber-500/30">
//             <Radio size={10} className="text-amber-400" />
//             <span className="text-[10px] font-mono text-amber-400">Suggested boundary</span>
//           </div>
//         )}

//         {/* Point count pill */}
//         {points.length > 0 && !usingSuggested && !saved && (
//           <div className="absolute bottom-2 right-2 z-[1000] bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/20">
//             {points.length} point{points.length !== 1 ? 's' : ''} placed
//           </div>
//         )}

//         {/* Saved overlay */}
//         {saved && (
//           <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1.5 bg-green-900/80 backdrop-blur-sm px-2 py-1 rounded border border-green-500/30">
//             <Check size={10} className="text-green-400" />
//             <span className="text-[10px] font-mono text-green-400">Boundary saved</span>
//           </div>
//         )}

//         {/* Legacy label (no cluster, no points) */}
//         {!cluster && clusterName && points.length === 0 && (
//           <div className="absolute top-2 left-12 z-[1000]">
//             <span className="text-amber-400 text-xs font-mono bg-base-800/80 px-2 py-1 rounded border border-amber-500/20">
//               {clusterName}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <p className="text-[11px] text-slate-600 font-mono">
//         {cluster
//           ? `Cluster center: ${cluster.centerLat?.toFixed(4)}°N, ${cluster.centerLng?.toFixed(4)}°E · radius ~${cluster.radiusMeters}m`
//           : 'OpenStreetMap tiles · boundary coords output as real lat/lng array'}
//       </p>
//     </div>
//   )
// }




// import { useState, useEffect, useRef } from 'react'
// import { MousePointer, RotateCcw, Check, Info, Radio } from 'lucide-react'
// import clsx from 'clsx'

// // ============================================================
// // BoundaryDrawer.jsx
// // ============================================================

// const CLUSTER_HEAT_COLOR = {
//   cold:    '#FFF176',
//   mild:    '#FFD54F',
//   warm:    '#FFB300',
//   hot:     '#FF6D00',
//   on_fire: '#DD2C00',
// }

// function buildCirclePolygon(lat, lng, radiusMeters, sides = 12) {
//   const R = radiusMeters / 111320
//   return Array.from({ length: sides }, (_, i) => {
//     const angle = (i / sides) * 2 * Math.PI
//     return {
//       lat: lat + R * Math.cos(angle),
//       lng: lng + R * Math.sin(angle) / Math.cos((lat * Math.PI) / 180),
//     }
//   })
// }

// export default function BoundaryDrawer({
//   clusterName,
//   cluster,
//   onSave,
//   readOnly = false,
//   center = [20.2961, 85.8245], 
//   zoom   = 15,
// }) {
//   const mapRef          = useRef(null) 
//   const mapElRef        = useRef(null) 
//   const markersRef      = useRef([]) 
//   const polylineRef     = useRef(null) 
//   const polygonRef      = useRef(null) 
//   const clusterLayerRef = useRef(null) 

//   const [drawing,        setDrawing]        = useState(false)
//   const [points,         setPoints]         = useState([]) 
//   const [saved,          setSaved]          = useState(false)
//   const [usingSuggested, setUsingSuggested] = useState(false)

//   const heatColor = CLUSTER_HEAT_COLOR[cluster?.heatLevel] ?? '#FFD54F'

//   // ── 1. Init Leaflet map once + Search Control ──────────────
//   useEffect(() => {
//     if (mapRef.current || !mapElRef.current) return;

//     let mapInstance = null;

//     Promise.all([
//       import('leaflet'),
//       import('leaflet-control-geocoder'),
//       import('leaflet-control-geocoder/dist/Control.Geocoder.css') 
//     ]).then(([L]) => {
//       if (mapRef.current || !mapElRef.current) return;

//       // Fix default marker icons
//       delete L.Icon.Default.prototype._getIconUrl;
//       L.Icon.Default.mergeOptions({
//         iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
//         iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
//       });

//       const initialCenter = cluster ? [cluster.centerLat, cluster.centerLng] : center;

//       mapInstance = L.map(mapElRef.current, {
//         center: initialCenter,
//         zoom,
//         zoomControl: true,
//       });

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors',
//         maxZoom: 19,
//       }).addTo(mapInstance);

//       // --- ADDED SEARCH CONTROL ---
//       const geocoder = L.Control.geocoder({
//         defaultMarkGeocode: false,
//         placeholder: "Search location...",
//       })
//         .on('markgeocode', function(e) {
//           const bbox = e.geocode.bbox;
//           mapInstance.fitBounds([
//             [bbox.getSouthEast().lat, bbox.getSouthEast().lng],
//             [bbox.getNorthWest().lat, bbox.getNorthWest().lng]
//           ]);
//         })
//         .addTo(mapInstance);

//       setTimeout(() => {
//         mapInstance.invalidateSize();
//       }, 100);

//       mapRef.current = mapInstance;
//     });

//     return () => {
//       if (mapInstance) {
//         mapInstance.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []); 

//   // ── 2. Click handler (Keep logic identical) ────────────
//   useEffect(() => {
//     const map = mapRef.current
//     if (!map) return
//     const onClick = (e) => {
//       if (!drawing || readOnly || saved) return
//       setPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
//     }
//     map.on('click', onClick)
//     return () => map.off('click', onClick)
//   }, [drawing, readOnly, saved])

//   // ── 3. Cursor style ──────────────────────────────────────
//   useEffect(() => {
//     if (!mapElRef.current) return
//     mapElRef.current.style.cursor = drawing ? 'crosshair' : ''
//   }, [drawing])

//   // ── 4. Re-render markers + polygon ───────────────────────
//   useEffect(() => {
//     import('leaflet').then(L => {
//       const map = mapRef.current
//       if (!map) return

//       markersRef.current.forEach(m => map.removeLayer(m))
//       markersRef.current = []
//       if (polylineRef.current) { map.removeLayer(polylineRef.current); polylineRef.current = null }
//       if (polygonRef.current)  { map.removeLayer(polygonRef.current);  polygonRef.current  = null }

//       if (points.length === 0) return

//       const latlngs = points.map(p => [p.lat, p.lng])
//       const color   = usingSuggested ? heatColor : '#f59e0b'

//       points.forEach(p => {
//         const dot = L.circleMarker([p.lat, p.lng], {
//           radius: 5, color: '#0f172a', weight: 1.5, fillColor: color, fillOpacity: 1,
//         }).addTo(map)
//         markersRef.current.push(dot)
//       })

//       if (points.length >= 3) {
//         polygonRef.current = L.polygon(latlngs, {
//           color, weight: 2, dashArray: saved ? undefined : '8 4', fillColor: color, fillOpacity: 0.15,
//         }).addTo(map)
//       } else if (points.length === 2) {
//         polylineRef.current = L.polyline(latlngs, { color, weight: 2, dashArray: '8 4' }).addTo(map)
//       }
//     })
//   }, [points, saved, usingSuggested, heatColor])

//   // ── 5. Cluster Logic & Suggested Boundary ────────────────
//   useEffect(() => {
//     import('leaflet').then(L => {
//       const map = mapRef.current
//       if (!map || !cluster || saved) return

//       if (clusterLayerRef.current) map.removeLayer(clusterLayerRef.current)

//       const { centerLat, centerLng, radiusMeters, displayName, heatLevel } = cluster
//       const color = CLUSTER_HEAT_COLOR[heatLevel] ?? '#FFD54F'
//       const group = L.layerGroup()

//       L.circle([centerLat, centerLng], { radius: radiusMeters * 1.6, color: 'transparent', fillColor: color, fillOpacity: 0.08 }).addTo(group)
//       L.circle([centerLat, centerLng], { radius: radiusMeters, color, weight: 1.5, dashArray: '6 4', fillColor: color, fillOpacity: 0.12 }).addTo(group)

//       const pulseIcon = L.divIcon({
//         html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;animation:nm-pulse 1.2s ease-in-out infinite;"></div><style>@keyframes nm-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}</style>`,
//         className: '', iconSize: [14, 14], iconAnchor: [7, 7],
//       })

//       L.marker([centerLat, centerLng], { icon: pulseIcon })
//         .bindPopup(`<b>${displayName ?? 'Active Area'}</b><br>Heat: <b>${heatLevel}</b>`)
//         .addTo(group)

//       group.addTo(map)
//       clusterLayerRef.current = group
//       map.setView([centerLat, centerLng], zoom)
//     })
//   }, [cluster, saved, zoom])

//   useEffect(() => {
//     if (!cluster) return
//     setPoints(buildCirclePolygon(cluster.centerLat, cluster.centerLng, cluster.radiusMeters, 12))
//     setUsingSuggested(true); setSaved(false); setDrawing(false)
//   }, [cluster])

//   // Actions
//   const reset = () => {
//     if (cluster) {
//       setPoints(buildCirclePolygon(cluster.centerLat, cluster.centerLng, cluster.radiusMeters, 12))
//       setUsingSuggested(true)
//     } else {
//       setPoints([]); setUsingSuggested(false)
//     }
//     setDrawing(false); setSaved(false)
//   }

//   const handleSave = () => { if (points.length >= 3) { onSave?.(points); setSaved(true); setDrawing(false) } }

//   return (
//     <div className="space-y-3">
//       {/* TOOLBAR */}
//       {!readOnly && (
//         <div className="flex items-center gap-2 flex-wrap">
//           {cluster && usingSuggested && !saved ? (
//             <>
//               <button onClick={() => { onSave?.(points); setSaved(true); setUsingSuggested(false) }} className="btn-success">
//                 <Check size={14} /> Accept Suggested
//               </button>
//               <button onClick={() => { setPoints([]); setUsingSuggested(false); setDrawing(true); setSaved(false) }} className="btn-secondary">
//                 <MousePointer size={14} /> Draw Custom
//               </button>
//             </>
//           ) : (
//             <>
//               <button onClick={() => { setSaved(false); setDrawing(d => !d) }} className={clsx('flex items-center gap-1.5', drawing ? 'btn-primary' : 'btn-secondary')}>
//                 <MousePointer size={14} /> {drawing ? 'Drawing…' : 'Draw Boundary'}
//               </button>
//               {points.length > 0 && (
//                 <button onClick={reset} className="btn-secondary"><RotateCcw size={14} /> Reset</button>
//               )}
//               {points.length >= 3 && !saved && (
//                 <button onClick={handleSave} className="btn-primary"><Check size={14} /> Save</button>
//               )}
//             </>
//           )}
//           {saved && <span className="text-xs text-green-400 flex items-center gap-1"><Check size={11}/> Saved</span>}
//         </div>
//       )}

//       {/* MAP */}
//       <div className="relative rounded-xl overflow-hidden border border-base-500" style={{ height: 400 }}>
//         <div ref={mapElRef} style={{ width: '100%', height: '100%' }} />
//       </div>

//       <p className="text-[11px] text-slate-600 font-mono">
//         OpenStreetMap tiles · Use the search bar to find specific areas.
//       </p>
//     </div>
//   )
// }