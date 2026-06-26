import { useState, type ReactNode } from 'react'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './council.module.css'

const KPIS = [
  { v: <><em>47</em></>, l: 'new this week' },
  { v: <><em>9</em></>, l: 'you claimed' },
  { v: <><em>9.4</em>d</>, l: 'median reply', jade: true },
  { v: <><em>3</em></>, l: 'at deadline' },
]
const TABS = [
  { label: 'New', ct: '47' },
  { label: 'Yours', ct: '9' },
  { label: 'At deadline', ct: '3', warn: true },
  { label: 'Shortlisted', ct: '14' },
  { label: 'Answered', ct: '128' },
]

interface Sub {
  tint: 'coral' | 'jade' | 'plum'
  titlePre: string
  titleEm?: string
  who: ReactNode
  badges: { label: string; cls?: string }[]
  day: string
  of?: boolean
  note: string
  meta: ReactNode[]
}

const SUBS: Sub[] = [
  { tint: 'coral', titlePre: 'The piano ', titleEm: 'I waited for', who: <>Renato V. · Porto · <em>first submission</em></>, badges: [{ label: 'First submission', cls: 'first' }, { label: '1 track' }, { label: 'Lead sheet attached' }, { label: 'PT lyrics' }, { label: 'Claimed · you', cls: 'claimed' }], day: 'Day 9', of: true, note: "i'm a 56-year-old former dock worker. i bought a piano at 49 and i'm writing the songs i should have written at 24. this is the first one i'd be proud to send out. four minutes and forty seconds. piano and one voice, plain.", meta: [<>Submitted <em>Sat 31 May</em></>, 'FLAC · 24/48 · 38.4 MB', '−14.1 LUFS · ready', 'Lyric translation requested · EN'] },
  { tint: 'plum', titlePre: 'Coro de ', titleEm: 'Porto', who: 'Eight voices · Porto · cover artists from the choir collective', badges: [{ label: 'First submission', cls: 'first' }, { label: '4 tracks · EP' }, { label: 'SATB scores' }, { label: 'Mirandês + PT' }], day: 'Day 7', of: true, note: "we're the porto cousin of coro de outubro. four songs of our own, all in mirandês, with PT side-by-side. recorded in casa do povo de miranda do douro, one mic, two takes each.", meta: [<>Submitted <em>Mon 2 Jun</em></>, 'FLAC · 24/96 · 412 MB', '−15.2 LUFS · ready', 'Translations attached: PT, EN'] },
  { tint: 'jade', titlePre: 'Tomboy · ', titleEm: 'Outubro', who: 'DJ from São Paulo · second submission', badges: [{ label: 'Mix · 38m' }, { label: 'Sapatão-sci-fi' }, { label: 'Cue sheet attached' }, { label: 'BR house' }], day: 'Day 4', of: true, note: 'sapatão-sci-fi mix, 38 minutes, all heard from below the dancefloor. last submission got a thoughtful pass — this one starts differently.', meta: [<>Submitted <em>Wed 5 Jun</em></>, 'FLAC · 24/44.1 · 1.8 GB', 'Cleared 18 source artists', 'Cue sheet: 18 tracks'] },
  { tint: 'coral', titlePre: 'Ainda', who: <>Helena P. · Aveiro · <em>first single, also our translator</em></>, badges: [{ label: 'First submission', cls: 'first' }, { label: '1 track' }, { label: 'PT' }], day: 'Day 11', of: true, note: "two minutes and forty-six seconds. a piano and a small fire. you know me as the translator on Mariana's record; i'd like to try the other side, this once.", meta: [<>Submitted <em>Thu 30 May</em></>, 'WAV · 24/48 · 23.4 MB', '−13.8 LUFS · ready', 'Note from Mariana: vouches'] },
]

const FILE = [
  ['Format', <>FLAC · 24 bit / 48 kHz</>],
  ['Loudness', <><em>−14.1 LUFS</em> · within bounds</>],
  ['Duration', <>4:40</>],
  ['Lyrics', <>PT · EN translation requested</>],
  ['Splits', <>100% Renato V. · no collabs</>],
]
const WF = [40, 65, 55, 80, 60, 50, 72, 58, 46, 88, 62, 54, 80, 42, 68, 75, 48, 60, 84, 50, 62, 38, 72, 55, 48, 62, 38, 55]

export function StudioTriagePage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('New')
  const [active, setActive] = useState(0)

  return (
    <StudioShell>
      <div className={s.wrap}>
        <section className={s.trH}>
          <div>
            <div className={s.eb}>Submission triage · the council answers every submission in 14 days</div>
            <div className={s.pageH} style={{ padding: 0 }}>
              <h1>
                Inbox · <em>47</em> new this week.
              </h1>
            </div>
            <div className="sub" style={{ fontSize: 14, color: 'rgba(247,243,238,.55)', lineHeight: 1.6, maxWidth: '56ch', marginTop: 10 }}>
              Every submission gets read or listened to. <em style={{ color: 'var(--jade-light)' }}>Pass</em> takes a sentence — that sentence becomes the artist's answer. Median reply time this season: 9.4 days.
            </div>
          </div>
          <div className={s.kpiStrip}>
            {KPIS.map((k, i) => (
              <div key={i} className={s.kpiMini}>
                <div className={`${s.v} ${k.jade ? 'jade' : ''}`} style={k.jade ? { color: 'var(--jade-light)' } : undefined}>
                  {k.v}
                </div>
                <div className={s.l}>{k.l}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={s.trTabs}>
          {TABS.map((t) => (
            <button key={t.label} className={[s.trTab, tab === t.label && s.trTabOn, t.warn && s.trTabWarn].filter(Boolean).join(' ')} onClick={() => setTab(t.label)}>
              {t.label} <span className={s.ctNum}>{t.ct}</span>
            </button>
          ))}
        </div>

        <div className={s.trBody}>
          <section className={s.subList}>
            {SUBS.map((sub, i) => (
              <div key={i} className={[s.subRow, active === i && s.subRowActive].filter(Boolean).join(' ')} role="button" tabIndex={0} onClick={() => setActive(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i) } }}>
                <div className={s.subTop}>
                  <span className={s.srCov}>
                    <ImageSlot tint={sub.tint} width={48} height={48} radius={8} placeholder="" />
                  </span>
                  <div>
                    <h3>
                      {sub.titlePre}
                      {sub.titleEm && <em>{sub.titleEm}</em>}
                    </h3>
                    <div className={s.subWho}>{sub.who}</div>
                    <div className={s.badges}>
                      {sub.badges.map((b) => (
                        <span key={b.label} className={b.cls === 'first' ? s.first : b.cls === 'claimed' ? s.claimed : undefined}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={s.deadline}>
                    <b>{sub.day}</b>
                    {sub.of && 'of 14 to answer'}
                  </div>
                </div>
                <div className={s.subNote}>{sub.note}</div>
                <div className={s.metaStrip}>
                  {sub.meta.map((m, j) => (
                    <span key={j}>{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className={s.aside}>
            <h2>
              The piano <em>I waited for</em>
            </h2>
            <div className={s.asideWho}>Renato V. · Porto · single · 4:40</div>

            <div className={s.playerMini}>
              <div className={s.pmWf}>
                {WF.map((h, i) => (
                  <span key={i} className={i < 6 ? s.played : undefined} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className={s.pmCtrl}>
                <button className={s.pmPlay} aria-label="Play">
                  <svg viewBox="0 0 12 14" fill="currentColor">
                    <path d="M1 1l10 6-10 6z" />
                  </svg>
                </button>
                <div className={s.pmTimes}>
                  <span className="e" style={{ color: 'var(--accent)' }}>1:48</span>
                  <span>4:40</span>
                </div>
              </div>
            </div>

            <div className={s.claimRow}>
              <div className="av">SM</div>
              <div className={s.text}>
                <b>Claimed by Sara M.</b>
                You're answering this one. <em>D. Okoye second-reading queued.</em>
              </div>
            </div>

            <div className={s.detailBlock}>
              <h4>The file</h4>
              <div className={s.dGrid}>
                {FILE.map(([k, v], i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <span className={s.k}>{k}</span>
                    <span className={s.v}>{v}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className={s.detailBlock}>
              <h4>What other curators flagged (3)</h4>
              <p style={{ fontStyle: 'italic', color: 'rgba(247,243,238,.6)' }}>
                D. Okoye: "the bridge at 2:14 is the thing." · João R.: "PT feels regional — Porto, not Lisbon." · Yara R.: "i'd put this on the standards collection in a year, easily."
              </p>
            </div>

            <h3 className={s.shortlistH}>
              Your <em>answer</em>
            </h3>
            <div className={s.decision}>
              <h4>If you pass — write one sentence. This goes to Renato as the answer.</h4>
              <textarea placeholder="A small sentence that explains the no. We never send a form letter, ever." />
              <div className="hint" style={{ fontSize: 11.5, color: 'rgba(247,243,238,.5)', fontFamily: 'var(--serif)', fontStyle: 'italic', marginTop: 8 }}>
                Required for pass. <em style={{ color: 'var(--accent)' }}>Not required</em> for slate.
              </div>
              <div className="actions" style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button className={s.bt} onClick={() => showToast('Held for a second read', 'info')}>
                  Hold &amp; second-read
                </button>
                <button className={s.bt} onClick={() => showToast('Passed with your sentence — sent to Renato', 'success')}>
                  Pass · with the sentence
                </button>
                <button className={`${s.bt} ${s.btP}`} onClick={() => showToast('Added to the next slate', 'success')}>
                  ＋ Add to next slate
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StudioShell>
  )
}
