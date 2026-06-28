import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfileTheme } from '../../app/providers/ProfileThemeProvider'
import { useScrollLock } from '../../shared/hooks'
import { AppShell } from '../../shared/components/layout'
import { FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { NAV, type PaneId } from './settings.data'
import { DeleteAccountSection } from './DeleteAccountSection'
import { EditProfilePane } from './EditProfilePane'
import { ProfileThemePane, AccessibilityPane } from './SettingsPersonalisation'
import { InterestsPane } from './InterestsPane'
import { DeleteAccountModal } from './SettingsControls'
import {
  AccountPane,
  DataPane,
  LanguagePane,
  NotificationsPane,
  SimulationsPane,
  VisibilityPane,
} from './SettingsPanes'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const { showToast } = useToast()
  const { commit: commitTheme, discard: discardTheme } = useProfileTheme()
  const [params] = useSearchParams()
  const initialPane = (() => {
    const p = params.get('pane')
    const valid = NAV.flatMap((g) => g.items.map((i) => i.id))
    return p && valid.includes(p as PaneId) ? (p as PaneId) : 'notifications'
  })()
  const [pane, setPane] = useState<PaneId>(initialPane)
  const [dirty, setDirty] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  useScrollLock(showDelete)

  // Drop any leftover unsaved theme edits when re-entering Settings.
  useEffect(() => {
    discardTheme()
  }, [discardTheme])

  const markChanged = () => setDirty(true)

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <aside className={styles.sidebar}>
          {NAV.map((g) => (
            <div key={g.group}>
              <h3>{g.group}</h3>
              {g.items.map((item) => (
                <button
                  key={item.id}
                  className={[
                    styles.navItem,
                    item.danger && styles.navItemDanger,
                    pane === item.id && styles.navItemActive,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setPane(item.id)}
                >
                  <span className={styles.icon}><item.icon /></span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.main}>
          <FadeIn key={pane}>
            {pane === 'notifications' && <NotificationsPane onChange={markChanged} />}
            {pane === 'language' && <LanguagePane onChange={markChanged} />}
            {pane === 'data' && <DataPane onChange={markChanged} onDeleteClick={() => setShowDelete(true)} />}
            {pane === 'visibility' && <VisibilityPane onChange={markChanged} />}
            {pane === 'profile' && <EditProfilePane onChange={markChanged} />}
            {pane === 'profile-theme' && <ProfileThemePane onChange={markChanged} />}
            {pane === 'accessibility' && <AccessibilityPane onChange={markChanged} />}
            {pane === 'interests' && <InterestsPane onChange={markChanged} />}
            {pane === 'account' && <AccountPane onChange={markChanged} />}
            {pane === 'simulations' && <SimulationsPane />}
            {pane === 'delete' && <DeleteAccountSection />}
          </FadeIn>
        </main>
      </div>

      {dirty && (
        <div className={styles.saveBar}>
          <p>You have unsaved changes.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={styles.discard}
              onClick={() => {
                discardTheme()
                setDirty(false)
              }}
            >
              Discard
            </button>
            <button
              className={styles.saveBtn}
              onClick={() => {
                commitTheme()
                setDirty(false)
                showToast('Settings saved', 'success')
              }}
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            setShowDelete(false)
            showToast("Account deletion requested — you'll get a confirmation email within 24 hours", 'info')
          }}
        />
      )}
    </AppShell>
  )
}
