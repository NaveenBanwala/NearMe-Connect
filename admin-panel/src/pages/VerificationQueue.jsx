import { useState } from 'react'
import { ShieldCheck, XCircle, ZoomIn, Clock, GraduationCap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getVerifyQueue, approveVerify, rejectVerify } from '../services/adminApi.js'
import clsx from 'clsx'

export default function VerificationQueue() {
  const { data, loading, error, reload } = useApi(getVerifyQueue)
  const [modal,        setModal]        = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [preview,      setPreview]      = useState(null)
  const [done,         setDone]         = useState([])
  const [working,      setWorking]      = useState(false)

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const queue = data || []

  const handleApprove = async (item) => {
    setWorking(true)
    try {
      await approveVerify(item.user_id)
      setDone(prev => [...prev, { ...item, result: 'approved' }])
      reload()
    } catch (e) {
      alert('Approve failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null) }
  }

  const handleReject = async (item) => {
    setWorking(true)
    try {
      await rejectVerify(item.user_id, rejectReason)
      setDone(prev => [...prev, { ...item, result: 'rejected', reason: rejectReason }])
      reload()
    } catch (e) {
      alert('Reject failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null); setRejectReason('') }
  }

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Clock,       color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Pending review',        value: queue.length },
          { icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: 'Approved this session', value: done.filter(d => d.result === 'approved').length },
          { icon: XCircle,     color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20',     label: 'Rejected this session', value: done.filter(d => d.result === 'rejected').length },
        ].map(s => (
          <div key={s.label} className="card px-5 py-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-white">{s.value}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {queue.length === 0 ? (
        <div className="card py-20 text-center">
          <ShieldCheck size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">All caught up!</p>
          <p className="text-slate-600 text-sm mt-1">No pending verifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map(item => (
            <div key={item.user_id} className="card-hover p-5 space-y-4 animate-slide-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-base-600 border border-base-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(item.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{item.name}</p>
                  <p className="text-slate-500 text-xs font-mono">{item.phone}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <GraduationCap size={11} className="text-slate-500" />
                    <p className="text-slate-400 text-xs truncate">{item.college_name}</p>
                  </div>
                </div>
                <span className="text-slate-600 text-xs font-mono flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} />
                  {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : '—'}
                </span>
              </div>

              {/* College ID image */}
              {item.college_id_url ? (
                <div className="relative group rounded-xl overflow-hidden bg-base-700 border border-base-500">
                  <img src={item.college_id_url} alt="College ID" className="w-full h-44 object-cover" />
                  <button
                    onClick={() => setPreview(item.college_id_url)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center"
                  >
                    <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              ) : (
                <div className="h-20 rounded-xl bg-base-700 border border-base-500 flex items-center justify-center">
                  <p className="text-slate-500 text-xs">No ID image uploaded</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setModal({ type: 'approve', item })} disabled={working} className="btn-success flex-1 justify-center">
                  <ShieldCheck size={14} /> Approve
                </button>
                <button onClick={() => setModal({ type: 'reject', item })} disabled={working} className="btn-danger flex-1 justify-center">
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="card p-5">
          <p className="section-title mb-4">Completed This Session</p>
          <div className="space-y-2">
            {done.map((item) => (
  <div key={`${item.user_id}-${item.result}`} className="flex items-center justify-between py-2 border-b border-base-700 last:border-0">
                <div>
                  <p className="text-slate-300 text-sm font-medium">{item.name}</p>
                  <p className="text-slate-600 text-xs font-mono">{item.college_name}</p>
                </div>
                <span className={clsx('badge border', item.result === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400')}>
                  {item.result === 'approved' ? <ShieldCheck size={10} /> : <XCircle size={10} />} {item.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image preview */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="ID Preview" className="max-w-full max-h-[80vh] rounded-xl border border-base-500 shadow-2xl" />
        </div>
      )}

      {/* Confirm modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setModal(null); setRejectReason('') }}>
          <div className="card w-full max-w-sm p-6 animate-slide-in" onClick={e => e.stopPropagation()}>
            {modal.type === 'approve' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center"><ShieldCheck size={18} className="text-green-400" /></div>
                  <div><p className="text-white font-semibold">Approve Verification</p><p className="text-slate-500 text-xs">{modal.item.name}</p></div>
                </div>
                <p className="text-slate-400 text-sm mb-5">User will receive the student verified badge and gain access to campus feeds.</p>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(modal.item)} disabled={working} className="btn-success flex-1 justify-center">
                    <ShieldCheck size={14} /> {working ? 'Approving…' : 'Confirm Approve'}
                  </button>
                  <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'reject' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><XCircle size={18} className="text-red-400" /></div>
                  <div><p className="text-white font-semibold">Reject Verification</p><p className="text-slate-500 text-xs">{modal.item.name}</p></div>
                </div>
                <label className="label">Reason (shown to user)</label>
                <textarea className="input resize-none h-24 mb-4" placeholder="e.g. ID image is blurry..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => handleReject(modal.item)} disabled={working} className="btn-danger flex-1 justify-center">
                    <XCircle size={14} /> {working ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                  <button onClick={() => { setModal(null); setRejectReason('') }} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}