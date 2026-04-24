import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Send, Eye, EyeOff, Clock, MapPin } from 'lucide-react'
import { useRequestStore } from '../store/requestStore.js'
import { useAuthStore }    from '../store/authStore.js'
import { useBlockStore }   from '../store/blockStore.js'
import { useClusterStore } from '../store/clusterStore.js'
import { useVerification } from '../hooks/useVerification.js'
import { useBrowserLocation } from '../hooks/useLocation.js'
import { ROUTES }          from '../navigation/routes.js'
import { REQUEST_TYPES, REQUEST_TYPE_META, REQUEST_VISIBILITIES } from '../utils/constants.js'
import { BackButton }      from '../components/shared/BackButton.jsx'
import { cn }              from '../utils/cn.js'

const EXPIRY_OPTIONS = [
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
]

// ── Context badge shown below the header ──────────────────────
function ContextBadge({ context }) {
  if (context === 'detecting') {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-muted-app">
        <span className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
        Detecting your location…
      </div>
    )
  }
  if (context?.type === 'block') {
    return (
      <div className="flex items-center gap-1.5 rounded-2xl bg-teal-50 dark:bg-teal-900/30 px-3 py-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
        <MapPin size={12} /> Posting in <strong>{context.name}</strong>
      </div>
    )
  }
  if (context?.type === 'cluster') {
    return (
      <div className="flex items-center gap-1.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
        <MapPin size={12} /> Posting in <strong>{context.name || 'Nearby Area'}</strong>
      </div>
    )
  }
  // free-pin
  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
      <MapPin size={12} /> Posting at your current location (no block yet)
    </div>
  )
}

export function CreateRequestScreen() {
  // ── blockId only present when coming from block/:blockId/new ─
  const { blockId }   = useParams()
  const locationState = useLocation().state   // { clusterId? }
  const navigate      = useNavigate()

  const addRequest        = useRequestStore((s) => s.addRequest)
  const addFreePinRequest = useRequestStore((s) => s.addFreePinRequest)
  const createRequest     = useRequestStore((s) => s.createRequest)
  const { isStudent }     = useVerification()
  const user              = useAuthStore((s) => s.user)
  const blocks            = useBlockStore((s) => s.blocks)
  const { currentCluster } = useClusterStore()
  const { coords }        = useBrowserLocation()

  // ── Resolved context: 'detecting' | { type, id, name } ───────
  const [context, setContext] = useState(blockId
    ? { type: 'block', id: blockId, name: blocks.find(b => b.block_id === blockId)?.name || 'Block' }
    : 'detecting'
  )

  // Auto-detect context from GPS when no blockId in URL
  useEffect(() => {
    if (blockId) return   // already set above

    // Cluster passed via navigation state (from ClusterSheet)
    if (locationState?.clusterId) {
      setContext({ type: 'cluster', id: locationState.clusterId, name: locationState.clusterName || '' })
      return
    }

    // currentCluster from store (user is physically inside one)
    if (currentCluster) {
      setContext({ type: 'cluster', id: currentCluster.clusterId, name: currentCluster.name || '' })
      return
    }

    // GPS coords arrived — check if inside a block polygon
    if (coords) {
      const matchedBlock = findBlockContaining(blocks, coords.lat, coords.lng)
      if (matchedBlock) {
        setContext({ type: 'block', id: matchedBlock.block_id, name: matchedBlock.name })
      } else {
        setContext({ type: 'free', lat: coords.lat, lng: coords.lng })
      }
    }
    // else stays 'detecting' until coords arrive
  }, [blockId, locationState, currentCluster, coords, blocks])

  // ── Form state ────────────────────────────────────────────────
  const [title,      setTitle]      = useState('')
  const [desc,       setDesc]       = useState('')
  const [type,       setType]       = useState('help')
  const [visibility, setVisibility] = useState(
    isStudent ? REQUEST_VISIBILITIES.STUDENTS : REQUEST_VISIBILITIES.PUBLIC
  )
  const [expiryMs, setExpiryMs] = useState(EXPIRY_OPTIONS[1].ms)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (context === 'detecting') { setError('Still detecting your location…'); return }

    setLoading(true); setError(null)

    // Build payload from detected context
// Add coords to base so every request includes location
const base = {
  type:        type.toUpperCase(),
  title:       title.trim(),
  description: desc.trim() || null,
  visibility:  isStudent ? visibility : REQUEST_VISIBILITIES.PUBLIC,
  expiry_time: new Date(Date.now() + expiryMs).toISOString(),
  anonymous:   false,
  latitude:    coords?.lat ?? context.lat ?? null,   // ← add
  longitude:   coords?.lng ?? context.lng ?? null,   // ← add
}

let payload
if (context.type === 'block') {
  payload = { ...base, block_id: context.id }        // ✅ snake_case
} else if (context.type === 'cluster') {
  payload = { ...base, cluster_id: context.id }      // ✅ snake_case
} else {
  payload = { ...base, latitude: context.lat, longitude: context.lng }
}
    try {
      const res = await createRequest(payload)

      // Navigate back to the right place
      if (context.type === 'block') {
        navigate(ROUTES.block(context.id), { replace: true })
      } else {
        navigate(ROUTES.home, { replace: true })
      }
    } catch (err) {
      // Optimistic local fallback
      const local = {
        request_id: `local_${Date.now()}`,
        ...payload,
        status:     'open',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + expiryMs).toISOString(),
      }
      if (context.type === 'block') {
        addRequest(context.id, local)
        navigate(ROUTES.block(context.id), { replace: true })
      } else {
        addFreePinRequest(local)
        navigate(ROUTES.home, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-app pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-display font-bold text-app">New Request</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-5">

        {/* Context badge */}
        <ContextBadge context={context} />

        {/* Type selector */}
        <div>
          <label className="label">Request Type</label>
          <div className="grid grid-cols-4 gap-2">
            {REQUEST_TYPES.map(t => {
              const meta = REQUEST_TYPE_META[t]
              return (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all text-xs font-semibold',
                    type === t
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                      : 'border-app bg-surface text-muted-app hover:border-brand-300'
                  )}>
                  <span className="text-2xl">{meta.emoji}</span>
                  {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Title <span className="text-red-400">*</span></label>
          <input className="input" placeholder="What do you need?" maxLength={100}
            value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          <p className="text-xs text-faint-app text-right mt-1">{title.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label className="label">Details <span className="text-faint-app font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={4}
            placeholder="More context, location hint, etc."
            value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        {/* Visibility — students only */}
        {isStudent && (
          <div>
            <label className="label">Visibility</label>
            <div className="flex gap-2">
              {[
                { v: REQUEST_VISIBILITIES.STUDENTS, label: 'Students Only', icon: EyeOff },
                { v: REQUEST_VISIBILITIES.PUBLIC,   label: 'Public',         icon: Eye },
              ].map(({ v, label, icon: Icon }) => (
                <button key={v} type="button" onClick={() => setVisibility(v)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                    visibility === v
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                      : 'border-app text-muted-app hover:border-brand-300'
                  )}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expiry */}
        <div>
          <label className="label flex items-center gap-1.5"><Clock size={13} /> Expires in</label>
          <div className="flex gap-2">
            {EXPIRY_OPTIONS.map(opt => (
              <button key={opt.ms} type="button" onClick={() => setExpiryMs(opt.ms)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  expiryMs === opt.ms
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                    : 'border-app text-muted-app hover:border-brand-300'
                )}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button type="submit" disabled={loading || !title.trim() || context === 'detecting'}
          className="btn-primary w-full py-4 text-base">
          {loading
            ? <span className="flex items-center gap-2 justify-center">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting…
              </span>
            : <><Send size={16} /> Publish Request</>
          }
        </button>
      </form>
    </div>
  )
}

// ── Point-in-polygon helper (ray casting) ─────────────────────
// blocks must have a .polygon array of { lat, lng } vertices
function findBlockContaining(blocks, lat, lng) {
  for (const block of blocks) {
    if (!block.polygon?.length) continue
    if (pointInPolygon(lat, lng, block.polygon)) return block
  }
  return null
}

function pointInPolygon(lat, lng, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat
    const xj = polygon[j].lng, yj = polygon[j].lat
    const intersect = ((yi > lat) !== (yj > lat))
      && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}