import { useState } from 'react'
import { Bell, MapPin, Flame, ShieldCheck, MessageCircle, Clock } from 'lucide-react'
import { BackButton } from '../components/shared/BackButton.jsx'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../navigation/routes.js'
import { cn } from '../utils/helpers.js'

// Notifications don't have a dedicated backend endpoint yet — kept as local state
// When FCM is wired, replace MOCK_NOTIFS with real push data
const MOCK_NOTIFS = [
  { id:1, type:'accept',  icon: MessageCircle, color:'text-brand-500',  bg:'bg-brand-50 dark:bg-brand-900/30',  title:'Request accepted',         body:'Your help request found a match nearby.',    time:'2 min ago',  read:false },
  { id:2, type:'heat',    icon: Flame,         color:'text-orange-500', bg:'bg-orange-50 dark:bg-orange-900/30',title:'Block heating up',          body:'KIIT Campus just crossed Warm level.',       time:'18 min ago', read:false },
  { id:3, type:'verify',  icon: ShieldCheck,   color:'text-green-500',  bg:'bg-green-50 dark:bg-green-900/30',  title:'ID verified ✓',             body:'Your college ID has been approved by admin.', time:'2 hrs ago',  read:true  },
  { id:4, type:'block',   icon: MapPin,        color:'text-purple-500', bg:'bg-purple-50 dark:bg-purple-900/30',title:'New block created',         body:'Salt Lake Sec V is now live on the map.',    time:'Yesterday',  read:true  },
  { id:5, type:'expire',  icon: Clock,         color:'text-amber-500',  bg:'bg-amber-50 dark:bg-amber-900/30',  title:'Request expiring soon',     body:'Your "Badminton partner" expires in 10 min.',time:'Yesterday',  read:true  },
]

export function NotificationsScreen() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const navigate            = useNavigate()
  const unread              = notifs.filter(n => !n.read).length

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })))
  const markRead    = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="min-h-dvh bg-app pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-xl font-display font-bold text-app">Notifications</h1>
              {unread > 0 && <p className="text-xs text-brand-500 font-medium">{unread} new</p>}
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-brand-500 font-semibold hover:text-brand-600">
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-app">
        {notifs.map(n => {
          const Icon = n.icon
          return (
            <div key={n.id}
              onClick={() => markRead(n.id)}
              className={cn('flex gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-subtle',
                !n.read && 'bg-brand-50/50 dark:bg-brand-900/10')}>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', n.bg)}>
                <Icon size={20} className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-semibold', !n.read ? 'text-app' : 'text-muted-app')}>
                    {n.title}
                  </p>
                  <span className="text-xs text-faint-app flex-shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-muted-app mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
              )}
            </div>
          )
        })}
      </div>

      {notifs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <Bell size={48} className="text-faint-app mb-4" />
          <p className="font-semibold text-app">All caught up!</p>
          <p className="text-sm text-muted-app mt-1">Notifications will appear here.</p>
        </div>
      )}
    </div>
  )
}