import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { IdentitySection, PronounsSection, BioSection, SkillsSection, VisibilitySection } from './EditProfileSections'
import styles from './EditProfilePage.module.css'

export function EditProfilePage() {
  const { showToast } = useToast()
  const [unsaved, setUnsaved] = useState(false)
  const [selectedPronouns, setSelectedPronouns] = useState<string[]>(['she/her'])
  const [skills, setSkills] = useState(['Community organising', 'Legal research'])
  const [interests, setInterests] = useState(['Housing policy', 'Queer theory', 'Lisbon history'])
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [bioText, setBioText] = useState('Former housing rights lawyer. Has been doing community organising in Mouraria since 2018. Convinced the platform needed to exist before she knew how to build it.')

  const markChanged = () => setUnsaved(true)

  function togglePronoun(p: string) {
    setSelectedPronouns((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
    markChanged()
  }

  function addTag(key: 'skills' | 'interests', val: string) {
    const trimmed = val.trim()
    if (!trimmed) return
    if (key === 'skills') { setSkills((prev) => prev.includes(trimmed) ? prev : [...prev, trimmed]); setSkillInput('') }
    else { setInterests((prev) => prev.includes(trimmed) ? prev : [...prev, trimmed]); setInterestInput('') }
    markChanged()
  }

  function removeTag(key: 'skills' | 'interests', val: string) {
    if (key === 'skills') setSkills((prev) => prev.filter((s) => s !== val))
    else setInterests((prev) => prev.filter((s) => s !== val))
    markChanged()
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>, key: 'skills' | 'interests') {
    if (e.key === 'Enter') { e.preventDefault(); addTag(key, key === 'skills' ? skillInput : interestInput) }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <aside className={styles.nav}>
          <div className={styles.navInner}>
            <div className={styles.navSection}>Profile</div>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
              Identity &amp; photo
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M4 4h8M8 4v8M5 11l3 2 3-2" /></svg>
              Pronouns &amp; name
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M3 4h10M3 8h8M3 12h5" /></svg>
              Bio &amp; occupation
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><polygon points="8,2 10.2,6 15,6.6 11.5,10 12.4,15 8,12.5 3.6,15 4.5,10 1,6.6 5.8,6" /></svg>
              Skills &amp; interests
            </button>
            <div className={styles.navSection}>Privacy</div>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>
              Field visibility
            </button>
            <div className={styles.navSection}>More</div>
            <Link to={routes.pronounsGuide} className={styles.navItem}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v0M8 8v4" /></svg>
                Pronouns guide
              </Link>
          </div>
        </aside>

        <main className={styles.main}>
          <IdentitySection onUpload={() => showToast('Photo upload — connect to your file system.', 'info')} onRemove={() => showToast('Photo removed.', 'info')} onChange={markChanged} />
          <PronounsSection selected={selectedPronouns} onToggle={togglePronoun} onChange={markChanged} />
          <BioSection bioText={bioText} onChange={setBioText} onAnyChange={markChanged} />
          <SkillsSection skills={skills} interests={interests} skillInput={skillInput} interestInput={interestInput} onSkillInputChange={setSkillInput} onInterestInputChange={setInterestInput} onAdd={addTag} onRemove={removeTag} onKeyDown={handleTagKey} />
          <VisibilitySection onChange={markChanged} />
          <div style={{ height: '80px' }} />
        </main>
      </div>

      {unsaved && (
        <div className={styles.saveBar}>
          <span className={styles.unsavedLabel}>Unsaved changes</span>
          <div className={styles.saveActions}>
            <Button variant="ghost" onClick={() => { setUnsaved(false); showToast('Changes discarded.', 'info') }}>Discard</Button>
            <Button variant="primary" onClick={() => { setUnsaved(false); showToast('Profile saved.', 'success') }}>Save profile</Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
