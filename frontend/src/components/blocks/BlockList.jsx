import { BlockCard } from './BlockCard.jsx'
import { EmptyState } from '../shared/EmptyState.jsx'
import { Button } from '../shared/Button.jsx'

export function BlockList({ blocks, getLink, emptyTitle = 'No blocks found', emptyDescription, showClearSearch, onClearSearch }) {
  if (!blocks.length) return (
    <EmptyState
      emoji="🏜️"
      title={emptyTitle}
      description={emptyDescription ?? 'Try another search or browse the map for nearby areas.'}
      action={showClearSearch
        ? <Button type="button" variant="secondary" className="rounded-full" onClick={onClearSearch}>
            Clear search
          </Button>
        : null
      }
    />
  )

  return (
    <ul className="flex flex-col gap-3">
      {blocks.map((b) => (
        <li key={b.block_id}>
          <BlockCard block={b} to={getLink(b)} distanceKm={b.distanceKm} />
        </li>
      ))}
    </ul>
  )
}