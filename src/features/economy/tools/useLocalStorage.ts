import { useCallback, useEffect, useState } from 'react'

/**
 * State persisted to localStorage under `key`, degrading silently to in-memory
 * when storage is unavailable (private mode). `initial` seeds first use.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw) as T
    } catch {
      // ignore — fall back to initial
    }
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore — keep working in-memory
    }
  }, [key, value])

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next))
  }, [])

  return [value, update]
}
