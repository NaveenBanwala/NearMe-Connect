import React from 'react'
import { Circle } from 'react-leaflet'
import { useClusterHeat } from '../../hooks/useClusterHeat.js'

const HEAT_VISUAL = {
  cold:    { fill: '#FFF176', stroke: '#FFF176' },
  mild:    { fill: '#FFD54F', stroke: '#FFD54F' },
  warm:    { fill: '#FFB300', stroke: '#FFB300' },
  hot:     { fill: '#FF6D00', stroke: '#FF6D00' },
  on_fire: { fill: '#DD2C00', stroke: '#DD2C00' },
}

export default function ClusterBlob({ cluster, onPress }) {
  const { clusterId, centerLat, centerLng, radiusMeters } = cluster
  const { heatLevel } = useClusterHeat(clusterId)
  const visual = HEAT_VISUAL[heatLevel] ?? HEAT_VISUAL.cold
  const center = [centerLat, centerLng]

  return (
    <React.Fragment>
      <Circle
        center={center}
        radius={radiusMeters * 1.3}
        pathOptions={{ color: 'transparent', fillColor: visual.fill, fillOpacity: 0.18, weight: 0 }}
      />
      <Circle
        center={center}
        radius={radiusMeters}
        pathOptions={{ color: visual.stroke, fillColor: visual.fill, fillOpacity: 0.35, weight: 1.5 }}
        eventHandlers={{ click: () => onPress?.(clusterId) }}
      />
    </React.Fragment>
  )
}