import { Link } from 'react-router-dom'
import { FiBookmark, FiX } from 'react-icons/fi'
import { EmptyState } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSaved } from '../../app/providers/SavedProvider'
import { linkToPath, routes } from '../../app/routeMap'
import { KIND_GROUPS } from './savedByYou.data'
import styles from './SavedByYou.module.css'

/**
 * Live list of everything the member has saved across the app, driven by the
 * SavedProvider store and grouped by kind. Each row links to the item and can
 * be removed in place. Shows an EmptyState when nothing is saved.
 */
export function SavedByYou() {
  const { items, byKind, unsave } = useSaved()
  const { showToast } = useToast()

  if (items.length === 0) {
    return (
      <section className={styles.wrap}>
        <div className={styles.secH}>
          <span>Saved by you · live across QueerPulse</span>
        </div>
        <EmptyState
          icon={<FiBookmark />}
          title="Nothing saved yet"
          description="Save articles, films, jobs and posts as you explore — they'll gather here so you can come back to them and sort them into collections."
          action={{ label: 'Browse the magazine', to: routes.magazine }}
          secondaryAction={{ label: 'Explore cinema', to: routes.cinema }}
        />
      </section>
    )
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.secH}>
        <span>Saved by you · live across QueerPulse</span>
        <span className={styles.ct}>{items.length} saved</span>
      </div>

      {KIND_GROUPS.map((group) => {
        const rows = byKind(group.kind)
        if (rows.length === 0) return null
        return (
          <div key={group.kind} className={styles.group}>
            <h3 className={styles.groupH}>
              {group.label}
              <span className={styles.groupCt}>{rows.length}</span>
            </h3>
            <div className={styles.list}>
              {rows.map((item) => (
                <div key={item.id} className={styles.row}>
                  <span className={styles.badge}>{group.badge}</span>
                  <div className={styles.info}>
                    {item.href ? (
                      <Link to={linkToPath(item.href)} className={styles.title}>
                        {item.title}
                      </Link>
                    ) : (
                      <span className={styles.title}>{item.title}</span>
                    )}
                    {item.meta && <span className={styles.meta}>{item.meta}</span>}
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove ${item.title} from saved`}
                    onClick={() => {
                      unsave(item.id)
                      showToast('Removed from saved', 'info')
                    }}
                  >
                    <FiX aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
