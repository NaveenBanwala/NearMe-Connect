import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import {
  DEFAULT_MAP_ZOOM,
  TILE_LAYER_LIGHT,
  TILE_LAYER_DARK,
  TILE_ATTRIBUTION_LIGHT,
  TILE_ATTRIBUTION_DARK,
} from '../../config/maps.js'
import { useThemeStore } from '../../store/themeStore.js'
import { cn } from '../../utils/cn.js'

const containerDefault = 'h-full w-full overflow-hidden rounded-2xl'

function MapClickHandler({ onMapClick, onMapMove }) {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
    moveend(e) {
      const c = e.target.getCenter()
      onMapMove?.({ lat: c.lat, lng: c.lng })
    },
  })
  return null
}

// Replaces RecenterMap — flies smoothly when GPS coords arrive
function MapCenterUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { animate: true, duration: 1 })
    }
  }, [center?.lat, center?.lng])
  return null
}

function MapInner({ center, zoom = DEFAULT_MAP_ZOOM, children, onMapClick, onMapMove, mapContainerClassName, onLoad }) {
  const isDark          = useThemeStore((s) => s.isDark)
  const tileUrl         = isDark ? TILE_LAYER_DARK       : TILE_LAYER_LIGHT
  const tileAttribution = isDark ? TILE_ATTRIBUTION_DARK : TILE_ATTRIBUTION_LIGHT

  return (
    <MapContainer
      key="main-map"
      center={[center.lat, center.lng]}
      zoom={zoom}
      className={cn(containerDefault, mapContainerClassName)}
      zoomControl={true}
      whenCreated={onLoad}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} />
      <MapCenterUpdater center={center} />
      {(onMapClick || onMapMove) && (
        <MapClickHandler onMapClick={onMapClick} onMapMove={onMapMove} />
      )}
      {children}
    </MapContainer>
  )
}

export function FitBounds({ blocks }) {
  const map = useMap()
  useEffect(() => {
    if (!blocks?.length) return
    const valid = blocks.filter(b => b.center_lat && b.center_lng)
    if (!valid.length) return
    map.fitBounds(
      valid.map(b => [b.center_lat, b.center_lng]),
      { padding: [50, 50], maxZoom: 14 }
    )
  }, [blocks?.length])
  return null
}

export function MapView({ center, zoom, children, onMapClick, onMapMove, mapContainerClassName, onLoad }) {
  if (!center) {
    return (
      <div className={cn(
        'flex min-h-[220px] flex-col items-center justify-center rounded-2xl',
        'border-2 border-dashed border-slate-300 dark:border-slate-600',
        'bg-slate-100 dark:bg-slate-800 px-6 py-8 text-center',
        mapContainerClassName
      )}>
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Map preview</p>
        <p className="mt-1.5 max-w-xs text-xs text-slate-500 dark:text-slate-400">
          Waiting for location…
        </p>
      </div>
    )
  }

  return (
    <MapInner
      center={center}
      zoom={zoom}
      onMapClick={onMapClick}
      onMapMove={onMapMove}
      mapContainerClassName={mapContainerClassName}
      onLoad={onLoad}
    >
      {children}
    </MapInner>
  )
}
// import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
// import { env } from '../../config/env.js'
// import { DEFAULT_MAP_ZOOM, MAP_STYLE_LIGHT, MAP_STYLE_DARK } from '../../config/maps.js'
// import { useThemeStore } from '../../store/themeStore.js'
// import { cn } from '../../utils/cn.js'

// const LIBRARIES = ['geometry', 'drawing']

// const containerDefault = 'h-full w-full overflow-hidden rounded-2xl'

// function MapInner({ center, zoom = DEFAULT_MAP_ZOOM, children, onMapClick, mapContainerClassName, onLoad }) {
//   const isDark = useThemeStore((s) => s.isDark)

//   const { isLoaded, loadError } = useJsApiLoader({
//     id: 'nearme-map',
//     googleMapsApiKey: env.googleMapsKey,
//     libraries: LIBRARIES,
//   })

//   if (loadError) return (
//     <div className={cn('flex min-h-[200px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 text-center text-sm text-red-700', mapContainerClassName)}>
//       Could not load Maps. Check your <code className="rounded bg-red-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code>.
//     </div>
//   )

//   if (!isLoaded) return (
//     <div className={cn('min-h-[200px] w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700', mapContainerClassName)} aria-busy="true" />
//   )

//   return (
//     <GoogleMap
//       mapContainerClassName={cn(containerDefault, mapContainerClassName)}
//       center={center}
//       zoom={zoom}
//       onClick={onMapClick}
//       onLoad={onLoad}
//       options={{
//   styles:              isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT,
//   streetViewControl:   false,
//   mapTypeControl:      false,
//   fullscreenControl:   false,
//   clickableIcons:      false,
//   zoomControlOptions:  { position: 7 },
//   gestureHandling:     'greedy',
// }}
//     >
//       {children}
//     </GoogleMap>
//   )
// }

// export function MapView({ center, zoom, children, onMapClick, mapContainerClassName, onLoad }) {
//   if (!env.googleMapsKey) {
//     return (
//       <div className={cn(
//         'flex min-h-[220px] flex-col items-center justify-center rounded-2xl',
//         'border-2 border-dashed border-slate-300 dark:border-slate-600',
//         'bg-slate-100 dark:bg-slate-800 px-6 py-8 text-center',
//         mapContainerClassName
//       )}>
//         <div className="text-4xl mb-3">🗺️</div>
//         <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Map preview</p>
//         <p className="mt-1.5 max-w-xs text-xs text-slate-500 dark:text-slate-400">
//           Set <code className="rounded bg-slate-200 dark:bg-slate-700 px-1">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="rounded bg-slate-200 dark:bg-slate-700 px-1">.env</code> to load Google Maps.
//         </p>
//         <p className="mt-3 font-mono text-xs text-slate-400">
//           {center?.lat?.toFixed(4)}, {center?.lng?.toFixed(4)}
//           {zoom != null ? ` · z${zoom}` : ''}
//         </p>
//       </div>
//     )
//   }

//   return (
//     <MapInner
//       center={center} zoom={zoom}
//       onMapClick={onMapClick} mapContainerClassName={mapContainerClassName} onLoad={onLoad}
//     >
//       {children}
//     </MapInner>
//   )
// }