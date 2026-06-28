import { useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { Button, FadeIn, EmptyState } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import type { Thread as ThreadData } from './communityDetails'
import { CommunityThread } from './CommunityThread'
import detail from './CommunityDetailPage.module.css'
import styles from './CommunityHubTabs.module.css'

const CHIPS = ['All', 'Pinned', 'Newest'] as const
type Chip = (typeof CHIPS)[number]

export function DiscussionTab({ threads }: { threads: ThreadData[] }) {
  const { showToast } = useToast()
  const [q, setQ] = useState('')
  const [chip, setChip] = useState<Chip>('All')
  const [newPost, setNewPost] = useState('')
  const [extra, setExtra] = useState<ThreadData[]>([])

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = [...extra, ...threads]
    if (term) list = list.filter((t) => `${t.title} ${t.post}`.toLowerCase().includes(term))
    if (chip === 'Newest') list = [...list].sort((a, b) => b.votes - a.votes)
    return list
  }, [q, chip, extra, threads])

  const post = () => {
    const text = newPost.trim()
    if (!text) return
    const title = text.length > 70 ? `${text.slice(0, 67)}…` : text
    setExtra((prev) => [
      { votes: 1, title, author: { initials: 'Me', name: 'You', tint: 'plum' }, time: 'just now', replyCount: 0, post: text, replies: [] },
      ...prev,
    ])
    setNewPost('')
    showToast('Discussion started.', 'success')
  }

  return (
    <div>
      <div className={styles.searchRow}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          className={styles.search}
          aria-label="Search discussions"
          placeholder="Search this community's discussions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className={styles.chips}>
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className={[styles.chip, chip === c && styles.chipOn].filter(Boolean).join(' ')}
            onClick={() => setChip(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title="Nothing matches yet" description="Try a different search, or start the discussion below." />
      ) : (
        shown.map((t, i) => (
          <FadeIn key={t.title} delay={Math.min(i, 8) * 55}>
            <CommunityThread data={t} />
          </FadeIn>
        ))
      )}

      <div className={detail.newPost} style={{ marginTop: 16 }}>
        <div className={[detail.rAv, detail.tPlum].join(' ')} style={{ width: 30, height: 30 }}>
          Me
        </div>
        <textarea
          className={detail.npTa}
          rows={1}
          placeholder="Start a new discussion in this community…"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <Button variant="ghost" onClick={post} style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
          Post
        </Button>
      </div>
    </div>
  )
}
