import { useState, type ReactNode } from 'react'
import { FiCheck } from 'react-icons/fi'
import { resolveAvatarSrc } from '../../../shared/lib/avatarUrl'
import styles from './adminUi.module.css'

export type AvatarTone = 'plum' | 'coral' | 'jade' | 'violet' | 'amber' | 'anon'

const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = { sm: 30, md: 40, lg: 56 }

/** Request a face-aware square crop from Unsplash so small avatars stay sharp;
 *  Google/OAuth avatars get their size directive bumped via resolveAvatarSrc. */
function faceCrop(src: string, px: number): string {
  if (!src.includes('unsplash.com')) return resolveAvatarSrc(src, px * 2) ?? src
  const url = new URL(src)
  const size = String(px * 2)
  url.searchParams.set('w', size)
  url.searchParams.set('h', size)
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('crop', 'faces')
  url.searchParams.set('auto', 'format')
  url.searchParams.set('q', '80')
  return url.toString()
}

export function AdminAvatar({
  initials,
  tone = 'plum',
  size = 'md',
  verified = false,
  src,
  alt,
  className,
}: {
  initials: ReactNode
  tone?: AvatarTone
  size?: 'sm' | 'md' | 'lg'
  verified?: boolean
  /** Optional photo; falls back to initials when absent or it fails to load. */
  src?: string
  alt?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const resolved = src ? faceCrop(src, SIZE_PX[size]) : undefined

  return (
    <span
      className={[styles.avatar, styles[`av_${tone}`], styles[`av_${size}`], className]
        .filter(Boolean)
        .join(' ')}
    >
      {resolved && !failed ? (
        <img
          className={styles.avatarImg}
          src={resolved}
          alt={alt ?? (typeof initials === 'string' ? initials : '')}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
      {verified && (
        <span className={styles.avVerified} aria-hidden>
          <FiCheck />
        </span>
      )}
    </span>
  )
}
