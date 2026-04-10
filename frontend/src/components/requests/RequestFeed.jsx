import { RequestCard } from './RequestCard.jsx'
import { EmptyState } from '../shared/EmptyState.jsx'

export function RequestFeed({ requests, loading }) {
  if (loading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-subtle" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-subtle rounded w-3/4" />
              <div className="h-3 bg-subtle rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (!requests?.length) return (
    <EmptyState emoji="📭" title="No requests here" subtitle="Be the first to post one!" />
  )

  return (
    <div className="space-y-2">
      {requests.map(r => <RequestCard key={r.request_id} request={r} />)}
    </div>
  )
}