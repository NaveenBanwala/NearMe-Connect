import { useState } from 'react'

export function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  const submit = (e) => {
    e?.preventDefault()
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border-t border-slate-100 dark:border-slate-700/60
                 bg-white dark:bg-slate-900 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <textarea
        rows={1}
        className="min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-600
                   bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100
                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                   focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20
                   max-h-28 scrollbar-hide"
        placeholder="Message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        enterKeyHint="send"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-11 h-11 flex-shrink-0 rounded-xl bg-brand-500 text-white flex items-center justify-center
                   hover:bg-brand-600 disabled:opacity-40 active:scale-95 transition-all"
        aria-label="Send"
      >
        <svg className="h-5 w-5 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </form>
  )
}