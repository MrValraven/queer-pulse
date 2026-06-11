import { PageShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import { ManifestoBody, ManifestoSigners, ManifestoActions } from './ManifestoSections'
import styles from './ManifestoPage.module.css'

export function ManifestoPage() {
  const { showToast } = useToast()
  const sign = () => showToast('Signed — welcome to the long list', 'success')

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.open}>
          <div className={styles.openInner}>
            <div className={styles.eyebrow}>
              The QueerPulse Manifesto · 2024 · revised 2025
            </div>
            <h1 className={styles.title}>
              A quiet network for <em>people worth knowing.</em>
            </h1>
            <p className={styles.attrib}>
              First written in <b>March 2024</b> by the founding members, in the back room of
              Café Beirão, over five evenings. Revised once, in <b>November 2025</b>, after the
              second annual assembly. We re-read it each Pride.
            </p>
          </div>
        </section>

        <ManifestoBody />
        <ManifestoSigners onSign={sign} />
        <ManifestoActions onSign={sign} />
      </div>
    </PageShell>
  )
}
