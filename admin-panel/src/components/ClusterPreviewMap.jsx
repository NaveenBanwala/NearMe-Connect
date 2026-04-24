import { MapPin } from 'lucide-react'
import clsx from 'clsx'

// ============================================================
// ClusterPreviewMap.jsx
// Small inline map preview shown on each cluster card
// in the admin Cluster Review page.
//
// Shows:
//   - The cluster blob (soft glow circle) at center
//   - The system-suggested boundary polygon (octagon)
//   - Nearby official block outlines as context
//   - Cluster center coordinates label
//
// This is a self-contained SVG canvas — not a real map.
// In production replace with a small embedded Google Maps
// iframe or Maps Static API image centered on the cluster.
//
// Used by: ClusterReview.jsx
// ============================================================

// Heat level → glow color
const HEAT_GLOW = {
  cold:    '#FFF176',
  mild:    '#FFD54F',
  warm:    '#FFB300',
  hot:     '#FF6D00',
  on_fire: '#DD2C00',
}

// Mock nearby official block rectangles for context
// In production these come from the blocks API
const MOCK_NEARBY_BLOCKS = [
  { x: 10, y: 12, w: 28, h: 22, color: '#f59e0b', name: 'KIIT Campus'  },
  { x: 62, y: 55, w: 22, h: 18, color: '#3b82f6', name: 'Sec V'        },
]

// Canvas size (SVG viewBox units)
const W = 200
const H = 160

// Cluster always rendered at center of the preview
const CX = W / 2
const CY = H / 2

// Blob radius in SVG units
const BLOB_R = 28

// Build 8-point octagon for suggested boundary
const buildOctagon = (cx, cy, r) =>
  Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 2 * Math.PI
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')

export default function ClusterPreviewMap({ cluster, className }) {
  if (!cluster) return null

  const {
    displayName,
    centerLat,
    centerLng,
    heatLevel,
  } = cluster

  const glowColor  = HEAT_GLOW[heatLevel] ?? HEAT_GLOW.mild
  const octagonPts = buildOctagon(CX, CY, BLOB_R * 1.35)

  return (
    <div className={clsx('relative rounded-lg overflow-hidden border border-base-500 bg-base-800', className)}>

      {/* ── SVG canvas ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width={W} height={H} fill="#0f172a" />

        {/* Grid */}
        <defs>
          <pattern id="preview-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
          </pattern>
          {/* Glow filter */}
          <filter id="blob-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#preview-grid)" />

        {/* Mock roads */}
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#1e3a5f" strokeWidth="2" />
        <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#1e3a5f" strokeWidth="2" />
        <line x1="0" y1={H / 4} x2={W} y2={H / 4} stroke="#1e3a5f" strokeWidth="1" />
        <line x1="0" y1={H * 0.75} x2={W} y2={H * 0.75} stroke="#1e3a5f" strokeWidth="1" />

        {/* Nearby official blocks */}
        {MOCK_NEARBY_BLOCKS.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x} y={b.y}
              width={b.w} height={b.h}
              fill={b.color + '18'}
              stroke={b.color}
              strokeWidth="1"
              rx="2"
            />
            <text
              x={b.x + b.w / 2} y={b.y + b.h / 2 + 3}
              textAnchor="middle"
              fontSize="6"
              fill={b.color}
              fontFamily="monospace"
            >
              {b.name}
            </text>
          </g>
        ))}

        {/* Cluster outer glow */}
        <circle
          cx={CX} cy={CY}
          r={BLOB_R * 1.6}
          fill={glowColor + '18'}
          filter="url(#blob-glow)"
        />

        {/* Cluster blob */}
        <circle
          cx={CX} cy={CY}
          r={BLOB_R}
          fill={glowColor + '28'}
          stroke={glowColor + '66'}
          strokeWidth="1"
        />

        {/* Suggested boundary octagon */}
        <polygon
          points={octagonPts}
          fill={glowColor + '12'}
          stroke={glowColor}
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={3} fill={glowColor} />

        {/* Cluster name label */}
        <rect
          x={CX - 36} y={CY + BLOB_R * 1.5}
          width="72" height="12"
          fill="#0f172a"
          rx="3"
          opacity="0.85"
        />
        <text
          x={CX} y={CY + BLOB_R * 1.5 + 8.5}
          textAnchor="middle"
          fontSize="6.5"
          fill={glowColor}
          fontFamily="monospace"
        >
          {displayName?.length > 16
            ? displayName.slice(0, 14) + '…'
            : displayName
          }
        </text>

      </svg>

      {/* ── Coordinates badge (bottom left) ── */}
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-base-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
        <MapPin size={8} className="text-slate-500" />
        <span className="text-[9px] font-mono text-slate-500">
          {centerLat?.toFixed(3)}°N {centerLng?.toFixed(3)}°E
        </span>
      </div>

      {/* ── "Mock" label (top right) ── */}
     <div className="absolute top-1.5 right-1.5 bg-base-900/70 px-1.5 py-0.5 rounded">
  <span className="text-[9px] font-mono" style={{ color: glowColor }}>
    {cluster.heatLevel?.replace('_', ' ') ?? 'cold'}
  </span>
</div>

    </div>
  )
}