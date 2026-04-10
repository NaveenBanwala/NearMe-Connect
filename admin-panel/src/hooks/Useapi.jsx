import { useState, useEffect, useCallback } from 'react'

export function useApi(apiFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await apiFn()
      setData(res.data)
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Something went wrong')
    } finally { setLoading(false) }
  }, deps)

  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load }
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )
}

export function ApiError({ message, onRetry }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-red-400 font-medium mb-1">Failed to load</p>
      <p className="text-slate-500 text-sm mb-4">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary mx-auto">Retry</button>}
    </div>
  )
}