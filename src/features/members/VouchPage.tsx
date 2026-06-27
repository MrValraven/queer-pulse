import { useState, type FormEvent } from 'react'
import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { CANDIDATE, MEANS } from './vouch.data'
import styles from './VouchPage.module.css'

export function VouchPage() {
  const { showToast } = useToast()
  const [sent, setSent] = useState(false)
  const [note, setNote] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSent(true)
    showToast(`Your vouch for ${CANDIDATE.name} is on its way to the council.`)
  }

  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.inner}>
            {sent ? (
              <Reveal className={styles.panel}>
                <div className={styles.panelIcon}><FiCheck /></div>
                <h1 className={styles.panelTitle}>
                  That's a <em>real welcome.</em>
                </h1>
                <p className={styles.panelSub}>
                  Your vouch for {CANDIDATE.name} has gone to the membership council. They'll know
                  someone already had their back before they even walked in.
                </p>
                <div className={styles.panelActions}>
                  <Button to={routes.connections} variant="ghost-dark" size="lg">
                    Back to connections
                  </Button>
                  <Button to={routes.members} variant="jade" size="lg">
                    Browse members
                  </Button>
                </div>
              </Reveal>
            ) : (
              <>
                <Reveal className={styles.eyebrow}>Vouch</Reveal>
                <Reveal as="h1" className={styles.title} delay={60}>
                  Tell us you <em>know them.</em>
                </Reveal>

                <Reveal className={styles.candidate} delay={120}>
                  <Avatar initials={CANDIDATE.initials} tint={CANDIDATE.tint} size={56} />
                  <div>
                    <div className={styles.candName}>{CANDIDATE.name}</div>
                    <div className={styles.candContext}>{CANDIDATE.context}</div>
                    <div className={styles.candBio}>{CANDIDATE.bio}</div>
                  </div>
                </Reveal>

                <div className={styles.means}>
                  {MEANS.map((mean, index) => (
                    <Reveal key={mean.title} className={styles.mean} delay={index * 50}>
                      <span className={styles.meanIcon}><mean.icon /></span>
                      <div>
                        <div className={styles.meanTitle}>{mean.title}</div>
                        <div className={styles.meanBody}>{mean.body}</div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <Reveal as="form" delay={120} onSubmit={handleSubmit}>
                  <label className={styles.label} htmlFor="vouch-note">
                    Add a short note (optional)
                  </label>
                  <textarea
                    id="vouch-note"
                    className={styles.textarea}
                    placeholder="How do you know Jonas, and what should the council know?"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <div className={styles.actions}>
                    <Button type="submit" variant="primary" size="lg">
                      Send my vouch →
                    </Button>
                    <Button to={routes.members} variant="ghost" size="lg">
                      Not right now
                    </Button>
                  </div>
                </Reveal>
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
