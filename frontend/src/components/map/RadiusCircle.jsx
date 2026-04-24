// ============================================================
// RadiusCircle.jsx — Leaflet + OpenStreetMap
// Drop-in replacement for Google Maps Circle
// Same props interface — no logic changes needed
// ============================================================

import { Circle } from 'react-leaflet'

export function RadiusCircle({ center, radiusMeters = 800 }) {
  if (!center) return null

  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radiusMeters}
      pathOptions={{
        color:       '#f97316',
        opacity:     0.80,
        weight:      2,
        fillColor:   '#f97316',
        fillOpacity: 0.06,
        dashArray:   '6 3',
      }}
    />
  )
}

// import { Circle } from '@react-google-maps/api'

// export function RadiusCircle({ center, radiusMeters = 800 }) {
//   if (!center) return null
//   return (
//     <Circle
//       center={center}
//       radius={radiusMeters}
//       options={{
//         strokeColor:   '#f97316',
//         strokeOpacity: 0.80,
//         strokeWeight:  2,
//         fillColor:     '#f97316',
//         fillOpacity:   0.06,
//         strokeDasharray: '6 3',
//       }}
//     />
//   )
// }