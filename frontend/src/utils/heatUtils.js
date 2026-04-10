import { HEAT_LABELS, HEAT_EMOJI, HEAT_COLORS } from './constants.js'

export function heatLevelFromScore(score) {
  if (!score || score <= 5)  return 0
  if (score <= 20)           return 1
  if (score <= 50)           return 2
  if (score <= 100)          return 3
  return 4
}

export function heatLabel(score) { return HEAT_LABELS[heatLevelFromScore(score)] }

export function heatPresentation(score) {
  const level = heatLevelFromScore(score ?? 0)
  return { level, label: HEAT_LABELS[level], emoji: HEAT_EMOJI[level], className: HEAT_COLORS[level], score: score ?? 0 }
}