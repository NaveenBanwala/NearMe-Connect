import { useState } from 'react'
import { BottomSheet } from '../shared/BottomSheet.jsx'
import { Button } from '../shared/Button.jsx'
import { RequestTypeSelector } from './RequestTypeSelector.jsx'
import { VisibilityToggle } from './VisibilityToggle.jsx'
import { ExpirySelector } from './ExpirySelector.jsx'
import { REQUEST_VISIBILITIES } from '../../utils/constants.js'
import { useVerification } from '../../hooks/useVerification.js'
import { createRequest } from '../../services/requestService.js'

export function CreateRequestSheet({ open, onClose, blockId, onSubmit }) {
  const { isStudent }    = useVerification()
  const [title, setTitle]= useState('')
  const [desc,  setDesc] = useState('')
  const [type,  setType] = useState('help')
  const [visibility, setVisibility] = useState(
    isStudent ? REQUEST_VISIBILITIES.STUDENTS : REQUEST_VISIBILITIES.PUBLIC
  )
  const [expiresMs, setExpiresMs] = useState(60 * 60 * 1000)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const payload = {
        block_id:    blockId,
        title:       title.trim(),
        description: desc.trim(),
        type,
        visibility:  isStudent ? visibility : REQUEST_VISIBILITIES.PUBLIC,
        expiry_time: new Date(Date.now() + expiresMs).toISOString(),
      }
      const res = await createRequest(payload)
      onSubmit?.(res.data)
    } catch {
      // Optimistic fallback
      onSubmit?.({
        request_id:  `local_${Date.now()}`,
        block_id:    blockId,
        title:       title.trim(),
        description: desc.trim(),
        type, visibility, status: 'open',
        created_at:  new Date().toISOString(),
        expires_at:  new Date(Date.now() + expiresMs).toISOString(),
      })
    } finally {
      setLoading(false)
      setTitle(''); setDesc('')
      onClose?.()
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="New Request">
      <form className="flex flex-col gap-4 pt-1" onSubmit={handleSubmit}>
        <RequestTypeSelector value={type} onChange={setType} />

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="What do you need?"
            value={title} onChange={(e) => setTitle(e.target.value)} required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Details</label>
          <textarea
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            rows={3} value={desc} onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Visibility</p>
          <VisibilityToggle value={visibility} onChange={setVisibility} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expires in</p>
          <ExpirySelector onSelectMs={setExpiresMs} />
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading || !title.trim()}>
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting…
            </span>
          ) : '🚀 Post Request'}
        </Button>
      </form>
    </BottomSheet>
  )
}