import { useState, useEffect } from 'react'
import { Save, RotateCcw, RefreshCw, Info, Users, MapPin, Calendar } from 'lucide-react'
import clsx from 'clsx'
import { getThresholds, updateThresholds } from '../services/adminApi'

// ============================================================
// ThresholdEditor.jsx
// Admin page — configure activity thresholds that determine
// when an unofficial cluster is flagged for admin review.
//
// Each category (campus / locality / lane) has three thresholds:
//   - Unique Users  — distinct verified users active in cluster
//   - Requests      — total requests posted inside the cluster
//   - Active Days   — calendar days with consistent activity
//
// Background scheduler checks these values every hour.
// When all three conditions are met for a cluster, its status
// changes to `flagged_for_admin` and admin is notified.
//
// API:
//   GET  /api/admin/thresholds          → current values
//   PATCH /api/admin/thresholds         → update all categories
// ============================================================

// ── Category config ──────────────────────────────────────────
const CATEGORIES = [
  {
    key:         'campus',
    label:       'Campus',
    description: 'University or college campus areas',
    color:       'purple',
  },
  {
    key:         'locality',
    label:       'Locality',
    description: 'General residential or commercial localities',
    color:       'blue',
  },
  {
    key:         'lane',
    label:       'Small Lane',
    description: 'Small lanes, alleys, or micro-neighbourhoods',
    color:       'green',
  },
]

// ── Field config ─────────────────────────────────────────────
const FIELDS = [
  {
    key:         'uniqueUsers',
    label:       'Unique Users',
    icon:        Users,
    unit:        'users',
    min:         1,
    max:         500,
    description: 'Distinct verified users who must be active in the cluster',
    iconColor:   'text-blue-400',
  },
  {
    key:         'requests',
    label:       'Requests Posted',
    icon:        MapPin,
    unit:        'requests',
    min:         1,
    max:         200,
    description: 'Total requests posted inside the cluster area',
    iconColor:   'text-green-400',
  },
  {
    key:         'activeDays',
    label:       'Active Days',
    icon:        Calendar,
    unit:        'days',
    min:         1,
    max:         30,
    description: 'Consecutive calendar days the cluster must show activity',
    iconColor:   'text-purple-400',
  },
]

// ── Default thresholds (mirrors ClusterPromotionService) ─────
const DEFAULTS = {
  campus:   { uniqueUsers: 20, requests: 10, activeDays: 3 },
  locality: { uniqueUsers: 10, requests: 5,  activeDays: 2 },
  lane:     { uniqueUsers: 5,  requests: 3,  activeDays: 1 },
}

// ── Accent styles per category color ─────────────────────────
const ACCENTS = {
  purple: {
    label:    'bg-purple-500/15 text-purple-400 border-purple-500/25',
    ring:     'focus:border-purple-500/60',
    bar:      'bg-purple-500',
    header:   'border-purple-500/20',
    dot:      'bg-purple-500',
  },
  blue: {
    label:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
    ring:     'focus:border-blue-500/60',
    bar:      'bg-blue-500',
    header:   'border-blue-500/20',
    dot:      'bg-blue-500',
  },
  green: {
    label:    'bg-green-500/15 text-green-400 border-green-500/25',
    ring:     'focus:border-green-500/60',
    bar:      'bg-green-500',
    header:   'border-green-500/20',
    dot:      'bg-green-500',
  },
}

// ── Clamp helper ─────────────────────────────────────────────
const clamp = (val, min, max) => Math.min(Math.max(Number(val) || min, min), max)

// ============================================================
// Main component
// ============================================================
export default function ThresholdEditor() {
  const [thresholds, setThresholds] = useState(DEFAULTS)
  const [saved,      setSaved]      = useState({})   // { campus: true, ... } per-category save state
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState(null)
  const [dirty,      setDirty]      = useState(false)

  // ── Fetch current thresholds on mount ──────────────────────
  useEffect(() => {
    fetchThresholds()
  }, [])

  const fetchThresholds = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getThresholds()
      // Backend returns { campus: {...}, locality: {...}, lane: {...} }
      setThresholds(data ?? DEFAULTS)
    } catch {
      // Fall back to defaults silently — editor still functional
      setThresholds(DEFAULTS)
    } finally {
      setLoading(false)
    }
  }

  // ── Update a single field value ────────────────────────────
  const handleChange = (category, field, rawValue) => {
    const cfg   = FIELDS.find(f => f.key === field)
    const value = clamp(rawValue, cfg.min, cfg.max)

    setThresholds(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }))
    setDirty(true)
    setSaved(prev => ({ ...prev, [category]: false }))
  }

  // ── Reset a single category to defaults ───────────────────
  const handleResetCategory = (categoryKey) => {
    setThresholds(prev => ({
      ...prev,
      [categoryKey]: { ...DEFAULTS[categoryKey] },
    }))
    setSaved(prev => ({ ...prev, [categoryKey]: false }))
    setDirty(true)
  }

  // ── Reset all categories to defaults ──────────────────────
  const handleResetAll = () => {
    setThresholds(DEFAULTS)
    setSaved({})
    setDirty(true)
  }

  // ── Save all thresholds ────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateThresholds(thresholds)
      // Mark all categories as saved
      setSaved({ campus: true, locality: true, lane: true })
      setDirty(false)
    } catch {
      setError('Failed to save thresholds. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-sm">Loading threshold configuration…</span>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-200">Threshold Editor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Set the activity thresholds that trigger admin review for each block category.
            The background scheduler checks clusters every hour against these values.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetAll}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Reset all categories to system defaults"
          >
            <RotateCcw size={12} />
            Reset all
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={clsx(
              'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors',
              dirty && !saving
                ? 'bg-amber-500 hover:bg-amber-400 text-base-900'
                : 'bg-base-600 text-slate-500 cursor-not-allowed'
            )}
          >
            {saving
              ? <RefreshCw size={12} className="animate-spin" />
              : <Save size={12} />
            }
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Info banner ── */}
      <div className="flex items-start gap-2.5 bg-base-800 border border-base-600 rounded-xl px-4 py-3">
        <Info size={14} className="text-slate-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          A cluster is flagged for review when <span className="text-slate-300 font-medium">all three conditions</span> are met
          simultaneously for its category. Lowering thresholds flags clusters sooner;
          raising them requires more proven activity before admin review.
          Changes take effect on the next scheduler run (within 1 hour).
        </p>
      </div>

      {/* ── Category cards ── */}
      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const accent  = ACCENTS[cat.color]
          const values  = thresholds[cat.key] ?? DEFAULTS[cat.key]
          const isSaved = saved[cat.key]

          return (
            <div
              key={cat.key}
              className="bg-base-800 border border-base-600 rounded-xl overflow-hidden"
            >
              {/* Card header */}
              <div className={clsx(
                'flex items-center justify-between px-5 py-3.5 border-b border-base-600',
              )}>
                <div className="flex items-center gap-3">
                  <div className={clsx('w-2 h-2 rounded-full', accent.dot)} />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">{cat.label}</span>
                    <span className="text-xs text-slate-500 ml-2">{cat.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSaved && (
                    <span className="text-[11px] text-green-400 font-mono">✓ Saved</span>
                  )}
                  <button
                    onClick={() => handleResetCategory(cat.key)}
                    className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                    title={`Reset ${cat.label} to defaults`}
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-base-600">
                {FIELDS.map(field => {
                  const FieldIcon     = field.icon
                  const currentVal    = values[field.key]
                  const defaultVal    = DEFAULTS[cat.key][field.key]
                  const isModified    = currentVal !== defaultVal
                  const pct           = Math.min((currentVal / field.max) * 100, 100)

                  return (
                    <div key={field.key} className="px-5 py-4 space-y-3">

                      {/* Field label */}
                      <div className="flex items-center gap-2">
                        <FieldIcon size={13} className={field.iconColor} />
                        <span className="text-xs font-medium text-slate-300">{field.label}</span>
                        {isModified && (
                          <span className="text-[10px] text-amber-400 font-mono ml-auto">modified</span>
                        )}
                      </div>

                      {/* Number input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={currentVal}
                          onChange={e => handleChange(cat.key, field.key, e.target.value)}
                          className={clsx(
                            'w-20 bg-base-700 border border-base-500 rounded-lg px-3 py-2',
                            'text-sm font-mono font-semibold text-slate-200',
                            'focus:outline-none transition-colors',
                            accent.ring
                          )}
                        />
                        <span className="text-xs text-slate-500">{field.unit}</span>
                      </div>

                      {/* Range slider */}
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        value={currentVal}
                        onChange={e => handleChange(cat.key, field.key, e.target.value)}
                        className="w-full h-1.5 appearance-none bg-base-600 rounded-full cursor-pointer
                                   [&::-webkit-slider-thumb]:appearance-none
                                   [&::-webkit-slider-thumb]:w-3
                                   [&::-webkit-slider-thumb]:h-3
                                   [&::-webkit-slider-thumb]:rounded-full
                                   [&::-webkit-slider-thumb]:bg-amber-400"
                      />

                      {/* Fill bar + range labels */}
                      <div className="space-y-1">
                        <div className="h-1 bg-base-600 rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full rounded-full transition-all duration-300', accent.bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-mono text-slate-600">{field.min}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            default: {defaultVal}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">{field.max}</span>
                        </div>
                      </div>

                      {/* Tooltip description */}
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {field.description}
                      </p>

                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Summary table ── */}
      <div className="bg-base-800 border border-base-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-base-600">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Current Thresholds Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-base-600">
                <th className="px-5 py-3 text-left text-slate-500 font-medium">Category</th>
                {FIELDS.map(f => (
                  <th key={f.key} className="px-5 py-3 text-center text-slate-500 font-medium">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, i) => {
                const accent = ACCENTS[cat.color]
                const values = thresholds[cat.key] ?? DEFAULTS[cat.key]
                return (
                  <tr
                    key={cat.key}
                    className={clsx(
                      'border-b border-base-600/50 last:border-0',
                      i % 2 === 0 ? '' : 'bg-base-700/20'
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx('w-1.5 h-1.5 rounded-full', accent.dot)} />
                        <span className="text-slate-300">{cat.label}</span>
                      </div>
                    </td>
                    {FIELDS.map(f => (
                      <td key={f.key} className="px-5 py-3 text-center text-slate-300 font-semibold">
                        {values[f.key]}
                        <span className="text-slate-600 font-normal ml-1">{f.unit}</span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Save footer ── */}
      {dirty && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-xl px-5 py-3.5">
          <p className="text-xs text-amber-400">
            You have unsaved threshold changes. Save to apply on the next scheduler run.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold
                       bg-amber-500 hover:bg-amber-400 text-base-900 transition-colors disabled:opacity-50"
          >
            {saving
              ? <RefreshCw size={12} className="animate-spin" />
              : <Save size={12} />
            }
            {saving ? 'Saving…' : 'Save now'}
          </button>
        </div>
      )}

    </div>
  )
}