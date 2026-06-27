import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useProfileTheme } from '../../app/providers/ProfileThemeProvider'
import { routes } from '../../app/routeMap'
import { ThemeStudio } from './ThemeStudio'
import styles from './ProfileThemePage.module.css'

export function ProfileThemePage() {
  const { showToast } = useToast()
  const { commit: commitTheme, discard: discardTheme } = useProfileTheme()

  // Start from the committed theme, dropping any leftover unsaved edits.
  useEffect(() => {
    discardTheme()
  }, [discardTheme])

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <ThemeStudio />
      </div>

      <div style={{ position: 'fixed', top: 18, right: 24, zIndex: 200, display: 'flex', gap: 10 }}>
        <Link to={routes.accountProfile} style={{ fontSize: 13, padding: '9px 16px', borderRadius: 999, border: '1.5px solid rgba(45,27,61,.16)', background: 'var(--cream)', color: 'var(--plum)', textDecoration: 'none', fontWeight: 600 }}>← My profile</Link>
        <Button variant="primary" onClick={() => { commitTheme(); showToast('Theme saved', 'success') }}>Save theme</Button>
      </div>
    </AppShell>
  )
}
