import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { useToast } from '../../shared/components/feedback/useToast'
import { AGENDA, RESOLUTIONS, MORE_RESOLUTIONS, HISTORY, type AssemblyVote, type Resolution } from './annualAssembly.data'
import { LiveStreamModal } from './LiveStreamModal'
import styles from './AnnualAssemblyPage.module.css'

function ResolutionCard({ res }: { res: Resolution }) {
  const { showToast } = useToast()
  const [vote, setVote] = useState<AssemblyVote>(res.defaultVote ?? null)
  const cast = (v: AssemblyVote) => {
    setVote(v)
    showToast('Vote recorded · you can change it any time', 'success')
  }
  const cls = (v: AssemblyVote) =>
    [styles.voteBtn, vote === v && styles[v === 'yes' ? 'votedYes' : v === 'no' ? 'votedNo' : 'votedAbstain']]
      .filter(Boolean)
      .join(' ')
  return (
    <div className={styles.resCard}>
      <div className={styles.resH}>
        <h3>{res.num}</h3>
        <span className={styles.resNum}>{res.threshold}</span>
      </div>
      <p className={styles.resDesc}>{res.desc}</p>
      <div className={styles.resVoteRow}>
        <button type="button" className={cls('yes')} onClick={() => cast('yes')}>{res.yesLabel}</button>
        <button type="button" className={cls('no')} onClick={() => cast('no')}>No · reject</button>
        <button type="button" className={cls('abstain')} onClick={() => cast('abstain')}>Abstain</button>
      </div>
      <div className={styles.resBar}>
        <span className={styles.y} style={{ width: `${res.bar.y}%` }} />
        <span className={styles.n} style={{ width: `${res.bar.n}%` }} />
        <span className={styles.a} style={{ width: `${res.bar.a}%` }} />
      </div>
      <div className={styles.resTally}>
        <span className={styles.jade}>Yes <b>{res.tally.yes.split(' · ')[0]}</b> · {res.tally.yes.split(' · ')[1]}</span>
        <span className={styles.accent}>No <b>{res.tally.no.split(' · ')[0]}</b> · {res.tally.no.split(' · ')[1]}</span>
        <span>Abstain <b>{res.tally.abstain.split(' · ')[0]}</b> · {res.tally.abstain.split(' · ')[1]}</span>
        {res.tally.extra}
      </div>
    </div>
  )
}

export function AgendaSection() {
  return (
    <section className={styles.sec}>
      <h2>The <em>agenda</em></h2>
      <p className={styles.subText}>Roughly the order. Times are guidelines. We've never finished on time and we don't expect to.</p>
      <div className={styles.agenda}>
        {AGENDA.map((a, i) => (
          <div className={styles.agRow} key={i}>
            <div className={styles.agTime}>{a.h}<em>{a.m}</em></div>
            <div className={styles.agInfo}><b>{a.title}</b><span>{a.sub}</span></div>
            <span className={`${styles.agTag} ${styles[a.tagClass]}`}>{a.tag}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function VoteSection() {
  const [showAll, setShowAll] = useState(false)
  return (
    <section className={styles.sec} id="vote">
      <h2>Vote · <em>open until 14 Nov · 14:00</em></h2>
      <p className={styles.subText}>
        Everyone votes — whether you're attending or not. Cast your vote any time; you can change it until the close. <em>One vote per member, per resolution.</em>
      </p>
      <div className={styles.quorumStrip}>
        <b>Quorum:</b> 184 votes required to validate a resolution.{' '}
        <em>Currently at 312 votes cast</em> — quorum met. <b>Yes/no thresholds:</b>{' '}
        simple majority for budget items; 60% supermajority for Code of Conduct &amp; manifesto changes.
      </div>
      {RESOLUTIONS.map((r, i) => <ResolutionCard res={r} key={i} />)}
      {showAll && MORE_RESOLUTIONS.map((r, i) => <ResolutionCard res={r} key={`more-${i}`} />)}
      {!showAll && (
        <p className={styles.showMore}>
          <a role="button" tabIndex={0} onClick={() => setShowAll(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAll(true) } }}>
            Show {MORE_RESOLUTIONS.length} more resolutions →
          </a>
        </p>
      )}
    </section>
  )
}

export function AttendCard() {
  const [stream, setStream] = useState(false)
  return (
    <div className={styles.attendCard}>
      <div>
        <h3>Can't make it in person?</h3>
        <p>Vote online any time until 14 Nov · 14:00. Watch the live stream of the in-person sessions with chat. Read the minutes the following Friday.</p>
      </div>
      <div className={styles.attendActions}>
        <Button href="#vote" variant="primary">Cast your vote</Button>
        <Button type="button" variant="ghost-dark" onClick={() => setStream(true)}>Live stream link</Button>
      </div>
      {stream && <LiveStreamModal onClose={() => setStream(false)} />}
    </div>
  )
}

export function PastAssembliesSection() {
  return (
    <section className={styles.sec}>
      <h2>Past <em>assemblies</em></h2>
      <p className={styles.subText}>Every Annual Assembly's resolutions and minutes are public.</p>
      {HISTORY.map((h) => (
        <div className={styles.historyRow} key={h.y}>
          <div className={styles.histY}>202<em>{h.y}</em></div>
          <div className={styles.histInfo}><b>{h.title}</b><span>{h.sub}</span></div>
          <Link className={styles.histLink} to={`${routes.annualAssembly}/minutes/202${h.y}`}>Minutes →</Link>
        </div>
      ))}
    </section>
  )
}
