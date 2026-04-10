import { useEffect } from 'react'
import { useRequestStore } from '../store/requestStore.js'

export function useRequests(blockId, params = {}) {
  const list       = useRequestStore((s) => s.requestsForBlock(blockId))
  const addRequest = useRequestStore((s) => s.addRequest)
  const loadReqs   = useRequestStore((s) => s.loadRequests)
  const loading    = useRequestStore((s) => s.loading)

  useEffect(() => {
    if (blockId) loadReqs(blockId, params)
  }, [blockId])

  return { list, addRequest, loading }
}