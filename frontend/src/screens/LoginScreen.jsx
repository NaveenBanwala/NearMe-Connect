import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { sendOtp } from '../services/authService.js'
import { ROUTES } from '../navigation/routes.js'
import { isValidPhone, normalizePhone } from '../utils/validators.js'
import { cn } from '../utils/cn.js'

function MapPinMascot() {
  return (
    <svg viewBox="0 0 120 140" className="w-28 h-32 drop-shadow-lg" aria-hidden>
      <ellipse cx="60" cy="132" rx="20" ry="6" fill="rgba(0,0,0,0.12)" />
      <path d="M60 10 C35 10 16 29 16 54 C16 80 60 128 60 128 C60 128 104 80 104 54 C104 29 85 10 60 10Z" fill="#f97316" />
      <path d="M60 10 C35 10 16 29 16 54 C16 66 24 78 35 90 L60 128 C60 128 85 90 85 90 C72 78 80 66 80 54 C80 35 72 18 60 10Z" fill="#fb923c" opacity="0.5" />
      <circle cx="60" cy="52" r="28" fill="white" opacity="0.95" />
      <circle cx="51" cy="46" r="4.5" fill="#1e293b" />
      <circle cx="69" cy="46" r="4.5" fill="#1e293b" />
      <circle cx="52.5" cy="44.5" r="1.5" fill="white" />
      <circle cx="70.5" cy="44.5" r="1.5" fill="white" />
      <path d="M49 57 Q60 68 71 57" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="54" r="5" fill="#fca5a5" opacity="0.5" />
      <circle cx="76" cy="54" r="5" fill="#fca5a5" opacity="0.5" />
      <circle cx="86" cy="18" r="4" fill="#fbbf24" />
      <line x1="80" y1="22" x2="86" y2="18" stroke="#f97316" strokeWidth="2" />
    </svg>
  )
}

export function LoginScreen() {
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const navigate              = useNavigate()
  const setPhoneForOtp        = useAuthStore((s) => s.setPhoneForOtp)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const n = normalizePhone(phone)
    if (!isValidPhone(n)) { setError('Enter a valid 10-digit number'); return }
    setLoading(true); setError(null)
    try {
      const formatted = n.startsWith('91') ? `+${n}` : `+91${n}`
      await sendOtp(formatted)
      setPhoneForOtp(formatted)
      navigate(ROUTES.otp)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not send OTP. Try again.'
      console.error('OTP error:', err?.response?.status, err?.response?.data, msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <div className="bg-gradient-to-b from-brand-500 via-brand-500 to-brand-600
                      flex flex-col items-center justify-center px-6 pt-safe pt-12 pb-16 text-center">
        <MapPinMascot />
        <h1 className="mt-3 text-3xl font-display font-extrabold text-white tracking-tight">NearMe</h1>
        <p className="mt-1 text-brand-100 text-sm font-medium">Connect with people around you</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-brand-200">
          <span className="flex items-center gap-1">🏫 Campuses</span>
          <span>·</span>
          <span className="flex items-center gap-1">🏘️ Localities</span>
          <span>·</span>
          <span className="flex items-center gap-1">🛒 Markets</span>
        </div>
      </div>

      <div className="flex-1 px-5 -mt-6 pb-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl"
        >
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Sign in</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            We'll send a one-time code to your phone.
          </p>

          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
            Phone number
          </label>
          <div className="flex gap-2 mb-2">
            <div className="flex items-center px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
              🇮🇳 +91
            </div>
            <input
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              type="tel" inputMode="numeric" placeholder="99999 99999"
              value={phone} maxLength={10}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(null) }}
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading || !isValidPhone(normalizePhone(phone))}
            className="w-full rounded-full bg-brand-500 py-3.5 text-sm font-bold text-white
                       hover:bg-brand-600 disabled:opacity-50 active:scale-[0.98] transition-all mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending OTP…
              </span>
            ) : 'Get OTP →'}
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            By continuing you agree to our{' '}
            <span className="text-brand-500 cursor-pointer hover:underline">Terms</span>
          </p>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
          Dev mode: use OTP <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">123456</code>
        </p>
      </div>
    </div>
  )
}