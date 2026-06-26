import { useState, type FormEvent } from 'react'
import { FiCheckCircle, FiMail } from 'react-icons/fi'
import { Button, Reveal } from '../../../shared/components/ui'
import { useToast } from '../../../shared/components/feedback/useToast'
import { digestPreview } from '../data/digestPreview'
import styles from './Newsletter.module.css'

export function Newsletter() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) {
      showToast('Please enter your email', 'info')
      return
    }
    setSubmitted(email.trim())
    showToast("You're on the list — see you Thursday", 'success')
    setEmail('')
  }

  return (
    <section className={styles.digest} id="digest">
      <div className="wrap">
        <div className={styles.inner}>
          <div>
            <Reveal as="h2" className={styles.title}>
              Stay connected. <em>Weekly, not daily.</em>
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={60}>
              The QueerPulse digest lands every Thursday — new members to meet, upcoming
              gatherings, open skill swaps, and one piece of writing worth your time. No
              noise.
            </Reveal>
            {submitted ? (
              <Reveal className={styles.success}>
                <span className={styles.successIcon} aria-hidden>
                  <FiCheckCircle />
                </span>
                <h3 className={styles.successTitle}>
                  You're on the list, <em>almost.</em>
                </h3>
                <p className={styles.successBody}>
                  We'll start sending the <strong>Weekly digest</strong> to{' '}
                  <strong>{submitted}</strong> every Thursday.
                </p>
                <p className={styles.successNext}>
                  <FiMail aria-hidden /> Check your inbox to confirm your subscription —
                  the link expires in 48 hours.
                </p>
                <Button variant="ghost-dark" onClick={() => setSubmitted(null)}>
                  Use a different email
                </Button>
              </Reveal>
            ) : (
              <>
                <Reveal delay={120}>
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <Button type="submit">Subscribe</Button>
                  </form>
                </Reveal>
                <Reveal as="p" className={styles.note} delay={160}>
                  Members only · no spam · unsubscribe anytime
                </Reveal>
              </>
            )}
          </div>

          <Reveal className={styles.preview} delay={100}>
            {digestPreview.map((item) => (
              <div key={item.title} className={styles.item}>
                <div className={styles.week}>{item.tag}</div>
                <div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMeta}>{item.meta}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
