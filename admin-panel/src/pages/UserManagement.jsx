import { useState } from 'react'
import { Search, ShieldCheck, ShieldOff, Trash2, ChevronDown, User, Clock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useApi, Spinner, ApiError } from '../hooks/Useapi.jsx'
import { getUsers, banUser, unbanUser, deleteUser } from '../services/adminApi.js'
import clsx from 'clsx'

const FILTERS = ['all', 'students', 'locals', 'banned']

function statusBadge(user) {
  if (user.status === 'banned')       return { label: 'Banned',     bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400'    }
  if (user.student_verified)          return { label: 'Student',    bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' }
  if (user.phone_verified)            return { label: 'Verified',   bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400'  }
  return                                     { label: 'Unverified', bg: 'bg-slate-500/10',  border: 'border-slate-500/20',  text: 'text-slate-400'  }
}

function verifyBadge(status) {
  if (status === 'APPROVED') return { label: 'ID Approved', text: 'text-green-400', bg: 'bg-green-500/10',  border: 'border-green-500/20'  }
  if (status === 'PENDING')  return { label: 'ID Pending',  text: 'text-amber-400', bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  }
  if (status === 'REJECTED') return { label: 'ID Rejected', text: 'text-red-400',   bg: 'bg-red-500/10',    border: 'border-red-500/20'    }
  return                            { label: 'No ID',       text: 'text-slate-500', bg: 'bg-base-600',      border: 'border-base-500'      }
}

export default function UserManagement() {
  const { data, loading, error, reload } = useApi(getUsers)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [modal,    setModal]    = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [working,  setWorking]  = useState(false)

  if (loading) return <Spinner />
  if (error)   return <ApiError message={error} onRetry={reload} />

  const users = data || []

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = (u.name || '').toLowerCase().includes(q) ||
                        (u.phone || '').includes(q) ||
                        (u.college_name || '').toLowerCase().includes(q)
    if (filter === 'students') return matchSearch && u.student_verified
    if (filter === 'locals')   return matchSearch && !u.student_verified
    if (filter === 'banned')   return matchSearch && u.status === 'BANNED'
    return matchSearch
  })

  const handleBanToggle = async (user) => {
    setWorking(true)
    try {
      if (user.status === 'BANNED') await unbanUser(user.user_id)
      else                          await banUser(user.user_id)
      reload()
    } catch (e) {
      alert('Action failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null) }
  }

  const handleDelete = async (userId) => {
    setWorking(true)
    try {
      await deleteUser(userId)
      reload()
    } catch (e) {
      alert('Delete failed: ' + (e?.response?.data?.message || e.message))
    } finally { setWorking(false); setModal(null) }
  }

  return (
    <div className="space-y-4 animate-fade-in">

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search by name, phone or college..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={clsx(
              'px-3 py-2 rounded-lg text-xs font-mono capitalize transition-all border',
              filter === f ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'text-slate-500 border-base-500 hover:border-base-400 hover:text-slate-300'
            )}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: users.length,                                       color: 'text-white'        },
          { label: 'Students', value: users.filter(u => u.student_verified).length,        color: 'text-purple-400'   },
          { label: 'Banned',   value: users.filter(u => u.status === 'BANNED').length,    color: 'text-red-400'      },
          { label: 'Pending',  value: users.filter(u => u.verification_status === 'PENDING').length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-slate-500 text-xs font-mono">{s.label}</span>
            <span className={clsx('text-xl font-bold font-mono', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
  <tr className="border-b border-base-600">
    <th className="text-left py-3 px-4 text-xs font-mono uppercase tracking-wider text-slate-500">User</th>
    <th className="text-left py-3 px-4 text-xs font-mono uppercase tracking-wider text-slate-500">Status</th>
    <th className="text-left py-3 px-4 text-xs font-mono uppercase tracking-wider text-slate-500">Verification</th>
    <th className="text-left py-3 px-4 text-xs font-mono uppercase tracking-wider text-slate-500">Last Seen</th>
    <th className="text-left py-3 px-4 text-xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
  </tr>
</thead>
            <tbody>
              {filtered.map(user => {
                const sb = statusBadge(user)
                const vb = verifyBadge(user.verification_status)
                return (
                  <tr key={user.user_id} className="border-b border-base-700 hover:bg-base-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-base-600 border border-base-500 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{user.name}</p>
                          <p className="text-slate-500 text-xs font-mono">{user.phone}</p>
                          {user.college_name && <p className="text-slate-600 text-xs truncate max-w-[160px]">{user.college_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className={clsx('badge border', sb.bg, sb.border, sb.text)}>{sb.label}</span></td>
                    <td className="py-3 px-4"><span className={clsx('badge border', vb.bg, vb.border, vb.text)}>{vb.label}</span></td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {user.last_seen_at ? formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true }) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: 'ban', user })} disabled={working}
                          className={clsx('p-1.5 rounded-lg transition-colors', user.status === 'BANNED' ? 'hover:bg-green-500/10 text-slate-500 hover:text-green-400' : 'hover:bg-red-500/10 text-slate-500 hover:text-red-400')}
                          title={user.status === 'BANNED' ? 'Unban' : 'Ban'}>
                          {user.status === 'BANNED' ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                        </button>
                        <button onClick={() => setModal({ type: 'delete', user })} disabled={working}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map(user => {
          const sb = statusBadge(user)
          const vb = verifyBadge(user.verification_status)
          const isExpanded = expanded === user.user_id
          return (
            <div key={user.user_id} className="card overflow-hidden">
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(isExpanded ? null : user.user_id)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-base-600 border border-base-500 flex items-center justify-center text-sm font-bold text-slate-300">
                    {(user.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <p className="text-slate-500 text-xs font-mono">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('badge border', sb.bg, sb.border, sb.text)}>{sb.label}</span>
                  <ChevronDown size={14} className={clsx('text-slate-500 transition-transform', isExpanded && 'rotate-180')} />
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-base-600 p-4 space-y-3 animate-slide-in">
                  {user.college_name && <p className="text-slate-400 text-xs">{user.college_name}</p>}
                  <span className={clsx('badge border', vb.bg, vb.border, vb.text)}>{vb.label}</span>
                  {user.last_seen_at && (
                    <p className="text-slate-500 text-xs font-mono flex items-center gap-1">
                      <Clock size={10} /> {formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true })}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setModal({ type: 'ban', user })} disabled={working}
                      className={user.status === 'BANNED' ? 'btn-success flex-1 justify-center' : 'btn-danger flex-1 justify-center'}>
                      {user.status === 'BANNED' ? <><ShieldCheck size={13} />Unban</> : <><ShieldOff size={13} />Ban</>}
                    </button>
                    <button onClick={() => setModal({ type: 'delete', user })} disabled={working} className="btn-danger px-3"><Trash2 size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirm modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="card w-full max-w-sm p-6 animate-slide-in" onClick={e => e.stopPropagation()}>
            {modal.type === 'ban' && (
              <>
                <p className="text-white font-semibold mb-2">{modal.user.status === 'BANNED' ? 'Unban' : 'Ban'} {modal.user.name}?</p>
                <p className="text-slate-500 text-sm mb-5">
                  {modal.user.status === 'BANNED' ? 'User will regain access to the app.' : 'User will be blocked from accessing any block or posting requests.'}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handleBanToggle(modal.user)} disabled={working}
                    className={modal.user.status === 'BANNED' ? 'btn-success flex-1 justify-center' : 'btn-danger flex-1 justify-center'}>
                    {working ? 'Working…' : modal.user.status === 'BANNED' ? 'Confirm Unban' : 'Confirm Ban'}
                  </button>
                  <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'delete' && (
              <>
                <p className="text-white font-semibold mb-2">Delete {modal.user.name}?</p>
                <p className="text-slate-500 text-sm mb-5">This is permanent. All their data will be removed.</p>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(modal.user.user_id)} disabled={working} className="btn-danger flex-1 justify-center">
                    <Trash2 size={13} /> {working ? 'Deleting…' : 'Delete Permanently'}
                  </button>
                  <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}