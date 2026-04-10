import { Polygon } from '@react-google-maps/api'
import { CATEGORY_COLORS } from '../../config/maps.js'

export function BlockBoundary({ paths, category, onClick, selected }) {
  if (!paths?.length) return null

  const cat     = (category || 'locality').toLowerCase()
  const colors  = CATEGORY_COLORS[cat] || CATEGORY_COLORS.locality
  const coords  = paths.map((p) => ({ lat: p.lat, lng: p.lng }))

  return (
    <Polygon
      paths={coords}
      onClick={onClick}
      options={{
        fillColor:    colors.fill,
        fillOpacity:  selected ? 0.22 : 0.10,
        strokeColor:  colors.stroke,
        strokeOpacity:selected ? 1.0 : 0.80,
        strokeWeight: selected ? 3 : 2,
        clickable:    true,
        zIndex:       selected ? 2 : 1,
      }}
    />
  )
}