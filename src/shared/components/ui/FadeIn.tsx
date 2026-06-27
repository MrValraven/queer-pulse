import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'
import styles from './FadeIn.module.css'

interface FadeInProps {
  as?: ElementType
  /** Stagger delay in ms — e.g. `delay={i * 60}` across a list. */
  delay?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
  /** Extra props are forwarded to the rendered element (e.g. `to` when `as={Link}`). */
  [key: string]: unknown
}

/**
 * Entrance-on-mount animation: fades + slides its children up the moment they
 * mount, which is exactly when real content replaces a loading skeleton. Use a
 * staggered `delay` across a list for a cascading reveal. The scroll-triggered
 * sibling is `Reveal`. Respects reduced motion (renders visible, no motion).
 */
export function FadeIn({
  as = 'div',
  delay = 0,
  className,
  style,
  children,
  ...rest
}: FadeInProps) {
  const cls = [styles.fadeIn, className].filter(Boolean).join(' ')

  return createElement(
    as,
    {
      className: cls,
      style: { '--fade-delay': `${delay}ms`, ...style } as CSSProperties,
      ...rest,
    },
    children,
  )
}
