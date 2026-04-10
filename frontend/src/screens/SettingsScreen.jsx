import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Monitor, Bell, Lock, Trash2, ChevronRight } from 'lucide-react'
import { useThemeStore } from '../store/themeStore.js'
import { useAuthStore } from '../store/authStore.js'
import { requestNotificationPermission } from '../services/notificationService.js'
import { BackButton } from '../components/shared/BackButton.jsx'
import { cn } from '../utils/helpers.js'

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: Sun     },
  { value: 'dark',   label: 'Dark',   icon: Moon    },
  { value: 'system', label: 'System', icon: Monitor },
]

export function SettingsScreen() {
  const navigate   = useNavigate()
  const theme      = useThemeStore((s) => s.theme)
  const setTheme   = useThemeStore((s) => s.setTheme)
  const logout     = useAuthStore((s) => s.logout)
  const user       = useAuthStore((s) => s.user)

  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [notifLoading, setNotifLoading] = useState(false)

  const handleEnableNotifs = async () => {
    setNotifLoading(true)
    const result = await requestNotificationPermission()
    setNotifPerm(result)
    setNotifLoading(false)
  }

  const permLabel = {
    granted:  '✅ Enabled',
    denied:   '🚫 Blocked — change in browser settings',
    default:  '⏸ Not yet enabled',
  }[notifPerm] || '⏸ Unknown'

  return (
    <div className="min-h-dvh bg-app pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-display font-bold text-app">Settings</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* Appearance */}
        <Section title="Appearance">
          <label className="label">Theme</label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all text-xs font-semibold',
                  theme === value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'border-app bg-surface text-muted-app hover:border-brand-300'
                )}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div className="flex items-center justify-between py-1 mb-3">
            <div>
              <p className="text-sm font-semibold text-app">Push Notifications</p>
              <p className="text-xs text-muted-app mt-0.5">{permLabel}</p>
            </div>
            {notifPerm !== 'granted' && notifPerm !== 'denied' && (
              <button
                onClick={handleEnableNotifs}
                disabled={notifLoading}
                className="btn-primary py-2 px-4 text-sm"
              >
                {notifLoading ? '…' : 'Enable'}
              </button>
            )}
          </div>
          <InfoRow icon="🔔" title="New requests nearby" sub="When someone posts near you" toggled />
          <InfoRow icon="✅" title="Request accepted"     sub="When your request is accepted" toggled />
          <InfoRow icon="⏰" title="Expiry warning"       sub="10 min before your request expires" toggled />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <InfoRow icon={<Lock size={16} className="text-green-500" />}
            title="Location privacy" sub="Exact location hidden until request is accepted" />
          <InfoRow icon="👤" title="Anonymous posting" sub="Option available when creating a request" />
          <InfoRow icon="🚫" title="Blocked users" sub="Manage your blocked list" />
        </Section>

        {/* Account */}
        <Section title="Account">
          <div className="space-y-0.5 text-sm text-muted-app mb-4">
            <p><span className="text-faint-app text-xs uppercase font-semibold">Phone</span></p>
            <p className="font-mono text-app">{user?.phone || '—'}</p>
          </div>
          <button
            onClick={() => { if (confirm('Log out of NearMe?')) logout() }}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-red-200
                       dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Trash2 size={16} className="text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Log Out</p>
              <p className="text-xs text-muted-app">Sign out of this device</p>
            </div>
          </button>
        </Section>

        {/* About */}
        <Section title="About">
          <InfoRow icon="📍" title="NearMe Connect" sub={`v${import.meta.env.VITE_APP_VERSION || '1.0.0'}`} />
          <InfoRow icon="📖" title="Terms of Service" arrow />
          <InfoRow icon="🔒" title="Privacy Policy" arrow />
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-faint-app mb-4">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ icon, title, sub, toggled, arrow }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-app last:border-0">
      <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center text-sm flex-shrink-0">
        {typeof icon === 'string' ? icon : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-app">{title}</p>
        {sub && <p className="text-xs text-muted-app">{sub}</p>}
      </div>
      {toggled && (
        <div className="w-11 h-6 rounded-full bg-brand-500 flex items-center justify-end px-0.5 flex-shrink-0">
          <div className="w-5 h-5 rounded-full bg-white shadow" />
        </div>
      )}
      {arrow && <ChevronRight size={15} className="text-faint-app flex-shrink-0" />}
    </div>
  )
}