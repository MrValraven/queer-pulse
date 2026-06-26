import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { useWorkProfile } from '../../app/providers/WorkProfileProvider'
import { IdentitySection, ShowUpAtWorkSection, SkillsFocusSection } from './WorkProfileSections'
import styles from './WorkProfilePage.module.css'

/** The Work Profile — identity & safety controls at the heart of the workspace. */
export function WorkProfilePage() {
  const { showToast } = useToast()
  const { outAtWork, setOutAtWork, transSupport, toggleTransSupport, safeOnly, setSafeOnly } =
    useWorkProfile()
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    showToast('Work profile saved', 'success')
  }

  if (saved) {
    return (
      <PageShell>
        <div className={styles.successWrap}>
          <div className={styles.success}>
            <div className={styles.successIcon} aria-hidden>
              <FiCheck />
            </div>
            <h1 className={styles.successTitle}>
              Your work profile is <em>set.</em>
            </h1>
            <p className={styles.successSub}>
              You appear to employers exactly as you choose to — and never otherwise.
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" to={routes.work}>
                Back to your workspace
              </Button>
              <Button variant="ghost-dark" onClick={() => setSaved(false)}>
                Keep editing
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Work profile</div>
          <h1 className={styles.h1}>
            How you show up <em>at work.</em>
          </h1>
          <p className={styles.sub}>
            This controls what employers see — and what stays yours. Nothing here is shared without
            your say-so.
          </p>
        </header>

        <IdentitySection />
        <ShowUpAtWorkSection
          outChoice={outAtWork}
          onOut={setOutAtWork}
          trans={transSupport}
          onToggleTrans={toggleTransSupport}
          safeOnly={safeOnly}
          onSafeOnly={setSafeOnly}
        />
        <SkillsFocusSection />

        <div className={styles.saveBar}>
          <Button variant="primary" size="lg" onClick={save}>
            Save work profile
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
