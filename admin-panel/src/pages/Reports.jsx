import { useState } from 'react'
import { Flag, CheckCircle, XCircle, User, FileText, Clock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getReports, resolveReport, dismissReport } from '../services/adminApi.js'
import clsx from 'clsx'

const STATUS_MAP = {
  open:      { label: 'Open',      bg: 'bg-red-500/10',   border: 'border-red-500/20',   text: 'text-red-400'   },
  resolved:  { label: 'Resolved',  bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
  dismissed: { label: 'Dismissed', bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' },
}
const TYPE_MAP = {
  user:    { icon: User,     color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  request: { icon: FileText, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
}

export default function Reports() {
  const { data, loading, error, reload } = useApi(getReports)
  const [filter,  setFilter]  = useState('all')
  const [modal,   setModal]   = useState(null)
  const [working, setWorking] = useState(false)

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const reports   = data || []
  const openCount = reports.filter(r => r.status === 'open').length

  const filtered = reports.filter(r => {
    if (filter === 'open')     return r.status === 'open'
    if (filter === 'resolved') return r.status === 'resolved'
    if (filter === 'users')    return r.against_type === 'user'
    if (filter === 'requests') return r.against_type === 'request'
    return true
  })

  const handleResolve = async () => {
    setWorking(true)
    try {
      await resolveReport(modal.report.report_id)
      reload()
    } catch (e) {
      alert('Resolve failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null) }
  }

  const handleDismiss = async (reportId) => {
    try {
      await dismissReport(reportId)
      reload()
    } catch (e) {
      alert('Dismiss failed: ' + (e?.response?.data?.message || e.message))
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {openCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">
            <strong className="font-semibold">{openCount} open report{openCount > 1 ? 's' : ''}</strong> need your attention.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: reports.length,                                    color: 'text-white'      },
          { label: 'Open',      value: reports.filter(r => r.status === 'open').length,      color: 'text-red-400'    },
          { label: 'Resolved',  value: reports.filter(r => r.status === 'resolved').length,  color: 'text-green-400'  },
          { label: 'Dismissed', value: reports.filter(r => r.status === 'dismissed').length, color: 'text-slate-400'  },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-slate-500 text-xs font-mono">{s.label}</span>
            <span className={clsx('text-xl font-bold font-mono', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'resolved', 'users', 'requests'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={clsx(
            'px-3 py-2 rounded-lg text-xs font-mono capitalize border transition-all',
            filter === f ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'text-slate-500 border-base-500 hover:border-base-400 hover:text-slate-300'
          )}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Flag size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">{reports.length === 0 ? 'No reports yet.' : 'No reports match your filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(report => {
            const sm = STATUS_MAP[report.status] || STATUS_MAP.open
            const tm = TYPE_MAP[report.against_type] || TYPE_MAP.user
            const TypeIcon = tm.icon
            return (
              <div key={report.report_id} className="card-hover p-4 animate-slide-in">
                <div className="flex items-start gap-3">
                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border', tm.bg, tm.border)}>
                    <TypeIcon size={15} className={tm.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <div>
                        <p className="text-white font-medium text-sm">{report.against_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Reported by <span className="text-slate-400">{report.reported_by_name}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={clsx('badge border', sm.bg, sm.border, sm.text)}>{sm.label}</span>
                        <span className={clsx('badge border capitalize', tm.bg, tm.border, tm.color)}>{report.against_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Flag size={11} className="text-slate-600" />
                      <p className="text-slate-400 text-sm">{report.reason}</p>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-slate-600 text-xs font-mono flex items-center gap-1">
                        <Clock size={10} />
                        {report.created_at ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true }) : '—'}
                      </span>
                      {report.status === 'open' && (
                        <div className="flex gap-2">
                          <button onClick={() => setModal({ type: 'resolve', report })} className="btn-success py-1.5 px-3 text-xs">
                            <CheckCircle size={12} /> Resolve
                          </button>
                          <button onClick={() => handleDismiss(report.report_id)} className="btn-secondary py-1.5 px-3 text-xs">
                            <XCircle size={12} /> Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                    {report.admin_notes && (
                      <p className="text-slate-600 text-xs mt-2 italic">Note: {report.admin_notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="card w-full max-w-sm p-6 animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Resolve Report</p>
                <p className="text-slate-500 text-xs">Mark as handled</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-5">
              Confirm you've reviewed the report against <strong className="text-white">{modal.report.against_name}</strong> and taken action.
            </p>
            <div className="flex gap-2">
              <button onClick={handleResolve} disabled={working} className="btn-success flex-1 justify-center">
                <CheckCircle size={14} /> {working ? 'Resolving…' : 'Mark Resolved'}
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}