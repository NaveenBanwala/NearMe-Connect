import { useState } from 'react'
import { Search, SlidersHorizontal, CheckCircle, XCircle, MapPin } from 'lucide-react'
import ApprovalCard from '../components/ApprovalCard.jsx'
import ThresholdEditor from '../components/ThresholdEditor.jsx'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getVoteClusters, approveVoteCluster, rejectVoteCluster } from '../services/adminApi.js'
import clsx from 'clsx'

const FILTERS = ['all', 'campus', 'locality', 'society', 'market']

export default function BlockRequests() {
  const { data: clusters, loading, error, reload } = useApi(getVoteClusters)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [showThresh,   setShowThresh]   = useState(false)
  const [modal,        setModal]        = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [working,      setWorking]      = useState(false)

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const list = clusters || []

  const filtered = list.filter(c => {
    const matchSearch = c.suggested_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.category === filter
    return matchSearch && matchFilter
  })

  const readyToApprove = list.filter(c => c.vote_count >= c.threshold_required)

  const confirmApprove = async () => {
    setWorking(true)
    try {
      // Navigate to block editor with cluster data to draw boundary
      // For now, approve with center coordinates as boundary placeholder
      await approveVoteCluster(modal.cluster.cluster_id, {
        name:             modal.cluster.suggested_name,
        category:         modal.cluster.category,
        clusterId:        modal.cluster.cluster_id,
        centerLat:        modal.cluster.geo_lat,
        centerLng:        modal.cluster.geo_lng,
        // Minimal bounding box — admin should draw proper boundary in BlockEditor
        boundaryGeoJson:  JSON.stringify({
          type: 'Polygon',
          coordinates: [[
            [modal.cluster.geo_lng - 0.005, modal.cluster.geo_lat - 0.005],
            [modal.cluster.geo_lng + 0.005, modal.cluster.geo_lat - 0.005],
            [modal.cluster.geo_lng + 0.005, modal.cluster.geo_lat + 0.005],
            [modal.cluster.geo_lng - 0.005, modal.cluster.geo_lat + 0.005],
            [modal.cluster.geo_lng - 0.005, modal.cluster.geo_lat - 0.005],
          ]]
        }),
      })
      reload()
    } catch (e) {
      alert('Approve failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null) }
  }

  const confirmReject = async () => {
    setWorking(true)
    try {
      await rejectVoteCluster(modal.cluster.cluster_id, { reason: rejectReason })
      reload()
    } catch (e) {
      alert('Reject failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null); setRejectReason('') }
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {readyToApprove.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong className="font-semibold">{readyToApprove.length} block request{readyToApprove.length > 1 ? 's' : ''}</strong> have reached their vote threshold and need your review.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search block requests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={clsx(
              'px-3 py-2 rounded-lg text-xs font-mono capitalize transition-all border',
              filter === f ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'text-slate-500 border-base-500 hover:border-base-400 hover:text-slate-300'
            )}>{f}</button>
          ))}
          <button onClick={() => setShowThresh(v => !v)} className="btn-secondary">
            <SlidersHorizontal size={14} /> Thresholds
          </button>
        </div>
      </div>

      {showThresh && <ThresholdEditor />}

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <MapPin size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">{list.length === 0 ? 'No pending block requests.' : 'No results match your filters.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(cluster => (
            <ApprovalCard
              key={cluster.cluster_id}
              cluster={cluster}
              onApprove={c => setModal({ type: 'approve', cluster: c })}
              onReject={c  => setModal({ type: 'reject',  cluster: c })}
              onView={c    => setModal({ type: 'view',    cluster: c })}
            />
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="card w-full max-w-md p-6 animate-slide-in" onClick={e => e.stopPropagation()}>

            {modal.type === 'approve' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Approve Block</p>
                    <p className="text-slate-500 text-xs mt-0.5">A default boundary will be created. Refine it in Block Editor.</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-5">
                  Approve <strong className="text-white">{modal.cluster.suggested_name}</strong> as a new{' '}
                  <span className="text-amber-400">{modal.cluster.category}</span> block?
                  All {modal.cluster.unique_voter_count} voters will be notified.
                </p>
                <div className="flex gap-2">
                  <button onClick={confirmApprove} disabled={working} className="btn-success flex-1 justify-center">
                    <CheckCircle size={14} /> {working ? 'Approving…' : 'Approve Block'}
                  </button>
                  <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}

            {modal.type === 'reject' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <XCircle size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Reject Block Request</p>
                    <p className="text-slate-500 text-xs mt-0.5">Voters will be notified with your reason</p>
                  </div>
                </div>
                <label className="label">Reason (optional)</label>
                <textarea className="input resize-none h-24 mb-4" placeholder="e.g. Area too small, duplicate of existing block..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={confirmReject} disabled={working} className="btn-danger flex-1 justify-center">
                    <XCircle size={14} /> {working ? 'Rejecting…' : 'Reject Request'}
                  </button>
                  <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}

            {modal.type === 'view' && (
              <>
                <p className="text-white font-semibold mb-4">{modal.cluster.suggested_name}</p>
                <div className="space-y-2 text-sm">
                  {[
                    ['Category',       modal.cluster.category],
                    ['Votes',          `${modal.cluster.vote_count} / ${modal.cluster.threshold_required}`],
                    ['Unique voters',  modal.cluster.unique_voter_count],
                    ['Progress',       `${modal.cluster.progress_pct}%`],
                    ['Coordinates',    `${modal.cluster.geo_lat?.toFixed(5)}, ${modal.cluster.geo_lng?.toFixed(5)}`],
                    ['Status',         modal.cluster.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-200 font-mono text-xs capitalize">{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setModal(null)} className="btn-secondary w-full justify-center mt-5">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}