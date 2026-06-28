import { FiX, FiClock, FiShield } from 'react-icons/fi'
import { Avatar, Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import type { AdminMember } from './adminMembers.data'
import styles from './AdminMembersPage.module.css'

interface Props {
  member: AdminMember
  onClose: () => void
  onAction: (memberId: string, label: string) => void
}

export function AdminMemberDrawer({ member, onClose, onAction }: Props) {
  useScrollLock()

  function act(label: string) {
    onAction(member.id, label)
  }

  const statusClass =
    member.status === 'active'
      ? styles.stActive
      : member.status === 'suspended'
        ? styles.stSuspended
        : styles.stBanned

  return (
    <>
      <div
        className={`${styles.scrim} ${styles.scrimOpen}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`${styles.drawer} ${styles.drawerOpen}`} aria-label="Member details">
        <DrawerHeader member={member} statusClass={statusClass} onClose={onClose} />
        <div className={styles.drawerBody}>
          {member.bio && <p className={styles.drawerBio}>{member.bio}</p>}

          <VouchHistory vouchedBy={member.vouchedBy} vouches={member.vouches} />
          <ModHistorySection history={member.modHistory} />

          <section>
            <h3 className={styles.drawerHeading}>Quick actions</h3>
            <div className={styles.drawerActions}>
              <Button variant="ghost" size="md" onClick={() => act('Suspend')}>Suspend</Button>
              <Button variant="ghost" size="md" onClick={() => act('Ban')}>Ban</Button>
              <Button variant="ghost" size="md" onClick={() => act('Remove from vouch chain')}>Remove from vouch chain</Button>
              <Button variant="ghost" size="md" onClick={() => act('Verify identity')}>Verify identity</Button>
              <Button variant="ghost" size="md" onClick={() => act('Send warning')}>Send warning</Button>
            </div>
          </section>

          <Button variant="primary" size="md" to={`/profile/${member.id}`}>
            View public profile
          </Button>
        </div>
      </aside>
    </>
  )
}

function DrawerHeader({ member, statusClass, onClose }: {
  member: AdminMember
  statusClass: string
  onClose: () => void
}) {
  return (
    <header style={{ padding: '18px 22px', borderBottom: '1px solid rgba(45,27,61,.09)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials={member.initials} tint={member.tint} size={48} alt={member.name} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{member.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <span className={`${styles.badge} ${styles.roleBadge}`}>{member.role}</span>
              <span className={`${styles.badge} ${statusClass}`}>{member.status}</span>
              <span className={`${styles.badge} ${styles.roleBadge}`}>{member.tier}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close member drawer"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <FiX size={20} aria-hidden />
        </button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-60)', display: 'flex', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FiClock size={12} aria-hidden /> Joined {member.joined}
        </span>
        <span>Last seen {member.lastSeen}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FiShield size={12} aria-hidden /> {member.vouches} vouches
        </span>
      </div>
    </header>
  )
}

function VouchHistory({ vouchedBy, vouches }: { vouchedBy: AdminMember['vouchedBy']; vouches: number }) {
  if (vouches === 0) {
    return (
      <section>
        <h3 className={styles.drawerHeading}>Vouch history</h3>
        <p className={styles.drawerEmpty}>No vouches yet.</p>
      </section>
    )
  }
  return (
    <section>
      <h3 className={styles.drawerHeading}>Vouch history</h3>
      <ul className={styles.drawerList}>
        {vouchedBy.map((v) => (
          <li key={v.name} className={styles.drawerRow}>
            <span>{v.name}</span>
            <span className={styles.drawerRowMeta}>{v.when}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ModHistorySection({ history }: { history: AdminMember['modHistory'] }) {
  if (history.length === 0) return null
  return (
    <section>
      <h3 className={styles.drawerHeading}>Moderation history</h3>
      <ul className={`${styles.drawerList} ${styles.modList}`}>
        {history.map((h) => (
          <li key={`${h.date}-${h.action}`} className={styles.modItem}>
            <div className={styles.modItemTitle}>
              {h.action} <span className={styles.modItemDate}>· {h.date}</span>
            </div>
            <div className={styles.modItemNote}>{h.note}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
