import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, ImageSlot } from '../../shared/components/ui'
import styles from './OnboardingPage.module.css'

const STEP_LABELS = [
  'Step 1 of 6',
  'Step 2 of 6',
  'Step 3 of 6 · Community norms',
  'Step 4 of 6 · What brings you here',
  'Step 5 of 6 · Communities',
  "You're all set!",
]

const NORMS = [
  { title: 'Be present', desc: 'Give conversations your genuine attention. Scrolling past is fine; engaging half-heartedly isn\'t.' },
  { title: 'Respect names and pronouns', desc: "Use the name and pronouns each member shares. If you're unsure, ask — that's always welcome here." },
  { title: "What's shared here stays here", desc: 'Members share things here they might not share elsewhere. Treat that as a privilege.' },
  { title: 'Ask before you photograph', desc: 'At gatherings, always ask before photographing other members, even in a shared space.' },
]

const INTENTS = ['Community', 'Gatherings & events', 'Professional connections', 'Dating', 'Resources & support', 'Contributing', 'Housing', 'Finding flatmates', 'Activism', 'Creative collaboration']

const COMMUNITIES = [
  { id: 'cc1', name: 'Queer Lisbon', count: '284 members', desc: 'The main hub for queer life in Lisbon — events, housing, jobs, and everything in between.', joined: true },
  { id: 'cc2', name: 'Queer Creatives', count: '96 members', desc: 'Artists, writers, filmmakers, and makers building queer culture in Portugal and beyond.', joined: false },
  { id: 'cc3', name: 'Trans & Non-Binary', count: '118 members', desc: 'A dedicated space for trans and non-binary members — peer support, healthcare, community.', joined: false },
  { id: 'cc4', name: 'Queer Tech', count: '61 members', desc: 'Queer people working in technology — design, engineering, product, and the ethics behind it.', joined: false },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [agreed, setAgreed] = useState(false)
  const [selectedIntents, setSelectedIntents] = useState<Set<string>>(
    new Set(['Community', 'Professional connections', 'Creative collaboration']),
  )
  const [joined, setJoined] = useState<Set<string>>(new Set(['cc1']))

  const progress = Math.max(((step - 1) / 5) * 100, 4)

  function go(next: number) {
    setStep(next)
    window.scrollTo(0, 0)
  }
  function toggleIntent(intent: string) {
    setSelectedIntents((current) => {
      const next = new Set(current)
      if (next.has(intent)) next.delete(intent)
      else next.add(intent)
      return next
    })
  }
  function toggleJoin(id: string) {
    setJoined((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={styles.root}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressLabel}>{STEP_LABELS[step - 1]}</div>
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.page}>
        <div className={styles.card} key={step}>
          {step === 1 && (
            <>
              <div className={styles.checkWrap}>
                <svg viewBox="0 0 72 72" width={72} height={72}>
                  <circle className={styles.checkCircle} cx={36} cy={36} r={33} />
                  <path className={styles.checkMark} d="M22 36l10.5 11.5L50 24" />
                </svg>
              </div>
              <div className={styles.eye}>You're in</div>
              <div className={styles.h}>
                Welcome, <em>Sofia</em>
              </div>
              <div className={styles.vouchCard}>
                <div className={styles.vcAv}>TM</div>
                <div>
                  <div className={styles.vcName}>Tomás Mendes</div>
                  <div className={styles.vcRole}>Member since Oct 2024 · Architect</div>
                  <div className={styles.vcNote}>
                    "Sofia is exactly the kind of person this community was built for — thoughtful,
                    creative, and genuinely invested in making queer spaces better."
                  </div>
                </div>
              </div>
              <div className={styles.p}>
                QueerPulse is a cared-for professional network rooted in Lisbon. You were invited
                because someone here knows your worth.
              </div>
              <div className={styles.nav}>
                <Button onClick={() => go(2)}>Let's get started</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.eye}>Step 2 of 6</div>
              <div className={styles.h}>
                Put a face to the <em>name</em>
              </div>
              <div className={styles.p}>
                A photo helps members feel comfortable connecting with you. You can always add this
                later.
              </div>
              <div className={styles.photoWrap}>
                <ImageSlot shape="circle" tint="coral" width={130} height={130} placeholder="your photo" initials="S" />
                <div style={{ fontSize: 13, color: 'var(--ink-40)', marginTop: 10 }}>
                  Drag a photo here, or click to upload
                </div>
              </div>
              <div className={styles.nav}>
                <Button onClick={() => go(3)}>Continue</Button>
                <button className={styles.skip} onClick={() => go(3)}>
                  Skip for now
                </button>
                <button className={styles.back} onClick={() => go(1)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.eye}>Step 3 of 6</div>
              <div className={styles.h}>
                This is a <em>cared-for</em> space
              </div>
              <div className={styles.normCards}>
                {NORMS.map((norm) => (
                  <div key={norm.title} className={styles.normCard}>
                    <div className={styles.ncDot} />
                    <div>
                      <div className={styles.ncTitle}>{norm.title}</div>
                      <div className={styles.ncDesc}>{norm.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <label className={styles.agreeRow}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span className={styles.agreeLabel}>
                  I've read and agree to the <Link to="/guidelines">Community Guidelines</Link>
                </span>
              </label>
              <div className={styles.nav}>
                <Button onClick={() => go(4)} disabled={!agreed}>
                  I agree, continue
                </Button>
                <button className={styles.back} onClick={() => go(2)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.eye}>Step 4 of 6</div>
              <div className={styles.h}>
                What brings you <em>here?</em>
              </div>
              <div className={styles.chipHint}>Select as many as you like</div>
              <div className={styles.chips}>
                {INTENTS.map((intent) => (
                  <button
                    key={intent}
                    className={[styles.chip, selectedIntents.has(intent) && styles.chipSelected].filter(Boolean).join(' ')}
                    onClick={() => toggleIntent(intent)}
                  >
                    {intent}
                  </button>
                ))}
              </div>
              <div className={styles.nav}>
                <Button onClick={() => go(5)}>Continue</Button>
                <button className={styles.back} onClick={() => go(3)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className={styles.eye}>Step 5 of 6</div>
              <div className={styles.h}>
                Find your <em>communities</em>
              </div>
              <div className={styles.p} style={{ marginBottom: 20 }}>
                Groups you might like based on your interests.
              </div>
              <div className={styles.communityGrid}>
                {COMMUNITIES.map((community) => {
                  const isJoined = joined.has(community.id)
                  return (
                    <div
                      key={community.id}
                      className={[styles.commCard, isJoined && styles.commJoined].filter(Boolean).join(' ')}
                    >
                      <div className={styles.ccName}>{community.name}</div>
                      <div className={styles.ccCount}>{community.count}</div>
                      <div className={styles.ccDesc}>{community.desc}</div>
                      <button
                        className={[styles.ccJoin, isJoined && styles.ccJoinActive].filter(Boolean).join(' ')}
                        onClick={() => toggleJoin(community.id)}
                      >
                        {isJoined ? '✓ Joined' : 'Join'}
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className={styles.nav}>
                <Button onClick={() => go(6)}>Continue</Button>
                <button className={styles.skip} onClick={() => go(6)}>
                  Skip for now
                </button>
                <button className={styles.back} onClick={() => go(4)}>
                  ← Back
                </button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div className={styles.h}>
                You're <em>part of it</em> now
              </div>
              <div className={styles.quickStart}>
                <Link to="/members" className={styles.qsCard}>
                  <span className={styles.qsIcon} style={{ background: 'rgba(45,27,61,.07)' }}>👥</span>
                  <div className={styles.qsBody}>
                    <div className={styles.qsTitle}>Browse the member directory</div>
                    <div className={styles.qsDesc}>482 members in Lisbon and beyond</div>
                  </div>
                  <span className={styles.qsArrow}>→</span>
                </Link>
                <Link to="/calendar" className={styles.qsCard}>
                  <span className={styles.qsIcon} style={{ background: 'rgba(232,119,90,.08)' }}>📅</span>
                  <div className={styles.qsBody}>
                    <div className={styles.qsTitle}>See upcoming gatherings</div>
                    <div className={styles.qsDesc}>Real-world events for the community</div>
                  </div>
                  <span className={styles.qsArrow}>→</span>
                </Link>
                <Link to="/magazine" className={styles.qsCard}>
                  <span className={styles.qsIcon} style={{ background: 'rgba(74,140,111,.08)' }}>📖</span>
                  <div className={styles.qsBody}>
                    <div className={styles.qsTitle}>Read the community magazine</div>
                    <div className={styles.qsDesc}>Published the first of every month</div>
                  </div>
                  <span className={styles.qsArrow}>→</span>
                </Link>
              </div>
              <div className={styles.nav}>
                <Button onClick={() => navigate('/feed')}>Go to my home</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
