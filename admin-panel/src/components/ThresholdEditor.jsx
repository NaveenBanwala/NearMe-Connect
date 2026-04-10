import { useState, useEffect } from 'react'
import { Save, Info } from 'lucide-react'
import { getThresholds, updateThresholds } from '../services/adminApi.js'

const DESCRIPTIONS = {
  campus:   'Large university or college campus. Higher threshold needed due to large user base.',
  locality: 'Residential or commercial locality area. Medium threshold.',
  society:  'Gated society or housing complex. Lower threshold — smaller community.',
  market:   'Market area or shopping complex. Medium threshold.',
}

export default function ThresholdEditor() {
  const [values,  setValues]  = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getThresholds()
      .then(res => {
        const map = {}
        ;(res.data || []).forEach(t => { map[t.category] = t.threshold })
        setValues(map)
      })
      .catch(e => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = Object.entries(values).map(([category, threshold]) => ({
        category, threshold, description: DESCRIPTIONS[category] || ''
      }))
      await updateThresholds(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert('Save failed: ' + (e?.response?.data?.message || e.message))
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <div className="w-4 h-4 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        Loading thresholds…
      </div>
    </div>
  )

  if (error) return (
    <div className="card p-5">
      <p className="text-red-400 text-sm">Failed to load thresholds: {error}</p>
    </div>
  )

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="section-title">Vote Thresholds</p>
          <p className="text-slate-500 text-xs mt-0.5">Min votes required before admin is notified</p>
        </div>
        <button onClick={handleSave} disabled={saving} className={saved ? 'btn-success' : 'btn-primary'}>
          <Save size={14} />
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(values).map(([category, val]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="label mb-0 capitalize">{category}</label>
                <div className="group relative">
                  <Info size={12} className="text-slate-600 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-52 p-2 bg-base-600 border border-base-500 rounded-lg text-xs text-slate-400 hidden group-hover:block z-10 shadow-xl">
                    {DESCRIPTIONS[category]}
                  </div>
                </div>
              </div>
              <span className="text-amber-400 font-mono text-sm font-semibold">{val}</span>
            </div>
            <input
              type="range" min="5" max="200" value={val}
              onChange={e => setValues(prev => ({ ...prev, [category]: Number(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-0.5">
              <span>5</span><span>200</span>
            </div>
          </div>
        ))}
        {Object.keys(values).length === 0 && (
          <p className="text-slate-500 text-sm">No threshold categories found.</p>
        )}
      </div>
    </div>
  )
}