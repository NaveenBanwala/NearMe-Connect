import { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { BlockSearchBar } from '../components/blocks/BlockSearchBar.jsx'
import { BlockList } from '../components/blocks/BlockList.jsx'
import { EmptyState } from '../components/shared/EmptyState.jsx'
import { LoadingSpinner } from '../components/shared/LoadingSpinner.jsx'
import { useBlockStore } from '../store/blockStore.js'
import { ROUTES } from '../navigation/routes.js'
import { useNearbyBlocks } from '../hooks/useNearbyBlocks.js'
import { useBrowserLocation } from '../hooks/useLocation.js'
import { getCurrentPosition } from '../services/locationService.js'
import { submitBlockVote } from '../services/blockService.js'
import { DEFAULT_MAP_CENTER } from '../config/maps.js'
import { normalizeSearchQuery, blockMatchesQuery } from '../utils/searchUtils.js'
import { cn } from '../utils/cn.js'

export function BlockSearchScreen() {
  const navigate = useNavigate()
  const [listMode, setListMode] = useState('all')
  const query = useBlockStore((s) => s.searchQuery)
  const setSearchQuery = useBlockStore((s) => s.setSearchQuery)
  const clearSearchQuery = useBlockStore((s) => s.clearSearchQuery)

  const { coords, loading: locationLoading } = useBrowserLocation()
  const effectiveCoords = useMemo(() => coords ?? DEFAULT_MAP_CENTER, [coords?.lat, coords?.lng])

  const { blocks: nearby, loading: blocksLoading } = useNearbyBlocks(effectiveCoords)

  const normalizedQuery = useMemo(() => normalizeSearchQuery(query), [query])
  const filtered = useMemo(
    () => (nearby ?? []).filter((b) => blockMatchesQuery(b, normalizedQuery)),
    [nearby, normalizedQuery]
  )

  const hasActiveSearch = normalizedQuery.length > 0
  const noMatches = hasActiveSearch && filtered.length === 0

  // ── Vote cluster state ──
  const [voteStep, setVoteStep]       = useState('idle') // 'idle' | 'naming' | 'locating' | 'done' | 'error'
  const [voteName, setVoteName]       = useState('')
  const [voteCategory, setVoteCategory] = useState('locality')
  const [voteError, setVoteError]     = useState(null)

  const handleStartVote = async () => {
    if (voteStep === 'naming') {
      // Submit
      setVoteStep('locating')
      setVoteError(null)
      try {
        const pos = await getCurrentPosition()
        await submitBlockVote({
          suggested_name: voteName.trim(),
          category: voteCategory,
          user_lat: pos.coords.latitude,
          user_lng: pos.coords.longitude,
        })
        setVoteStep('done')
      } catch (e) {
        setVoteError(
          e?.response?.data?.message || 'Could not submit. Enable location access and try again.'
        )
        setVoteStep('naming')
      }
    } else {
      setVoteStep('naming')
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 px-4 pb-28 pt-[calc(1rem+env(safe-area-inset-top))]">
      <div className="mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Blocks</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Explore nearby areas.
          {locationLoading && (
            <span className="ml-2 text-brand-500">Locating…</span>
          )}
        </p>
      </div>

      {/* Tab toggles */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setListMode('all')}
          className={cn(
            'rounded-full px-5 py-2.5 text-sm font-semibold transition',
            listMode === 'all'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700'
          )}
        >
          All Blocks
        </button>
        <button
          type="button"
          onClick={() => setListMode('vote')}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition',
            listMode === 'vote'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700'
          )}
        >
          <span aria-hidden>🗳</span>
          Vote for Block
        </button>
      </div>

      {/* ── All blocks tab ── */}
      {listMode === 'all' && (
        <div className="mt-5">
          <BlockSearchBar
            value={query}
            onChange={setSearchQuery}
            onClear={clearSearchQuery}
          />
          <p className="mt-2 text-xs text-slate-400">
            Search by name, category, or block id (e.g. b1).
          </p>

          <div className="mt-6">
            {blocksLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : (
              <BlockList
                blocks={filtered}
                getLink={(b) => ROUTES.block(b.block_id)}
                emptyTitle={noMatches ? 'No matching blocks' : 'No blocks near you'}
                emptyDescription={
                  noMatches
                    ? `Nothing matches "${query.trim()}". Try another name, category, or id.`
                    : 'Move closer to a block area or vote to create one.'
                }
                showClearSearch={noMatches}
                onClearSearch={clearSearchQuery}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Vote tab ── */}
      {listMode === 'vote' && (
        <div className="mt-8">
          {voteStep === 'done' ? (
            <div className="rounded-2xl bg-brand-50 dark:bg-brand-900/30 p-6 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-base font-bold text-brand-700 dark:text-brand-300">
                Vote submitted!
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                We'll notify you when an admin reviews your cluster.
              </p>
              <button
                type="button"
                onClick={() => { setVoteStep('idle'); setVoteName('') }}
                className="mt-4 rounded-full border border-brand-300 dark:border-brand-700 px-5 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400"
              >
                Submit another
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center text-2xl">
                  🗳️
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    Request a new block
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Drop a pin where you are and gather community votes.
                  </p>
                </div>
              </div>

              {(voteStep === 'naming' || voteStep === 'locating') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Suggested block name
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-400"
                      placeholder="e.g. KIIT Gate 2, City Square Mall…"
                      value={voteName}
                      onChange={(e) => setVoteName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Category
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { v: 'locality', l: '📍 Locality' },
                        { v: 'campus',   l: '🏫 Campus'   },
                        { v: 'society',  l: '🏘️ Society'  },
                        { v: 'market',   l: '🛒 Market'   },
                      ].map(({ v, l }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVoteCategory(v)}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-xs font-semibold border transition',
                            voteCategory === v
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {voteError && (
                <p className="text-xs text-red-500">{voteError}</p>
              )}

              <button
                type="button"
                onClick={handleStartVote}
                disabled={voteStep === 'locating'}
                className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {voteStep === 'idle'    && 'Start a vote cluster'}
                {voteStep === 'naming'  && (
                  <span className="flex items-center justify-center gap-1.5">
                    <MapPin size={15} /> Use my location & submit
                  </span>
                )}
                {voteStep === 'locating' && (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Getting location…
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}