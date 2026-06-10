import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Avatar } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { conversations, me } from './data'
import styles from './MessagesPage.module.css'

export function MessagesPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [activeId],
  )

  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? conversations.filter((c) => c.name.toLowerCase().includes(q)) : conversations
  }, [query])

  function openThread(id: string) {
    setActiveId(id)
    setReadIds((current) => new Set(current).add(id))
    setDraft('')
  }

  function send() {
    if (!draft.trim()) return
    setDraft('')
    showToast('Message sent', 'success')
  }

  return (
    <AppShell unreadCount={3}>
      <div className={styles.app}>
        {/* Thread list */}
        <div className={styles.threadPanel}>
          <div className={styles.tpTop}>
            <div className={styles.tpHeadRow}>
              <div className={styles.tpTitle}>Messages</div>
              <button
                className={styles.composeBtn}
                title="New message"
                onClick={() => showToast('Start a new conversation', 'info')}
              >
                <svg width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
                  <path d="M10.5 2L13 4.5l-7 7H3.5V9l7-7Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
                  <path d="M2 13h11" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden>
                <circle cx={6} cy={6} r={4.5} stroke="currentColor" strokeWidth={1.4} />
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
              </svg>
              <input
                className={styles.search}
                type="text"
                placeholder="Search conversations…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.threadList}>
            {visibleThreads.map((thread) => {
              const isUnread = thread.unread && !readIds.has(thread.id) && thread.id !== activeId
              return (
                <button
                  key={thread.id}
                  className={[styles.threadRow, thread.id === activeId && styles.threadActive]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => openThread(thread.id)}
                >
                  <div className={styles.trAv}>
                    <Avatar initials={thread.initials} tint={thread.tint} size={42} />
                    {isUnread && <span className={styles.unreadDot} />}
                  </div>
                  <div className={styles.trBody}>
                    <div className={styles.trHeader}>
                      <span className={styles.trName}>{thread.name}</span>
                      <span className={styles.trTime}>{thread.time}</span>
                    </div>
                    <div
                      className={[styles.trPreview, isUnread && styles.trPreviewUnread]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {thread.preview}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conversation */}
        <div className={styles.convoPanel}>
          <div className={styles.topbar}>
            <Avatar initials={active.initials} tint={active.tint} size={38} />
            <div className={styles.ctbInfo}>
              <div className={styles.ctbName}>{active.name}</div>
              <div className={styles.ctbMeta}>
                {active.official
                  ? 'Official · Cannot reply to this thread'
                  : `${active.pronouns} · Connected since ${active.connectedSince}`}
              </div>
            </div>
            {!active.official && (
              <button className={styles.ctbLink} onClick={() => navigate('/profile')}>
                View profile →
              </button>
            )}
          </div>

          <div className={styles.area}>
            {active.messages.map((group) => (
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
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    send()
                  }
                }}
              />
              <button
                className={[styles.sendBtn, draft.trim() && styles.sendBtnActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={send}
                aria-label="Send"
              >
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M2 8l12-6-4 6 4 6-12-6Z" fill="rgba(247,243,238,.9)" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
