import { useState } from 'react'
import { MousePointer, RotateCcw, Check, Info } from 'lucide-react'
import clsx from 'clsx'

// This component renders a mock map boundary drawer.
// In production, replace the canvas mock with Google Maps JS API
// using DrawingManager and Polygon overlays.

const MOCK_BLOCKS = [
  { id: 1, name: 'KIIT Campus',    x: 42, y: 30, w: 22, h: 28, color: '#f59e0b' },
  { id: 2, name: 'Salt Lake Sec V', x: 68, y: 48, w: 18, h: 20, color: '#3b82f6' },
  { id: 3, name: 'New Town',        x: 20, y: 58, w: 15, h: 16, color: '#22c55e' },
]

export default function BoundaryDrawer({ clusterName, onSave, readOnly = false }) {
  const [drawing, setDrawing] = useState(false)
  const [points, setPoints]   = useState([])
  const [saved, setSaved]     = useState(false)

  const handleMapClick = (e) => {
    if (readOnly || !drawing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    setPoints(prev => [...prev, { x, y }])
  }

  const reset = () => { setPoints([]); setDrawing(false); setSaved(false) }

  const handleSave = () => {
    if (points.length < 3) return
    onSave?.(points)
    setSaved(true)
    setDrawing(false)
  }

  const polyPath = points.map(p => `${p.x}%,${p.y}%`).join(' ')

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setDrawing(d => !d)}
            className={clsx(drawing ? 'btn-primary' : 'btn-secondary')}
          >
            <MousePointer size={14} />
            {drawing ? 'Drawing… click map' : 'Draw Boundary'}
          </button>
          {points.length > 0 && (
            <>
              <button onClick={reset} className="btn-secondary">
                <RotateCcw size={14} />
                Reset
              </button>
              {points.length >= 3 && (
                <button onClick={handleSave} className={saved ? 'btn-success' : 'btn-primary'}>
                  <Check size={14} />
                  {saved ? 'Boundary Saved' : 'Save Boundary'}
                </button>
              )}
            </>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
            <Info size={11} />
            <span className="hidden sm:inline">Click on map to place boundary points (min 3)</span>
          </div>
        </div>
      )}

      {/* Map canvas */}
      <div
        className={clsx(
          'relative bg-base-700 rounded-xl overflow-hidden border border-base-500',
          drawing && 'cursor-crosshair border-amber-500/40',
          'select-none'
        )}
        style={{ height: 360 }}
        onClick={handleMapClick}
      >
        {/* Grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Mock map roads */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#64748b" strokeWidth="2"/>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#64748b" strokeWidth="2"/>
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#64748b" strokeWidth="1"/>
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#64748b" strokeWidth="1"/>
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#64748b" strokeWidth="1"/>
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#64748b" strokeWidth="1"/>
        </svg>

        {/* Existing blocks */}
        {MOCK_BLOCKS.map(block => (
          <div
            key={block.id}
            className="absolute rounded border-2 flex items-center justify-center"
            style={{
              left: `${block.x}%`, top: `${block.y}%`,
              width: `${block.w}%`, height: `${block.h}%`,
              borderColor: block.color,
              backgroundColor: block.color + '18',
            }}
          >
            <span className="text-[10px] font-mono text-center px-1" style={{ color: block.color }}>
              {block.name}
            </span>
          </div>
        ))}

        {/* Drawing polygon */}
        {points.length >= 3 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polygon
              points={polyPath}
              fill="rgba(245,158,11,0.15)"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray={saved ? '0' : '6,3'}
            />
          </svg>
        )}
        {points.length >= 2 && points.length < 3 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points={polyPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6,3"
            />
          </svg>
        )}

        {/* Points */}
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-amber-500 rounded-full border-2 border-base-900 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}

        {/* New cluster marker */}
        {clusterName && points.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1 animate-pulse" />
            <span className="text-amber-400 text-xs font-mono bg-base-800/80 px-2 py-0.5 rounded">
              {clusterName}
            </span>
          </div>
        )}

        {/* Corner label */}
        <div className="absolute top-2 left-2 bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-base-600">
          Mock Map · Bhubaneswar, Odisha
        </div>

        {points.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-base-800/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/20">
            {points.length} point{points.length !== 1 ? 's' : ''} placed
          </div>
        )}
      </div>

      {/* Instructions note */}
      <p className="text-[11px] text-slate-600 font-mono">
        Note: In production this uses Google Maps Drawing Manager API for precise polygon boundaries.
      </p>
    </div>
  )
}