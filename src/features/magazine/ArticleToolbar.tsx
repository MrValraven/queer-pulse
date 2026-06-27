import {
  FiBookmark,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShare2,
  FiType,
} from 'react-icons/fi'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSaved } from '../../app/providers/SavedProvider'
import styles from './ArticleToolbar.module.css'

export type TextSize = 'sm' | 'md' | 'lg'

const SIZES: TextSize[] = ['sm', 'md', 'lg']

interface Props {
  textSize: TextSize
  onTextSize: (size: TextSize) => void
  /** Stable identity of the article being read — used to persist the save. */
  articleId?: string
  /** Human title for the saved-items list (falls back to the document title). */
  articleTitle?: string
  /** Small supporting line (author · read time). */
  articleMeta?: string
}

/** Derive a stable slug + href from the current URL when props aren't passed. */
function deriveIdentity(articleId?: string) {
  if (articleId) return { slug: articleId, href: `/article?id=${articleId}` }
  if (typeof window === 'undefined') return { slug: 'current', href: '/article' }
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('id') ?? 'current'
  return { slug, href: `${window.location.pathname}${window.location.search}` }
}

export function ArticleToolbar({
  textSize,
  onTextSize,
  articleId,
  articleTitle,
  articleMeta,
}: Props) {
  const { showToast } = useToast()
  const { isSaved, toggleSave: toggleSaved } = useSaved()

  const { slug, href } = deriveIdentity(articleId)
  const id = `article:${slug}`
  const saved = isSaved(id)

  const sizeIndex = SIZES.indexOf(textSize)
  const decSize = () => sizeIndex > 0 && onTextSize(SIZES[sizeIndex - 1])
  const incSize = () =>
    sizeIndex < SIZES.length - 1 && onTextSize(SIZES[sizeIndex + 1])

  function toggleSave() {
    const title =
      articleTitle ??
      (typeof document !== 'undefined' ? document.title : 'This article')
    const next = toggleSaved({
      id,
      kind: 'article',
      title,
      href,
      meta: articleMeta,
    })
    showToast(
      next ? 'Saved to your reading list' : 'Removed from your reading list',
      next ? 'success' : 'info',
    )
  }

  async function share() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard', 'success')
    } catch {
      showToast('Could not copy the link', 'info')
    }
  }

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Reading tools">
      <div className={styles.group} role="group" aria-label="Adjust text size">
        <FiType className={styles.groupIcon} aria-hidden />
        <button
          type="button"
          className={styles.iconBtn}
          onClick={decSize}
          disabled={sizeIndex === 0}
          aria-label="Decrease text size"
        >
          <FiMinus aria-hidden />
        </button>
        <span className={styles.sizeReadout} aria-live="polite">
          {textSize === 'sm' ? 'A−' : textSize === 'lg' ? 'A+' : 'A'}
        </span>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={incSize}
          disabled={sizeIndex === SIZES.length - 1}
          aria-label="Increase text size"
        >
          <FiPlus aria-hidden />
        </button>
      </div>

      <div className={styles.spacer} />

      <button
        type="button"
        className={[styles.action, saved && styles.actionOn].filter(Boolean).join(' ')}
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from reading list' : 'Save to reading list'}
      >
        <FiBookmark aria-hidden style={{ fill: saved ? 'currentColor' : 'none' }} />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>

      <button
        type="button"
        className={styles.action}
        onClick={share}
        aria-label="Copy a link to this article"
      >
        <FiShare2 aria-hidden />
        <span>Share</span>
      </button>

      {saved && (
        <span className={styles.savedHint} aria-hidden>
          <FiCheck /> In your list
        </span>
      )}
    </div>
  )
}
