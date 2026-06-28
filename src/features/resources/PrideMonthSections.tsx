import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Reveal } from '../../shared/components/ui'
import {
  CHIPS, EVENTS, MORE_EVENTS, SAFETY_CARDS, READING, GATHERING,
} from './prideMonth.data'
import styles from './PrideMonthPage.module.css'

export function PrideMonthCalendar() {
  const [activeChip, setActiveChip] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const events = expanded ? [...EVENTS, ...MORE_EVENTS] : EVENTS

  return (
    <section className={styles.calSection} id="calendar">
      <Reveal className={styles.calH}>
        <h2>
          Thirty days, <em>thirty-eight events.</em>
        </h2>
        <span className={styles.meta}>Hosted by 14 members and 6 partner spaces</span>
      </Reveal>
      <div className={styles.calChips}>
        {CHIPS.map((c, i) => (
          <button
            key={c}
            type="button"
            className={[styles.calChip, activeChip === i && styles.calChipActive]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveChip(i)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className={styles.calList}>
        {events.map((e, i) => (
          <Reveal
            as={Link}
            to={GATHERING}
            key={i}
            className={[styles.evRow, e.headline && styles.headline]
              .filter(Boolean)
              .join(' ')}
            delay={Math.min(i, 8) * 55}
          >
            <div className={styles.evDate}>
              <div className={styles.evDateD}>{e.d}</div>
              <div className={styles.evDateM}>{e.m}</div>
              <div className={styles.evDateDay}>{e.day}</div>
            </div>
            <div className={styles.evInfo}>
              <div className={styles.evKind}>{e.kind}</div>
              <div className={styles.evTitle}>{e.title}</div>
              <div className={styles.evHost}>{e.host}</div>
            </div>
            <div className={styles.evAction}>
              <span className={styles.free}>{e.free}</span>
              <b>{e.count}</b>
            </div>
          </Reveal>
        ))}
        {!expanded && (
          <div className={styles.calMore}>
            <Button type="button" variant="ghost" onClick={() => setExpanded(true)}>
              Show {MORE_EVENTS.length} more events
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export function PrideMonthSafety() {
  return (
    <section className={styles.safetyRow}>
      <div className={styles.safetyInner}>
        <Reveal as="h2" className={styles.safetyH}>
          Pride is the <em>most-policed</em> month of the year. Know your tools.
        </Reveal>
        <Reveal as="p" className={styles.safetySub} delay={60}>
          In Portugal, the march is generally safe — but the days around it are
          when verbal and physical harassment incidents spike. We treat this month
          seriously.
        </Reveal>
        <div className={styles.safetyGrid}>
          {SAFETY_CARDS.map((c, i) => (
            <Reveal as={Link} to={c.href} className={styles.safetyCard} key={i} delay={i * 60}>
              <div className={styles.safetyIc}><c.icon /></div>
              <h4>{c.h}</h4>
              <p>{c.p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PrideMonthReading() {
  return (
    <section className={styles.readSection}>
      <Reveal className={styles.calH}>
        <h2>
          Pride month <em>reading list.</em>
        </h2>
        <span className={styles.meta}>From Sara Pinheiro, magazine editor</span>
      </Reveal>
      <div className={styles.readGrid}>
        {READING.map((r, i) => (
          <Reveal as={Link} to={r.href} className={styles.readCard} key={i} delay={i * 60}>
            <div className={styles.readKicker}>{r.kicker}</div>
            <div className={styles.readTitle}>{r.title}</div>
            <div className={styles.readD}>{r.d}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
