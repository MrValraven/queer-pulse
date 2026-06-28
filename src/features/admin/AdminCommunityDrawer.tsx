import { FiX } from 'react-icons/fi'
import { Avatar, Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { adminCommunityMod } from '../../app/routeMap'
import type { CommunityHealth } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

interface Props {
  community: CommunityHealth
  onClose: () => void
}

export function AdminCommunityDrawer({ community, onClose }: Props) {
  useScrollLock()

  return (
    <>
      <div
        className={`${styles.scrim} ${styles.scrimOpen}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`${styles.drawer} ${styles.drawerOpen}`} aria-label="Community details">
        <DrawerHeader community={community} onClose={onClose} />
        <div className={styles.drawerBody}>
          <FactorsSection factors={community.factors} />
          <ModRoster mods={community.mods_roster} />
          <EscalationsSection escalations={community.escalations} />
          <Button variant="primary" size="md" to={adminCommunityMod(community.slug)}>
            Open mod panel
          </Button>
        </div>
      </aside>
    </>
  )
}

function DrawerHeader({ community, onClose }: { community: CommunityHealth; onClose: () => void }) {
  return (
    <header className={styles.drawerHeader}>
      <div className={styles.drawerHeaderRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials={community.initials} tint={community.tint as never} size={44} alt={community.name} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{community.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-60)', marginTop: 2 }}>
              {community.kind} · {community.members} members · {community.mods} mods
            </div>
          </div>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close community drawer"
        >
          <FiX size={20} aria-hidden />
        </button>
      </div>
    </header>
  )
}

function FactorsSection({ factors }: { factors: CommunityHealth['factors'] }) {
  return (
    <section className={styles.drawerSection}>
      <h3 className={styles.drawerHeading}>Health factors</h3>
      {factors.map((f) => (
        <div key={`${f.label}-${f.status}`} className={styles.factor}>
          <span
            className={`${styles.dot} ${f.status === 'good' ? styles.dotGood : f.status === 'warn' ? styles.dotWarn : styles.dotBad}`}
          />
          <div>
            <span className={styles.factorLabel}>{f.label}</span>
            <span className={styles.factorDetail}>{f.detail}</span>
          </div>
        </div>
      ))}
    </section>
  )
}

function ModRoster({ mods }: { mods: CommunityHealth['mods_roster'] }) {
  return (
    <section className={styles.drawerSection}>
      <h3 className={styles.drawerHeading}>Moderators</h3>
      {mods.map((m) => (
        <div key={`${m.name}-${m.role}`} className={styles.modRow}>
          <Avatar initials={m.initials} tint={m.tint as never} size={30} alt={m.name} />
          <span className={styles.modName}>{m.name}</span>
          <span className={styles.modRole}>{m.role}</span>
        </div>
      ))}
    </section>
  )
}

function EscalationsSection({ escalations }: { escalations: CommunityHealth['escalations'] }) {
  return (
    <section className={styles.drawerSection}>
      <h3 className={styles.drawerHeading}>Recent escalations</h3>
      {escalations.length === 0 ? (
        <p className={styles.emptyNote}>No recent escalations.</p>
      ) : (
        escalations.map((e) => (
          <div key={`${e.time}-${e.text.slice(0, 20)}`} className={styles.escalation}>
            <span>{e.text}</span>
            <span className={styles.escalationTime}>{e.time}</span>
          </div>
        ))
      )}
    </section>
  )
}
