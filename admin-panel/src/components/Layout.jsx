import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, Map, Users, ShieldCheck,
  Flame, Flag, Menu, X, ChevronRight, Bell, Settings,
  LogOut, Activity
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard',          badge: null },
  { to: '/block-requests', icon: MapPin,           label: 'Block Requests',     badge: 'votes' },
  { to: '/block-editor',   icon: Map,              label: 'Block Editor',       badge: null },
  { to: '/users',          icon: Users,            label: 'Users',              badge: null },
  { to: '/verification',   icon: ShieldCheck,      label: 'Verification Queue', badge: 'pending' },
  { to: '/heatmap',        icon: Flame,            label: 'Heat Map',           badge: 'live' },
  { to: '/reports',        icon: Flag,             label: 'Reports',            badge: 'new' },
]

const BADGE_COLORS = {
  votes:   'bg-amber-500/20 text-amber-400',
  pending: 'bg-blue-500/20 text-blue-400',
  live:    'bg-red-500/20 text-red-400 animate-pulse-slow',
  new:     'bg-purple-500/20 text-purple-400',
}

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
          isActive
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
            : 'text-slate-400 hover:text-slate-200 hover:bg-base-700'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon size={16} className={clsx('flex-shrink-0', isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300')} />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className={clsx('badge text-[10px] px-1.5', BADGE_COLORS[item.badge])}>
              {item.badge}
            </span>
          )}
          {isActive && <ChevronRight size={12} className="text-amber-500/60" />}
        </>
      )}
    </NavLink>
  )
}

function Sidebar({ onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-base-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Activity size={16} className="text-base-900" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm font-display leading-none">NearMe</p>
            <p className="text-amber-500/70 text-[10px] font-mono uppercase tracking-widest mt-0.5">Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-base-600 text-slate-400 lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 px-3 mb-2">Main</p>
        {NAV.slice(0, 2).map(item => <NavItem key={item.to} item={item} onClick={onClose} />)}
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 px-3 mb-2 mt-4">Management</p>
        {NAV.slice(2, 5).map(item => <NavItem key={item.to} item={item} onClick={onClose} />)}
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 px-3 mb-2 mt-4">Analytics</p>
        {NAV.slice(5).map(item => <NavItem key={item.to} item={item} onClick={onClose} />)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-base-600 space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-base-700 transition-all">
          <Settings size={16} className="text-slate-500" />
          Settings
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut size={16} className="text-slate-500" />
          Sign out
        </button>
      </div>

      {/* Admin tag */}
      <div className="px-4 py-3 border-t border-base-600">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">A</div>
          <div>
            <p className="text-sm text-white font-medium">Super Admin</p>
            <p className="text-[11px] text-slate-500 font-mono">admin@nearme.app</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Layout({onLogout,user}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const currentPage = NAV.find(n => n.to === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-base-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-base-800 border-r border-base-600 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={clsx(
        'fixed top-0 left-0 z-50 h-full w-64 bg-base-800 border-r border-base-600 transition-transform duration-300 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-base-800 border-b border-base-600 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-base-700 text-slate-400 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-white font-semibold text-base font-display">{currentPage}</h1>
              <p className="text-slate-500 text-xs font-mono hidden sm:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-mono">Live</span>
            </div>

            <button className="relative p-2 rounded-lg hover:bg-base-700 text-slate-400 hover:text-white transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

         <button
    onClick={onLogout}
    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
  >
    <LogOut size={16} className="text-slate-500" />
    Sign out
  </button>

    <div className="px-4 py-3 border-t border-base-600">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
        {(user?.name || 'A').charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm text-white font-medium">{user?.name || 'Admin'}</p>
        <p className="text-[11px] text-slate-500 font-mono">{user?.phone}</p>
      </div>
    </div>
  </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}