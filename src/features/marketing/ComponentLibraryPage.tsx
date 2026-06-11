import { PageShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import { TOC } from './componentLibrary.data'
import {
  AvatarsSection,
  ButtonsSection,
  CardsSection,
  ChipsSection,
  ColorsSection,
  FormsSection,
  NavSection,
  StatusSection,
  TypeSection,
} from './ComponentLibrarySections'
import styles from './ComponentLibraryPage.module.css'

export function ComponentLibraryPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eye}>Design system · live component library · v2.4</div>
          <h1 className={styles.h1}>
            Every <em>piece,</em> on one page.
          </h1>
          <p className={styles.sub}>
            The 24 components every QueerPulse page is made of. Live (uses the production CSS).{' '}
            <em>For internal handoff &amp; press use only</em> — not a public design system.
          </p>
        </header>

        <nav className={styles.toc}>
          {TOC.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <ColorsSection />
        <TypeSection />
        <ButtonsSection />
        <ChipsSection />
        <AvatarsSection />
        <CardsSection />
        <FormsSection />
        <StatusSection />
        <NavSection />

        <p className={styles.footerNote}>
          For everything else · type pairs, motion easing tokens, dark-mode swap, full radii scale,
          and the foundation cards · see{' '}
          <a onClick={() => showToast('Opening Guidelines…', 'info')}>Guidelines</a> · or the{' '}
          <a onClick={() => showToast('Downloading Figma kit…', 'success')}>Figma kit</a>.
        </p>
      </div>
    </PageShell>
  )
}
