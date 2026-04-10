import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, CheckCircle, Clock, Upload, ImageIcon } from 'lucide-react'
import { useAuthStore } from '../store/authStore.js'
import { uploadCollegeId } from '../services/authService.js'
import { ROUTES } from '../navigation/routes.js'
import { BackButton } from '../components/shared/BackButton.jsx'
import { cn } from '../utils/helpers.js'

export function VerificationScreen() {
  const user       = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const navigate   = useNavigate()

  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [college, setCollege] = useState(user?.college_name || '')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState(null)
  const fileRef               = useRef()

  const onFile = (f) => {
    if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f)); setError(null)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!file || !college.trim()) { setError('Please add college name and upload your ID.'); return }
    setLoading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('college_name', college.trim())
      const res = await uploadCollegeId(fd)
      updateUser(res.data || { verification_status: 'pending', college_name: college.trim() })
      setDone(true)
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload failed. Try again.')
    } finally { setLoading(false) }
  }

  // Show current verification status
  const statusContent = () => {
    if (user?.student_verified) {
      return (
        <div className="card p-6 text-center">
          <CheckCircle size={52} className="text-green-500 mx-auto mb-3" />
          <p className="text-lg font-bold text-app">Student Verified ✓</p>
          <p className="text-sm text-muted-app mt-1">{user.college_name}</p>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-700 dark:text-green-300">
            You have full access to campus feeds, student-only requests, and mode switching.
          </div>
        </div>
      )
    }
    if (user?.verification_status === 'pending') {
      return (
        <div className="card p-6 text-center">
          <Clock size={52} className="text-amber-500 mx-auto mb-3 animate-pulse-slow" />
          <p className="text-lg font-bold text-app">Under Review</p>
          <p className="text-sm text-muted-app mt-1">
            Your ID was submitted for <strong>{user.college_name || 'your college'}</strong>.
            Admin will verify within 24 hours.
          </p>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-700 dark:text-amber-300">
            You'll get a notification when it's approved.
          </div>
        </div>
      )
    }
    if (user?.verification_status === 'rejected') {
      return (
        <>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40
                          rounded-2xl mb-5 text-sm text-red-700 dark:text-red-300">
            ❌ Your previous ID was rejected. Please re-upload a clear photo of your college ID card.
          </div>
          <UploadForm
            college={college} setCollege={setCollege}
            preview={preview} fileRef={fileRef} onFile={onFile}
            error={error} loading={loading} done={done}
            onSubmit={handleSubmit}
          />
        </>
      )
    }
    // Not verified, no submission
    return (
      <UploadForm
        college={college} setCollege={setCollege}
        preview={preview} fileRef={fileRef} onFile={onFile}
        error={error} loading={loading} done={done}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-app pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-display font-bold text-app">Verification</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Phone status */}
        <div className={cn('card p-4 flex items-center gap-3',
          user?.phone_verified ? 'border-green-200 dark:border-green-900/40' : 'border-red-200 dark:border-red-900/40')}>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl',
            user?.phone_verified ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30')}>
            📱
          </div>
          <div>
            <p className="text-sm font-semibold text-app">Phone Verification</p>
            <p className={cn('text-xs', user?.phone_verified ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
              {user?.phone_verified ? `Verified: ${user.phone}` : 'Not verified'}
            </p>
          </div>
          {user?.phone_verified && <CheckCircle size={18} className="text-green-500 ml-auto" />}
        </div>

        {/* Student verification */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-brand-500" />
            <h2 className="text-base font-bold text-app">Student Verification</h2>
          </div>
          {statusContent()}
        </div>

        {!user?.phone_verified && (
          <button onClick={() => navigate(ROUTES.login)} className="btn-primary w-full">
            Verify Phone First
          </button>
        )}
      </div>
    </div>
  )
}

function UploadForm({ college, setCollege, preview, fileRef, onFile, error, loading, done, onSubmit }) {
  if (done) return (
    <div className="card p-8 text-center">
      <CheckCircle size={52} className="text-green-500 mx-auto mb-3" />
      <p className="font-bold text-app">Submitted for review!</p>
      <p className="text-sm text-muted-app mt-1">You'll be notified once verified.</p>
    </div>
  )

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <div>
        <label className="label">College / University</label>
        <input className="input" placeholder="e.g. KIIT University, IIT Bhubaneswar"
          value={college} onChange={(e) => setCollege(e.target.value)} required />
      </div>

      <div>
        <label className="label">ID Photo</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-app rounded-2xl p-5 text-center cursor-pointer
                     hover:border-brand-400 transition-colors bg-subtle"
        >
          {preview
            ? <img src={preview} alt="ID" className="max-h-36 mx-auto rounded-xl object-cover" />
            : <div className="space-y-2">
                <ImageIcon size={28} className="mx-auto text-faint-app" />
                <p className="text-sm text-muted-app">Tap or drop to upload</p>
                <p className="text-xs text-faint-app">JPG, PNG up to 10 MB</p>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => onFile(e.target.files[0])} />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading
          ? <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </span>
          : <><Upload size={15} /> Submit for Verification</>
        }
      </button>
    </form>
  )
}