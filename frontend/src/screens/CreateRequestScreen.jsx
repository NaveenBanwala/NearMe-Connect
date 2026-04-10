import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, Eye, EyeOff, Clock } from 'lucide-react'
import { useRequestStore } from '../store/requestStore.js'
import { useAuthStore } from '../store/authStore.js'
import { useVerification } from '../hooks/useVerification.js'
import { createRequest } from '../services/requestService.js'
import { ROUTES } from '../navigation/routes.js'
import { REQUEST_TYPES, REQUEST_TYPE_META, REQUEST_VISIBILITIES } from '../utils/constants.js'
import { BackButton } from '../components/shared/BackButton.jsx'
import { cn } from '../utils/cn.js'

const EXPIRY_OPTIONS = [
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
]

export function CreateRequestScreen() {
  const { blockId }        = useParams()
  const navigate           = useNavigate()
  const addRequest         = useRequestStore((s) => s.addRequest)
  const { isStudent }      = useVerification()
  const user               = useAuthStore((s) => s.user)

  const [title,      setTitle]      = useState('')
  const [desc,       setDesc]       = useState('')
  const [type,       setType]       = useState('help')
  const [visibility, setVisibility] = useState(isStudent ? REQUEST_VISIBILITIES.STUDENTS : REQUEST_VISIBILITIES.PUBLIC)
  const [expiryMs,   setExpiryMs]   = useState(EXPIRY_OPTIONS[1].ms)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError(null)
    try {
      const payload = {
        block_id:    blockId,
        type,
        title:       title.trim(),
        description: desc.trim(),
        visibility:  isStudent ? visibility : REQUEST_VISIBILITIES.PUBLIC,
        expiry_time: new Date(Date.now() + expiryMs).toISOString(),
      }
      const res = await createRequest(payload)
      addRequest(blockId, res.data)
      navigate(ROUTES.block(blockId), { replace: true })
    } catch (e) {
      // Optimistic fallback — add locally even if API fails
      const local = {
        request_id: `local_${Date.now()}`,
        block_id: blockId,
        title: title.trim(), description: desc.trim(),
        type, visibility, status: 'open',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + expiryMs).toISOString(),
      }
      addRequest(blockId, local)
      navigate(ROUTES.block(blockId), { replace: true })
    } finally { setLoading(false) }
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

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-5">
        {/* Type selector */}
        <div>
          <label className="label">Request Type</label>
          <div className="grid grid-cols-4 gap-2">
            {REQUEST_TYPES.map(t => {
              const meta = REQUEST_TYPE_META[t]
              return (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={cn('flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all text-xs font-semibold',
                    type === t
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                      : 'border-app bg-surface text-muted-app hover:border-brand-300')}>
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
                  className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                    visibility === v ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'border-app text-muted-app hover:border-brand-300')}>
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
                className={cn('flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  expiryMs === opt.ms ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'border-app text-muted-app hover:border-brand-300')}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button type="submit" disabled={loading || !title.trim()} className="btn-primary w-full py-4 text-base">
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