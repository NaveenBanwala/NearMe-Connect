import { Circle } from '@react-google-maps/api'

export function RadiusCircle({ center, radiusMeters = 800 }) {
  if (!center) return null
  return (
    <Circle
      center={center}
      radius={radiusMeters}
      options={{
        strokeColor:   '#f97316',
        strokeOpacity: 0.80,
        strokeWeight:  2,
        fillColor:     '#f97316',
        fillOpacity:   0.06,
        strokeDasharray: '6 3',
      }}
    />
  )
}