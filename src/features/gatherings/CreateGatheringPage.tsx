import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAward } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { PILL_LABELS, TIPS, TOTAL_STEPS } from './createGathering.data'
import { useGatheringForm } from './useGatheringForm'
import {
  CapacityStep,
  DatePlaceStep,
  PricingStep,
  ReviewStep,
  TypeStep,
} from './CreateGatheringSteps'
import styles from './CreateGatheringPage.module.css'

export function CreateGatheringPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const form = useGatheringForm()

  const isSuccess = step === 6
  const fill = ((step - 1) / TOTAL_STEPS) * 100
  const canPublish = step !== TOTAL_STEPS || form.allChecked

  const next = () => {
    if (step === TOTAL_STEPS) {
      if (!form.allChecked) return
      setStep(6)
      showToast('Your gathering is live', 'success')
    } else {
      setStep((s) => s + 1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => {
    if (step === 1) navigate(routes.host)
    else setStep((s) => s - 1)
  }

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>List your event</div>
            <h2 className={styles.title}>
              Create your <em>gathering.</em>
            </h2>
            <p className={styles.sub}>
              Fill in the details below and your event will be live on the QueerPulse gatherings
              board immediately.
            </p>
          </div>

          {!isSuccess && (
            <div className={styles.progressWrap}>
              <div className={styles.stepPills}>
                {PILL_LABELS.map((l, i) => {
                  const s = i + 1
                  const cls = s < step ? styles.pillDone : s === step ? styles.pillActive : styles.pillPending
                  return (
                    <div key={l} className={`${styles.pill} ${cls}`}>
                      {l}
                    </div>
                  )
                })}
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${fill}%` }} />
              </div>
            </div>
          )}

          <div className={styles.layout}>
            <div>
              {step === 1 && <TypeStep form={form} />}
              {step === 2 && <DatePlaceStep form={form} />}
              {step === 3 && <CapacityStep form={form} />}
              {step === 4 && <PricingStep form={form} />}
              {step === 5 && <ReviewStep form={form} />}

              {isSuccess && (
                <div className={styles.success}>
                  <div className={styles.successIcon}><FiAward /></div>
                  <div className={styles.successTitle}>
                    Your gathering <em>is live.</em>
                  </div>
                  <p className={styles.successSub}>
                    It's now visible on the QueerPulse gatherings board. Members can see it and RSVP.
                    You'll get an email notification for each new attendee.
                  </p>
                  <div className={styles.successActions}>
                    <Button to={routes.gathering} variant="ghost-dark">
                      View on board →
                    </Button>
                    <Button to={routes.event} variant="primary">
                      See your event page →
                    </Button>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className={styles.nav}>
                  <button type="button" className={styles.back} onClick={back}>
                    {step === 1 ? 'Cancel' : '← Back'}
                  </button>
                  <button
                    type="button"
                    className={styles.next}
                    onClick={next}
                    disabled={!canPublish}
                    title={!canPublish ? 'Confirm all three boxes above to publish' : undefined}
                  >
                    {step === TOTAL_STEPS ? 'Publish gathering →' : 'Continue →'}
                  </button>
                </div>
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.tipCard}>
                <div className={styles.tipTitle}>Tip for this step</div>
                <div className={styles.tipBody}>{TIPS[Math.min(step, TOTAL_STEPS) - 1]}</div>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipTitle}>What happens after you publish</div>
                <div className={styles.tipBody}>
                  Your gathering appears on the board immediately. RSVPs come to your QueerPulse
                  inbox. Full addresses are shared only with confirmed attendees. You can edit or
                  cancel at any time up to 48 hours before.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
