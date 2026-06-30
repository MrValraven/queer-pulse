import { useEffect, useMemo, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { Avatar, SearchInput } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { conversations, type Conversation } from './data'
import styles from './NewMessageModal.module.css'

interface NewMessageModalProps {
  onClose: () => void
  onPick: (recipient: Conversation) => void
}

/** Self-contained recipient picker — opens (or reuses) a thread for the chosen member. */
export function NewMessageModal({ onClose, onPick }: NewMessageModalProps) {
  useScrollLock()
  const [query, setQuery] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const people = useMemo(() => {
    const candidates = conversations.filter((c) => !c.official)
    const q = query.trim().toLowerCase()
    return q ? candidates.filter((c) => c.name.toLowerCase().includes(q)) : candidates
  }, [query])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.head}>
          <h2 id="new-message-title" className={styles.title}>
            New message
          </h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <p className={styles.sub}>Pick a connection to start a conversation.</p>
        <SearchInput
          className={styles.searchField}
          value={query}
          onChange={setQuery}
          placeholder="Search connections…"
          ariaLabel="Search connections"
        />
        <ul className={styles.list}>
          {people.map((person) => (
            <li key={person.id}>
              <button className={styles.row} onClick={() => onPick(person)}>
                <Avatar initials={person.initials} tint={person.tint} size={40} />
                <div className={styles.rowBody}>
                  <span className={styles.rowName}>{person.name}</span>
                  <span className={styles.rowMeta}>{person.pronouns}</span>
                </div>
              </button>
            </li>
          ))}
          {people.length === 0 && <li className={styles.empty}>No connections match “{query}”.</li>}
        </ul>
      </div>
    </div>
  )
}
