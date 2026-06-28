import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Avatar, Button, EmptyState, FadeIn } from '../../shared/components/ui'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { useToast } from '../../shared/components/feedback/useToast'
import type { ToastType } from '../../shared/components/feedback/toastContext'
import { MEMBERS, VERIFICATION_QUEUE, type AdminMember, type MemberStatus, type MemberRole, type Tier } from './adminMembers.data'
import { AdminMemberDrawer } from './AdminMemberDrawer'
import { AdminVouchGraph } from './AdminVouchGraph'
import styles from './AdminMembersPage.module.css'

const TABS = [
  ['directory', 'Directory'],
  ['verification', 'Verification queue'],
  ['network', 'Vouch network'],
] as const

type TabId = (typeof TABS)[number][0]

function isValidTab(t: string | null): t is TabId {
  return TABS.some(([id]) => id === t)
}

export function AdminMembersPage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const [tab, setTab] = useState<TabId>(isValidTab(initialTab) ? initialTab : 'directory')
  const [selected, setSelected] = useState<AdminMember | null>(null)
  const { showToast } = useToast()

  function handleAction(memberId: string, label: string) {
    showToast(`${label} action recorded for member ${memberId}.`, 'success')
    setSelected(null)
  }

  return (
    <AdminShell title={<>Members</>}>
      <div className={styles.tabs}>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'directory' && (
        <DirectoryTab onSelect={setSelected} />
      )}
      {tab === 'verification' && (
        <VerificationTab showToast={showToast} />
      )}
      {tab === 'network' && (
        <AdminVouchGraph
          onSelectMember={(id) => setSelected(MEMBERS.find((m) => m.id === id) ?? null)}
        />
      )}

      {selected && (
        <AdminMemberDrawer
          member={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </AdminShell>
  )
}

function DirectoryTab({ onSelect }: { onSelect: (m: AdminMember) => void }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | ''>('')
  const [roleFilter, setRoleFilter] = useState<MemberRole | ''>('')
  const [tierFilter, setTierFilter] = useState<Tier | ''>('')

  const filtered = MEMBERS.filter((m) => {
    const q = search.toLowerCase()
    if (q && !m.name.toLowerCase().includes(q)) return false
    if (statusFilter && m.status !== statusFilter) return false
    if (roleFilter && m.role !== roleFilter) return false
    if (tierFilter && m.tier !== tierFilter) return false
    return true
  })

  const statusClass = (s: AdminMember['status']) =>
    s === 'active' ? styles.stActive : s === 'suspended' ? styles.stSuspended : styles.stBanned

  return (
    <>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search members"
        />
        <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MemberStatus | '')}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <select className={styles.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as MemberRole | '')}>
          <option value="">All roles</option>
          <option value="founder">Founder</option>
          <option value="staff">Staff</option>
          <option value="mod">Mod</option>
          <option value="member">Member</option>
        </select>
        <select className={styles.select} value={tierFilter} onChange={(e) => setTierFilter(e.target.value as Tier | '')}>
          <option value="">All tiers</option>
          <option value="sustainer">Sustainer</option>
          <option value="solidarity">Solidarity</option>
          <option value="standard">Standard</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No members found" description="Try adjusting your search or filters." />
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span>Tier</span>
            <span>Vouches</span>
            <span>Last seen</span>
          </div>
          {filtered.map((m, i) => (
            <FadeIn key={m.id} delay={Math.min(i, 8) * 40}>
              <div
                className={styles.row}
                onClick={() => onSelect(m)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(m) }}
                aria-label={`View ${m.name}`}
              >
                <div className={styles.cell}>
                  <Avatar initials={m.initials} tint={m.tint} size={32} alt={m.name} />
                  <span className={styles.memberName}>{m.name}</span>
                </div>
                <div className={styles.cell}><span className={`${styles.badge} ${styles.roleBadge}`}>{m.role}</span></div>
                <div className={styles.cell}><span className={`${styles.badge} ${statusClass(m.status)}`}>{m.status}</span></div>
                <div className={styles.cell}><span style={{ fontSize: 13, color: 'var(--ink-60)' }}>{m.tier}</span></div>
                <div className={styles.cell}><span style={{ fontSize: 13 }}>{m.vouches}</span></div>
                <div className={styles.cell}><span style={{ fontSize: 13, color: 'var(--ink-60)' }}>{m.lastSeen}</span></div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </>
  )
}

function VerificationTab({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [queue, setQueue] = useState(VERIFICATION_QUEUE)

  function remove(id: string) {
    setQueue((q) => q.filter((v) => v.id !== id))
  }

  if (queue.length === 0) {
    return <EmptyState title="All caught up" description="No pending identity verifications." />
  }

  return (
    <div className={styles.vGrid}>
      {queue.map((v, i) => (
        <FadeIn key={v.id} delay={i * 60}>
          <div className={styles.vCard}>
            <div className={styles.vCardHead}>
              <Avatar initials={v.initials} tint={v.tint} size={40} alt={v.name} />
              <div>
                <div className={styles.vCardName}>{v.name}</div>
                <div className={styles.vCardMeta}>{v.docType} · waiting {v.waiting} · {v.vouches} vouch{v.vouches !== 1 ? 'es' : ''}</div>
              </div>
            </div>
            <div className={styles.vCardActions}>
              <Button variant="jade" size="md" onClick={() => { showToast(`${v.name} identity verified.`, 'success'); remove(v.id) }}>Verify</Button>
              <Button variant="ghost" size="md" onClick={() => { showToast(`More info requested from ${v.name}.`); remove(v.id) }}>Request more info</Button>
              <Button variant="ghost" size="md" onClick={() => { showToast(`Verification declined for ${v.name}.`); remove(v.id) }}>Decline</Button>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  )
}
