import type { ReactNode } from 'react'
import { FiCheck } from 'react-icons/fi'
import styles from './adminUi.module.css'

export type AvatarTone = 'plum' | 'coral' | 'jade' | 'violet' | 'amber' | 'anon'

export function AdminAvatar({
  initials,
  tone = 'plum',
  size = 'md',
  verified = false,
  className,
}: {
  initials: ReactNode
  tone?: AvatarTone
  size?: 'sm' | 'md' | 'lg'
  verified?: boolean
  className?: string
}) {
  return (
    <span
      className={[styles.avatar, styles[`av_${tone}`], styles[`av_${size}`], className]
        .filter(Boolean)
        .join(' ')}
    >
      {initials}
      {verified && (
        <span className={styles.avVerified} aria-hidden>
          <FiCheck />
        </span>
      )}
    </span>
  )
}
