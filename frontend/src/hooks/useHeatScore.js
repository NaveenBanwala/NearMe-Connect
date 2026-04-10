import { useMemo } from 'react'
import { heatPresentation, heatLevelFromScore } from '../utils/heatUtils.js'

export function useHeatScore(score) {
  return useMemo(() => heatPresentation(score), [score])
}