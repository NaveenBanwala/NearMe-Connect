import { useNavigate } from 'react-router-dom'
import { CollegeIDUpload } from '../components/auth/CollegeIDUpload.jsx'
import { ROUTES } from '../navigation/routes.js'

export function CollegeIDUploadScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verify your ID</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload your college ID to unlock full access.
        </p>
      </div>
      <CollegeIDUpload onUploaded={() => navigate(ROUTES.home, { replace: true })} />
    </div>
  )
}