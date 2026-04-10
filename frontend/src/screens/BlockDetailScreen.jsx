import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useBlockStore } from '../store/blockStore.js'
import { useRequestStore } from '../store/requestStore.js'
import { useMapStore } from '../store/mapStore.js'
import { useAuthStore } from '../store/authStore.js'
import { submitBlockVote } from '../services/blockService.js'
import { getCurrentPosition } from '../services/locationService.js'
import { HeatBadge } from '../components/blocks/HeatBadge.jsx'
import { ModeSwitcher } from '../components/map/ModeSwitcher.jsx'
import { RequestCard } from '../components/requests/RequestCard.jsx'
import { BackButton } from '../components/shared/BackButton.jsx'
import { LoadingSpinner } from '../components/shared/LoadingSpinner.jsx'
import { EmptyState } from '../components/shared/EmptyState.jsx'
import { ROUTES } from '../navigation/routes.js'
import { REQUEST_TYPE_META } from '../utils/constants.js'
import { cn } from '../utils/cn.js'

const TYPE_FILTERS = ['all', 'help', 'talk', 'play', 'free']

export function BlockDetailScreen() {
  const { id }               = useParams()
  const navigate             = useNavigate()
  const block                = useBlockStore((s) => s.getBlockById(id))
  const loadBlock            = useBlockStore((s) => s.loadBlock)
  const requests             = useRequestStore((s) => s.requestsForBlock(id))
  const loadRequests         = useRequestStore((s) => s.loadRequests)
  const mode                 = useMapStore((s) => s.mode)
  const setMode              = useMapStore((s) => s.setMode)
  const user                 = useAuthStore((s) => s.user)
  const [filterType, setType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [voting,  setVoting]  = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [voteError, setVoteError]     = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([loadBlock(id), loadRequests(id, { mode })]).finally(() =>
      setLoading(false)
    )
  }, [id, mode])

  const filtered = useMemo(
    () =>
      filterType === 'all'
        ? requests
        : requests.filter((r) => r.type === filterType),
    [requests, filterType]
  )

  const handleVote = async () => {
    const suggestedName = window.prompt(
      'Suggest a name for the new block near you (optional):'
    )
    // User cancelled the prompt
    if (suggestedName === null) return

    setVoting(true)
    setVoteError(null)
    try {
      const position = await getCurrentPosition()
      await submitBlockVote({
        suggested_name: suggestedName.trim(),
        user_lat: position.coords.latitude,
        user_lng: position.coords.longitude,
        category: 'locality',
      })
      setVoteSuccess(true)
    } catch (e) {
      setVoteError(
        e?.response?.data?.message ||
          'Could not submit vote. Make sure location access is enabled.'
      )
    } finally {
      setVoting(false)
    }
  }

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
    campus: '🏫',
    locality: '📍',
    society: '🏘️',
    market: '🛒',
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

      {/* Vote cluster section */}
      <div className="mx-4 mt-6 card p-5">
        <h2 className="text-base font-bold text-app mb-1">Not your block?</h2>
        <p className="text-sm text-muted-app mb-4">
          Vote to request a new block near your current location.
        </p>

        {voteSuccess ? (
          <div className="rounded-xl bg-brand-50 dark:bg-brand-900/30 px-4 py-3 text-sm text-brand-700 dark:text-brand-300 text-center">
            ✅ Vote submitted! We'll review and notify you.
          </div>
        ) : (
          <>
            <button
              onClick={handleVote}
              disabled={voting}
              className="btn-secondary w-full"
            >
              {voting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Locating…
                </span>
              ) : (
                '🗳️ Vote for a New Block'
              )}
            </button>
            {voteError && (
              <p className="mt-2 text-xs text-red-500 text-center">{voteError}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}