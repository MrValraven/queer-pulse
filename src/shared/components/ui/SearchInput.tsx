import { FiSearch, FiX } from 'react-icons/fi'
import styles from './SearchInput.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Accessible label (the field has no visible label by default). */
  ariaLabel?: string
  /** Show a clear (×) button while there's text. */
  clearable?: boolean
  className?: string
}

/** Icon-prefixed search field with an optional clear button. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  ariaLabel = 'Search',
  clearable = true,
  className,
}: SearchInputProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <span className={styles.icon} aria-hidden>
        <FiSearch />
      </span>
      <input
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
      {clearable && value && (
        <button type="button" className={styles.clear} onClick={() => onChange('')} aria-label="Clear search">
          <FiX />
        </button>
      )}
    </div>
  )
}
