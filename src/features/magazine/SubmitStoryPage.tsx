import { useState, type FormEvent } from 'react'
import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { FORMATS, LOOKING_FOR, STEPS } from './submitStory.data'
import styles from './SubmitStoryPage.module.css'

export function SubmitStoryPage() {
  const { showToast } = useToast()
  const [sent, setSent] = useState(false)
  const [format, setFormat] = useState('essay')
  const [working, setWorking] = useState('')
  const [pitch, setPitch] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSent(true)
    showToast('Pitch received — an editor will be in touch within two weeks.')
  }

  if (sent) {
    return (
      <PageShell>
        <section className={styles.page}>
          <div className="wrap">
            <Reveal className={styles.panel}>
              <div className={styles.panelIcon}><FiCheck /></div>
              <h1 className={styles.panelTitle}>
                We're <em>reading.</em>
              </h1>
              <p className={styles.panelSub}>
                Thank you for trusting us with “{working || 'your story'}”. An editor will reply
                within two weeks — yes, no, or let's talk. Whatever happens, the copyright stays
                yours.
              </p>
              <div className={styles.panelActions}>
                <Button to="/magazine" variant="ghost-dark" size="lg">
                  Back to the magazine
                </Button>
                <Button to="/issues" variant="jade" size="lg">
                  Read past issues
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.grid}>
            <div>
              <Reveal className={styles.eyebrow}>Pitch a story</Reveal>
              <Reveal as="h1" className={styles.title} delay={60}>
                Got something <em>worth telling?</em>
              </Reveal>
              <Reveal as="p" className={styles.lead} delay={120}>
                The QueerPulse magazine is written by the community. You don't need a byline or an
                agent — just a story that matters and an honest way of telling it.
              </Reveal>

              <div className={styles.looking}>
                {LOOKING_FOR.map((item, index) => (
                  <Reveal key={item.title} className={styles.look} delay={index * 50}>
                    <span className={styles.lookIcon}><item.icon /></span>
                    <div>
                      <div className={styles.lookTitle}>{item.title}</div>
                      <div className={styles.lookBody}>{item.body}</div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className={styles.steps}>
                <div className={styles.stepsH}>What happens next</div>
                {STEPS.map((step) => (
                  <div key={step} className={styles.step}>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <Reveal as="form" className={styles.form} delay={120} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <span className={styles.label}>What format is it?</span>
                <div className={styles.formats}>
                  {FORMATS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.fmt} ${format === option.id ? styles.fmtOn : ''}`}
                      onClick={() => setFormat(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="working-title">
                  Working title
                </label>
                <input
                  id="working-title"
                  className={styles.input}
                  type="text"
                  placeholder="It can change later"
                  value={working}
                  onChange={(event) => setWorking(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="pitch">
                  The pitch
                </label>
                <textarea
                  id="pitch"
                  className={styles.textarea}
                  placeholder="A paragraph or two — what's the story, why now, and why you?"
                  value={pitch}
                  onChange={(event) => setPitch(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="links">
                  Links to past work (optional)
                </label>
                <input
                  id="links"
                  className={styles.input}
                  type="text"
                  placeholder="Portfolio, a published piece, your Instagram…"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }}>
                Send the pitch →
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
