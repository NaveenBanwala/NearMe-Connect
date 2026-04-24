// ============================================================
// NameSuggestionSheet.jsx  —  Web React
// Modal bottom sheet for suggesting a cluster name
// Uses a fixed overlay + slide-up sheet, no React Native deps
// ============================================================

import { useState, useEffect, useRef } from 'react'

const MIN_LEN = 2
const MAX_LEN = 100

export default function NameSuggestionSheet({ visible, saving, error, onSubmit, onClose }) {
  const [name,       setName]       = useState('')
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  // Auto-focus and reset on open/close
  useEffect(() => {
    if (visible) {
      setName('')
      setLocalError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [visible])

  if (!visible) return null

  const validate = (v) => {
    const t = v.trim()
    if (t.length < MIN_LEN) return `Name must be at least ${MIN_LEN} characters`
    if (t.length > MAX_LEN) return `Name must be under ${MAX_LEN} characters`
    return ''
  }

  const handleChange = (e) => {
    setName(e.target.value)
    if (localError) setLocalError(validate(e.target.value))
  }

  const handleSubmit = () => {
    const err = validate(name)
    if (err) { setLocalError(err); return }
    onSubmit(name.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  const displayError = localError || error

  return (
    // Fixed full-screen overlay
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-md bg-white rounded-t-2xl px-5 pt-4 pb-8 flex flex-col gap-4"
        style={{ animation: 'slideUp 0.22s ease-out' }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-gray-900">Name this area</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            What do people nearby call this place? Your suggestion helps others find it.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LEN}
            disabled={saving}
            placeholder="e.g. KIIT Gate 4 Area, Saheed Nagar Lane…"
            className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder-gray-300
              ${displayError
                ? 'border-red-400 focus:border-red-500'
                : 'border-gray-200 focus:border-emerald-400'
              }
              ${saving ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            `}
          />
          <div className="flex items-center justify-between px-1">
            {displayError
              ? <span className="text-xs text-red-500">{displayError}</span>
              : <span />
            }
            <span className="text-xs text-gray-300 ml-auto">
              {name.trim().length} / {MAX_LEN}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="flex-[2] py-3 rounded-xl text-sm font-bold text-white transition-colors
              disabled:bg-emerald-200 disabled:cursor-not-allowed
              enabled:bg-emerald-500 enabled:hover:bg-emerald-600"
          >
            {saving
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              : 'Suggest'
            }
          </button>
        </div>
      </div>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}