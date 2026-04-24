import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore.js'
import { useThemeStore } from './store/themeStore.js'
import { ProtectedLayout } from './navigation/AuthGate.jsx'
import { MainLayout } from './navigation/MainLayout.jsx'
import { ROUTES } from './navigation/routes.js'
import 'leaflet/dist/leaflet.css'

// Screens
import { SplashScreen }         from './screens/SplashScreen.jsx'
import { OnboardingScreen }     from './screens/OnboardingScreen.jsx'
import { LoginScreen }          from './screens/LoginScreen.jsx'
import { PhoneOTPScreen }       from './screens/PhoneOTPScreen.jsx'
import { CollegeIDUploadScreen } from './screens/CollegeIDUploadScreen.jsx'
import { HomeMapScreen }        from './screens/HomeMapScreen.jsx'
import { BlockSearchScreen }    from './screens/BlockSearchScreen.jsx'
import { BlockDetailScreen }    from './screens/BlockDetailScreen.jsx'
import { CreateRequestScreen }  from './screens/CreateRequestScreen.jsx'
import { RequestDetailScreen }  from './screens/RequestDetailScreen.jsx'
import { ChatListScreen }       from './screens/ChatListScreen.jsx'
import { ChatThreadScreen }     from './screens/ChatThreadScreen.jsx'
import { ProfileScreen }        from './screens/ProfileScreen.jsx'
import { VerificationScreen }   from './screens/VerificationScreen.jsx'
import { NotificationsScreen }  from './screens/NotificationsScreen.jsx'
import { SettingsScreen }       from './screens/SettingsScreen.jsx'

/**
 * Logic for the Login Route:
 * 1. If onboarding isn't done, go to Splash/Onboarding.
 * 2. If already logged in (token exists), go Home.
 * 3. Otherwise, show Login.
 */
function LoginRoute() {
  const token = useAuthStore((s) => s.token)
  const onboardingDone = useAuthStore((s) => s.onboardingDone)
  
  if (!onboardingDone) return <Navigate to={ROUTES.splash} replace />
  if (token) return <Navigate to={ROUTES.home} replace />
  
  return <LoginScreen />
}

/**
 * AppContents houses the Routes and logic that require 'useNavigate'
 */
function AppContents() {
  const navigate = useNavigate()
  const setOnboardingDone = useAuthStore((s) => s.setOnboardingDone)

  // This is triggered when 'Get Started' is clicked in OnboardingScreen
  const handleOnboardingFinish = () => {
    setOnboardingDone(true)
    navigate(ROUTES.login)
  }

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path={ROUTES.splash} element={<SplashScreen />} />
      <Route 
        path={ROUTES.onboarding} 
        element={<OnboardingScreen onFinish={handleOnboardingFinish} />} 
      />
      <Route path={ROUTES.login} element={<LoginRoute />} />
      <Route path={ROUTES.otp} element={<PhoneOTPScreen />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedLayout />}>
        <Route path={ROUTES.collegeId} element={<CollegeIDUploadScreen />} />

        {/* Main Tab Navigation */}
        <Route element={<MainLayout />}>
          <Route index element={<HomeMapScreen />} />
          <Route path="search" element={<BlockSearchScreen />} />
          <Route path="chats" element={<ChatListScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
        </Route>

        {/* Full-Screen Modals / Detail Views */}
        <Route path="block/:id" element={<BlockDetailScreen />} />
        <Route path="block/:blockId/new" element={<CreateRequestScreen />} />
        <Route path="request/:id" element={<RequestDetailScreen />} />
        <Route path="chat/:requestId" element={<ChatThreadScreen />} />
        <Route path="request/new" element={<CreateRequestScreen />} />
        <Route path="notifications" element={<NotificationsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="verification" element={<VerificationScreen />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
    </Routes>
  )
}

export function App() {
  const initTheme = useThemeStore((s) => s.init)

  // Initialize theme (dark/light mode) on mount
  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <div className="flex min-h-dvh justify-center bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950">
      <div className="relative flex min-h-dvh w-full max-w-lg flex-col bg-app
                      sm:my-3 sm:min-h-[calc(100dvh-1.5rem)] sm:overflow-x-hidden
                      sm:rounded-[2rem] sm:shadow-2xl sm:ring-1 sm:ring-slate-200/80 dark:sm:ring-slate-700/40">
        
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContents />
        </BrowserRouter>
        
      </div>
    </div>
  )
}