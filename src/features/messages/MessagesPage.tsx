import { useMemo, useState } from 'react'
import { FiMessageCircle, FiSearch } from 'react-icons/fi'
import { AppShell } from '../../shared/components/layout'
import { Avatar, EmptyState, FadeIn, SearchInput } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { MessageThreadListSkeleton } from './MessagesSkeleton'
import { conversations, type ChatMessage, type Conversation } from './data'
import { ConversationPanel } from './ConversationPanel'
import { NewMessageModal } from './NewMessageModal'
import styles from './MessagesPage.module.css'

export function MessagesPage() {
  const loading = useSimulatedLoad()
  const [extraThreads, setExtraThreads] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState(conversations[0]!.id)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  /** Per-thread appended messages, keyed by conversation id. */
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({})
  const [composing, setComposing] = useState(false)

  const allThreads = useMemo(() => [...extraThreads, ...conversations], [extraThreads])

  const active = useMemo(
    () => allThreads.find((c) => c.id === activeId) ?? allThreads[0]!,
    [allThreads, activeId],
  )

  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? allThreads.filter((c) => c.name.toLowerCase().includes(q)) : allThreads
  }, [allThreads, query])

  /** Static message groups plus any messages sent this session. */
  const messageGroups = useMemo(() => {
    const extra = sent[active.id]
    if (!extra || extra.length === 0) return active.messages
    const groups = active.messages.map((g) => ({ ...g, items: [...g.items] }))
    const today = groups.find((g) => g.day === 'Today')
    if (today) {
      today.items = [...today.items, ...extra]
      return groups
    }
    return [...groups, { day: 'Today', items: extra }]
  }, [active, sent])

  function openThread(id: string) {
    setActiveId(id)
    setReadIds((current) => new Set(current).add(id))
    setDraft('')
  }

  function startThread(recipient: Conversation) {
    setComposing(false)
    setExtraThreads((prev) => (prev.some((t) => t.id === recipient.id) ? prev : [recipient, ...prev]))
    setActiveId(recipient.id)
    setReadIds((current) => new Set(current).add(recipient.id))
    setQuery('')
    setDraft('')
  }

  function send() {
    const body = draft.trim()
    if (!body) return
    setSent((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), { from: 'me', text: body, time: 'Just now' }],
    }))
    setDraft('')
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
                onClick={() => setComposing(true)}
              >
                <svg width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
                  <path d="M10.5 2L13 4.5l-7 7H3.5V9l7-7Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
                  <path d="M2 13h11" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search conversations…"
              ariaLabel="Search conversations"
            />
          </div>

          <div className={styles.threadList}>
            {loading && <MessageThreadListSkeleton count={6} />}
            {!loading && visibleThreads.length === 0 && (
              query.trim() ? (
                <EmptyState
                  compact
                  icon={<FiSearch />}
                  title="No conversations found"
                  description={<>No one matches “{query.trim()}”. Try a different name.</>}
                  action={{ label: 'Clear search', onClick: () => setQuery('') }}
                />
              ) : (
                <EmptyState
                  compact
                  icon={<FiMessageCircle />}
                  title="No conversations yet"
                  description="When you start a chat, it’ll live here — a quiet, private space just for you and the people you reach out to."
                  action={{ label: 'New message', onClick: () => setComposing(true) }}
                />
              )
            )}
            {!loading && visibleThreads.map((thread, i) => {
              const isUnread = thread.unread && !readIds.has(thread.id) && thread.id !== activeId
              return (
                <FadeIn key={thread.id} delay={Math.min(i, 8) * 60}>
                <button
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
                </FadeIn>
              )
            })}
          </div>
        </div>

        <ConversationPanel
          active={active}
          messageGroups={messageGroups}
          draft={draft}
          onDraftChange={setDraft}
          onSend={send}
        />
      </div>
      {composing && (
        <NewMessageModal onClose={() => setComposing(false)} onPick={startThread} />
      )}
    </AppShell>
  )
}
