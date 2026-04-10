import { useState, useRef } from 'react'
import { cn } from '../../utils/cn.js'

export function OTPInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(() => Array.from({ length }, () => ''))
  const refs = useRef([])

  const updateAt = (i, char) => {
    const next = [...values]
    next[i] = char.replace(/\D/g, '').slice(-1)
    setValues(next)
    const code = next.join('')
    if (code.length === length && !next.includes('')) onComplete?.(code)
    if (char && i < length - 1) refs.current[i + 1]?.focus()
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const onPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted.length < 2) return
    e.preventDefault()
    const next = Array(length).fill('')
    pasted.split('').forEach((c, j) => { if (j < length) next[j] = c })
    setValues(next)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
    if (pasted.length === length) onComplete?.(pasted)
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="One time code" onPaste={onPaste}>
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={cn(
            'h-14 w-11 rounded-xl border-2 bg-white dark:bg-slate-800 text-center',
            'text-xl font-bold text-slate-900 dark:text-slate-100',
            'border-slate-200 dark:border-slate-600',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            'transition-all duration-150'
          )}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={v}
          onChange={(e) => updateAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}