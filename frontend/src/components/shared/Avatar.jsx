import { cn } from '../../utils/cn.js'

export function Avatar({ name = '?', initials: initialsProp, src, size = 40, emoji, className }) {
  const initial = initialsProp || (() => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0]?.charAt(0).toUpperCase() || '?'
  })()

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white select-none',
        className
      )}
      style={{ width: size, height: size, fontSize: emoji ? size * 0.5 : Math.round(size * 0.38) }}
      aria-hidden={src ? undefined : true}
    >
      {src     ? <img src={src} alt="" className="h-full w-full object-cover" /> :
       emoji   ? emoji :
                 initial}
    </div>
  )
}