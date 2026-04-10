import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { ROUTES } from './routes.js'

export function ProtectedLayout() {
  const token          = useAuthStore((s) => s.token)
  const onboardingDone = useAuthStore((s) => s.onboardingDone)
  const location       = useLocation()

  if (!token) {
    if (!onboardingDone) return <Navigate to={ROUTES.splash} replace />
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}