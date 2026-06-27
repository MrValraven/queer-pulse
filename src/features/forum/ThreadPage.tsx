import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiStar, FiHeart } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { CATS, CAT_STYLE, REPLY_SORTS, THREADS, type Reply } from './forum.data'
import styles from './ThreadPage.module.css'

export function ThreadPage() {
  const { showToast } = useToast()
  const { id } = useParams()
  const thread = useMemo(() => THREADS.find((t) => String(t.id) === id) ?? THREADS[0], [id])

  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [sort, setSort] = useState<(typeof REPLY_SORTS)[number]>('Oldest')
  const [reply, setReply] = useState('')
  const [localReplies, setLocalReplies] = useState<Reply[]>(thread.replies)

  // Reset the local reply list whenever the visited thread changes.
  useEffect(() => {
    setLocalReplies(thread.replies)
  }, [thread.replies])

  const catMeta = CATS.find((c) => c.id === thread.cat)
  const catColor = CAT_STYLE[thread.cat]?.color ?? 'var(--plum)'

  const replies = useMemo(() => {
    if (sort === 'Newest') return [...localReplies].reverse()
    if (sort === 'Most helpful') return [...localReplies].sort((a, b) => Number(b.helpful ?? 0) - Number(a.helpful ?? 0) || b.reactions - a.reactions)
    return localReplies
  }, [localReplies, sort])

  function addReply(body: string) {
    setLocalReplies((prev) => [
      ...prev,
      {
        av: 'SF',
        bg: 'var(--plum)',
        color: 'var(--cream)',
        name: 'You',
        time: 'Just now',
        body: [body],
        reactions: 0,
      },
    ])
    setReply('')
    showToast('Reply posted', 'success')
  }

  return (
    <PageShell>
      <section className={styles.topbar}>
        <div className="wrap">
          <div className={styles.topbarInner}>
            <Link to={routes.forum} className={styles.back}>
              <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="10,4 6,8 10,12" />
              </svg>
              Forum
            </Link>
            <span className={styles.sep} />
            <span className={styles.topCat}>{catMeta?.name}</span>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={styles.layout}>
          <div className={styles.opCard}>
            <div className={styles.opHead}>
              <div className={styles.opAv} style={{ background: thread.author.t, color: thread.author.tt }}>
                {thread.author.i}
              </div>
              <div>
                <div className={styles.opName}>{thread.author.n}</div>
                <div className={styles.opSub}>
                  <span className={styles.opCat} style={{ color: catColor }}>
                    {catMeta?.name}
                  </span>
                  <span>·</span>
                  <span>Posted {thread.posted}</span>
                  <span>·</span>
                  <span>{thread.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
            <h1 className={styles.opTitle}>{thread.title}</h1>
            <div className={styles.opBody}>
              {thread.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className={styles.opTags}>
              {thread.tags.map((t) => (
                <span key={t} className={styles.opTag}>
                  {t}
                </span>
              ))}
            </div>
            <div className={styles.opFooter}>
              <button className={[styles.reaction, liked && styles.reactionOn].filter(Boolean).join(' ')} onClick={() => setLiked((v) => !v)}>
                <svg viewBox="0 0 14 14">
                  <path d="M7 12s-7-4.5-7-8a4 4 0 0 1 7-2.7A4 4 0 0 1 14 4c0 3.5-7 8-7 8z" fill="currentColor" stroke="none" />
                </svg>
                {thread.upvotes + (liked ? 1 : 0)}
              </button>
              <button className={[styles.reaction, bookmarked && styles.reactionOn].filter(Boolean).join(' ')} onClick={() => setBookmarked((v) => !v)}>
                {bookmarked ? 'Saved' : 'Bookmark'}
              </button>
              <button className={styles.report} onClick={() => showToast('Thanks — a moderator will review this.', 'success')}>
                Report
              </button>
            </div>
          </div>

          <div className={styles.replyBar}>
            <span className={styles.replyCount}>
              {localReplies.length} repl{localReplies.length === 1 ? 'y' : 'ies'}
            </span>
            <div className={styles.replySort}>
              {REPLY_SORTS.map((s) => (
                <button key={s} className={[styles.sortBtn, sort === s && styles.sortBtnOn].filter(Boolean).join(' ')} onClick={() => setSort(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            {replies.map((r, i) => (
              <div key={i} className={[styles.reply, r.helpful && styles.replyHighlighted].filter(Boolean).join(' ')}>
                <div className={styles.replyAv} style={{ background: r.bg, color: r.color }}>
                  {r.av}
                </div>
                <div>
                  <div className={styles.replyTop}>
                    <span className={styles.replyName}>{r.name}</span>
                    {r.isOP && <span className={styles.opBadge}>OP</span>}
                    {r.helpful && <span className={styles.helpfulBadge}><FiStar /> Most helpful</span>}
                    <span className={styles.replyTime}>{r.time}</span>
                  </div>
                  <div className={styles.replyBody}>
                    {r.quote && (
                      <div className={styles.quote}>
                        <cite>{r.quote.cite}</cite>
                        {r.quote.text}
                      </div>
                    )}
                    {r.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                  <span className={styles.replyReact} onClick={() => showToast('Liked', 'success')}>
                    <FiHeart /> {r.reactions}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.compose}>
            <div className={styles.crHead}>
              <span className={styles.crAv}>SF</span>
              <span>
                Replying to <strong>{thread.author.n}</strong>
              </span>
            </div>
            <textarea
              className={styles.crTextarea}
              placeholder="Write a reply…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className={styles.crFooter}>
              <Button
                disabled={!reply.trim()}
                onClick={() => {
                  const body = reply.trim()
                  if (body) addReply(body)
                }}
              >
                Post reply
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
