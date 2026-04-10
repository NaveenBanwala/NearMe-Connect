import { create } from 'zustand'
import { MAP_MODES } from '../utils/constants.js'
import { DEFAULT_MAP_CENTER } from '../config/maps.js'

export const useMapStore = create((set) => ({
  mode:         MAP_MODES.CAMPUS,
  center:       DEFAULT_MAP_CENTER,
  zoom:         15,
  radiusMeters: 800,
  userLatLng:   null,

  setMode:         (mode)         => set({ mode }),
  setCenter:       (center)       => set({ center }),
  setZoom:         (zoom)         => set({ zoom }),
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),
  setUserLatLng:   (userLatLng)   => set({ userLatLng }),
}))