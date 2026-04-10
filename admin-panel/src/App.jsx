import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BlockRequests from './pages/BlockRequests.jsx'
import BlockEditor from './pages/BlockEditor.jsx'
import UserManagement from './pages/UserManagement.jsx'
import VerificationQueue from './pages/VerificationQueue.jsx'
import HeatMap from './pages/HeatMap.jsx'
import Reports from './pages/Reports.jsx'
import api from './services/adminApi.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  // On load — check if token already exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      api.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('admin_token')
          delete api.defaults.headers.common.Authorization
        })
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    delete api.defaults.headers.common.Authorization
    setUser(null)
  }

  if (checking) return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Login onLogin={setUser} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"        element={<Dashboard />} />
          <Route path="block-requests"   element={<BlockRequests />} />
          <Route path="block-editor"     element={<BlockEditor />} />
          <Route path="block-editor/:id" element={<BlockEditor />} />
          <Route path="users"            element={<UserManagement />} />
          <Route path="verification"     element={<VerificationQueue />} />
          <Route path="heatmap"          element={<HeatMap />} />
          <Route path="reports"          element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}