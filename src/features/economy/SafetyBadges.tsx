import { FiShield, FiHeart, FiSmile } from 'react-icons/fi'
import type { SafetySignals } from './employerSafety.data'
import styles from './SafetyBadges.module.css'

interface SafetyBadgesProps {
  signals?: SafetySignals
  /** Tighter chips for use inside cards. */
  compact?: boolean
}

/** Shared employer safety signals — the common vocabulary across Jobs and Reviews. */
export function SafetyBadges({ signals, compact }: SafetyBadgesProps) {
  if (!signals) return null

  const badges: { key: string; icon: React.ReactNode; label: string }[] = []
  if (signals.verifiedSafe) badges.push({ key: 'verified', icon: <FiShield />, label: 'Verified safe' })
  if (signals.transFriendly) badges.push({ key: 'trans', icon: <FiHeart />, label: 'Trans-friendly' })
  if (signals.safeToBeOut >= 8) badges.push({ key: 'out', icon: <FiSmile />, label: 'Safe to be out' })

  if (badges.length === 0) return null

  return (
    <div className={[styles.row, compact && styles.compact].filter(Boolean).join(' ')}>
      {badges.map((b) => (
        <span key={b.key} className={styles.badge}>
          <span className={styles.icon} aria-hidden>
            {b.icon}
          </span>
          {b.label}
        </span>
      ))}
    </div>
  )
}
