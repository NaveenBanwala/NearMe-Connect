import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { MapView } from '../components/map/MapView.jsx'
import { BlockBoundary } from '../components/map/BlockBoundary.jsx'
import { ModeSwitcher } from '../components/map/ModeSwitcher.jsx'
import { RadiusCircle } from '../components/map/RadiusCircle.jsx'
import { NearbyRequestRow } from '../components/requests/NearbyRequestRow.jsx'
import { useBlockStore } from '../store/blockStore.js'
import { useMapStore } from '../store/mapStore.js'
import { useBrowserLocation } from '../hooks/useLocation.js'
import { ROUTES } from '../navigation/routes.js'
import { MAP_MODES } from '../utils/constants.js'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../config/maps.js'
import { RequestPin } from '../components/map/RequestPin.jsx'
import { useRequestStore } from '../store/requestStore.js'
import { useAuthStore } from '../store/authStore.js'

export function HomeMapScreen() {
  const navigate = useNavigate()
  
  // --- STORE SELECTORS (FIXED) ---
  // Do NOT use '?? []' inside the selector function. 
  // Select the raw value and handle the fallback outside.
  const blocks = useBlockStore((s) => s.blocks)
  const mode = useMapStore((s) => s.mode)
  const setMode = useMapStore((s) => s.setMode)
  const radiusMeters = useMapStore((s) => s.radiusMeters)
  const nearbyRequests = useRequestStore((s) => s.nearbyRequests)
  const user = useAuthStore((s) => s.user)

  // Fallbacks handled outside the selector to maintain stable references
  const requests = nearbyRequests || []
  const displayBlocks = blocks || []

  // --- LOCATION STABILIZATION ---
  const { coords } = useBrowserLocation()
  
  const center = useMemo(() => {
    if (!coords) return DEFAULT_MAP_CENTER;
    // Ensure we are returning a stable object based on values
    return { lat: coords.lat, lng: coords.lng };
  }, [coords?.lat, coords?.lng]);

  const [panelOpen, setPanelOpen] = useState(true)

  // --- PINS MEMOIZATION ---
  const pins = useMemo(() => {
    return requests.slice(0, 6).map((r, i) => ({
      id: r.request_id,
      position: {
        lat: center.lat + (i % 3) * 0.0012,
        lng: center.lng + (i % 2) * 0.0012,
      },
      title: r.title,
    }))
  }, [requests, center.lat, center.lng])

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
          mapContainerClassName="h-full w-full rounded-2xl border border-white/10 shadow-inner"
        >
          {displayBlocks.map((b) => (
            <BlockBoundary
              key={b.block_id}
              paths={b.polygon}
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
              onClick={() => navigate(ROUTES.request(p.id))}
            />
          ))}
        </MapView>
      </div>

  {/* ── Bottom Panel ── */}
      <section
        className={[
          'relative z-20 flex flex-col rounded-t-[2.5rem] bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.3)]',
          'transition-[max-height] duration-500 ease-in-out overflow-hidden',
          // 1. Increased closed height from 56px to 140px to stay above Nav Bar
          panelOpen ? 'max-h-[50vh]' : 'max-h-[140px]', 
        ].join(' ')}
      >
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          // 2. Added pb-24 when closed to push the label UP above the Nav Bar
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

        {/* Scrollable list */}
        <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-32">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-3xl">📭</p>
              <p className="text-sm font-semibold text-slate-700">No nearby requests</p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.newRequest())}
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
    </div>
  )
}