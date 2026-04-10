import { env } from './env.js'

export const GOOGLE_MAPS_API_KEY = env.googleMapsKey
export const DEFAULT_MAP_CENTER  = { lat: 20.3535, lng: 85.8164 }
export const DEFAULT_MAP_ZOOM    = 15

export const MAP_STYLE_LIGHT = [
  { featureType:'poi',           elementType:'labels',      stylers:[{visibility:'off'}] },
  { featureType:'transit',       elementType:'labels.icon', stylers:[{visibility:'off'}] },
  { featureType:'road',          elementType:'geometry',    stylers:[{color:'#f5f5f5'}]  },
  { featureType:'road.arterial', elementType:'geometry',    stylers:[{color:'#ffffff'}]  },
  { featureType:'road.highway',  elementType:'geometry',    stylers:[{color:'#dadada'}]  },
  { featureType:'water',         elementType:'geometry',    stylers:[{color:'#c9d9e8'}]  },
  { featureType:'landscape',     elementType:'geometry',    stylers:[{color:'#f5f5f5'}]  },
]

export const MAP_STYLE_DARK = [
  { elementType:'geometry',             stylers:[{color:'#1d2c4d'}] },
  { elementType:'labels.text.fill',     stylers:[{color:'#8ec3b9'}] },
  { elementType:'labels.text.stroke',   stylers:[{color:'#1a3646'}] },
  { featureType:'road',          elementType:'geometry',    stylers:[{color:'#304a7d'}] },
  { featureType:'road.highway',  elementType:'geometry',    stylers:[{color:'#2c6675'}] },
  { featureType:'water',         elementType:'geometry',    stylers:[{color:'#0e1626'}] },
  { featureType:'poi',           elementType:'labels',      stylers:[{visibility:'off'}] },
  { featureType:'transit',       elementType:'labels',      stylers:[{visibility:'off'}] },
]

// Heat colors per level (0–4)
export const HEAT_MARKER_COLORS = {
  0:'#38bdf8', 1:'#fbbf24', 2:'#f97316', 3:'#ef4444', 4:'#ec4899',
}

// Category border colors for block polygons
export const CATEGORY_COLORS = {
  campus:   { fill:'#f97316', stroke:'#ea580c' },
  locality: { fill:'#3b82f6', stroke:'#2563eb' },
  society:  { fill:'#22c55e', stroke:'#16a34a' },
  market:   { fill:'#a855f7', stroke:'#9333ea' },
}