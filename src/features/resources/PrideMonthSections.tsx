import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  CHIPS, EVENTS, SAFETY_CARDS, READING, GATHERING,
} from './prideMonth.data'
import styles from './PrideMonthPage.module.css'

export function PrideMonthCalendar() {
  const { showToast } = useToast()
  const [activeChip, setActiveChip] = useState(0)

  return (
    <section className={styles.calSection} id="calendar">
      <div className={styles.calH}>
        <h2>
          Thirty days, <em>thirty-eight events.</em>
        </h2>
        <span className={styles.meta}>Hosted by 14 members and 6 partner spaces</span>
      </div>
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
        {EVENTS.map((e, i) => (
          <Link
            to={GATHERING}
            key={i}
            className={[styles.evRow, e.headline && styles.headline]
              .filter(Boolean)
              .join(' ')}
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
          </Link>
        ))}
        <div className={styles.calMore}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => showToast('Loading more events…', 'info')}
          >
            Show 29 more events
          </Button>
        </div>
      </div>
    </section>
  )
}

export function PrideMonthSafety() {
  return (
    <section className={styles.safetyRow}>
      <div className={styles.safetyInner}>
        <h2 className={styles.safetyH}>
          Pride is the <em>most-policed</em> month of the year. Know your tools.
        </h2>
        <p className={styles.safetySub}>
          In Portugal, the march is generally safe — but the days around it are
          when verbal and physical harassment incidents spike. We treat this month
          seriously.
        </p>
        <div className={styles.safetyGrid}>
          {SAFETY_CARDS.map((c, i) => (
            <Link to={c.href} className={styles.safetyCard} key={i}>
              <div className={styles.safetyIc}>{c.icon}</div>
              <h4>{c.h}</h4>
              <p>{c.p}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PrideMonthReading() {
  return (
    <section className={styles.readSection}>
      <div className={styles.calH}>
        <h2>
          Pride month <em>reading list.</em>
        </h2>
        <span className={styles.meta}>From Sara Pinheiro, magazine editor</span>
      </div>
      <div className={styles.readGrid}>
        {READING.map((r, i) => (
          <Link to={r.href} className={styles.readCard} key={i}>
            <div className={styles.readKicker}>{r.kicker}</div>
            <div className={styles.readTitle}>{r.title}</div>
            <div className={styles.readD}>{r.d}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
