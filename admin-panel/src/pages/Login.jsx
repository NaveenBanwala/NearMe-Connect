import { useState } from 'react'
import { Activity, ArrowRight } from 'lucide-react'
import api from '../services/adminApi.js'

export default function Login({ onLogin }) {
  const [phone,   setPhone]   = useState('')
  const [code,    setCode]    = useState('')
  const [step,    setStep]    = useState('phone')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const sendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Enter a valid phone number'); return }
    setLoading(true); setError(null)
    try {
      const formatted = cleaned.startsWith('91') ? '+' + cleaned : '+91' + cleaned
      await api.post('/api/auth/send-otp', { phone: formatted })
      setStep('otp')
      setPhone(formatted)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const verify = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await api.post('/api/auth/verify-otp', { phone, code })
      const { token, user } = res.data
      if (!user.admin) {
        setError('Access denied. This number is not registered as an admin.')
        setLoading(false)
        return
      }
      localStorage.setItem('admin_token', token)
      api.defaults.headers.common.Authorization = 'Bearer ' + token
      onLogin(user)
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid OTP.')
      setCode('')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-base-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-base-900" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">NearMe</p>
            <p className="text-amber-500/70 text-xs font-mono uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <p className="text-white font-semibold text-lg mb-0.5">
              {step === 'phone' ? 'Admin Sign In' : 'Enter OTP'}
            </p>
            <p className="text-slate-500 text-sm">
              {step === 'phone' ? 'Only registered admin numbers can access this panel.' : 'Code sent to ' + phone}
            </p>
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <>
              <div>
                <label className="label">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl border border-base-500 bg-base-700 text-sm text-slate-400 whitespace-nowrap">
                    India +91
                  </span>
                  <input className="input flex-1" type="tel" inputMode="numeric"
                    placeholder="99999 99999" value={phone.replace('+91', '')} maxLength={10}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g,'')); setError(null) }}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()} />
                </div>
              </div>
              <button onClick={sendOtp} disabled={loading || phone.replace(/\D/g,'').length < 10}
                className="btn-primary w-full justify-center">
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="label">6-digit OTP</label>
                <input className="input tracking-[0.5em] text-center text-xl font-mono"
                  type="tel" inputMode="numeric" placeholder="      " maxLength={6}
                  value={code} autoFocus
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g,'')); setError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verify()} />
                <p className="text-slate-600 text-xs mt-1.5 font-mono">Dev: use 123456</p>
              </div>
              <button onClick={verify} disabled={loading || code.length < 6}
                className="btn-primary w-full justify-center">
                {loading ? 'Verifying…' : 'Sign In'}
              </button>
              <button onClick={() => { setStep('phone'); setCode(''); setError(null) }}
                className="btn-secondary w-full justify-center text-xs">
                Change number
              </button>
            </>
          )}
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">Admin access only.</p>
      </div>
    </div>
  )
}