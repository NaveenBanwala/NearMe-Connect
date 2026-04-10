import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Save } from 'lucide-react'
import BoundaryDrawer from '../components/BoundaryDrawer.jsx'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getBlocks, deleteBlock, updateBlock } from '../services/adminApi.js'
import clsx from 'clsx'

const CATEGORIES = ['campus', 'locality', 'society', 'market']
const HEAT_COLORS = {
  fire: { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400'   },
  hot:  { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400'   },
  warm: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400' },
  mild: { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400' },
  cold: { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400'  },
}
const heatKey   = s => s >= 100 ? 'fire' : s >= 51 ? 'hot' : s >= 21 ? 'warm' : s >= 6 ? 'mild' : 'cold'
const heatLabel = s => s >= 100 ? 'On Fire' : s >= 51 ? 'Hot' : s >= 21 ? 'Warm' : s >= 6 ? 'Mild' : 'Cold'

export default function BlockEditor() {
  const { data, loading, error, reload } = useApi(getBlocks)
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')
  const [saved,    setSaved]    = useState(false)
  const [working,  setWorking]  = useState(false)
  const [editName, setEditName] = useState('')
  const [editing,  setEditing]  = useState(false)

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const blocks   = data || []
  const filtered = blocks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id) => {
    if (!confirm('Delete this block? This cannot be undone.')) return
    setWorking(true)
    try {
      await deleteBlock(id)
      if (selected?.block_id === id) setSelected(null)
      reload()
    } catch (e) {
      alert('Delete failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false) }
  }

  const handleSaveBoundary = async (points) => {
    if (!selected) return
    setWorking(true)
    try {
      const coords = points.map(p => {
        // points are percentages — convert back to approximate lat/lng
        // In production: use real Google Maps coordinates directly
        const lng = selected.center_lng + (p.x - 50) * 0.0002
        const lat = selected.center_lat - (p.y - 50) * 0.0002
        return [lng, lat]
      })
      // Close the polygon
      coords.push(coords[0])
      const geoJson = JSON.stringify({ type: 'Polygon', coordinates: [coords] })

      await updateBlock(selected.block_id, { boundary_geo_json: geoJson })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      reload()
    } catch (e) {
      alert('Save boundary failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false) }
  }

  const handleRename = async () => {
    if (!editName.trim() || !selected) return
    setWorking(true)
    try {
      await updateBlock(selected.block_id, { name: editName.trim() })
      setEditing(false)
      reload()
    } catch (e) {
      alert('Rename failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false) }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: block list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-8 text-sm" placeholder="Search blocks..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-mono px-1">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} · approve a vote cluster to create new blocks
          </p>

          <div className="space-y-2">
            {filtered.map(block => {
              const hk = heatKey(block.heat_score || 0)
              const hc = HEAT_COLORS[hk]
              return (
                <div
                  key={block.block_id}
                  onClick={() => { setSelected(block); setEditName(block.name); setEditing(false) }}
                  className={clsx('card-hover p-3 cursor-pointer transition-all', selected?.block_id === block.block_id && 'border-amber-500/40 bg-base-700')}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white text-sm font-medium">{block.name}</p>
                      <p className="text-slate-500 text-xs font-mono capitalize mt-0.5">{block.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={clsx('badge border text-[10px]', hc.bg, hc.border, hc.text)}>{heatLabel(block.heat_score || 0)}</span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(block.block_id) }}
                        disabled={working}
                        className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs font-mono text-slate-500">
                    <span>{block.live_user_count ?? 0} live</span>
                    <span>·</span>
                    <span>{block.open_request_count ?? 0} requests</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: boundary editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="flex gap-2 items-center">
                      <input className="input text-sm flex-1" value={editName} onChange={e => setEditName(e.target.value)} />
                      <button onClick={handleRename} disabled={working} className="btn-primary py-1.5 px-3 text-xs">
                        <Save size={12} /> Save
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="section-title">{selected.name}</p>
                      <button onClick={() => setEditing(true)} className="p-1 text-slate-500 hover:text-amber-400 transition-colors">
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                  <p className="text-slate-500 text-xs mt-0.5 font-mono capitalize">
                    {selected.category} · {selected.center_lat?.toFixed(4)}, {selected.center_lng?.toFixed(4)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {saved && <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">Boundary saved</span>}
                  <span className={`badge border ${selected.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              <BoundaryDrawer clusterName={selected.name} onSave={handleSaveBoundary} />

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-base-600">
                {[
                  { label: 'Live users',  value: selected.live_user_count ?? 0 },
                  { label: 'Requests',    value: selected.open_request_count ?? 0 },
                  { label: 'Heat score',  value: selected.heat_score ?? 0 },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold font-mono text-white">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center py-24">
              <div className="text-center">
                <Pencil size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a block to edit its boundary</p>
                <p className="text-slate-600 text-xs mt-1">Approve vote clusters in Block Requests to create new blocks</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}