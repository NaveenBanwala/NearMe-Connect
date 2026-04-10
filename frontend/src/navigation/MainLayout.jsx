import { Outlet } from 'react-router-dom'
import { MainTabBar } from './MainTabBar.jsx'

export function MainLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-app">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <MainTabBar />
    </div>
  )
}