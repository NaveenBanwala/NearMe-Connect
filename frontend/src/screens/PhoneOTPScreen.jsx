import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { verifyOtp } from '../services/authService.js'
import { setAuthToken } from '../services/api.js'
import { OTPInput } from '../components/auth/OTPInput.jsx'
import { ROUTES } from '../navigation/routes.js'

// ── Envelope mascot (inline SVG — no image file needed) ───────────────────────
function EnvelopeMascot() {
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-lg" aria-hidden>
      <ellipse cx="60" cy="114" rx="22" ry="6" fill="rgba(0,0,0,0.1)" />
      <rect x="8" y="28" width="104" height="70" rx="12" fill="#f97316" />
      <rect x="8" y="28" width="104" height="70" rx="12" fill="white" opacity="0.12" />
      {/* Envelope flap lines */}
      <path d="M8 42 L60 74 L112 42" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkles */}
      <circle cx="96" cy="16" r="5" fill="#fbbf24" />
      <circle cx="108" cy="28" r="3" fill="#fbbf24" opacity="0.7" />
      <circle cx="100" cy="8"  r="2.5" fill="#fbbf24" opacity="0.5" />
      <text x="32" y="100" fontSize="24" fill="white" opacity="0.85">✨</text>
    </svg>
  )
}

export function PhoneOTPScreen() {
  const navigate   = useNavigate()
  const phone      = useAuthStore((s) => s.phoneForOtp)
  const setSession = useAuthStore((s) => s.setSession)

  const handleComplete = async (code) => {
    if (!phone) { navigate(ROUTES.login, { replace: true }); return }
    try {
      // verifyOtp registers user if new, returns token + user object
      const res  = await verifyOtp(phone, code)
      const { token, user } = res.data
      setAuthToken(token)
      setSession({ token, user })

      // If student already verified → go home
      // If not → offer college ID upload (skippable)
      // Always replace so back button can't return to OTP screen
      if (user.student_verified || user.verification_status === 'approved') {
        navigate(ROUTES.home, { replace: true })
      } else {
        navigate(ROUTES.collegeId, { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid OTP'
      // OTPInput resets itself via key; show alert for simplicity
      // In production swap for inline error state
      alert(msg)
    }
  }

  // Guard: if no phone in store, send back to login
  if (!phone) return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 bg-app">
      <p className="text-slate-500 dark:text-slate-400">No phone number found.</p>
      <Link className="text-brand-500 font-semibold text-sm hover:underline" to={ROUTES.login}>
        ← Back to login
      </Link>
    </div>
  )

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 flex flex-col items-center
                      justify-center px-6 pt-safe pt-12 pb-16 text-center">
        <EnvelopeMascot />
        <h1 className="mt-4 text-2xl font-display font-extrabold text-white">Check your SMS</h1>
        <p className="mt-1.5 text-brand-100 text-sm leading-relaxed">
          We sent a 6-digit code to<br />
          <strong className="text-white font-semibold">{phone}</strong>
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 -mt-6 pb-10">
        <div className="rounded-3xl border border-slate-100 dark:border-slate-700
                        bg-white dark:bg-slate-800 p-6 shadow-xl">
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 text-center mb-6">
            Enter 6-digit code
          </p>

          {/* OTPInput auto-submits when all 6 digits are filled */}
          <OTPInput length={6} onComplete={handleComplete} />

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
            Didn't receive it?{' '}
            <button
              type="button"
              onClick={() => navigate(ROUTES.login, { replace: true })}
              className="text-brand-500 font-semibold hover:underline"
            >
              Resend OTP
            </button>
          </p>

          <button
            type="button"
            onClick={() => navigate(ROUTES.login, { replace: true })}
            className="mt-3 w-full rounded-full border border-slate-200 dark:border-slate-600
                       py-2.5 text-sm text-slate-500 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            ← Change number
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
          Dev mode: type{' '}
          <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
            123456
          </code>
        </p>
      </div>
    </div>
  )
}