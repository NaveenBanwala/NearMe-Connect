import { useState, useRef } from 'react'
import { uploadCollegeId } from '../../services/authService.js'
import { cn } from '../../utils/cn.js'

export function CollegeIDUpload({ onUploaded }) {
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [college, setCollege] = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState(null)
  const fileRef = useRef()

  const onFile = (f) => {
    if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f)); setError(null)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!file || !college.trim()) { setError('Add college name and an ID photo.'); return }
    setLoading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('college_name', college.trim())
      await uploadCollegeId(fd)
      setDone(true)
      onUploaded?.()
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload failed. Try again.')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div className="text-center py-6">
      <div className="text-4xl mb-2">✅</div>
      <p className="font-semibold text-slate-900 dark:text-slate-100">Submitted! Admin reviews within 24 hrs.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          College / University Name
        </label>
        <input
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="e.g. KIIT University"
          value={college} onChange={(e) => setCollege(e.target.value)} required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          College ID Photo
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors',
            'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50',
            'hover:border-brand-400 dark:hover:border-brand-500'
          )}
        >
          {preview
            ? <img src={preview} alt="ID preview" className="max-h-36 mx-auto rounded-xl object-cover" />
            : <div className="space-y-1.5">
                <div className="text-3xl">📷</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tap or drop your ID card photo</p>
                <p className="text-xs text-slate-400">JPG, PNG up to 10 MB</p>
              </div>
          }
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => onFile(e.target.files[0])} />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full rounded-full bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50 transition-all">
        {loading
          ? <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </span>
          : 'Upload for Review'
        }
      </button>
    </form>
  )
}