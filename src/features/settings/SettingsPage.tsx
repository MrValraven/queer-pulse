import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useScrollLock } from '../../shared/hooks'
import { AppShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './SettingsPage.module.css'

type PaneId = 'notifications' | 'language' | 'data' | 'visibility' | 'profile' | 'account'

const NAV: { group: string; items: { id: PaneId; icon: string; label: string }[] }[] = [
  {
    group: 'Preferences',
    items: [
      { id: 'notifications', icon: '🔔', label: 'Notifications' },
      { id: 'language', icon: '💬', label: 'Language & terminology' },
    ],
  },
  {
    group: 'Privacy & data',
    items: [
      { id: 'data', icon: '🔒', label: 'Data & privacy' },
      { id: 'visibility', icon: '👁', label: 'Visibility' },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'profile', icon: '✏️', label: 'Profile' },
      { id: 'account', icon: '⚙️', label: 'Account' },
    ],
  },
]

const TERMS = [
  { name: 'Queer', def: "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; usage varies — some older members may prefer not to use it." },
  { name: 'Cisgender', def: 'Describes someone whose gender identity matches the sex they were assigned at birth. Not a value judgement — simply a neutral descriptor.' },
  { name: 'Non-binary', def: 'A gender identity that sits outside the man/woman binary. Some non-binary people use they/them; always ask rather than assume.' },
  { name: 'Two-spirit', def: 'A term used by some Indigenous North American cultures for a person embodying both masculine and feminine spirits. Not interchangeable with Western LGBTQ+ terms.' },
]

export function SettingsPage() {
  const { showToast } = useToast()
  const [pane, setPane] = useState<PaneId>('notifications')
  const [dirty, setDirty] = useState(false)
  const [termQuery, setTermQuery] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  useScrollLock(showDelete)

  const markChanged = () => setDirty(true)

  const terms = useMemo(() => {
    const q = termQuery.trim().toLowerCase()
    if (!q) return TERMS
    return TERMS.filter((t) => t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q))
  }, [termQuery])

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
                  className={[styles.navItem, pane === item.id && styles.navItemActive].filter(Boolean).join(' ')}
                  onClick={() => setPane(item.id)}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.main}>
          {pane === 'notifications' && (
            <Pane title={<>Notification <em>preferences.</em></>} sub="Granular control over what reaches you and how. We'll never send you something you haven't asked for.">
              <Section label="Gatherings">
                <ToggleList>
                  <ToggleRow title="New gathering announced" desc="When a gathering matching your interests is posted" defaultChecked onChange={markChanged} />
                  <ToggleRow title="RSVP reminder" desc="48 hours before a gathering you've said you're going to" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Last few spots" desc="When a gathering you saved is almost full" onChange={markChanged} />
                </ToggleList>
              </Section>
              <Section label="Messages & connections">
                <ToggleList>
                  <ToggleRow title="New message" desc="When someone sends you a direct message" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Connection request" desc="When someone asks to connect with you" defaultChecked onChange={markChanged} />
                  <ToggleRow title='"Say hello" received' desc="When someone waves at your profile" onChange={markChanged} />
                </ToggleList>
              </Section>
              <Section label="Communities & board">
                <ToggleList>
                  <ToggleRow title="New post in my communities" desc="Activity in communities you've joined" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Reply to a thread I'm in" desc="When someone responds to a thread you've participated in" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Weekly community digest" desc="A quiet summary of what's happening — one email, once a week" onChange={markChanged} />
                </ToggleList>
              </Section>
              <Section label="Delivery">
                <SelectRow title="Email notifications" desc="How often to batch and send notifications by email" options={['Immediately', 'Daily digest', 'Weekly digest', 'Never']} defaultValue="Daily digest" onChange={markChanged} />
                <SelectRow title="Quiet hours" desc="Don't send anything between these hours" options={['No quiet hours', '22:00 – 08:00', '21:00 – 09:00', '20:00 – 10:00']} defaultValue="22:00 – 08:00" onChange={markChanged} />
              </Section>
            </Pane>
          )}

          {pane === 'language' && (
            <Pane title={<>Language &amp; <em>terminology.</em></>} sub="A living document, edited by the community. If a term feels incomplete or missing — suggest an edit. All changes are reviewed before going live.">
              <Section label="Platform language preference">
                <SelectRow title="Interface language" desc="The language QueerPulse uses for menus, labels, and system messages" options={['English', 'Português', 'Español', 'Français']} defaultValue="English" onChange={markChanged} />
              </Section>
              <Section label="Community terminology guide">
                <input className={styles.termSearch} type="search" placeholder="Search terms…" value={termQuery} onChange={(e) => setTermQuery(e.target.value)} />
                <div className={styles.termList}>
                  {terms.map((t) => (
                    <div key={t.name} className={styles.termRow}>
                      <div className={styles.termName}>{t.name}</div>
                      <div className={styles.termDef}>{t.def}</div>
                      <span className={styles.termEdit} onClick={() => showToast('Suggest-an-edit form coming soon', 'info')}>
                        Suggest an edit →
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            </Pane>
          )}

          {pane === 'data' && (
            <Pane title={<>Data &amp; <em>privacy.</em></>} sub="Your data belongs to you. We collect the minimum needed to run the platform and never sell it. You can download or delete everything at any time.">
              <div className={styles.gdprBox}>
                <span className={styles.gIcon}>🇪🇺</span>
                <p>
                  <strong>GDPR compliant.</strong> QueerPulse is subject to EU data protection law and the Portuguese RGPD. Your rights include access, correction, portability, and deletion. This page is how you exercise them.
                </p>
              </div>
              <Section label="Your data">
                <div className={styles.dataCards}>
                  <DataCard title="Download your data" desc="A full export of your profile, messages, community posts, and activity. Delivered as a JSON file within 48 hours." btn="Request export" onClick={() => showToast("Export requested — we'll email you within 48 hours", 'success')} />
                  <DataCard title="Download your messages" desc="Your full message history, exported as plain text." btn="Export messages" onClick={() => showToast('Message export requested', 'success')} />
                  <DataCard title="Correct inaccurate data" desc="If we hold data about you that is factually incorrect, you have the right to have it corrected." btn="Contact data team" to="/contact" />
                </div>
              </Section>
              <Section label="What we collect">
                <ToggleList>
                  <ToggleRow title="Analytics & usage data" desc="Anonymous usage patterns to improve the platform. No individual tracking, no third-party ad networks." defaultChecked onChange={markChanged} />
                  <ToggleRow title="Search personalisation" desc="Use your interests and connections to improve suggested members and gatherings" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Crash & error reporting" desc="Automatic error reports when something goes wrong. Helps us fix bugs faster." defaultChecked onChange={markChanged} />
                </ToggleList>
              </Section>
              <Section label="Danger zone">
                <div className={styles.dataCards}>
                  <div className={`${styles.dataCard} ${styles.dangerCard}`}>
                    <div className={styles.dcText}>
                      <div className={`${styles.dcTitle} ${styles.dangerTitle}`}>Deactivate account</div>
                      <div className={styles.dcDesc}>Your profile becomes invisible and you stop receiving notifications. You can reactivate at any time by logging back in. Your data is retained.</div>
                    </div>
                    <button className={`${styles.dcBtn} ${styles.danger}`} onClick={() => showToast('Account deactivated — log back in any time to reactivate', 'info')}>
                      Deactivate
                    </button>
                  </div>
                  <div className={`${styles.dataCard} ${styles.dangerCard}`}>
                    <div className={styles.dcText}>
                      <div className={`${styles.dcTitle} ${styles.dangerTitle}`}>Delete account permanently</div>
                      <div className={styles.dcDesc}>Permanently deletes your profile, messages, and all associated data within 30 days. This cannot be undone.</div>
                    </div>
                    <button className={`${styles.dcBtn} ${styles.danger}`} onClick={() => setShowDelete(true)}>
                      Delete account
                    </button>
                  </div>
                </div>
                <div className={styles.fineprint}>
                  Under GDPR Article 17, you have the right to erasure. Deletion requests are processed within 30 days. Some data may be retained where we have a legal obligation to do so.
                </div>
              </Section>
            </Pane>
          )}

          {pane === 'visibility' && (
            <Pane title={<>Profile <em>visibility.</em></>} sub="Control who can find and reach you. You can change this at any time with no questions asked.">
              <Section label="Who can see your profile">
                <div className={styles.toggleList}>
                  {[
                    { v: 'open', t: 'Open to connect', d: 'Anyone in the network can see your profile and say hello' },
                    { v: 'network', t: 'Network only', d: 'Visible to people within two connections of you' },
                    { v: 'private', t: 'Keep it quiet for now', d: "I'll reach out when I'm ready. Profile not visible in search." },
                  ].map((o, i) => (
                    <label key={o.v} className={styles.radioRow}>
                      <input type="radio" name="vis" defaultChecked={i === 0} onChange={markChanged} />
                      <div>
                        <div className={styles.toggleTitle}>{o.t}</div>
                        <div className={styles.toggleDesc}>{o.d}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Section>
              <Section label="Additional controls">
                <ToggleList>
                  <ToggleRow title='Show me in "New arrivals"' desc="Let the community know you've recently joined" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Appear in suggested connections" desc="Allow the platform to suggest you to members with shared interests" defaultChecked onChange={markChanged} />
                  <ToggleRow title="Show activity status" desc="Let people see when you were last active (approximate)" onChange={markChanged} />
                </ToggleList>
              </Section>
            </Pane>
          )}

          {pane === 'profile' && (
            <Pane title={<>Profile <em>settings.</em></>} sub="Edit your name, pronouns, bio, and photo.">
              <Section label="Basic information">
                <div className={styles.fields}>
                  <div className={styles.fieldRow2}>
                    <input className={styles.input} type="text" defaultValue="Sofia Andrade" onChange={markChanged} />
                    <input className={styles.input} type="text" defaultValue="she / her" onChange={markChanged} />
                  </div>
                  <input className={styles.input} type="text" defaultValue="Documentary Filmmaker · Alfama" onChange={markChanged} />
                  <textarea className={`${styles.input} ${styles.textarea}`} onChange={markChanged} defaultValue="Making films about queer histories and public space in Lisbon. Alfama local since 2019. Always happy to introduce people around." />
                </div>
              </Section>
              <Link to="/profile" className={styles.dcBtn}>
                View my full profile →
              </Link>
            </Pane>
          )}

          {pane === 'account' && (
            <Pane title={<>Account <em>settings.</em></>} sub="Email, password, and login preferences.">
              <Section label="Login">
                <DataCard title="Email address" desc="sofia.andrade@email.com" btn="Change" onClick={() => showToast('Check your inbox to confirm the change', 'info')} />
                <DataCard title="Password" desc="Last changed 3 months ago" btn="Change" onClick={() => showToast('Password reset link sent', 'info')} />
              </Section>
              <Section label="Security">
                <ToggleList>
                  <ToggleRow title="Two-factor authentication" desc="Adds a second step when logging in from a new device" onChange={markChanged} />
                  <ToggleRow title="Login alerts" desc="Email me when my account is accessed from a new device" defaultChecked onChange={markChanged} />
                </ToggleList>
              </Section>
            </Pane>
          )}
        </main>
      </div>

      {dirty && (
        <div className={styles.saveBar}>
          <p>You have unsaved changes.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={styles.discard} onClick={() => setDirty(false)}>
              Discard
            </button>
            <button
              className={styles.saveBtn}
              onClick={() => {
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
        <div className={styles.overlay} onClick={() => setShowDelete(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete your account?</h3>
            <p>
              This will permanently delete your profile, messages, community posts, and all
              associated data within 30 days. It cannot be undone. We recommend downloading your
              data first.
            </p>
            <div className={styles.modalBtns}>
              <button className={styles.dcBtn} onClick={() => setShowDelete(false)}>
                Cancel
              </button>
              <button
                className={`${styles.dcBtn} ${styles.danger}`}
                onClick={() => {
                  setShowDelete(false)
                  showToast("Account deletion requested — you'll get a confirmation email within 24 hours", 'info')
                }}
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

/* ── Small building blocks ── */

function Pane({ title, sub, children }: { title: ReactNode; sub: string; children: ReactNode }) {
  return (
    <div>
      <h1 className={styles.paneTitle}>{title}</h1>
      <p className={styles.paneSub}>{sub}</p>
      {children}
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>{label}</div>
      {children}
    </div>
  )
}

function ToggleList({ children }: { children: ReactNode }) {
  return <div className={styles.toggleList}>{children}</div>
}

function ToggleRow({
  title,
  desc,
  defaultChecked,
  onChange,
}: {
  title: string
  desc: string
  defaultChecked?: boolean
  onChange: () => void
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleDesc}>{desc}</div>
      </div>
      <label className={styles.switch}>
        <input type="checkbox" defaultChecked={defaultChecked} onChange={onChange} />
        <span className={styles.track} />
        <span className={styles.thumb} />
      </label>
    </div>
  )
}

function SelectRow({
  title,
  desc,
  options,
  defaultValue,
  onChange,
}: {
  title: string
  desc: string
  options: string[]
  defaultValue: string
  onChange: () => void
}) {
  return (
    <div className={styles.selectRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleDesc}>{desc}</div>
      </div>
      <select className={styles.select} defaultValue={defaultValue} onChange={onChange}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function DataCard({
  title,
  desc,
  btn,
  onClick,
  to,
}: {
  title: string
  desc: string
  btn: string
  onClick?: () => void
  to?: string
}) {
  return (
    <div className={styles.dataCard}>
      <div className={styles.dcText}>
        <div className={styles.dcTitle}>{title}</div>
        <div className={styles.dcDesc}>{desc}</div>
      </div>
      {to ? (
        <Link to={to} className={styles.dcBtn}>
          {btn}
        </Link>
      ) : (
        <button className={styles.dcBtn} onClick={onClick}>
          {btn}
        </button>
      )}
    </div>
  )
}
