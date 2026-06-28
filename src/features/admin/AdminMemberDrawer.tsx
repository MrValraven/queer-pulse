import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { AdminDrawer, AdminAvatar, AdminChip } from './ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AdminVouchGraph } from './AdminVouchGraph'
import { detailFor, type AdminMember } from './adminMembers.data'
import styles from './AdminMembersPage.module.css'

interface Props {
  member: AdminMember
  onClose: () => void
}

export function AdminMemberDrawer({ member, onClose }: Props) {
  const { showToast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const detail = detailFor(member)

  return (
    <AdminDrawer
      label={`${member.name} — member detail`}
      onClose={onClose}
      head={
        <div className={styles.dHead}>
          <AdminAvatar
            initials={member.initials}
            tone={member.tone}
            size="lg"
            verified={member.verified}
          />
          <div>
            <h2 className={styles.dName}>{member.name}</h2>
            <div className={styles.dChips}>
              <AdminChip tone="plum">{member.pronoun}</AdminChip>
              <AdminChip tone={member.verified ? 'jade' : member.statusTone} dot>
                {member.verified ? 'Verified member' : member.statusLabel}
              </AdminChip>
            </div>
          </div>
        </div>
      }
      foot={
        confirming ? (
          <RemovePanel
            body={detail.removeBody}
            onKeep={() => setConfirming(false)}
            onContinue={() => showToast('A reason is required before removal', 'error')}
          />
        ) : (
          <div className={styles.dFoot}>
            <Button variant="jade" size="md" onClick={() => showToast(`${member.name} is verified.`, 'success')}>
              Verify
            </Button>
            <Button variant="ghost" size="md" onClick={() => showToast(`Message sent to ${member.name}.`, 'info')}>
              Message
            </Button>
            <Button variant="ghost" size="md" onClick={() => showToast(`${member.name}'s access is limited.`, 'info')}>
              Restrict…
            </Button>
            <Button variant="danger" size="md" onClick={() => setConfirming(true)}>
              Remove member…
            </Button>
          </div>
        )
      }
    >
      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>At a glance</h3>
        <div className={styles.glanceGrid}>
          {detail.glance.map((s) => (
            <div key={s.label} className={styles.glanceStat}>
              <div className={styles.glanceValue}>{s.value}</div>
              <div className={styles.glanceLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>Vouch network</h3>
        <div className={styles.graphWrap}>
          <AdminVouchGraph center={detail.graph.center} nodes={detail.graph.nodes} />
        </div>
        <p className={styles.dHint}>{detail.graphNote}</p>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>Communities</h3>
        <div className={styles.commChips}>
          {detail.communities.map((c) => (
            <AdminChip key={c.label} tone={c.tone}>
              {c.label}
            </AdminChip>
          ))}
        </div>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>Contribution history</h3>
        <ul className={styles.contribList}>
          {detail.contributions.map((c, i) => (
            <li key={i} className={styles.contribItem}>
              <span>{c.what}</span>
              <span className={styles.contribWhen}>{c.when}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>Reports involving this member</h3>
        <p className={styles.reportsNote}>{detail.reportsNote}</p>
      </section>
    </AdminDrawer>
  )
}

function RemovePanel({
  body,
  onKeep,
  onContinue,
}: {
  body: string
  onKeep: () => void
  onContinue: () => void
}) {
  return (
    <div className={styles.removePanel}>
      <p className={styles.removeTitle}>Removing a member is permanent.</p>
      <p className={styles.removeText}>{body}</p>
      <div className={styles.removeActions}>
        <Button variant="ghost" size="md" onClick={onKeep}>
          Keep member
        </Button>
        <Button variant="danger" size="md" onClick={onContinue}>
          I understand — continue
        </Button>
      </div>
    </div>
  )
}
