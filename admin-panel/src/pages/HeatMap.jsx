import { useState, useEffect } from 'react'
import { Flame, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getBlocks, getLiveMetrics } from '../services/adminApi.js'
import clsx from 'clsx'

const HEAT_CONFIG = {
  fire: { label: 'On Fire', color: '#dc2626', border: 'border-red-500/30',   text: 'text-red-300',   pulse: 'bg-red-500'    },
  hot:  { label: 'Hot',     color: '#ef4444', border: 'border-orange-500/30',text: 'text-orange-300',pulse: 'bg-orange-500' },
  warm: { label: 'Warm',    color: '#f59e0b', border: 'border-amber-500/30', text: 'text-amber-300', pulse: 'bg-amber-500'  },
  mild: { label: 'Mild',    color: '#22c55e', border: 'border-green-500/30', text: 'text-green-300', pulse: 'bg-green-500'  },
  cold: { label: 'Cold',    color: '#3b82f6', border: 'border-blue-500/30',  text: 'text-blue-300',  pulse: 'bg-blue-500'   },
}
function getHeatKey(score) {
  if (score >= 100) return 'fire'
  if (score >= 51)  return 'hot'
  if (score >= 21)  return 'warm'
  if (score >= 6)   return 'mild'
  return 'cold'
}

function HeatRing({ score, size = 80 }) {
  const hk = getHeatKey(score)
  const hc = HEAT_CONFIG[hk]
  const max = 200
  const pct = Math.min(score / max, 1)
  const radius = (size / 2) - 6
  const circ = 2 * Math.PI * radius
  const dash = pct * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e2a3e" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={hc.color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-white font-bold font-mono text-base leading-none">{score}</p>
        <p className={clsx('text-[10px] font-mono mt-0.5', hc.text)}>{hc.label}</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-base-700 border border-base-500 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 font-mono mb-1">{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function HeatMap() {
  const { data: blocks, loading, error, reload } = useApi(getBlocks)
  const [metrics,     setMetrics]     = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing,  setRefreshing]  = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [sortBy,      setSortBy]      = useState('heat')

  useEffect(() => {
    getLiveMetrics().then(r => setMetrics(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setInterval(() => { reload(); setLastRefresh(new Date()) }, 120_000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await reload()
    try { const r = await getLiveMetrics(); setMetrics(r.data) } catch {}
    setLastRefresh(new Date())
    setRefreshing(false)
  }

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const allBlocks = blocks || []
  const totalLive = allBlocks.reduce((s, b) => s + (b.live_user_count || 0), 0)

  const sorted = [...allBlocks].sort((a, b) => {
    if (sortBy === 'heat')     return (b.heat_score || 0)         - (a.heat_score || 0)
    if (sortBy === 'users')    return (b.live_user_count || 0)    - (a.live_user_count || 0)
    if (sortBy === 'requests') return (b.open_request_count || 0) - (a.open_request_count || 0)
    return 0
  })
  const topBlock = sorted[0]

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-mono font-semibold">{totalLive} users live now</span>
          </div>
          <span className="text-slate-600 text-xs font-mono hidden sm:block">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
        <button onClick={handleRefresh} className={clsx('btn-secondary', refreshing && 'opacity-50 pointer-events-none')}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {topBlock && (
        <div className={clsx('card p-5 border-2 transition-all', HEAT_CONFIG[getHeatKey(topBlock.heat_score || 0)].border)}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              <HeatRing score={topBlock.heat_score || 0} size={90} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} className="text-amber-400" />
                  <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Hottest Block</p>
                </div>
                <p className="text-white text-xl font-bold font-display">{topBlock.name}</p>
                <p className="text-slate-500 text-xs mt-1 font-mono capitalize">{topBlock.category}</p>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-white font-bold font-mono">{topBlock.live_user_count ?? 0}</p>
                    <p className="text-slate-600 text-[10px]">Live users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold font-mono">{topBlock.open_request_count ?? 0}</p>
                    <p className="text-slate-600 text-[10px]">Open requests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs font-mono">Sort by:</span>
        {['heat', 'users', 'requests'].map(s => (
          <button key={s} onClick={() => setSortBy(s)} className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-mono capitalize border transition-all',
            sortBy === s ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'text-slate-500 border-base-500 hover:text-slate-300 hover:border-base-400'
          )}>{s}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="card py-16 text-center">
          <Flame size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No active blocks yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(block => {
            const hk = getHeatKey(block.heat_score || 0)
            const hc = HEAT_CONFIG[hk]
            const isSelected = selected?.block_id === block.block_id
            return (
              <div key={block.block_id}
                onClick={() => setSelected(isSelected ? null : block)}
                className={clsx('card p-4 cursor-pointer transition-all duration-200', isSelected ? `border-2 ${hc.border}` : 'hover:border-base-500')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{block.name}</p>
                    <p className="text-slate-500 text-xs font-mono capitalize mt-0.5">{block.category}</p>
                  </div>
                  <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', hc.pulse, (hk === 'fire' || hk === 'hot') && 'animate-pulse')} />
                </div>
                <div className="flex items-center justify-between">
                  <HeatRing score={block.heat_score || 0} size={72} />
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-white font-bold font-mono text-lg">{block.live_user_count ?? 0}</p>
                      <p className="text-slate-500 text-[10px] font-mono">live users</p>
                    </div>
                    <div>
                      <p className="text-white font-bold font-mono">{block.open_request_count ?? 0}</p>
                      <p className="text-slate-500 text-[10px] font-mono">requests</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}