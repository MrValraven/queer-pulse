import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from './ModalKit'
import styles from './ApplicationModals.module.css'

/* ── Apply for cohort 3 ─────────────────────────────────────────────── */
export function CohortApplyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pitch, setPitch] = useState('')
  const { sending, done, submit } = useSubmitFlow()
  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email) && pitch.trim().length >= 30

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Application" em="received." onClose={onClose} closeLabel="Done">
          Thanks, <strong>{name.split(' ')[0]}</strong>. Cohort 3 applications are read by the
          programme team after the 30 July deadline — you'll hear back within three weeks, whatever
          we decide.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Incubator · Cohort 3</div>
          <h2 className={styles.title}>
            Apply to <em>build your thing.</em>
          </h2>
          <p className={styles.sub}>
            Six months of mentorship, peer accountability, and warm intros. No pitch deck required —
            just tell us what you're making and where you're at.
          </p>

          <div className={styles.field}>
            <label htmlFor="ca-name">Your name *</label>
            <input
              id="ca-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ca-email">Email *</label>
            <input
              id="ca-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ca-pitch">What are you building? *</label>
            <textarea
              id="ca-pitch"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="A couple of sentences on your idea, where you are, and what you most need help with."
            />
          </div>
          <p className={styles.note}>
            {pitch.trim().length < 30
              ? `${30 - pitch.trim().length} more characters in your pitch to submit.`
              : 'Looks good. Decisions go out within three weeks of the deadline.'}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
            >
              {sending ? <Sending label="Submitting…" /> : 'Submit application'}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  )
}

/* ── Become a mentor ────────────────────────────────────────────────── */
export function MentorSignupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [expertise, setExpertise] = useState('')
  const [why, setWhy] = useState('')
  const { sending, done, submit } = useSubmitFlow()
  const valid =
    name.trim().length > 1 && /.+@.+\..+/.test(email) && expertise.trim().length > 1 && why.trim().length >= 30

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="You're on the" em="list." onClose={onClose} closeLabel="Done">
          Thank you, <strong>{name.split(' ')[0]}</strong>. The mentorship team will reach out to
          match you with a founder whose sector and stage fit what you offer. Mentors meet their
          match fortnightly across the cohort.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Incubator · Mentorship</div>
          <h2 className={styles.title}>
            Become a <em>mentor.</em>
          </h2>
          <p className={styles.sub}>
            Give a few hours a month to a queer founder finding their feet. We match on sector,
            stage, and the things you actually know.
          </p>

          <div className={styles.field}>
            <label htmlFor="ms-name">Your name *</label>
            <input id="ms-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last" />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-email">Email *</label>
            <input id="ms-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-exp">Where can you help? *</label>
            <input
              id="ms-exp"
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Product, fundraising, legal, hiring"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-why">Why mentor? *</label>
            <textarea
              id="ms-why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="A sentence or two on what you'd bring and who you'd most like to support."
            />
          </div>
          <p className={styles.note}>
            {why.trim().length < 30
              ? `${30 - why.trim().length} more characters to submit.`
              : 'We review every mentor before matching — expect to hear from us soon.'}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button variant="primary" size="lg" disabled={!valid || sending} onClick={() => valid && submit()}>
              {sending ? <Sending label="Submitting…" /> : 'Sign up to mentor'}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  )
}
