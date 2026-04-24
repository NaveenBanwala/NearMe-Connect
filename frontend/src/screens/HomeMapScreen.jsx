import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { BlockBoundary }     from '../components/map/BlockBoundary.jsx'
import { ModeSwitcher }      from '../components/map/ModeSwitcher.jsx'
import { RadiusCircle }      from '../components/map/RadiusCircle.jsx'
import { NearbyRequestRow }  from '../components/requests/NearbyRequestRow.jsx'
import { RequestPin }        from '../components/map/RequestPin.jsx'
import { useBlockStore }     from '../store/blockStore.js'
import { useMapStore }       from '../store/mapStore.js'
import { useBrowserLocation } from '../hooks/useLocation.js'
import { useRequestStore }   from '../store/requestStore.js'
import { useAuthStore }      from '../store/authStore.js'
import { ROUTES }            from '../navigation/routes.js'
import { MAP_MODES }         from '../utils/constants.js'
import { MapView, FitBounds } from '../components/map/MapView.jsx'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../config/maps.js'

// 1. Add import at top
import { RequestClusterCircle } from '../components/map/RequestClusterCircle.jsx'
import { groupRequestsIntoCircles } from '../utils/requestClusterUtils.js'

import useClusterOverlay, {
  ClusterOverlay,
  ClusterSheet,
} from '../components/clusters/ClusterOverlay.jsx'

function parseBoundary(boundaryGeoJson) {
  if (!boundaryGeoJson) return []
  try {
    const geo = typeof boundaryGeoJson === 'string'
      ? JSON.parse(boundaryGeoJson)
      : boundaryGeoJson
    const polygon = geo.type === 'Feature' ? geo.geometry : geo
    if (polygon?.type !== 'Polygon' || !polygon.coordinates?.[0]) return []
    return polygon.coordinates[0].map(([lng, lat]) => ({ lat, lng }))
  } catch {
    return []
  }
}

export function HomeMapScreen() {
  const navigate = useNavigate()

  const blocks             = useBlockStore((s) => s.blocks)
  const loadNearbyBlocks   = useBlockStore((s) => s.loadNearbyBlocks)
  const loadAllBlocks = useBlockStore((s) => s.loadAllBlocks)
  const mode               = useMapStore((s) => s.mode)
  const setMode            = useMapStore((s) => s.setMode)
  const radiusMeters       = useMapStore((s) => s.radiusMeters)
  const nearbyRequests     = useRequestStore((s) => s.nearbyRequests)
  const loadNearbyRequests = useRequestStore((s) => s.loadNearbyRequests)

  const requests      = nearbyRequests || []
  const displayBlocks = blocks         || []

  const { coords } = useBrowserLocation()
  const center = useMemo(() => {
    if (!coords) return DEFAULT_MAP_CENTER
    return { lat: coords.lat, lng: coords.lng }
  }, [coords?.lat, coords?.lng])

  const [panelOpen, setPanelOpen] = useState(true)
  const [mapCenter, setMapCenter] = useState(null)

  // Debounce map move to avoid spamming cluster fetches on every drag pixel
  const mapMoveTimer = useRef(null)
  const handleMapMove = useCallback((c) => {
    clearTimeout(mapMoveTimer.current)
    mapMoveTimer.current = setTimeout(() => setMapCenter(c), 600)
  }, [])

  // Use GPS coords as fallback when user hasn't panned the map yet
  const effectiveCenter = mapCenter ?? center

  const { onBlobClick } = useClusterOverlay()

  // useEffect(() => {
  //   const lat = coords?.lat ?? DEFAULT_MAP_CENTER.lat
  //   const lng = coords?.lng ?? DEFAULT_MAP_CENTER.lng
  //   loadNearbyBlocks(lat, lng)
  // }, [coords?.lat, coords?.lng, loadNearbyBlocks])
  useEffect(() => {
  loadAllBlocks()
}, [loadAllBlocks])

  useEffect(() => {
    const lat = coords?.lat ?? DEFAULT_MAP_CENTER.lat
    const lng = coords?.lng ?? DEFAULT_MAP_CENTER.lng
    loadNearbyRequests(lat, lng)
  }, [coords?.lat, coords?.lng, loadNearbyRequests])

  const pins = useMemo(() => {
    return requests
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id:        r.request_id,
        position:  { lat: r.latitude, lng: r.longitude },
        title:     r.title,
        type:      r.type?.toLowerCase() || 'help',
        isFreePin: !r.block_id && !r.cluster_id,
      }))
  }, [requests])

  // 2. Add below existing pins useMemo
const requestCircles = useMemo(
  () => groupRequestsIntoCircles(requests),
  [requests]
)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-map">

      <header className="flex items-start justify-between px-4 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">NearMe</h1>
          <p className="text-sm text-slate-400">
            {coords ? 'Near you' : 'Locating…'}
          </p>
        </div>
        <Link
          to={ROUTES.notifications}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg backdrop-blur"
        >
          🔔
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-map" />
        </Link>
      </header>

      <div className="px-4 pb-3">
        <ModeSwitcher value={mode} onChange={setMode} variant="dark" />
      </div>

      <div className="relative flex-1 px-3 transition-all duration-300">

        {displayBlocks.length > 0 && (
          <div className="pointer-events-none absolute inset-x-4 top-0 z-10 flex gap-2 overflow-x-auto pb-2">
            {displayBlocks.map((b) => (
              <div
                key={b.block_id}
                className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur"
              >
                <button
                  type="button"
                  className="text-left text-sm font-semibold text-slate-900"
                  onClick={() => navigate(ROUTES.block(b.block_id))}
                >
                  {b.name}
                </button>
              </div>
            ))}
          </div>
        )}

        <MapView
          center={center}
          zoom={DEFAULT_MAP_ZOOM}
          onMapMove={handleMapMove}
          mapContainerClassName="h-full w-full rounded-2xl border border-white/10 shadow-inner"
        >
          {/* <FitBounds blocks={displayBlocks} /> */}

          {displayBlocks.map((b) => (
            <BlockBoundary
              key={b.block_id}
              paths={parseBoundary(b.boundary_geo_json)}
              category={b.category}
              onClick={() => navigate(ROUTES.block(b.block_id))}
            />
          ))}

          {mode === MAP_MODES.RADIUS && (
            <RadiusCircle center={center} radiusMeters={radiusMeters} />
          )}

          {pins.map((p) => (
            <RequestPin
              key={p.id}
              position={p.position}
              title={p.title}
              type={p.type}
              isFreePin={p.isFreePin}
              onClick={() => navigate(ROUTES.request(p.id))}
            />
          ))}
          {/* // 3. Add inside <MapView>, after the {pins.map(...)} block */}
{requestCircles.map((group, i) => (
  <RequestClusterCircle key={i} group={group} />
))}
          

          <ClusterOverlay onBlobClick={onBlobClick} mapCenter={effectiveCenter} />
        </MapView>
      </div>

      <section
        className={[
          'relative z-20 flex flex-col rounded-t-[2.5rem] bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.3)]',
          'transition-[max-height] duration-500 ease-in-out overflow-hidden',
          panelOpen ? 'max-h-[50vh]' : 'max-h-[140px]',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className={`flex w-full flex-col items-center pt-3 focus:outline-none ${!panelOpen ? 'pb-24' : 'pb-2'}`}
        >
          <div className="mb-1 h-1.5 w-10 rounded-full bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
              Nearby Requests
            </span>
            {requests.length > 0 && (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {requests.length}
              </span>
            )}
            {panelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>

        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-32">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-3xl">📭</p>
              <p className="text-sm font-semibold text-slate-700">No nearby requests</p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.newRequestFree)}
                className="mt-1 flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={15} /> Post a Request
              </button>
            </div>
          ) : (
            requests.map((r) => (
              <NearbyRequestRow
                key={r.request_id}
                request={r}
                onClick={() => navigate(ROUTES.request(r.request_id))}
              />
            ))
          )}
        </div>
      </section>

      <ClusterSheet
        onPostRequest={(clusterId, clusterName) =>
          navigate(ROUTES.newRequestFree, { state: { clusterId, clusterName } })
        }
      />
    </div>
  )
}
// import { useMemo, useState, useEffect } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { ChevronUp, ChevronDown, Plus } from 'lucide-react'
// import { MapView }           from '../components/map/MapView.jsx'
// import { BlockBoundary }     from '../components/map/BlockBoundary.jsx'
// import { ModeSwitcher }      from '../components/map/ModeSwitcher.jsx'
// import { RadiusCircle }      from '../components/map/RadiusCircle.jsx'
// import { NearbyRequestRow }  from '../components/requests/NearbyRequestRow.jsx'
// import { RequestPin }        from '../components/map/RequestPin.jsx'
// import { useBlockStore }     from '../store/blockStore.js'
// import { useMapStore }       from '../store/mapStore.js'
// import { useBrowserLocation } from '../hooks/useLocation.js'
// import { useRequestStore }   from '../store/requestStore.js'
// import { useAuthStore }      from '../store/authStore.js'
// import { ROUTES }            from '../navigation/routes.js'
// import { MAP_MODES }         from '../utils/constants.js'
// import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../config/maps.js'

// // Cluster components
// import useClusterOverlay, {
//   ClusterOverlay,
//   ClusterSheet,
// } from '../components/clusters/ClusterOverlay.jsx'

// export function HomeMapScreen() {
//   const navigate = useNavigate()

//   const blocks         = useBlockStore((s) => s.blocks)
//   const mode           = useMapStore((s) => s.mode)
//   const setMode        = useMapStore((s) => s.setMode)
//   const radiusMeters   = useMapStore((s) => s.radiusMeters)
//   const nearbyRequests = useRequestStore((s) => s.nearbyRequests)
//   const loadNearbyRequests = useRequestStore((s) => s.loadNearbyRequests)
//   const user           = useAuthStore((s) => s.user)

//   const requests      = nearbyRequests  || []
//   const displayBlocks = blocks          || []

//   const { coords } = useBrowserLocation()
//   const center = useMemo(() => {
//     if (!coords) return DEFAULT_MAP_CENTER
//     return { lat: coords.lat, lng: coords.lng }
//   }, [coords?.lat, coords?.lng])

//   const [panelOpen, setPanelOpen] = useState(true)

//   const { onBlobClick } = useClusterOverlay()

//   useEffect(() => {
//     if (coords?.lat) {
//       loadNearbyRequests(coords.lat, coords.lng)
//     }
//   }, [coords?.lat, coords?.lng, loadNearbyRequests])

//   // Fixed pins mapping: Uses actual GPS coords and identifies free-pins
//   const pins = useMemo(() => {
//     return requests
//       .filter((r) => r.latitude != null && r.longitude != null)
//       .map((r) => ({
//         id:        r.request_id,
//         position:  { lat: r.latitude, lng: r.longitude },
//         title:     r.title,
//         type:      r.type?.toLowerCase() || 'help',
//         isFreePin: !r.block_id && !r.cluster_id, 
//       }))
//   }, [requests])

//   return (
//     <div className="flex h-dvh flex-col overflow-hidden bg-map">

//       {/* Header */}
//       <header className="flex items-start justify-between px-4 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))]">
//         <div>
//           <h1 className="text-xl font-bold tracking-tight text-white">NearMe</h1>
//           <p className="text-sm text-slate-400">
//             {coords ? 'Near you' : 'Locating…'}
//           </p>
//         </div>
//         <Link
//           to={ROUTES.notifications}
//           className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg backdrop-blur"
//         >
//           🔔
//           <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-map" />
//         </Link>
//       </header>

//       <div className="px-4 pb-3">
//         <ModeSwitcher value={mode} onChange={setMode} variant="dark" />
//       </div>

//       {/* Map Section */}
//       <div className="relative flex-1 px-3 transition-all duration-300">

//         {/* Block name chips */}
//         {displayBlocks.length > 0 && (
//           <div className="pointer-events-none absolute inset-x-4 top-0 z-10 flex gap-2 overflow-x-auto pb-2">
//             {displayBlocks.map((b) => (
//               <div
//                 key={b.block_id}
//                 className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur"
//               >
//                 <button
//                   type="button"
//                   className="text-left text-sm font-semibold text-slate-900"
//                   onClick={() => navigate(ROUTES.block(b.block_id))}
//                 >
//                   {b.name}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <MapView
//           center={center}
//           zoom={DEFAULT_MAP_ZOOM}
//           mapContainerClassName="h-full w-full rounded-2xl border border-white/10 shadow-inner"
//         >
//           {/* Official block boundaries */}
//           {displayBlocks.map((b) => (
//             <BlockBoundary
//               key={b.block_id}
//               paths={b.polygon}
//               onClick={() => navigate(ROUTES.block(b.block_id))}
//             />
//           ))}

//           {/* Radius circle (student mode) */}
//           {mode === MAP_MODES.RADIUS && (
//             <RadiusCircle center={center} radiusMeters={radiusMeters} />
//           )}

//           {/* Request pins - Now passing isFreePin and type props */}
//           {pins.map((p) => (
//             <RequestPin
//               key={p.id}
//               position={p.position}
//               title={p.title}
//               type={p.type}
//               isFreePin={p.isFreePin}
//               onClick={() => navigate(ROUTES.request(p.id))}
//             />
//           ))}

//           {/* Unofficial cluster blobs */}
//           <ClusterOverlay onBlobClick={onBlobClick} />
//         </MapView>
//       </div>

//       {/* Bottom Panel */}
//       <section
//         className={[
//           'relative z-20 flex flex-col rounded-t-[2.5rem] bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.3)]',
//           'transition-[max-height] duration-500 ease-in-out overflow-hidden',
//           panelOpen ? 'max-h-[50vh]' : 'max-h-[140px]',
//         ].join(' ')}
//       >
//         <button
//           type="button"
//           onClick={() => setPanelOpen((v) => !v)}
//           className={`flex w-full flex-col items-center pt-3 focus:outline-none ${!panelOpen ? 'pb-24' : 'pb-2'}`}
//         >
//           <div className="mb-1 h-1.5 w-10 rounded-full bg-slate-200" />
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
//               Nearby Requests
//             </span>
//             {requests.length > 0 && (
//               <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
//                 {requests.length}
//               </span>
//             )}
//             {panelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
//           </div>
//         </button>

//         <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-32">
//           {requests.length === 0 ? (
//             <div className="flex flex-col items-center gap-3 py-8 text-center">
//               <p className="text-3xl">📭</p>
//               <p className="text-sm font-semibold text-slate-700">No nearby requests</p>
//               <button
//                 type="button"
//                 onClick={() => navigate(ROUTES.newRequestFree)}
//                 className="mt-1 flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
//               >
//                 <Plus size={15} /> Post a Request
//               </button>
//             </div>
//           ) : (
//             requests.map((r) => (
//               <NearbyRequestRow
//                 key={r.request_id}
//                 request={r}
//                 onClick={() => navigate(ROUTES.request(r.request_id))}
//               />
//             ))
//           )}
//         </div>
//       </section>

//       {/* Cluster detail sheet */}
//       <ClusterSheet
//         onPostRequest={(clusterId, clusterName) =>
//           navigate(ROUTES.newRequestFree, { state: { clusterId, clusterName } })
//         }
//       />
//     </div>
//   )
// }

// import { useMemo, useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { ChevronUp, ChevronDown, Plus } from 'lucide-react'
// import { MapView }           from '../components/map/MapView.jsx'
// import { BlockBoundary }     from '../components/map/BlockBoundary.jsx'
// import { ModeSwitcher }      from '../components/map/ModeSwitcher.jsx'
// import { RadiusCircle }      from '../components/map/RadiusCircle.jsx'
// import { NearbyRequestRow }  from '../components/requests/NearbyRequestRow.jsx'
// import { RequestPin }        from '../components/map/RequestPin.jsx'
// import { useBlockStore }     from '../store/blockStore.js'
// import { useMapStore }       from '../store/mapStore.js'
// import { useBrowserLocation } from '../hooks/useLocation.js'
// import { useRequestStore }   from '../store/requestStore.js'
// import { useAuthStore }      from '../store/authStore.js'
// import { ROUTES }            from '../navigation/routes.js'
// import { MAP_MODES }         from '../utils/constants.js'
// import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../config/maps.js'

// import { useEffect } from "react";

// // Cluster components — new system
// import useClusterOverlay, {
//   ClusterOverlay,
//   ClusterSheet,
// } from '../components/clusters/ClusterOverlay.jsx'

// export function HomeMapScreen() {
//   const navigate = useNavigate()

//   const blocks         = useBlockStore((s) => s.blocks)
//   const mode           = useMapStore((s) => s.mode)
//   const setMode        = useMapStore((s) => s.setMode)
//   const radiusMeters   = useMapStore((s) => s.radiusMeters)
//   const nearbyRequests = useRequestStore((s) => s.nearbyRequests)
//   const user           = useAuthStore((s) => s.user)

//   const requests      = nearbyRequests  || []
//   const displayBlocks = blocks          || []

//   const { coords } = useBrowserLocation()
//   const center = useMemo(() => {
//     if (!coords) return DEFAULT_MAP_CENTER
//     return { lat: coords.lat, lng: coords.lng }
//   }, [coords?.lat, coords?.lng])

//   const [panelOpen, setPanelOpen] = useState(true)

//   // Cluster overlay hook — gives us onBlobClick to wire up
//   const { onBlobClick } = useClusterOverlay()

//   useEffect(() => {
//   if (coords?.lat) {
//     loadNearbyRequests(coords.lat, coords.lng)
//   }
// }, [coords?.lat, coords?.lng])



// const loadNearbyRequests = useRequestStore((s) => s.loadNearbyRequests)

//   const pins = useMemo(() => {
//     return requests.slice(0, 6).map((r, i) => ({
//       id:       r.request_id,
//       position: {
//         lat: center.lat + (i % 3) * 0.0012,
//         lng: center.lng + (i % 2) * 0.0012,
//       },
//       title: r.title,
//     }))
//   }, [requests, center.lat, center.lng])

//   return (
//     <div className="flex h-dvh flex-col overflow-hidden bg-map">

//       {/* Header */}
//       <header className="flex items-start justify-between px-4 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))]">
//         <div>
//           <h1 className="text-xl font-bold tracking-tight text-white">NearMe</h1>
//           <p className="text-sm text-slate-400">
//             {coords ? 'Near you' : 'Locating…'}
//           </p>
//         </div>
//         <Link
//           to={ROUTES.notifications}
//           className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg backdrop-blur"
//         >
//           🔔
//           <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-map" />
//         </Link>
//       </header>

//       <div className="px-4 pb-3">
//         <ModeSwitcher value={mode} onChange={setMode} variant="dark" />
//       </div>

//       {/* Map */}
//       <div className="relative flex-1 px-3 transition-all duration-300">

//         {/* Block name chips */}
//         {displayBlocks.length > 0 && (
//           <div className="pointer-events-none absolute inset-x-4 top-0 z-10 flex gap-2 overflow-x-auto pb-2">
//             {displayBlocks.map((b) => (
//               <div
//                 key={b.block_id}
//                 className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur"
//               >
//                 <button
//                   type="button"
//                   className="text-left text-sm font-semibold text-slate-900"
//                   onClick={() => navigate(ROUTES.block(b.block_id))}
//                 >
//                   {b.name}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         <MapView
//           center={center}
//           zoom={DEFAULT_MAP_ZOOM}
//           mapContainerClassName="h-full w-full rounded-2xl border border-white/10 shadow-inner"
//         >
//           {/* Official block boundaries */}
//           {displayBlocks.map((b) => (
//             <BlockBoundary
//               key={b.block_id}
//               paths={b.polygon}
//               onClick={() => navigate(ROUTES.block(b.block_id))}
//             />
//           ))}

//           {/* Radius circle (student mode) */}
//           {mode === MAP_MODES.RADIUS && (
//             <RadiusCircle center={center} radiusMeters={radiusMeters} />
//           )}

//           {/* Request pins */}
//           {pins.map((p) => (
//             <RequestPin
//               key={p.id}
//               position={p.position}
//               title={p.title}
//               onClick={() => navigate(ROUTES.request(p.id))}
//             />
//           ))}

//           {/* ── Unofficial cluster blobs — NEW ── */}
//           <ClusterOverlay onBlobClick={onBlobClick} />
//         </MapView>
//       </div>

//       {/* ── Bottom Panel ── */}
//       <section
//         className={[
//           'relative z-20 flex flex-col rounded-t-[2.5rem] bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.3)]',
//           'transition-[max-height] duration-500 ease-in-out overflow-hidden',
//           panelOpen ? 'max-h-[50vh]' : 'max-h-[140px]',
//         ].join(' ')}
//       >
//         {/* Toggle */}
//         <button
//           type="button"
//           onClick={() => setPanelOpen((v) => !v)}
//           className={`flex w-full flex-col items-center pt-3 focus:outline-none ${!panelOpen ? 'pb-24' : 'pb-2'}`}
//         >
//           <div className="mb-1 h-1.5 w-10 rounded-full bg-slate-200" />
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
//               Nearby Requests
//             </span>
//             {requests.length > 0 && (
//               <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
//                 {requests.length}
//               </span>
//             )}
//             {panelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
//           </div>
//         </button>

//         {/* Request list */}
//         <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-32">
//           {requests.length === 0 ? (
//             <div className="flex flex-col items-center gap-3 py-8 text-center">
//               <p className="text-3xl">📭</p>
//               <p className="text-sm font-semibold text-slate-700">No nearby requests</p>
//               <button
//   type="button"
//   onClick={() => navigate(ROUTES.newRequestFree)}
//   className="mt-1 flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
// >
//   <Plus size={15} /> Post a Request
// </button>
//             </div>
//           ) : (
//             requests.map((r) => (
//               <NearbyRequestRow
//                 key={r.request_id}
//                 request={r}
//                 onClick={() => navigate(ROUTES.request(r.request_id))}
//               />
//             ))
//           )}
//         </div>
//       </section>

//       {/* ── Cluster detail sheet (renders outside MapView) — NEW ── */}
//       <ClusterSheet
//   onPostRequest={(clusterId, clusterName) =>
//     navigate(ROUTES.newRequestFree, { state: { clusterId, clusterName } })
//   }
// />

//     </div>
//   )
// }