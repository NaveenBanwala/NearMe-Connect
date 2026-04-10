import { useState } from 'react'
import { submitBlockVote } from '../../services/blockService.js'
import { useBrowserLocation } from '../../hooks/useLocation.js'

export function BlockVoteButton({ onVote, suggestedName, category, disabled }) {
  const [voted,   setVoted]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const { coords } = useBrowserLocation()

  const handleVote = async () => {
    if (voted || !coords || loading) return
    setLoading(true); setError(null)
    try {
      await submitBlockVote({
        suggested_name: suggestedName || 'New Block',
        category:       category || 'locality',
        user_lat:       coords.lat,
        user_lng:       coords.lng,
      })
      setVoted(true)
      onVote?.()
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not vote. Are you nearby?')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <button
        type="button" onClick={handleVote}
        disabled={loading || voted || disabled || !coords}
        className={
          voted
            ? 'w-full rounded-full bg-green-500 py-3 text-sm font-bold text-white cursor-default'
            : 'w-full rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors'
        }
      >
        {loading
          ? <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Voting…
            </span>
          : voted
            ? '✓ Vote Counted!'
            : '🗳️ Request this as a block'
        }
      </button>
      {!coords && <p className="mt-1.5 text-center text-xs text-amber-500">Allow location to vote</p>}
      {error   && <p className="mt-1.5 text-center text-xs text-red-500">{error}</p>}
    </div>
  )
}