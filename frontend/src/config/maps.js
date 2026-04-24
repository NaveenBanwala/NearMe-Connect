// ============================================================
// maps.js — Leaflet + OpenStreetMap config
// Replaces Google Maps API config — no API key needed
// ============================================================

export const DEFAULT_MAP_CENTER = { lat: 29.7857, lng: 76.3885 }
export const DEFAULT_MAP_ZOOM   = 15

// OSM tile layer URLs — no API key required
export const TILE_LAYER_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_LAYER_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export const TILE_ATTRIBUTION_LIGHT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
export const TILE_ATTRIBUTION_DARK  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

// Heat colors per level (unchanged — backend compatible)
export const HEAT_MARKER_COLORS = {
  0: '#38bdf8', 1: '#fbbf24', 2: '#f97316', 3: '#ef4444', 4: '#ec4899',
}

// Category border colors for block polygons (unchanged — backend compatible)

 export const CATEGORY_COLORS = {
  campus:   { fill: '#6366f1', stroke: '#4f46e5' },  // indigo
  locality: { fill: '#0ea5e9', stroke: '#0284c7' },  // sky blue (was flat blue)
  society:  { fill: '#10b981', stroke: '#059669' },  // emerald
  market:   { fill: '#f59e0b', stroke: '#d97706' },  // amber (was purple)
  
  
village: { fill: '#10b981', stroke: '#059669' },  // emerald
}
