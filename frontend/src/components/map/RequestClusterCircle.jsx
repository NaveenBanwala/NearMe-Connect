import React from 'react'
import { Circle } from 'react-leaflet'

const HEAT_VISUAL = {
  cold:    { fill: '#FFF176', stroke: '#FFF176' },
  mild:    { fill: '#FFD54F', stroke: '#FFD54F' },
  warm:    { fill: '#FFB300', stroke: '#FFB300' },
  hot:     { fill: '#FF6D00', stroke: '#FF6D00' },
  on_fire: { fill: '#DD2C00', stroke: '#DD2C00' },
}

export function RequestClusterCircle({ group }) {
  const { center, radiusMeters, heatLevel } = group
  const visual = HEAT_VISUAL[heatLevel] ?? HEAT_VISUAL.cold
  const pos = [center.lat, center.lng]

  return (
    <React.Fragment>
      {/* Outer glow */}
      <Circle
        center={pos}
        radius={radiusMeters * 1.4}
        pathOptions={{
          color: 'transparent',
          fillColor: visual.fill,
          fillOpacity: 0.12,
          weight: 0,
        }}
      />
      {/* Main circle */}
      <Circle
        center={pos}
        radius={radiusMeters}
        pathOptions={{
          color: visual.stroke,
          fillColor: visual.fill,
          fillOpacity: 0.30,
          weight: 1.5,
        }}
      />
    </React.Fragment>
  )
}