import { useState } from 'react'
import { Button, FadeIn } from '../../shared/components/ui'
import { AdminAvatar, AdminChip } from './ui'
import { portrait } from './adminPeople.data'
import { useToast } from '../../shared/components/feedback/useToast'
import { VerifyModal } from './AdminMemberModals'
import { VERIFY_QUEUE, type VerifyQueueItem } from './adminMembers.data'
import styles from './AdminMembersPage.module.css'

export function AdminVerifyQueue() {
  const { showToast } = useToast()
  const [queue, setQueue] = useState(VERIFY_QUEUE)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const [reviewing, setReviewing] = useState<VerifyQueueItem | null>(null)

  function welcomeIn(item: VerifyQueueItem) {
    setReviewing(null)
    setLeaving((s) => new Set(s).add(item.id))
    window.setTimeout(() => {
      setQueue((q) => q.filter((v) => v.id !== item.id))
    }, 320)
    showToast(`${item.name} was welcomed in`, 'success', undefined, {
      label: 'Undo',
      onClick: () => {
        setLeaving((s) => {
          const next = new Set(s)
          next.delete(item.id)
          return next
        })
        setQueue((q) => (q.some((v) => v.id === item.id) ? q : [item, ...q]))
      },
    })
  }

  function needMore(item: VerifyQueueItem) {
    showToast(`We will ask ${item.name} for one more vouch before they join.`, 'info')
  }

  if (queue.length === 0) {
    return (
      <div className={styles.queueEmpty}>
        <p className={styles.queueIntro}>
          The queue is clear. Everyone waiting has been welcomed in.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className={styles.queueIntro}>
        Verification is a welcome, not a gate. These members were vouched for and
        are ready to join fully — review their vouches and let them in.
      </p>
      <p className={styles.queueIntroEm}>
        <em>Take your time; there&rsquo;s no rush on a kindness.</em>
      </p>
      <p className={styles.queueShowing}>
        Showing <strong>3</strong> of <strong>11</strong> pending · the other 8
        are waiting on a second vouch before they reach you.
      </p>

      <div className={styles.queueGrid}>
        {queue.map((item, i) => (
          <FadeIn key={item.id} delay={i * 60}>
            <div
              className={`${styles.queueCard} ${leaving.has(item.id) ? styles.queueCardLeaving : ''}`}
            >
              <div className={styles.queueHead}>
                <AdminAvatar initials={item.initials} tone={item.tone} size="md" src={portrait(item.name)} />
                <div>
                  <div className={styles.queueName}>
                    {item.name} <span className={styles.pronoun}>{item.pronoun}</span>
                  </div>
                  <div className={styles.queueVouch}>{item.vouchedByLine}</div>
                  <div className={styles.queueApplied}>{item.appliedLine}</div>
                </div>
              </div>

              {item.oneVouchNudge && (
                <AdminChip tone="amber" dot>
                  1 vouch — wait for 2?
                </AdminChip>
              )}

              <div className={styles.queueActions}>
                <Button variant="ghost" size="md" onClick={() => needMore(item)}>
                  Need more
                </Button>
                <Button variant="jade" size="md" onClick={() => setReviewing(item)}>
                  Welcome in
                </Button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {reviewing && (
        <VerifyModal
          item={reviewing}
          onClose={() => setReviewing(null)}
          onAskMore={() => {
            needMore(reviewing)
            setReviewing(null)
          }}
          onWelcome={() => welcomeIn(reviewing)}
        />
      )}
    </div>
  )
}
