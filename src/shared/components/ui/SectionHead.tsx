import type { HTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './SectionHead.module.css'

interface SectionHeadProps extends HTMLAttributes<HTMLDivElement> {
  /** Title content — pass `<>…<em>accent</em></>` for the accent emphasis. */
  title: ReactNode
  subtitle?: ReactNode
  linkLabel?: string
  /** Internal route path. */
  linkTo?: string
  /** Right-aligned action (e.g. a ghost button). */
  action?: ReactNode
  /** Use on plum/dark sections. */
  dark?: boolean
}

export function SectionHead({
  title,
  subtitle,
  linkLabel,
  linkTo,
  action,
  dark = false,
  className,
  ...rest
}: SectionHeadProps) {
  const cls = [styles.head, dark && styles.dark, className].filter(Boolean).join(' ')
  const hasAside = subtitle || linkLabel || action
  return (
    <div className={cls} {...rest}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && action && <p className={styles.subtitleLeft}>{subtitle}</p>}
      </div>
      {hasAside && (
        <div className={styles.aside}>
          {subtitle && !action && <p className={styles.subtitle}>{subtitle}</p>}
          {linkLabel && (
            <Link to={linkTo ?? '#'} className={styles.link}>
              {linkLabel}
            </Link>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
