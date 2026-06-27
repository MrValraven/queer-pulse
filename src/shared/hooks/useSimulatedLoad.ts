import { useEffect, useState } from 'react'

/**
 * Simulates a short data fetch for the mock prototype: returns `loading` as
 * `true`, then flips it to `false` after `delay` ms so a page can show a
 * skeleton placeholder and then animate the real content in.
 *
 * This is the one place the prototype's fake "fetch" delay is defined — page
 * components should use it instead of hand-rolling a `useState` + `setTimeout`.
 *
 * @param delay milliseconds before content is "loaded" (default 600)
 */
export function useSimulatedLoad(delay = 600) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(t)
  }, [delay])

  return loading
}
