// ============================================================
// RequestPin.jsx — Leaflet + OpenStreetMap
// Drop-in replacement for Google Maps Marker + InfoWindow
// Same props interface — no logic changes needed
// ============================================================

import { Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'
import { REQUEST_TYPE_META } from '../../utils/constants.js'

// SVG pin colours per request type (unchanged)
const PIN_COLORS = {
  help:  '#3b82f6',
  talk:  '#a855f7',
  play:  '#22c55e',
  free:  '#f59e0b',
  study: '#0ea5e9',
  food:  '#f97316',
  ride:  '#f43f5e',
  lost:  '#64748b',
}

function pinSvg(color) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="40" rx="6" ry="3" fill="rgba(0,0,0,0.18)"/>
      <path d="M18 2 C9 2 2 9 2 18 C2 28 18 42 18 42 C18 42 34 28 34 18 C34 9 27 2 18 2Z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="18" r="8" fill="white" opacity="0.3"/>
    </svg>`)}`
}

function makeLeafletIcon(color) {
  return L.icon({
    iconUrl:     pinSvg(color),
    iconSize:    [36, 44],
    iconAnchor:  [18, 44],
    popupAnchor: [0, -44],
  })
}

export function RequestPin({ position, onClick, title, type = 'help' }) {
  const meta  = REQUEST_TYPE_META[type] || REQUEST_TYPE_META.help
  const color = PIN_COLORS[type] || PIN_COLORS.help
  const icon  = makeLeafletIcon(color)

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      title={title}
      eventHandlers={{ click: () => onClick?.() }}
    >
      <Popup>
        <div className="max-w-[160px]">
          <p className="text-xs font-bold text-slate-900">{meta.emoji} {title}</p>
          <p className="text-[10px] text-slate-500 capitalize mt-0.5">{meta.label}</p>
        </div>
      </Popup>
    </Marker>
  )
}

// import { Marker, InfoWindow } from '@react-google-maps/api'
// import { useState } from 'react'
// import { REQUEST_TYPE_META } from '../../utils/constants.js'

// // SVG pin colours per request type
// const PIN_COLORS = {
//   help:  '#3b82f6',
//   talk:  '#a855f7',
//   play:  '#22c55e',
//   free:  '#f59e0b',
//   study: '#0ea5e9',
//   food:  '#f97316',
//   ride:  '#f43f5e',
//   lost:  '#64748b',
// }

// function pinSvg(color) {
//   return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
//     <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
//       <ellipse cx="18" cy="40" rx="6" ry="3" fill="rgba(0,0,0,0.18)"/>
//       <path d="M18 2 C9 2 2 9 2 18 C2 28 18 42 18 42 C18 42 34 28 34 18 C34 9 27 2 18 2Z"
//             fill="${color}" stroke="white" stroke-width="2"/>
//       <circle cx="18" cy="18" r="8" fill="white" opacity="0.3"/>
//     </svg>`)}`
// }

// export function RequestPin({ position, onClick, title, type = 'help' }) {
//   const [infoOpen, setInfoOpen] = useState(false)
//   const meta  = REQUEST_TYPE_META[type] || REQUEST_TYPE_META.help
//   const color = PIN_COLORS[type] || PIN_COLORS.help

//   return (
//     <>
//       <Marker
//         position={position}
//         title={title}
//         onClick={() => { setInfoOpen(true); onClick?.() }}
//         icon={{
//           url:        pinSvg(color),
//           scaledSize: { width: 36, height: 44 },
//           anchor:     { x: 18, y: 44 },
//         }}
//         label={{
//           text:      meta.emoji,
//           fontSize:  '13px',
//           className: 'select-none',
//         }}
//       />
//       {infoOpen && (
//         <InfoWindow position={position} onCloseClick={() => setInfoOpen(false)}>
//           <div className="max-w-[160px]">
//             <p className="text-xs font-bold text-slate-900">{meta.emoji} {title}</p>
//             <p className="text-[10px] text-slate-500 capitalize mt-0.5">{meta.label}</p>
//           </div>
//         </InfoWindow>
//       )}
//     </>
//   )
// }