import { useState } from 'react'
import {
  FiBookmark,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShare2,
  FiType,
} from 'react-icons/fi'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './ArticleToolbar.module.css'

export type TextSize = 'sm' | 'md' | 'lg'

const SIZES: TextSize[] = ['sm', 'md', 'lg']

interface Props {
  textSize: TextSize
  onTextSize: (size: TextSize) => void
}

export function ArticleToolbar({ textSize, onTextSize }: Props) {
  const { showToast } = useToast()
  const [saved, setSaved] = useState(false)

  const sizeIndex = SIZES.indexOf(textSize)
  const decSize = () => sizeIndex > 0 && onTextSize(SIZES[sizeIndex - 1])
  const incSize = () =>
    sizeIndex < SIZES.length - 1 && onTextSize(SIZES[sizeIndex + 1])

  function toggleSave() {
    setSaved((prev) => {
      const next = !prev
      showToast(
        next ? 'Saved to your reading list' : 'Removed from your reading list',
        next ? 'success' : 'info',
      )
      return next
    })
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
