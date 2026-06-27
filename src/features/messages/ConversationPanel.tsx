import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../shared/components/ui'
import { me, type ChatMessage, type Conversation } from './data'
import styles from './MessagesPage.module.css'

interface ConversationPanelProps {
  active: Conversation
  messageGroups: { day: string; items: ChatMessage[] }[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
}

/** Right-hand conversation pane: header, scrolling message area, composer. */
export function ConversationPanel({
  active,
  messageGroups,
  draft,
  onDraftChange,
  onSend,
}: ConversationPanelProps) {
  const navigate = useNavigate()
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = areaRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messageGroups, active.id])

  return (
    <div className={styles.convoPanel}>
      <div className={styles.topbar}>
        <Avatar initials={active.initials} tint={active.tint} size={38} />
        <div className={styles.ctbInfo}>
          <div className={styles.ctbName}>{active.name}</div>
          <div className={styles.ctbMeta}>
            {active.official
              ? 'Official · Cannot reply to this thread'
              : `${active.pronouns}${active.connectedSince ? ` · Connected since ${active.connectedSince}` : ''}`}
          </div>
        </div>
        {!active.official && (
          <button className={styles.ctbLink} onClick={() => navigate('/profile')}>
            View profile →
          </button>
        )}
      </div>

      <div className={styles.area} ref={areaRef}>
        {messageGroups.map((group) => (
          <div key={group.day}>
            <div className={styles.dayLabel}>{group.day}</div>
            {group.items.map((message, index) => {
              const isSent = message.from === 'me'
              return (
                <div
                  key={index}
                  className={[styles.bubbleRow, isSent && styles.bubbleRowSent]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Avatar
                    initials={isSent ? me.initials : active.initials}
                    tint={isSent ? me.tint : active.tint}
                    size={28}
                    style={{ alignSelf: 'flex-end' }}
                  />
                  <div>
                    <div className={[styles.bubble, isSent ? styles.sent : styles.received].join(' ')}>
                      {message.text}
                    </div>
                    {message.time && <div className={styles.bubbleTime}>{message.time}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {active.official ? (
        <div className={styles.officialBar}>
          This is an automated thread — replies aren't monitored.
        </div>
      ) : (
        <div className={styles.composer}>
          <textarea
            className={styles.composerTa}
            placeholder={`Message ${active.name.split(' ')[0]}…`}
            value={draft}
            rows={1}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                onSend()
              }
            }}
          />
          <button
            className={[styles.sendBtn, draft.trim() && styles.sendBtnActive]
              .filter(Boolean)
              .join(' ')}
            onClick={onSend}
            aria-label="Send"
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8l12-6-4 6 4 6-12-6Z" fill="rgba(247,243,238,.9)" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
