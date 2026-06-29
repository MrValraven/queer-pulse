import { FiInbox, FiSend, FiSlash } from 'react-icons/fi'
import { EmptyState, FadeIn } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ConnectionsGridSkeleton } from './ConnectionsSkeleton'
import { BlockedCard, IncomingCard, SentCard, VouchedCard } from './ConnectionCards'
import type { ConnectionView } from './connections.data'
import styles from './ConnectionsPage.module.css'

const stagger = (i: number) => Math.min(i, 8) * 60

export function IncomingPanel({
  loading,
  views,
  onAccept,
  onDecline,
}: {
  loading: boolean
  views: ConnectionView[]
  onAccept: (v: ConnectionView) => void
  onDecline: (v: ConnectionView) => void
}) {
  if (loading) return <ConnectionsGridSkeleton count={4} />
  return (
    <div className={styles.grid}>
      {views.map((v, i) => (
        <FadeIn key={v.slug} delay={stagger(i)}>
          <IncomingCard view={v} onAccept={() => onAccept(v)} onDecline={() => onDecline(v)} />
        </FadeIn>
      ))}
      {views.length === 0 && (
        <EmptyState
          compact
          icon={<FiInbox />}
          title="No requests right now"
          description="When someone you've met asks to connect, they'll land here for you to accept or politely decline."
          action={{ label: 'Find members', to: routes.members }}
        />
      )}
    </div>
  )
}

export function SentPanel({
  loading,
  views,
  onWithdraw,
}: {
  loading: boolean
  views: ConnectionView[]
  onWithdraw: (v: ConnectionView) => void
}) {
  if (loading) return <ConnectionsGridSkeleton count={4} />
  return (
    <div className={styles.grid}>
      {views.map((v, i) => (
        <FadeIn key={v.slug} delay={stagger(i)}>
          <SentCard view={v} onWithdraw={() => onWithdraw(v)} />
        </FadeIn>
      ))}
      {views.length === 0 && (
        <EmptyState
          compact
          icon={<FiSend />}
          title="No requests right now"
          description="Requests you send sit here until they're accepted. Browse members and reach out to someone you've crossed paths with."
          action={{ label: 'Find members', to: routes.members }}
        />
      )}
    </div>
  )
}

export function BlockedPanel({
  loading,
  views,
  onUnblock,
}: {
  loading: boolean
  views: ConnectionView[]
  onUnblock: (v: ConnectionView) => void
}) {
  if (loading) return <ConnectionsGridSkeleton count={2} />
  return (
    <div className={styles.grid}>
      {views.map((v, i) => (
        <FadeIn key={v.slug} delay={stagger(i)}>
          <BlockedCard view={v} onUnblock={() => onUnblock(v)} />
        </FadeIn>
      ))}
      {views.length === 0 && (
        <EmptyState
          compact
          icon={<FiSlash />}
          title="You haven't blocked anyone"
          description="If someone makes the room feel unsafe, blocking them stops their messages and hides your updates. They'll show up here if you ever need to undo it."
        />
      )}
    </div>
  )
}

export function VouchedPanel({
  loading,
  views,
  noteFor,
}: {
  loading: boolean
  views: ConnectionView[]
  noteFor: (v: ConnectionView) => string
}) {
  return (
    <>
      <p className={styles.paneIntro}>
        People you've vouched for, or who've vouched for you.{' '}
        <em>Vouching is a small but meaningful act</em> — it stays attached to that member's
        profile.
      </p>
      {loading ? (
        <ConnectionsGridSkeleton count={4} />
      ) : (
        <div className={styles.grid}>
          {views.map((v, i) => (
            <FadeIn key={v.slug} delay={stagger(i)}>
              <VouchedCard view={v} note={noteFor(v)} />
            </FadeIn>
          ))}
        </div>
      )}
    </>
  )
}
