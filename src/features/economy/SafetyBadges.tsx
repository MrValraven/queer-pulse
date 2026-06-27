import { useId, useState, type ReactNode } from 'react'
import { FiInfo } from 'react-icons/fi'
import type { SafetySignals } from './employerSafety.data'
import {
  AFFILIATION_DEFS,
  SAFETY_BADGE_DEFS,
  type Affiliation,
} from './safetyBadges.data'
import styles from './SafetyBadges.module.css'

interface SafetyBadgesProps {
  signals?: SafetySignals
  /** Tighter chips for use inside cards. */
  compact?: boolean
  /** Optional affiliation chip — distinguishes queer-RUN from queer-FRIENDLY. */
  affiliation?: Affiliation
  /** Override the affiliation chip label (e.g. "Queer-led", "Community org"). */
  affiliationLabel?: string
}

/** A badge chip that reveals a criteria explainer on hover, focus, or click. */
function ExplainBadge({
  icon,
  label,
  blurb,
  tone = 'safe',
  compact,
}: {
  icon: ReactNode
  label: string
  blurb: string
  tone?: 'safe' | 'run' | 'friendly'
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span
      className={styles.badgeWrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={[styles.badge, styles[tone]].filter(Boolean).join(' ')}
        aria-describedby={id}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
        {label}
        <span className={styles.info} aria-hidden>
          <FiInfo size={compact ? 11 : 12} />
        </span>
      </button>
      <span role="tooltip" id={id} className={[styles.pop, open && styles.popOpen].filter(Boolean).join(' ')}>
        <strong className={styles.popTitle}>{label}</strong>
        {blurb}
      </span>
    </span>
  )
}

/** Shared employer safety signals — the common vocabulary across Jobs and Reviews. */
export function SafetyBadges({ signals, compact, affiliation, affiliationLabel }: SafetyBadgesProps) {
  const aff = affiliation ? AFFILIATION_DEFS[affiliation] : null

  const badges: { key: string; tone: 'safe' }[] = []
  if (signals?.verifiedSafe) badges.push({ key: 'verified', tone: 'safe' })
  if (signals?.transFriendly) badges.push({ key: 'trans', tone: 'safe' })
  if (signals && signals.safeToBeOut >= 8) badges.push({ key: 'out', tone: 'safe' })

  if (!aff && badges.length === 0) return null

  return (
    <div className={[styles.row, compact && styles.compact].filter(Boolean).join(' ')}>
      {aff && (
        <ExplainBadge
          icon={aff.icon}
          label={affiliationLabel ?? aff.label}
          blurb={aff.blurb}
          tone={affiliation as 'run' | 'friendly'}
          compact={compact}
        />
      )}
      {badges.map((b) => {
        const def = SAFETY_BADGE_DEFS[b.key]
        return (
          <ExplainBadge
            key={b.key}
            icon={def.icon}
            label={def.label}
            blurb={def.blurb}
            tone={b.tone}
            compact={compact}
          />
        )
      })}
    </div>
  )
}
