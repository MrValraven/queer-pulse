import { FiStar, FiShield, FiHeart, FiAward, FiLifeBuoy, FiZap, FiGlobe, FiUserCheck, FiMail, FiLock } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import type { Reaction, ReactionKey } from './community.model'
import type { AccessTier, CommunityRole } from './membership.types'
import styles from './CommunityBadges.module.css'

/** Owner/mod role pill. Members render nothing (no badge clutter). */
export function RoleBadge({ role }: { role: CommunityRole | undefined }) {
  if (role === 'owner') {
    return (
      <span className={[styles.role, styles.owner].join(' ')}>
        <FiStar aria-hidden /> Owner
      </span>
    )
  }
  if (role === 'mod') {
    return (
      <span className={[styles.role, styles.mod].join(' ')}>
        <FiShield aria-hidden /> Mod
      </span>
    )
  }
  return null
}

const TIER_META: Record<AccessTier, { label: string; icon: IconType; cls: string }> = {
  public: { label: 'Open to all', icon: FiGlobe, cls: styles.tierOpen! },
  request: { label: 'Request to join', icon: FiUserCheck, cls: styles.tierRequest! },
  invite: { label: 'Invite-only', icon: FiMail, cls: styles.tierInvite! },
  private: { label: 'Private', icon: FiLock, cls: styles.tierPrivate! },
}

/** Access-tier pill for community cards/headers. */
export function AccessTierBadge({ tier }: { tier: AccessTier }) {
  const { label, icon: Icon, cls } = TIER_META[tier]
  return (
    <span className={[styles.tier, cls].join(' ')}>
      <Icon aria-hidden /> {label}
    </span>
  )
}

const REACTION_ICON: Record<ReactionKey, IconType> = {
  heart: FiHeart,
  celebrate: FiAward,
  support: FiLifeBuoy,
  fire: FiZap,
}
const REACTION_LABEL: Record<ReactionKey, string> = {
  heart: 'Love',
  celebrate: 'Celebrate',
  support: 'Support',
  fire: 'Fire',
}

export function ReactionBar({
  reactions,
  onReact,
}: {
  reactions: Reaction[]
  onReact?: (key: ReactionKey) => void
}) {
  return (
    <div className={styles.reactions}>
      {reactions.map((r) => {
        const Icon = REACTION_ICON[r.key]
        return (
          <span
            key={r.key}
            role="button"
            tabIndex={0}
            aria-pressed={r.reacted}
            aria-label={`${REACTION_LABEL[r.key]} — ${r.count}`}
            className={[styles.pill, r.reacted && styles.pillOn].filter(Boolean).join(' ')}
            onClick={() => onReact?.(r.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onReact?.(r.key)
              }
            }}
          >
            <Icon aria-hidden />
            {r.count}
          </span>
        )
      })}
    </div>
  )
}
