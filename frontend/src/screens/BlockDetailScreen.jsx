import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useBlockStore }   from '../store/blockStore.js'
import { useRequestStore } from '../store/requestStore.js'
import { useMapStore }     from '../store/mapStore.js'
import { useAuthStore }    from '../store/authStore.js'
import { HeatBadge }       from '../components/blocks/HeatBadge.jsx'
import { ModeSwitcher }    from '../components/map/ModeSwitcher.jsx'
import { RequestCard }     from '../components/requests/RequestCard.jsx'
import { BackButton }      from '../components/shared/BackButton.jsx'
import { LoadingSpinner }  from '../components/shared/LoadingSpinner.jsx'
import { EmptyState }      from '../components/shared/EmptyState.jsx'
import { ROUTES }          from '../navigation/routes.js'
import { REQUEST_TYPE_META } from '../utils/constants.js'
import { cn }              from '../utils/cn.js'

const TYPE_FILTERS = ['all', 'help', 'talk', 'play', 'free']

export function BlockDetailScreen() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  // ✅ FIX: select stable state slices, derive values with useMemo
  const blocks          = useBlockStore((s) => s.blocks)
  const block           = useMemo(() => blocks.find((b) => b.block_id === id), [blocks, id])
  const loadBlock       = useBlockStore((s) => s.loadBlock)

  const requestsByBlock = useRequestStore((s) => s.requestsByBlock)
  const requests        = useMemo(() => requestsByBlock[id] ?? [], [requestsByBlock, id])
  const loadRequests    = useRequestStore((s) => s.loadRequests)

  const mode       = useMapStore((s) => s.mode)
  const setMode    = useMapStore((s) => s.setMode)
  const user       = useAuthStore((s) => s.user)

  const [filterType, setType]   = useState('all')
  const [loading,    setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    loadBlock(id).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    loadRequests(id, { mode })
  }, [id, mode])

  const filtered = useMemo(
    () =>
      filterType === 'all'
        ? requests
        : requests.filter((r) => r.type === filterType),
    [requests, filterType]
  )

  if (!block && !loading)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-app px-6">
        <p className="text-5xl">😕</p>
        <p className="text-muted-app">Block not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Go back
        </button>
      </div>
    )

  const catEmoji = {
    campus:   '🏫',
    locality: '📍',
    society:  '🏘️',
    market:   '🛒',
  }

  return (
    <div className="min-h-dvh bg-app pb-28">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <BackButton />
          <button
            onClick={() => navigate(ROUTES.newRequest(id))}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus size={15} /> New Request
          </button>
        </div>

        {block && (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">
                {catEmoji[block.category?.toLowerCase()] || '📍'}
              </span>
              <h1 className="text-xl font-display font-bold text-app truncate">
                {block.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <HeatBadge score={block.heat_score} size="md" />
              <span className="text-xs text-muted-app capitalize">
                {block.category}
              </span>
              <span className="text-xs text-faint-app">·</span>
              <span className="text-xs text-muted-app flex items-center gap-1">
                <Users size={11} /> {block.live_user_count ?? 0} live
              </span>
              <span className="text-xs text-faint-app">·</span>
              <span className="text-xs text-muted-app">
                {block.open_request_count ?? 0} requests
              </span>
            </div>
          </>
        )}

        {user?.student_verified && (
          <div className="mt-3">
            <ModeSwitcher />
          </div>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {TYPE_FILTERS.map((t) => {
          const meta = REQUEST_TYPE_META[t]
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                filterType === t
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-app text-muted-app hover:text-app bg-surface'
              )}
            >
              {t === 'all' ? '📋 All' : `${meta.emoji} ${meta.label}`}
            </button>
          )
        })}
      </div>

      {/* Request feed */}
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="No requests here"
            subtitle={
              filterType === 'all'
                ? 'Be the first to post a request in this block!'
                : `No ${filterType} requests right now.`
            }
            action={
              <button
                onClick={() => navigate(ROUTES.newRequest(id))}
                className="btn-primary mt-2"
              >
                <Plus size={15} /> Post a Request
              </button>
            }
          />
        ) : (
          filtered.map((req) => (
            <RequestCard key={req.request_id} request={req} />
          ))
        )}
      </div>

    </div>
  )
}

// import { useState, useEffect, useMemo } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { Plus, Users } from 'lucide-react'
// import { useBlockStore }   from '../store/blockStore.js'
// import { useRequestStore } from '../store/requestStore.js'
// import { useMapStore }     from '../store/mapStore.js'
// import { useAuthStore }    from '../store/authStore.js'
// import { HeatBadge }       from '../components/blocks/HeatBadge.jsx'
// import { ModeSwitcher }    from '../components/map/ModeSwitcher.jsx'
// import { RequestCard }     from '../components/requests/RequestCard.jsx'
// import { BackButton }      from '../components/shared/BackButton.jsx'
// import { LoadingSpinner }  from '../components/shared/LoadingSpinner.jsx'
// import { EmptyState }      from '../components/shared/EmptyState.jsx'
// import { ROUTES }          from '../navigation/routes.js'
// import { REQUEST_TYPE_META } from '../utils/constants.js'
// import { cn }              from '../utils/cn.js'

// // NOTE: Vote section removed — blocks are no longer requested via voting.
// // New areas form automatically as unofficial clusters when users are active.
// // Admins promote clusters to official blocks based on activity thresholds.

// const TYPE_FILTERS = ['all', 'help', 'talk', 'play', 'free']

// export function BlockDetailScreen() {
//   const { id }     = useParams()
//   const navigate   = useNavigate()
//   const block      = useBlockStore((s) => s.getBlockById(id))
//   const loadBlock  = useBlockStore((s) => s.loadBlock)
//   const requests   = useRequestStore((s) => s.requestsForBlock(id))
//   const loadRequests = useRequestStore((s) => s.loadRequests)
//   const mode       = useMapStore((s) => s.mode)
//   const setMode    = useMapStore((s) => s.setMode)
//   const user       = useAuthStore((s) => s.user)

//   const [filterType, setType] = useState('all')
//   const [loading,  setLoading] = useState(false)

//  // To this — separate the two loads:
// useEffect(() => {
//   if (!id) return
//   setLoading(true)
//   loadBlock(id).finally(() => setLoading(false))
// }, [id])

// useEffect(() => {
//   if (!id) return
//   loadRequests(id, { mode })
// }, [id, mode])

//   const filtered = useMemo(
//     () =>
//       filterType === 'all'
//         ? requests
//         : requests.filter((r) => r.type === filterType),
//     [requests, filterType]
//   )

//   if (!block && !loading)
//     return (
//       <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-app px-6">
//         <p className="text-5xl">😕</p>
//         <p className="text-muted-app">Block not found.</p>
//         <button onClick={() => navigate(-1)} className="btn-secondary">
//           Go back
//         </button>
//       </div>
//     )

//   const catEmoji = {
//     campus:   '🏫',
//     locality: '📍',
//     society:  '🏘️',
//     market:   '🛒',
//   }

//   return (
//     <div className="min-h-dvh bg-app pb-28">

//       {/* Header */}
//       <div className="sticky top-0 z-20 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
//         <div className="flex items-center justify-between mb-2">
//           <BackButton />
//           <button
//             onClick={() => navigate(ROUTES.newRequest(id))}
//             className="btn-primary py-2 px-4 text-sm"
//           >
//             <Plus size={15} /> New Request
//           </button>
//         </div>

//         {block && (
//           <>
//             <div className="flex items-center gap-2 mb-1.5">
//               <span className="text-2xl">
//                 {catEmoji[block.category?.toLowerCase()] || '📍'}
//               </span>
//               <h1 className="text-xl font-display font-bold text-app truncate">
//                 {block.name}
//               </h1>
//             </div>
//             <div className="flex items-center gap-2 flex-wrap">
//               <HeatBadge score={block.heat_score} size="md" />
//               <span className="text-xs text-muted-app capitalize">
//                 {block.category}
//               </span>
//               <span className="text-xs text-faint-app">·</span>
//               <span className="text-xs text-muted-app flex items-center gap-1">
//                 <Users size={11} /> {block.live_user_count ?? 0} live
//               </span>
//               <span className="text-xs text-faint-app">·</span>
//               <span className="text-xs text-muted-app">
//                 {block.open_request_count ?? 0} requests
//               </span>
//             </div>
//           </>
//         )}

//         {user?.student_verified && (
//           <div className="mt-3">
//             <ModeSwitcher />
//           </div>
//         )}
//       </div>

//       {/* Type filters */}
//       <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
//         {TYPE_FILTERS.map((t) => {
//           const meta = REQUEST_TYPE_META[t]
//           return (
//             <button
//               key={t}
//               onClick={() => setType(t)}
//               className={cn(
//                 'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
//                 filterType === t
//                   ? 'bg-brand-500 text-white border-brand-500'
//                   : 'border-app text-muted-app hover:text-app bg-surface'
//               )}
//             >
//               {t === 'all' ? '📋 All' : `${meta.emoji} ${meta.label}`}
//             </button>
//           )
//         })}
//       </div>

//       {/* Request feed */}
//       <div className="px-4 space-y-2">
//         {loading ? (
//           <div className="flex justify-center py-10">
//             <LoadingSpinner />
//           </div>
//         ) : filtered.length === 0 ? (
//           <EmptyState
//             emoji="📭"
//             title="No requests here"
//             subtitle={
//               filterType === 'all'
//                 ? 'Be the first to post a request in this block!'
//                 : `No ${filterType} requests right now.`
//             }
//             action={
//               <button
//                 onClick={() => navigate(ROUTES.newRequest(id))}
//                 className="btn-primary mt-2"
//               >
//                 <Plus size={15} /> Post a Request
//               </button>
//             }
//           />
//         ) : (
//           filtered.map((req) => (
//             <RequestCard key={req.request_id} request={req} />
//           ))
//         )}
//       </div>

//     </div>
//   )
// }