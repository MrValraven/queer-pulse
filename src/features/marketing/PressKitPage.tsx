import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  BoilerplateSection,
  ColourSection,
  CoverageSection,
  DownloadsSection,
  FactsSection,
  MarkSection,
  PhotographySection,
  TeamSection,
} from './PressKitSections'
import styles from './PressKitPage.module.css'

export function PressKitPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>For journalists, researchers &amp; partners</div>
          <h1 className={styles.h1}>
            Press <em>kit.</em>
          </h1>
          <p className={styles.dek}>
            Everything you need to write about, photograph, or fact-check QueerPulse.{' '}
            <b>Boilerplate, marks, photos, stats, and named spokespeople</b> — pre-cleared for reuse
            under the terms below. Updated 14 May 2026.
          </p>
          <div className={styles.actions}>
            <Button type="button" variant="primary" onClick={() => showToast('Downloading queerpulse-press-kit.zip (38 MB)', 'success')}>
              Download full kit · ZIP
            </Button>
            <Button href="mailto:press@queerpulse.app" variant="ghost">
              Or ask a person
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.contactStrip}>
        <div className={styles.contactInner}>
          <span><b>Press desk:</b> <a href="mailto:press@queerpulse.app">press@queerpulse.app</a></span>
          <span className={styles.sep}>·</span>
          <span><b>Phone:</b> +351 21 314 08 22 (Mon–Fri 10:00–18:00 WET)</span>
          <span className={styles.sep}>·</span>
          <span><b>Response time:</b> &lt; 8 working hours</span>
          <span className={styles.sep}>·</span>
          <span><b>Languages:</b> EN · PT · ES</span>
        </div>
      </div>

      <div className={styles.page}>
        <BoilerplateSection />
        <MarkSection />
        <ColourSection />
        <PhotographySection />
        <TeamSection />
        <FactsSection />
        <CoverageSection />
        <DownloadsSection />

        <div className={styles.footerNote}>
          All assets above are licensed under <a href="#">Creative Commons BY 4.0</a> for editorial
          use.
          <br />
          Commercial reuse requires written permission — write to{' '}
          <a href="mailto:press@queerpulse.app">press@queerpulse.app</a>.
        </div>
      </div>
    </PageShell>
  )
}
