// helpers.js — central barrel file for all utility exports

// export * from './cn.js';
// export * from './formatters.js';
// export * from './geoUtils.js';
// export * from './heatUtils.js';
// export * from './searchUtils.js';
// export * from './validators.js';


/**
 * helpers.js — barrel file.
 * Every screen imports { cn, formatRelativeTime, formatDistanceKm } from here.
 * Keeps imports short and consistent across the whole codebase.
 */

// ── className merger ─────────────────────────────────────────────────────────
export { cn } from './cn.js'

// ── Time & distance formatters ───────────────────────────────────────────────
export { formatRelativeTime, formatDistanceKm } from './formatters.js'

// ── Geo ──────────────────────────────────────────────────────────────────────
export { distanceKm, pointInPolygon } from './geoUtils.js'

// ── Heat ─────────────────────────────────────────────────────────────────────
export { heatPresentation, heatLevelFromScore, heatLabel } from './heatUtils.js'

// ── Search ───────────────────────────────────────────────────────────────────
export { normalizeSearchQuery, blockMatchesQuery } from './searchUtils.js'

// ── Validators ───────────────────────────────────────────────────────────────
export { isValidPhone, normalizePhone, isValidOtp } from './validators.js'