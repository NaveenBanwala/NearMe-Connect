import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, LogOut, Shield, MapPin, Clock, Settings, ChevronRight, Check, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore.js'
import { updateProfile } from '../services/userService.js'
import { ROUTES } from '../navigation/routes.js'
import { PROFILE_EMOJIS } from '../utils/constants.js'
import { cn } from '../utils/helpers.js'

export function ProfileScreen() {
  const user       = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const logout     = useAuthStore((s) => s.logout)
  const navigate   = useNavigate()

  const [editing,       setEditing]     = useState(false)
  const [showEmojiPick, setShowEmojiPick] = useState(false)
  const [name,          setName]         = useState(user?.name || '')
  const [emoji,         setEmoji]        = useState(user?.profile_emoji || '')
  const [saving,        setSaving]       = useState(false)
  const [error,         setError]        = useState(null)

  const displayEmoji  = emoji || user?.profile_emoji || '😊'
  const displayLetter = (user?.name || 'U').charAt(0).toUpperCase()

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true); setError(null)
    try {
      const res = await updateProfile({ name: name.trim(), profile_emoji: emoji })
      updateUser(res.data || { name: name.trim(), profile_emoji: emoji })
      setEditing(false)
      setShowEmojiPick(false)
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed.')
    } finally { setSaving(false) }
  }

  const cancelEdit = () => {
    setName(user?.name || '')
    setEmoji(user?.profile_emoji || '')
    setEditing(false)
    setShowEmojiPick(false)
  }

  const verifyBadge = user?.student_verified
    ? { label: 'Student Verified', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/30', icon: '✓' }
    : user?.phone_verified
      ? { label: 'Phone Verified', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', icon: '📱' }
      : { label: 'Unverified', color: 'text-muted-app', bg: 'bg-subtle', icon: '•' }

  return (
    <div className="min-h-dvh bg-app pb-28">
      {/* Hero header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900
                      px-4 pt-safe pt-6 pb-10 text-white">
        <div className="flex justify-end mb-3">
          <button onClick={() => navigate(ROUTES.settings)} className="btn-icon w-9 h-9 bg-white/10 border-white/20 text-white">
            <Settings size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          {/* Avatar with emoji picker */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600
                            flex items-center justify-center text-4xl shadow-lg border-4 border-white/10">
              {displayEmoji || displayLetter}
            </div>

            {editing && (
              <button
                onClick={() => setShowEmojiPick((v) => !v)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-500 text-white
                           flex items-center justify-center text-sm shadow border-2 border-white/20"
              >
                ✏️
              </button>
            )}
          </div>

          {/* Emoji picker */}
          {showEmojiPick && (
            <div className="mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-scale-in">
              <p className="text-xs text-white/60 mb-2 text-center">Choose your emoji</p>
              <div className="grid grid-cols-8 gap-1.5">
                {PROFILE_EMOJIS.map((e) => (
                  <button key={e} onClick={() => { setEmoji(e); setShowEmojiPick(false) }}
                    className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all',
                      emoji === e ? 'bg-brand-500 scale-110' : 'bg-white/10 hover:bg-white/20')}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          {editing ? (
            <input
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white
                         text-lg font-bold text-center w-full max-w-xs focus:outline-none focus:border-brand-400"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <h1 className="text-2xl font-bold">{user?.name || 'Guest'}</h1>
          )}

          {/* College + verify badge */}
          <p className="text-sm text-white/60 mt-1">
            {user?.college_name || 'NearMe Connect'}
          </p>

          <span className={cn('badge mt-2 text-xs font-semibold', verifyBadge.bg, verifyBadge.color)}>
            {verifyBadge.icon} {verifyBadge.label}
          </span>

          {/* Edit controls */}
          {editing ? (
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                Save
              </button>
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white rounded-xl text-sm">
                <X size={14} /> Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors">
              <Edit2 size={13} /> Edit Profile
            </button>
          )}

          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { n: user?.request_count ?? 0,  l: 'Requests' },
            { n: user?.helped_count  ?? 0,  l: 'Helped'   },
            { n: user?.rating?.toFixed(1) ?? '—', l: 'Rating' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/10 text-center py-4 px-2">
              <p className="text-xl font-bold">{s.n}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="relative z-10 -mt-4 rounded-t-3xl bg-app px-4 pt-5 space-y-2.5">
        {[
          { icon:'🛡️', title:'Verification',     sub: user?.student_verified ? 'Student verified ✓' : 'Upgrade to student access', to: ROUTES.verification },
          { icon:'📍', title:'My Blocks',         sub: 'View blocks you\'ve joined' },
          { icon:'🕐', title:'Request History',   sub: 'Past requests you\'ve made' },
          { icon:'⚙️', title:'Settings',          sub: 'Account, privacy & notifications', to: ROUTES.settings },
        ].map((item) => (
          <button key={item.title}
            onClick={() => item.to ? navigate(item.to) : null}
            className="card-hover w-full flex items-center gap-4 p-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-subtle flex items-center justify-center text-xl flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-app">{item.title}</p>
              <p className="text-xs text-muted-app">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-faint-app flex-shrink-0" />
          </button>
        ))}

        {/* Log out */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-red-200 dark:border-red-900/40
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <LogOut size={18} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Log Out</p>
        </button>
      </div>
    </div>
  )
}