import { NavLink, Link } from 'react-router-dom'
import { ROUTES } from './routes.js'
import { cn } from '../utils/cn.js'
import { useChatStore } from '../store/chatStore.js'

// ── SVG icons (no external dep) ─────────────────────────────────────────────
const MapIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)
const SearchIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
)
const ChatIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)
const ProfileIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const PlusIcon = () => (
  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const TABS = [
  { to: '/', end: true, label: 'Map',     Icon: MapIcon    },
  { to: '/search',      label: 'Blocks',   Icon: SearchIcon },
  { to: null,           label: '',         Icon: null       },   // FAB slot
  { to: '/chats',       label: 'Chats',    Icon: ChatIcon   },
  { to: '/profile',     label: 'Profile',  Icon: ProfileIcon},
]

function TabItem({ to, end, label, Icon }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        cn('flex min-h-[48px] flex-col items-center justify-end gap-0.5 pb-2 pt-1 text-[0.65rem] font-semibold tracking-wide transition-colors',
          isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300')
      }
    >
      {({ isActive }) => (
        <>
          <Icon cls={cn('h-[22px] w-[22px] transition-transform', isActive && 'scale-110')} />
          <span>{label}</span>
          <span className={cn('h-0.5 w-4 rounded-full transition-all',
            isActive ? 'bg-brand-500 dark:bg-brand-400' : 'bg-transparent')} aria-hidden />
        </>
      )}
    </NavLink>
  )
}

export function MainTabBar() {
  const threads    = useChatStore((s) => s.threads)
  const unreadTotal = Object.values(threads).reduce((sum, msgs) => {
    return sum + msgs.filter(m => m.sender_id !== 'me' && !m.read).length
  }, 0)

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-lg -translate-x-1/2
                 items-stretch border-t border-slate-200 dark:border-slate-700/60
                 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm
                 pb-[calc(0.4rem+env(safe-area-inset-bottom))] pt-1
                 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
      aria-label="Main navigation"
    >
      {TABS.map((tab, i) =>
        tab.to === null ? (
          // Centre FAB
          <div key="fab" className="relative flex flex-1 items-center justify-center">
            <Link
              to={ROUTES.search}
              className="absolute -top-6 flex h-14 w-14 items-center justify-center
                         rounded-full bg-brand-500 text-white shadow-lg ring-4
                         ring-white dark:ring-slate-900 transition-transform active:scale-90
                         hover:bg-brand-600"
              aria-label="Post a new request"
            >
              <PlusIcon />
            </Link>
          </div>
        ) : (
          <div key={tab.to} className="relative flex flex-1 justify-center">
            <TabItem to={tab.to} end={tab.end} label={tab.label} Icon={tab.Icon} />
            {/* Unread badge on Chats tab */}
            {tab.to === '/chats' && unreadTotal > 0 && (
              <span className="pointer-events-none absolute right-[calc(50%-18px)] top-1.5
                               flex h-4 min-w-4 items-center justify-center rounded-full
                               bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </div>
        )
      )}
    </nav>
  )
}