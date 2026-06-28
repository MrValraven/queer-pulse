import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBookmark, FiCheck, FiHeart, FiCornerUpLeft, FiSend, FiMessageCircle } from 'react-icons/fi'
import { Avatar, EmptyState } from '../../shared/components/ui'
import { useConnect } from '../../app/providers/ConnectProvider'
import { useSaved } from '../../app/providers/SavedProvider'
import { memberAvatar } from '../members/data/members'
import { gatheringPath } from '../gatherings/data'
import { routes } from '../../app/routeMap'
import { FEED_POST, type FeedReply } from './feed.data'
import { MoreMenu, ReportModal } from './FeedModeration'
import styles from './FeedPage.module.css'

export function GatheringCard() {
  return (
    <Link to={gatheringPath('queer-book-club')} className={`${styles.card} ${styles.cardLink}`}>
      <div className={styles.accent} style={{ background: 'var(--jade)' }} />
      <div className={styles.pad}>
        <div className={styles.eyebrow} style={{ color: 'var(--jade)' }}>
          <span className={styles.dot} style={{ background: 'var(--jade)' }} />
          Upcoming · 5 days
        </div>
        <div className={styles.gcTitle}>Queer Book Club — July</div>
        <div className={styles.gcMeta}>
          <span>Sat 19 July · 18:00–20:00</span>
          <span>LX Factory, Alcântara, Lisbon</span>
        </div>
        <div className={styles.gcFooter}>
          <div className={styles.attStack}>
            <div className={styles.attAvs}>
              <Avatar initials="AK" tint="jade" size={24} />
              <Avatar initials="JP" tint="coral" size={24} />
              <Avatar initials="TM" tint="plum" size={24} />
            </div>
            <span className={styles.attLabel}>+9 going</span>
          </div>
          <span className={styles.goingChip}><FiCheck /> You're going</span>
        </div>
      </div>
    </Link>
  )
}

export function NewMemberCard() {
  const { openConnect } = useConnect()
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.tag}><span className={styles.dot} /> New member</div>
      <div className={styles.nmRow}>
        <Avatar initials="KL" tint="plum" size={46} src={memberAvatar('kai')?.photo} alt="Kai Larsson" />
        <div className={styles.nmInfo}>
          <div className={styles.nmName}>Kai Larsson</div>
          <div className={styles.nmMeta}>they/them · Lisbon · Joined today</div>
          <div className={styles.nmBio}>
            Filmmaker making a documentary about queer nightlife in southern Europe.
            Looking for interviewees and collaborators.
          </div>
          <div className={styles.nmChips}>
            <span className={styles.nmChip}>Film</span>
            <span className={styles.nmChip}>Queer Lisbon</span>
          </div>
          <div className={styles.nmActions}>
            <button className={styles.btnOutline} onClick={() => openConnect('kai')}>Connect</button>
            <Link to="/profile/kai" className={styles.linkBtn}>View profile →</Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function ReplyComposer({ onSubmit, onCancel }: { onSubmit: (body: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState('')
  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault()
        const trimmed = value.trim()
        if (!trimmed) return
        onSubmit(trimmed)
        setValue('')
      }}
    >
      <label htmlFor="reply-input" className={styles.srOnly}>Write a reply</label>
      <textarea
        id="reply-input"
        className={styles.composerInput}
        placeholder="Write a reply…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        autoFocus
      />
      <div className={styles.composerRow}>
        <button type="button" className={styles.linkBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.composerSend} disabled={!value.trim()}>
          <FiSend /> Reply
        </button>
      </div>
    </form>
  )
}

function PostActions({
  liked, likeCount, onLike,
  replyCount, onToggleReply,
  saved, onSave,
}: {
  liked: boolean; likeCount: number; onLike: () => void
  replyCount: number; onToggleReply: () => void
  saved: boolean; onSave: () => void
}) {
  return (
    <div className={styles.postFooter}>
      <button
        className={`${styles.postAction} ${liked ? styles.postActionOn : ''}`}
        onClick={onLike}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike post' : 'Like post'}
      >
        <FiHeart fill={liked ? 'currentColor' : 'none'} /> {likeCount}
      </button>
      <button className={styles.postAction} onClick={onToggleReply} aria-label="Reply to post">
        <FiCornerUpLeft /> Reply · {replyCount}
      </button>
      <button
        className={`${styles.postAction} ${saved ? styles.postActionOn : ''}`}
        onClick={onSave}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save post'}
      >
        <FiBookmark fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}

export function PostCard() {
  const post = FEED_POST
  const { openConnect } = useConnect()
  const { isSaved, toggleSave } = useSaved()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [replies, setReplies] = useState<FeedReply[]>(post.replies)
  const [composing, setComposing] = useState(false)
  const [reporting, setReporting] = useState(false)
  const saved = isSaved(post.id)

  function addReply(body: string) {
    setReplies((prev) => [...prev, { id: `r${prev.length + 1}-${Date.now()}`, author: 'You', body }])
    setComposing(false)
  }

  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          <Avatar initials={post.authorInitials} tint={post.authorTint} size={36} />
          <div>
            <div className={styles.paName}>{post.authorName}</div>
            <div className={styles.paTime}>{post.time} · {post.context}</div>
          </div>
        </div>
        <div className={styles.postHeaderEnd}>
          <button className={styles.btnOutline} onClick={() => openConnect(post.slug)}>Connect</button>
          <MoreMenu authorName={post.authorName} onReport={() => setReporting(true)} />
        </div>
      </div>
      <div className={styles.postBody}>{post.body}</div>
      <PostActions
        liked={liked}
        likeCount={likeCount}
        onLike={() => {
          setLiked((l) => !l)
          setLikeCount((c) => (liked ? c - 1 : c + 1))
        }}
        replyCount={replies.length}
        onToggleReply={() => setComposing((c) => !c)}
        saved={saved}
        onSave={() => toggleSave({ id: post.id, kind: 'post', title: post.body.slice(0, 60), meta: post.authorName })}
      />
      {composing && <ReplyComposer onSubmit={addReply} onCancel={() => setComposing(false)} />}
      {replies.length === 0 && !composing && (
        <EmptyState
          compact
          icon={<FiMessageCircle />}
          title="No replies yet"
          description="Be the first to say something kind."
          action={{ label: 'Write a reply', onClick: () => setComposing(true) }}
        />
      )}
      {replies.length > 0 && (
        <ul className={styles.thread}>
          {replies.map((r) => (
            <li key={r.id} className={styles.reply}>
              <span className={styles.replyAuthor}>{r.author}</span>
              <span className={styles.replyBody}>{r.body}</span>
            </li>
          ))}
        </ul>
      )}
      {reporting && <ReportModal authorName={post.authorName} onClose={() => setReporting(false)} />}
    </article>
  )
}

export function SavedArticleCard() {
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.savedEyebrow}>From your saves</div>
      <div className={styles.savedTitle}>The Quiet Politics of Chosen Family</div>
      <div className={styles.savedSource}>QueerPulse Magazine · Issue 17 · 6 min read</div>
      <Link className={styles.savedLink} to={routes.article}>Continue reading →</Link>
    </article>
  )
}

export function RecapCard() {
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.recapEyebrow}>Gathering recap</div>
      <div className={styles.savedTitle}>Pride Brunch — June Edition</div>
      <div className={styles.savedSource}>You attended · 3 days ago · 38 people were there</div>
      <Link className={styles.savedLink} to={routes.gatheringRecap}>Read the recap →</Link>
    </article>
  )
}
