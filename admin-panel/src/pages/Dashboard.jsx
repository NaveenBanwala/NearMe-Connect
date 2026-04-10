import { useState, useEffect } from 'react'
import { Users, MapPin, Activity, Flame, ShieldCheck, Flag } from 'lucide-react'
import StatsWidget from '../components/StatsWidget.jsx'
import { getStats, getLiveMetrics, getBlocks } from '../services/adminApi.js'
import { Spinner, ApiError } from '../hooks/Useapi.jsx'

const HEAT_MAP = {
  fire: { label: 'On Fire', bg: 'bg-red-500/10',   border: 'border-red-500/20',   text: 'text-red-400'   },
  hot:  { label: 'Hot',     bg: 'bg-red-500/10',   border: 'border-red-500/15',   text: 'text-red-400'   },
  warm: { label: 'Warm',    bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  mild: { label: 'Mild',    bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
  cold: { label: 'Cold',    bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  text: 'text-blue-400'  },
}
function heatLevel(score) {
  if (score >= 100) return HEAT_MAP.fire
  if (score >= 51)  return HEAT_MAP.hot
  if (score >= 21)  return HEAT_MAP.warm
  if (score >= 6)   return HEAT_MAP.mild
  return HEAT_MAP.cold
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [blocks,  setBlocks]  = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [sRes, bRes, mRes] = await Promise.all([
        getStats(), getBlocks(), getLiveMetrics()
      ])
      setStats(sRes.data)
      setBlocks(bRes.data || [])
      setMetrics(mRes.data)
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setInterval(load, 120_000)
    return () => clearInterval(t)
  }, [])

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={load} />

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsWidget label="Total Users"       value={(stats?.total_users || 0).toLocaleString()}      sub="all time"           icon={Users}       accent="blue"   />
        <StatsWidget label="Live Right Now"    value={stats?.live_users || 0}                           sub="last 15 min"        icon={Activity}    accent="red"    />
        <StatsWidget label="Active Blocks"     value={stats?.active_blocks || 0}                        sub="with boundary"      icon={MapPin}      accent="amber"  />
        <StatsWidget label="Open Requests"     value={stats?.open_requests || 0}                        sub="across all blocks"  icon={Flame}       accent="amber"  />
        <StatsWidget label="Verified Students" value={(stats?.verified_students || 0).toLocaleString()} sub="college ID approved" icon={ShieldCheck} accent="green"  />
        <StatsWidget label="Pending Verify"    value={stats?.pending_verify || 0}                       sub="awaiting review"    icon={ShieldCheck} accent="purple" />
        <StatsWidget label="Pending Votes"     value={stats?.pending_votes || 0}                        sub="block requests"     icon={MapPin}      accent="amber"  />
        <StatsWidget label="Open Reports"      value={stats?.open_reports || 0}                         sub="flagged content"    icon={Flag}        accent="red"    />
      </div>

      {/* Live metrics banner */}
      {metrics && (
        <div className="card p-4 flex flex-wrap gap-6 items-center">
          {[
            { label: 'Hottest Block',      value: metrics.hottest_block_name,  mono: false },
            { label: 'Heat Score',         value: metrics.hottest_block_score, mono: true  },
            { label: 'Total Live Users',   value: metrics.live_users,           mono: true  },
            { label: 'Total Open Requests',value: metrics.open_requests,        mono: true  },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-slate-500 font-mono uppercase">{s.label}</p>
              <p className={`text-white font-bold mt-0.5 ${s.mono ? 'font-mono' : ''}`}>{s.value}</p>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Refreshes every 2 min
          </div>
        </div>
      )}

      {/* Block heat table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="section-title">Block Heat Overview</p>
          <span className="text-xs font-mono text-slate-500">{blocks.length} active blocks</span>
        </div>

        {blocks.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">No blocks found. Approve a vote cluster to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-600">
                  {['Block', 'Category', 'Heat Level', 'Live Users', 'Open Requests', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.map(block => {
                  const hl = heatLevel(block.heat_score || 0)
                  return (
                    <tr key={block.block_id} className="border-b border-base-700 hover:bg-base-700/50 transition-colors">
                      <td className="py-2.5 px-3 text-white font-medium">{block.name}</td>
                      <td className="py-2.5 px-3"><span className="badge bg-base-600 text-slate-400 capitalize">{block.category}</span></td>
                      <td className="py-2.5 px-3"><span className={`badge border ${hl.bg} ${hl.border} ${hl.text}`}>{hl.label}</span></td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{block.live_user_count ?? 0}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{block.open_request_count ?? 0}</td>
                      <td className="py-2.5 px-3">
                        <span className={`badge border ${block.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                          {block.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}