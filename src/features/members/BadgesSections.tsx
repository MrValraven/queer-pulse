import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import {
  type Badge,
  type PerkLadderRow,
  discoverCount,
  earnedBadges,
  levelInfo,
  levelLadder,
  lockedBadges,
  perksLadder,
} from './badges.data'
import styles from './BadgesPage.module.css'

const tintClass = {
  jade: styles.iconJade,
  accent: styles.iconAccent,
  plum: styles.iconPlum,
} as const

const rarityClass = {
  common: styles.rarityCommon,
  rare: styles.rarityRare,
  legendary: styles.rarityLegendary,
} as const

export function LevelCard() {
  return (
    <div className={styles.levelCard}>
      <div className={styles.lcLevel}>
        Level {levelInfo.level} · <em>{levelInfo.name}</em>
      </div>
      <div className={styles.xpBarWrap}>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${levelInfo.percent}%` }} />
        </div>
        <div className={styles.xpLabel}>
          {levelInfo.xp} / {levelInfo.xpMax} XP to Level {levelInfo.level + 1} ·{' '}
          {levelInfo.nextName}
        </div>
      </div>
      <div className={styles.levelLadder}>
        {levelLadder.map((pill) => (
          <div key={pill.num} className={`${styles.llPill} ${styles[pill.state]}`}>
            {pill.num} · {pill.name}
          </div>
        ))}
      </div>
      <a href="#how-xp" className={styles.howLink}>
        How to earn XP →
      </a>
    </div>
  )
}

function BadgeCard({ badge, locked }: { badge: Badge; locked?: boolean }) {
  return (
    <div className={`${styles.badgeCard} ${locked ? styles.lockedCard : ''}`}>
      <div className={`${styles.badgeIconWrap} ${tintClass[badge.tint]}`}>{badge.icon}</div>
      <div className={styles.badgeCat}>{badge.cat}</div>
      <div className={styles.badgeName}>{badge.name}</div>
      <div className={styles.badgeWhen}>{badge.when}</div>
      <div className={`${styles.rarityBar} ${rarityClass[badge.rarity]}`} />
    </div>
  )
}

export function EarnedBadges() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionRow}>
        <h2 className={styles.sectionHead}>
          Your <em>badges</em>
        </h2>
      </div>
      <div className={styles.sectionSub}>
        {earnedBadges.length} earned · {discoverCount} to discover
      </div>
      <div className={styles.badgeGrid}>
        {earnedBadges.map((badge) => (
          <BadgeCard key={badge.name} badge={badge} />
        ))}
      </div>
    </section>
  )
}

export function LockedBadges() {
  const [open, setOpen] = useState(false)
  return (
    <section className={styles.section}>
      <div className={styles.sectionRow}>
        <h2 className={styles.sectionHead}>
          <em>Locked</em> badges
        </h2>
        <button className={styles.expandLink} onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide ▴' : `Show ${discoverCount} more ▾`}
        </button>
      </div>
      <div className={styles.sectionSub}>
        Earn XP and attend gatherings to unlock these.
      </div>
      {open && (
        <div className={styles.badgeGrid}>
          {lockedBadges.map((badge) => (
            <BadgeCard key={badge.name} badge={badge} locked />
          ))}
        </div>
      )}
    </section>
  )
}

function PipIcon({ state }: { state: PerkLadderRow['state'] }) {
  if (state === 'locked') {
    return (
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
        <rect x="2" y="3.5" width="4" height="3" rx=".5" stroke="var(--ink-40)" strokeWidth="1.2" />
        <path d="M3 3.5V2.5a1 1 0 0 1 2 0v1" stroke="var(--ink-40)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  const color = state === 'current' ? 'var(--accent)' : 'var(--jade)'
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
      <path d="M1.5 4l2 2 3-3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PerkRow({ row }: { row: PerkLadderRow }) {
  const colClass =
    row.state === 'achieved'
      ? styles.colAchieved
      : row.state === 'current'
        ? styles.colCurrent
        : styles.colLocked
  const pipClass =
    row.state === 'achieved'
      ? styles.pipDone
      : row.state === 'current'
        ? styles.pipActive
        : styles.pipLocked
  const chipClass =
    row.state === 'achieved'
      ? styles.chipAchieved
      : row.state === 'current'
        ? styles.chipCurrent
        : styles.chipLocked
  return (
    <div className={`${styles.perkRow} ${row.state === 'current' ? styles.perkRowCurrent : ''}`}>
      <div className={`${styles.prLevelCol} ${colClass}`}>
        <div className={styles.prlNum}>{row.num}</div>
        <div className={styles.prlName}>{row.name}</div>
      </div>
      <div className={styles.prPerks}>
        {row.perks.map((perk) => (
          <div
            key={perk}
            className={`${styles.perkItem} ${row.state === 'locked' ? styles.perkItemLocked : ''}`}
          >
            <div className={`${styles.piCheck} ${pipClass}`}>
              <PipIcon state={row.state} />
            </div>
            {perk}
          </div>
        ))}
      </div>
      <div className={styles.prStatus}>
        <div className={`${styles.prChip} ${chipClass}`}>{row.status}</div>
      </div>
    </div>
  )
}

export function PerksLadder() {
  return (
    <section className={styles.section} id="how-xp">
      <h2 className={styles.sectionHead} style={{ marginBottom: 6 }}>
        What your level <em>unlocks</em>
      </h2>
      <div className={styles.sectionSub}>
        Each level grants new access and member benefits.
      </div>
      <div className={styles.perksLadder}>
        {perksLadder.map((row) => (
          <PerkRow key={row.num} row={row} />
        ))}
      </div>
      <div className={styles.redeemWrap}>
        <Button to={routes.perks}>Redeem your perks →</Button>
      </div>
    </section>
  )
}
