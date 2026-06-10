import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Reveal-on-scroll: returns a ref to attach to an element and a boolean that
 * flips to true the first time the element enters the viewport. Under reduced
 * motion it is immediately visible.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [isVisible, setIsVisible] = useState(prefersReduced)

  useEffect(() => {
    if (prefersReduced) {
      setIsVisible(true)
      return
    }
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReduced])

  return { ref, isVisible }
}
