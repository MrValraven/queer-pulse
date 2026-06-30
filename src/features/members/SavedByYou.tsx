import { Link } from 'react-router-dom'
import { FiBookmark } from 'react-icons/fi'
import { FaBookmark } from 'react-icons/fa6'
import { EmptyState, FadeIn } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSaved, type SavedItem } from '../../app/providers/SavedProvider'
import { linkToPath, routes } from '../../app/routeMap'
import { KIND_CARD, type KindCard } from './savedByYou.data'
import styles from './SavedByYou.module.css'

const variantClass: Record<KindCard['variant'], string> = {
  magazine: styles.vMagazine!,
  film: styles.vFilm!,
  job: styles.vJob!,
  event: styles.vEvent!,
  thread: styles.vThread!,
  group: styles.vGroup!,
}

/** Pull a "N min" read-length out of a meta string, returning the pill text and
 * the meta with that segment removed so it isn't shown twice. */
function splitReadTime(meta?: string): { meta?: string; readTime?: string } {
  if (!meta) return {}
  const match = meta.match(/(\d+)\s*min(?:\s*read)?/i)
  if (!match) return { meta }
  const cleaned = meta
    .replace(match[0], '')
    .replace(/\s*·\s*$/, '')
    .replace(/^\s*·\s*/, '')
    .trim()
  return { meta: cleaned || undefined, readTime: `${match[1]} min` }
}

/** A single saved item, rendered as a rich card matching the design prototype. */
function SaveCard({ item, onUnsave }: { item: SavedItem; onUnsave: () => void }) {
  const cfg = KIND_CARD[item.kind]
  // Prefer an explicit readTime; otherwise lift one out of the meta line.
  const derived = splitReadTime(item.meta)
  const readTime = item.readTime ?? derived.readTime
  const metaText = item.readTime ? item.meta : derived.meta

  return (
    <article className={`${styles.card} ${variantClass[cfg.variant]}`}>
      <div className={styles.top}>
        <span className={styles.cat}>{cfg.label}</span>
        <button
          type="button"
          className={styles.bookmark}
          aria-label={`Remove ${item.title} from saved`}
          title="Remove from saved"
          onClick={onUnsave}
        >
          <FaBookmark aria-hidden />
        </button>
      </div>

      {item.href ? (
        <Link to={linkToPath(item.href)} className={styles.title}>
          {item.title}
        </Link>
      ) : (
        <span className={styles.title}>{item.title}</span>
      )}

      {metaText && <div className={styles.meta}>{metaText}</div>}

      {item.description && <p className={styles.desc}>{item.description}</p>}

      {(item.href || readTime) && (
        <div className={styles.footer}>
          {item.href ? (
            <Link to={linkToPath(item.href)} className={styles.readLink}>
              {cfg.read} →
            </Link>
          ) : (
            <span />
          )}
          {readTime && <span className={styles.readPill}>{readTime}</span>}
        </div>
      )}
    </article>
  )
}

/**
 * Live list of everything the member has saved across the app, driven by the
 * SavedProvider store and rendered as a grid of cards (one per saved item).
 * Each card links to the item and can be removed in place via its bookmark.
 * Shows an EmptyState when nothing is saved.
 */
export function SavedByYou() {
  const { items, unsave } = useSaved()
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

      <div className={styles.grid}>
        {items.map((item, i) => (
          <FadeIn key={item.id} delay={Math.min(i, 8) * 60}>
            <SaveCard
              item={item}
              onUnsave={() => {
                unsave(item.id)
                showToast('Removed from saved', 'info')
              }}
            />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
