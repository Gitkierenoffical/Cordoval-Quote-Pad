import { useEffect, useState } from 'react'
import { PERSIST_FLAG_KEY } from '../db/constants'

export type PersistState = 'checking' | 'granted' | 'denied' | 'unsupported'

export function useStoragePersist(): PersistState {
  const [state, setState] = useState<PersistState>('checking')

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!navigator.storage?.persist) {
        if (!cancelled) setState('unsupported')
        return
      }

      const already = localStorage.getItem(PERSIST_FLAG_KEY)
      if (!already) {
        localStorage.setItem(PERSIST_FLAG_KEY, '1')
        try {
          await navigator.storage.persist()
        } catch {
          /* persist request failed; still check status below */
        }
      }

      try {
        const granted = await navigator.storage.persisted()
        if (!cancelled) setState(granted ? 'granted' : 'denied')
      } catch {
        if (!cancelled) setState('denied')
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
