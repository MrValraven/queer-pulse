import { useMemo, useState } from 'react'
import { FiShield } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { TERMS } from './settings.data'
import { SIM_GROUPS, type SimFlow } from './simulations.data'
import { SimulationPreviewModal } from './SimulationPreviewModal'
import { DestructiveActionFlow } from './DestructiveActionFlow'
import { DESTRUCTIVE_FLOW } from './destructiveFlows.data'
import { DataCard, Pane, Section, SelectRow, ToggleList, ToggleRow } from './SettingsControls'
import {
  DataExportModal,
  EmailChangeModal,
  PasswordChangeModal,
  SuggestEditModal,
} from './SettingsModals'
import styles from './SettingsPage.module.css'

const ACCOUNT_EMAIL = 'sofia.andrade@email.com'

const VISIBILITY_OPTIONS = [
  { v: 'open', t: 'Open to connect', d: 'Anyone in the network can see your profile and say hello' },
  { v: 'network', t: 'Network only', d: 'Visible to people within two connections of you' },
  { v: 'private', t: 'Keep it quiet for now', d: "I'll reach out when I'm ready. Profile not visible in search." },
]

export function NotificationsPane({ onChange }: { onChange: () => void }) {
  return (
    <Pane title={<>Notification <em>preferences.</em></>} sub="Granular control over what reaches you and how. We'll never send you something you haven't asked for.">
      <Section label="Gatherings">
        <ToggleList>
          <ToggleRow title="New gathering announced" desc="When a gathering matching your interests is posted" defaultChecked onChange={onChange} />
          <ToggleRow title="RSVP reminder" desc="48 hours before a gathering you've said you're going to" defaultChecked onChange={onChange} />
          <ToggleRow title="Last few spots" desc="When a gathering you saved is almost full" onChange={onChange} />
        </ToggleList>
      </Section>
      <Section label="Messages & connections">
        <ToggleList>
          <ToggleRow title="New message" desc="When someone sends you a direct message" defaultChecked onChange={onChange} />
          <ToggleRow title="Connection request" desc="When someone asks to connect with you" defaultChecked onChange={onChange} />
          <ToggleRow title='"Say hello" received' desc="When someone waves at your profile" onChange={onChange} />
        </ToggleList>
      </Section>
      <Section label="Communities & board">
        <ToggleList>
          <ToggleRow title="New post in my communities" desc="Activity in communities you've joined" defaultChecked onChange={onChange} />
          <ToggleRow title="Reply to a thread I'm in" desc="When someone responds to a thread you've participated in" defaultChecked onChange={onChange} />
          <ToggleRow title="Weekly community digest" desc="A quiet summary of what's happening — one email, once a week" onChange={onChange} />
        </ToggleList>
      </Section>
      <Section label="Delivery">
        <SelectRow title="Email notifications" desc="How often to batch and send notifications by email" options={['Immediately', 'Daily digest', 'Weekly digest', 'Never']} defaultValue="Daily digest" onChange={onChange} />
        <SelectRow title="Quiet hours" desc="Don't send anything between these hours" options={['No quiet hours', '22:00 – 08:00', '21:00 – 09:00', '20:00 – 10:00']} defaultValue="22:00 – 08:00" onChange={onChange} />
      </Section>
      <Section label="Newsletters & email">
        <div className={styles.dataCards}>
          <DataCard title="Newsletter & email preferences" desc="Choose which newsletters and email streams you receive — magazine issues, event digests, community announcements, and more." btn="Manage" to={routes.newsletter} />
        </div>
      </Section>
    </Pane>
  )
}

export function LanguagePane({ onChange }: { onChange: () => void }) {
  const [termQuery, setTermQuery] = useState('')
  const [editTerm, setEditTerm] = useState<string | null>(null)
  const terms = useMemo(() => {
    const q = termQuery.trim().toLowerCase()
    if (!q) return TERMS
    return TERMS.filter((t) => t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q))
  }, [termQuery])

  return (
    <Pane title={<>Language &amp; <em>terminology.</em></>} sub="A living document, edited by the community. If a term feels incomplete or missing — suggest an edit. All changes are reviewed before going live.">
      <Section label="Platform language preference">
        <SelectRow title="Interface language" desc="The language QueerPulse uses for menus, labels, and system messages" options={['English', 'Português', 'Español', 'Français']} defaultValue="English" onChange={onChange} />
      </Section>
      <Section label="Community terminology guide">
        <input className={styles.termSearch} type="search" placeholder="Search terms…" value={termQuery} onChange={(e) => setTermQuery(e.target.value)} />
        <div className={styles.termList}>
          {terms.map((t) => (
            <div key={t.name} className={styles.termRow}>
              <div className={styles.termName}>{t.name}</div>
              <div className={styles.termDef}>{t.def}</div>
              <span className={styles.termEdit} onClick={() => setEditTerm(t.name)}>
                Suggest an edit →
              </span>
            </div>
          ))}
        </div>
      </Section>
      {editTerm && <SuggestEditModal term={editTerm} onClose={() => setEditTerm(null)} />}
    </Pane>
  )
}

type ExportKind = 'full' | 'messages'

const EXPORTS: Record<ExportKind, { title: string; filename: string; payload: Record<string, unknown> }> = {
  full: {
    title: 'Preparing your full export',
    filename: 'queerpulse-export.json',
    payload: {
      account: { name: 'Sofia Andrade', email: ACCOUNT_EMAIL, joined: '2024-03-11' },
      profile: { pronouns: 'she/her', city: 'Lisbon', interests: ['Film', 'Mutual aid', 'Reading'] },
      activity: { gatheringsAttended: 14, communitiesJoined: 6, posts: 38 },
      exportedAt: new Date().toISOString(),
    },
  },
  messages: {
    title: 'Preparing your messages',
    filename: 'queerpulse-messages.json',
    payload: {
      account: 'Sofia Andrade',
      threads: 12,
      messages: 487,
      note: 'Plain export of your full message history.',
      exportedAt: new Date().toISOString(),
    },
  },
}

export function DataPane({ onChange, onDeleteClick }: { onChange: () => void; onDeleteClick: () => void }) {
  const [exportKind, setExportKind] = useState<ExportKind | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  return (
    <Pane title={<>Data &amp; <em>privacy.</em></>} sub="Your data belongs to you. We collect the minimum needed to run the platform and never sell it. You can download or delete everything at any time.">
      <div className={styles.gdprBox}>
        <span className={styles.gIcon}><FiShield /></span>
        <p>
          <strong>GDPR compliant.</strong> QueerPulse is subject to EU data protection law and the Portuguese RGPD. Your rights include access, correction, portability, and deletion. This page is how you exercise them.
        </p>
      </div>
      <Section label="Your data">
        <div className={styles.dataCards}>
          <DataCard title="Download your data" desc="A full export of your profile, messages, community posts, and activity. Delivered as a JSON file within 48 hours." btn="Request export" onClick={() => setExportKind('full')} />
          <DataCard title="Download your messages" desc="Your full message history, exported as plain text." btn="Export messages" onClick={() => setExportKind('messages')} />
          <DataCard title="Correct inaccurate data" desc="If we hold data about you that is factually incorrect, you have the right to have it corrected." btn="Contact data team" to={routes.contact} />
        </div>
      </Section>
      <Section label="What we collect">
        <ToggleList>
          <ToggleRow title="Analytics & usage data" desc="Anonymous usage patterns to improve the platform. No individual tracking, no third-party ad networks." defaultChecked onChange={onChange} />
          <ToggleRow title="Search personalisation" desc="Use your interests and connections to improve suggested members and gatherings" defaultChecked onChange={onChange} />
          <ToggleRow title="Crash & error reporting" desc="Automatic error reports when something goes wrong. Helps us fix bugs faster." defaultChecked onChange={onChange} />
        </ToggleList>
      </Section>
      <Section label="Danger zone">
        <div className={styles.dataCards}>
          <div className={`${styles.dataCard} ${styles.dangerCard}`}>
            <div className={styles.dcText}>
              <div className={`${styles.dcTitle} ${styles.dangerTitle}`}>Deactivate account</div>
              <div className={styles.dcDesc}>Your profile becomes invisible and you stop receiving notifications. You can reactivate at any time by logging back in. Your data is retained.</div>
            </div>
            <Button variant="ghost" className={`${styles.dcBtn} ${styles.danger}`} onClick={() => setDeactivateOpen(true)}>
              Deactivate
            </Button>
          </div>
          <div className={`${styles.dataCard} ${styles.dangerCard}`}>
            <div className={styles.dcText}>
              <div className={`${styles.dcTitle} ${styles.dangerTitle}`}>Delete account permanently</div>
              <div className={styles.dcDesc}>Permanently deletes your profile, messages, and all associated data within 30 days. This cannot be undone.</div>
            </div>
            <Button variant="primary" className={`${styles.dcBtn} ${styles.danger}`} onClick={onDeleteClick}>
              Delete account
            </Button>
          </div>
        </div>
        <div className={styles.fineprint}>
          Under GDPR Article 17, you have the right to erasure. Deletion requests are processed within 30 days. Some data may be retained where we have a legal obligation to do so.
        </div>
      </Section>
      {exportKind && (
        <DataExportModal
          title={EXPORTS[exportKind].title}
          filename={EXPORTS[exportKind].filename}
          payload={EXPORTS[exportKind].payload}
          onClose={() => setExportKind(null)}
        />
      )}
      {deactivateOpen && (
        <DestructiveActionFlow
          content={DESTRUCTIVE_FLOW.deactivate}
          onClose={() => setDeactivateOpen(false)}
        />
      )}
    </Pane>
  )
}

export function SimulationsPane() {
  const [preview, setPreview] = useState<SimFlow | null>(null)
  return (
    <Pane
      title={<>Flow <em>simulations.</em></>}
      sub="Preview key member journeys end to end. State screens open in a device-frame preview right here; richer flows launch the real screens so you can walk through them exactly as someone else would."
    >
      {SIM_GROUPS.map((g) => (
        <Section key={g.label} label={g.label}>
          <div className={styles.dataCards}>
            {g.flows.map((f) =>
              f.preview ? (
                <DataCard key={f.title} title={f.title} desc={f.desc} btn="Preview" onClick={() => setPreview(f)} />
              ) : (
                <DataCard key={f.title} title={f.title} desc={f.desc} btn="Start simulation" to={f.to} />
              ),
            )}
          </div>
        </Section>
      ))}
      {preview && <SimulationPreviewModal flow={preview} onClose={() => setPreview(null)} />}
    </Pane>
  )
}

export function VisibilityPane({ onChange }: { onChange: () => void }) {
  return (
    <Pane title={<>Profile <em>visibility.</em></>} sub="Control who can find and reach you. You can change this at any time with no questions asked.">
      <Section label="Who can see your profile">
        <div className={styles.toggleList}>
          {VISIBILITY_OPTIONS.map((o, i) => (
            <label key={o.v} className={styles.radioRow}>
              <input type="radio" name="vis" defaultChecked={i === 0} onChange={onChange} />
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
          <ToggleRow title='Show me in "New arrivals"' desc="Let the community know you've recently joined" defaultChecked onChange={onChange} />
          <ToggleRow title="Appear in suggested connections" desc="Allow the platform to suggest you to members with shared interests" defaultChecked onChange={onChange} />
          <ToggleRow title="Show activity status" desc="Let people see when you were last active (approximate)" onChange={onChange} />
        </ToggleList>
      </Section>
    </Pane>
  )
}

export function AccountPane({ onChange }: { onChange: () => void }) {
  const [emailOpen, setEmailOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  return (
    <Pane title={<>Account <em>settings.</em></>} sub="Email, password, and login preferences.">
      <Section label="Login">
        <DataCard title="Email address" desc={ACCOUNT_EMAIL} btn="Change" onClick={() => setEmailOpen(true)} />
        <DataCard title="Password" desc="Last changed 3 months ago" btn="Change" onClick={() => setPwOpen(true)} />
      </Section>
      {emailOpen && <EmailChangeModal currentEmail={ACCOUNT_EMAIL} onClose={() => setEmailOpen(false)} />}
      {pwOpen && <PasswordChangeModal onClose={() => setPwOpen(false)} />}
      <Section label="Security">
        <ToggleList>
          <ToggleRow title="Two-factor authentication" desc="Adds a second step when logging in from a new device" onChange={onChange} />
          <ToggleRow title="Login alerts" desc="Email me when my account is accessed from a new device" defaultChecked onChange={onChange} />
        </ToggleList>
      </Section>
    </Pane>
  )
}
