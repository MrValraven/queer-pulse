import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { AdminDrawer, AdminAvatar, AdminChip } from './ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { VouchGraphPreview } from './VouchGraphPreview'
import { AdminVouchGraphModal } from './AdminVouchGraphModal'
import { personIdByInitials } from './adminVouchGraph.data'
import { ModerationTimeline, SealedIdentity } from './AdminMemberDrawerSections'
import { MessageModal, RestrictModal } from './AdminMemberModals'
import { portrait } from './adminPeople.data'
import { detailFor, type AdminMember } from './adminMembers.data'
import styles from './AdminMembersPage.module.css'

interface Props {
  member: AdminMember
  onClose: () => void
}

const firstName = (full: string) => full.split(' ')[0]

export function AdminMemberDrawer({ member, onClose }: Props) {
  const { showToast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [modal, setModal] = useState<'message' | 'restrict' | 'network' | null>(null)
  const detail = detailFor(member)
  const first = firstName(member.name)
  const focusId = personIdByInitials(member.initials)

  return (
    <>{/* drawer + its modals */}
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
            src={portrait(member.name)}
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
            <Button variant="ghost" size="md" onClick={() => setModal('message')}>
              Message
            </Button>
            <Button variant="ghost" size="md" onClick={() => setModal('restrict')}>
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
        <h3 className={styles.dHeading}>Vouch graph — who trusts them</h3>
        <div
          className={styles.graphWrap}
          role="button"
          tabIndex={0}
          aria-label="Open the full trust network"
          title="Open the full trust network"
          onClick={() => setModal('network')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setModal('network')
            }
          }}
        >
          <VouchGraphPreview focusId={focusId} />
        </div>
        <div className={styles.graphNoteRow}>
          <p className={styles.dHint}>{detail.graphNote}</p>
          <Button variant="ghost" size="md" onClick={() => setModal('network')}>
            Explore network →
          </Button>
        </div>
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

      <ModerationTimeline entries={detail.moderationTimeline} />

      <SealedIdentity />
    </AdminDrawer>

    {modal === 'network' && (
      <AdminVouchGraphModal focusId={focusId} onClose={() => setModal(null)} />
    )}

    {modal === 'message' && (
      <MessageModal
        name={member.name}
        onClose={() => setModal(null)}
        onSend={() => {
          setModal(null)
          showToast('Message sent', 'success')
        }}
      />
    )}

    {modal === 'restrict' && (
      <RestrictModal
        name={member.name}
        onClose={() => setModal(null)}
        onMissingReason={() =>
          showToast(`A reason is required — ${first} will see it`, 'error')
        }
        onApply={(dur, scope) => {
          setModal(null)
          onClose()
          showToast(`Restricted · ${dur} · ${scope} — ${first} notified`, 'success', undefined, {
            label: 'Undo',
            onClick: () => showToast('Restriction reversed.', 'info'),
          })
        }}
      />
    )}
    </>
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
