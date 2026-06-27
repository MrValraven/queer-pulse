import { SkeletonAvatar, SkeletonLine } from '../../shared/components/ui'
import styles from './ThreadPage.module.css'

/** Mirrors a reply row: avatar + name line + body paragraphs. */
function ReplySkeleton() {
  return (
    <div className={styles.reply} aria-hidden>
      <SkeletonAvatar size={40} />
      <div>
        <div className={styles.replyTop}>
          <SkeletonLine width={120} height={14} />
          <SkeletonLine width={64} height={12} />
        </div>
        <SkeletonLine width="100%" height={14} style={{ marginTop: 4 }} />
        <SkeletonLine width="92%" height={14} style={{ marginTop: 6 }} />
        <SkeletonLine width="40%" height={14} style={{ marginTop: 6 }} />
      </div>
    </div>
  )
}

export function ThreadRepliesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ReplySkeleton key={i} />
      ))}
    </>
  )
}
