import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, Trash2, MapPin } from 'lucide-react'
import { useRequestStore } from '../store/requestStore.js'
import { useAuthStore } from '../store/authStore.js'
import { fetchRequest, acceptRequest } from '../services/requestService.js'
import { ROUTES } from '../navigation/routes.js'
import { REQUEST_TYPE_META } from '../utils/constants.js'
import { formatRelativeTime } from '../utils/helpers.js'
import { BackButton } from '../components/shared/BackButton.jsx'
import { LoadingSpinner } from '../components/shared/LoadingSpinner.jsx'

export function RequestDetailScreen() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const updateStore  = useRequestStore((s) => s.closeRequest)
  const deleteStore  = useRequestStore((s) => s.deleteRequest)
  const user         = useAuthStore((s) => s.user)

  const [request, setReq]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchRequest(id)
      .then(r => {
        const data = r.data ?? r
        setReq(data)
      })
      .catch(() => setError('Request not found.'))
      .finally(() => setLoading(false))
  }, [id])

  // API returns snake_case
  const isOwner  = request?.user_id === user?.user_id
  const accepted = request?.status === 'accepted'
  const closed   = request?.status === 'closed'

  const handleAccept = async () => {
    setWorking(true); setError(null)
    try {
      await acceptRequest(id)
      navigate(ROUTES.chat(id))
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not accept request.')
    } finally { setWorking(false) }
  }

  const handleClose = async () => {
    if (!confirm('Close this request?')) return
    setWorking(true)
    try {
      await updateStore(id)
      setReq(r => ({ ...r, status: 'closed' }))
    } catch {} finally { setWorking(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this request permanently?')) return
    setWorking(true)
    try {
      await deleteStore(id)
      navigate(-1)
    } catch {} finally { setWorking(false) }
  }

  if (loading) return (
    <div className="flex min-h-dvh items-center justify-center bg-app">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (!request) return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-app px-6">
      <p className="text-5xl">😕</p>
      <p className="text-muted-app">{error || 'Request not found.'}</p>
      <button onClick={() => navigate(-1)} className="btn-secondary">Go back</button>
    </div>
  )

  const meta = REQUEST_TYPE_META[request.type] || REQUEST_TYPE_META.help

  return (
    <div className="min-h-dvh bg-app pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
        <BackButton />
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Main card */}
        <div className="card p-5">
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className={`badge ${meta.color}`}>{meta.emoji} {meta.label}</span>
            <span className="badge bg-slate-100 dark:bg-slate-800 text-muted-app">
              {request.visibility === 'public' ? '🌐 Public' : '🔒 Students'}
            </span>
            {closed && (
              <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-500">Closed</span>
            )}
            {accepted && !closed && (
              <span className="badge bg-green-100 dark:bg-green-900/40 text-green-600">Accepted</span>
            )}
          </div>

          <h1 className="text-xl font-bold text-app mb-2">{request.title}</h1>

          {request.description && (
            <p className="text-sm text-muted-app leading-relaxed mb-4">{request.description}</p>
          )}

          <div className="flex gap-4 text-xs text-faint-app">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {request.created_at ? formatRelativeTime(request.created_at) : '—'}
            </span>
            {request.expiry_time && (
              <span className="flex items-center gap-1">
                ⏳ Expires {formatRelativeTime(request.expiry_time)}
              </span>
            )}
          </div>
        </div>

        {/* Location note */}
        <div className="card p-4 flex gap-3 items-start">
          <MapPin size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-app">
            Exact location is shared only after you accept this request.
          </p>
        </div>

        {/* Actions */}
        {!closed && !isOwner && (
          <button onClick={handleAccept} disabled={working || accepted}
            className="btn-primary w-full py-4 text-base">
            {working
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Accepting…
                </span>
              : accepted
                ? <><CheckCircle size={18} /> Chat Opened</>
                : <><CheckCircle size={18} /> Accept & Chat</>
            }
          </button>
        )}

        {accepted && !closed && (
          <button onClick={() => navigate(ROUTES.chat(id))} className="btn-secondary w-full py-3">
            💬 Open Chat
          </button>
        )}

        {isOwner && !closed && (
          <div className="flex gap-2">
            <button onClick={handleClose} disabled={working} className="btn-secondary flex-1 py-3">
              Mark as Done ✓
            </button>
            <button onClick={handleDelete} disabled={working}
              className="btn-icon w-12 h-12 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>
    </div>
  )
}