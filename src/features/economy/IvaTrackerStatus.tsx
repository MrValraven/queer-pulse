import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { euro } from './economy.data'
import {
  IVA_EXEMPTION_OVERRUN,
  IVA_EXEMPTION_THRESHOLD,
  IVA_EXEMPT_NOTE,
  TAX_DISCLAIMER,
} from './tax.constants'
import type { IvaEntry } from './ivaTracker.data'
import styles from './IvaTrackerPage.module.css'

interface IvaTrackerStatusProps {
  entries: IvaEntry[]
}

/** How close to the limit before we flip from comfortable to warning. */
const NEAR_THRESHOLD_MARGIN = 2000

type Zone = 'safe' | 'near' | 'over' | 'overrun'

function zoneFor(total: number): Zone {
  if (total > IVA_EXEMPTION_OVERRUN) return 'overrun'
  if (total > IVA_EXEMPTION_THRESHOLD) return 'over'
  if (total >= IVA_EXEMPTION_THRESHOLD - NEAR_THRESHOLD_MARGIN) return 'near'
  return 'safe'
}

const ZONE_CLASS: Record<Zone, string> = {
  safe: styles.zoneSafe,
  near: styles.zoneNear,
  over: styles.zoneOver,
  overrun: styles.zoneOverrun,
}

/**
 * Live read-out of invoiced income against the art. 53.º exemption threshold:
 * a colour-coded progress bar, the headline numbers, and an escalating warning
 * once you cross €15,000 (and a hard one past €18,750).
 */
export function IvaTrackerStatus({ entries }: IvaTrackerStatusProps) {
  const total = entries.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0)
  const remaining = IVA_EXEMPTION_THRESHOLD - total
  const pct = (total / IVA_EXEMPTION_THRESHOLD) * 100
  const barPct = Math.min(100, Math.max(0, pct))
  const zone = zoneFor(total)

  return (
    <div className={`${styles.status} ${ZONE_CLASS[zone]}`}>
      <p className={styles.statusEyebrow}>Toward the €15,000 limit</p>
      <p className={styles.statusTotal}>{euro(total)}</p>

      <div
        className={styles.barTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={IVA_EXEMPTION_THRESHOLD}
        aria-valuenow={Math.round(total)}
        aria-label="Invoiced income toward the IVA exemption threshold"
      >
        <div className={styles.barFill} style={{ width: `${barPct}%` }} />
        <span className={styles.barCap}>{euro(IVA_EXEMPTION_THRESHOLD)}</span>
      </div>

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt>Invoiced</dt>
          <dd>{euro(total)}</dd>
        </div>
        <div className={styles.metric}>
          <dt>{remaining >= 0 ? 'Headroom left' : 'Over by'}</dt>
          <dd>{euro(Math.abs(remaining))}</dd>
        </div>
        <div className={styles.metric}>
          <dt>Threshold used</dt>
          <dd>{Math.round(pct)}%</dd>
        </div>
      </dl>

      {zone === 'safe' && (
        <p className={styles.note}>
          <FiCheckCircle aria-hidden className={styles.noteIconOk} />
          <span>
            Comfortably under the limit. Keep logging invoices and you&apos;ll see your headroom
            shrink in real time.
          </span>
        </p>
      )}

      {zone === 'near' && (
        <p className={styles.note}>
          <FiAlertTriangle aria-hidden className={styles.noteIconWarn} />
          <span>
            Getting close — only {euro(Math.max(0, remaining))} of headroom left. Plan the rest of
            your year carefully before you cross {euro(IVA_EXEMPTION_THRESHOLD)}.
          </span>
        </p>
      )}

      {zone === 'over' && (
        <p className={styles.note}>
          <FiAlertTriangle aria-hidden className={styles.noteIconDanger} />
          <span>
            You&apos;ve passed the {euro(IVA_EXEMPTION_THRESHOLD)} exemption limit. You can finish
            the year exempt, but next year you&apos;ll charge IVA — and crossing{' '}
            {euro(IVA_EXEMPTION_OVERRUN)} (25% over) forces you out immediately.
          </span>
        </p>
      )}

      {zone === 'overrun' && (
        <div className={styles.hardWarn}>
          <p className={styles.hardWarnTitle}>
            <FiAlertTriangle aria-hidden /> You must leave the <em>exemption.</em>
          </p>
          <p className={styles.hardWarnBody}>
            You&apos;re past {euro(IVA_EXEMPTION_OVERRUN)} — more than 25% over the threshold — so the
            art. 53.º exemption ends in-year. You&apos;ll need to start charging IVA and drop the
            exemption note from your invoices.
          </p>
          <p className={styles.hardWarnNote}>
            Until now your faturas carried: <em>{IVA_EXEMPT_NOTE}</em>
          </p>
        </div>
      )}

      <p className={styles.disclaimer}>{TAX_DISCLAIMER}</p>
    </div>
  )
}
