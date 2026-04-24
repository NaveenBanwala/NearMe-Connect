import { useEffect, useState } from 'react'
import { fetchAllBlocks } from '../services/blockService.js'

export function useAllBlocks() {
  const [blocks,  setBlocks]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchAllBlocks()
      .then(data => {
        console.log('[useAllBlocks] raw:', data)          // remove once confirmed
        const list = Array.isArray(data)   ? data
                   : Array.isArray(data?.content) ? data.content   // Spring Page<T>
                   : Array.isArray(data?.blocks)  ? data.blocks    // custom wrapper
                   : []
        setBlocks(list)
      })
      .catch(() => setError('Could not load blocks.'))
      .finally(() => setLoading(false))
  }, [])

  return { blocks, loading, error }
}