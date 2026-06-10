import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift + shadow on hover. Defaults to true. */
  hover?: boolean
}

export function Card({ hover = true, className, children, ...rest }: CardProps) {
  const cls = [styles.card, hover && styles.hoverable, className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

export function CardDivider({
  className,
  ...rest
}: HTMLAttributes<HTMLHRElement>) {
  return <hr className={[styles.divider, className].filter(Boolean).join(' ')} {...rest} />
}
