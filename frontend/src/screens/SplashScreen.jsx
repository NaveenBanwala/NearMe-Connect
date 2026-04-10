import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { ROUTES } from '../navigation/routes.js'
import { LoadingSpinner } from '../components/shared/LoadingSpinner.jsx'

export function SplashScreen() {
  const navigate = useNavigate()
  const onboardingDone = useAuthStore((s) => s.onboardingDone)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!onboardingDone) navigate(ROUTES.onboarding, { replace: true })
      else if (!token) navigate(ROUTES.login, { replace: true })
      else navigate(ROUTES.home, { replace: true })
    }, 600)
    return () => window.clearTimeout(t)
  }, [navigate, onboardingDone, token])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-gradient-to-b from-teal-50 to-white px-6">
      <LoadingSpinner label="Starting NearMe" />
      <p className="text-center text-2xl font-extrabold tracking-tight text-slate-900">NearMe Connect</p>
    </div>
  )
}
