export function normalizeSearchQuery(raw) {
  return String(raw ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function blockMatchesQuery(block, normalizedQuery) {
  if (!normalizedQuery) return true
  const name     = String(block.name     ?? '').toLowerCase()
  const category = String(block.category ?? '').toLowerCase()
  const id       = String(block.block_id ?? '').toLowerCase()
  return normalizedQuery.split(' ').filter(Boolean).every(
    (w) => name.includes(w) || category.includes(w) || id.includes(w)
  )
}