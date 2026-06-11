import { useState, useRef } from 'react'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './AccessibilityPreferencesPage.module.css'
import { A11yDisplaySection, A11yMotionSection, A11yReadingSection, A11yInteractionSection } from './AccessibilityPrefSections'

type ColorTheme = 'default' | 'softer' | 'high-contrast'

export interface A11yPrefs {
  highContrast: boolean
  largerText: boolean
  dyslexia: boolean
  reduceMotion: boolean
  pauseDecorative: boolean
  wideSpacing: boolean
  focusRings: boolean
  largeTargets: boolean
  stickyNav: boolean
  skipLink: boolean
  textSize: number
  colorTheme: ColorTheme
}

const DEFAULT_PREFS: A11yPrefs = {
  highContrast: false, largerText: false, dyslexia: false,
  reduceMotion: false, pauseDecorative: false, wideSpacing: false,
  focusRings: false, largeTargets: false, stickyNav: true, skipLink: false,
  textSize: 100, colorTheme: 'default',
}

const SECTIONS = ['display', 'motion', 'reading', 'interaction', 'reset'] as const
type SectionId = typeof SECTIONS[number]

export function AccessibilityPreferencesPage() {
  const { showToast } = useToast()
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS)
  const [activeSection, setActiveSection] = useState<SectionId>('display')
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    display: null, motion: null, reading: null, interaction: null, reset: null,
  })

  function toggle(key: keyof A11yPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  function scrollToSection(id: SectionId) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  function resetAll() {
    setPrefs(DEFAULT_PREFS)
    showToast('All preferences reset', 'info')
  }

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <div className={styles.sbHead}>Preferences</div>
            <div className={styles.sbNav}>
              {SECTIONS.map((id) => (
                <button key={id} className={[styles.sbLink, activeSection === id && styles.sbLinkActive].filter(Boolean).join(' ')} onClick={() => scrollToSection(id)}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <A11yDisplaySection prefs={prefs} onToggle={toggle} onSizeChange={(v) => setPrefs((p) => ({ ...p, textSize: v }))} sectionRef={(el) => { sectionRefs.current.display = el }} />
            <A11yMotionSection prefs={prefs} onToggle={toggle} sectionRef={(el) => { sectionRefs.current.motion = el }} />
            <A11yReadingSection prefs={prefs} onToggle={toggle} onColorTheme={(t) => setPrefs((p) => ({ ...p, colorTheme: t as ColorTheme }))} sectionRef={(el) => { sectionRefs.current.reading = el }} />
            <A11yInteractionSection prefs={prefs} onToggle={toggle} sectionRef={(el) => { sectionRefs.current.interaction = el }} />

            <div className={styles.section} id="reset" ref={(el) => { sectionRefs.current.reset = el }}>
              <div className={styles.resetCard}>
                <Button variant="ghost" onClick={resetAll} style={{ margin: '0 auto' }}>Reset all preferences</Button>
                <div className={styles.resetNote}>This returns all display settings to their defaults. Your profile data is unaffected.</div>
                <div className={styles.deviceNote}>Your preferences are saved locally to this device.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
