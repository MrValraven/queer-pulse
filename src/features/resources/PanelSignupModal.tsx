import { useState } from 'react'
import { Button, Sending } from '../../shared/components/ui'
import { ResourceModal, PlumSuccess } from './ResourceModal'
import styles from './ResourceModal.module.css'

export function PanelSignupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [why, setWhy] = useState('')
  const [phase, setPhase] = useState<'form' | 'loading' | 'done'>('form')

  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email) && why.trim().length > 8

  const submit = () => {
    if (!valid || phase === 'loading') return
    setPhase('loading')
    setTimeout(() => setPhase('done'), 1100)
  }

  return (
    <ResourceModal title={phase === 'done' ? '' : 'Join the review panel'} onClose={onClose}>
      {phase === 'done' ? (
        <PlumSuccess
          title={<>You're on the <em>list.</em></>}
          sub="Thank you. The panel coordinator reviews new volunteers ahead of each quarter and will be in touch before the Q3 round opens. Panels rotate so the work stays shared."
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>
              The panel reads applications and decides grants together. We keep it small,
              rotating, and deliberately mixed — no professional gatekeepers.
            </p>

            <span className={styles.label}>Name</span>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <span className={styles.label}>Why you'd like to help review</span>
            <textarea
              className={styles.textarea}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="A sentence or two — lived experience, the kind of projects you care about, time you can give."
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={submit} disabled={!valid || phase === 'loading'}>
              {phase === 'loading' ? <Sending label="Sending…" /> : 'Add me to the panel'}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  )
}
