import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiStar, FiHeart, FiMessageSquare } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, EmptyState, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { CATS, CAT_STYLE, REPLY_SORTS, THREADS, MOD_ROLE, type Reply } from './forum.data'
import { ForumAvatar, ProfileLink, OfficialBadge, authorHref, memberPath } from './ForumAuthor'
import { currentUser, memberName } from '../members/data/members'
import { ThreadRepliesSkeleton } from './ThreadRepliesSkeleton'
import { ReportReplyModal } from './ReportReplyModal'
import styles from './ThreadPage.module.css'

/** Names the moderator who published an official QueerPulse post, linking to
 * their member profile — so the platform voice stays accountable to a person. */
function ModeratorByline({ mod }: { mod?: string }) {
  if (!mod) return null
  return (
    <div className={styles.modBy}>
      Written by{' '}
      <Link to={memberPath(mod)} className={styles.modByLink}>
        {memberName(mod)}
      </Link>
      {MOD_ROLE[mod] ? `, ${MOD_ROLE[mod]}` : ''} · on behalf of the team
    </div>
  )
}

export function ThreadPage() {
  const loading = useSimulatedLoad()
  const { showToast } = useToast()
  const { id } = useParams()
  const thread = useMemo(() => THREADS.find((t) => String(t.id) === id) ?? THREADS[0]!, [id])

  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [sort, setSort] = useState<(typeof REPLY_SORTS)[number]>('Oldest')
  const [reply, setReply] = useState('')
  const [localReplies, setLocalReplies] = useState<Reply[]>(thread.replies)
  // Per-reply like toggles, keyed by a stable identity (replies have no id).
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({})
  const [reportingAuthor, setReportingAuthor] = useState<string | null>(null)
  const replyBoxRef = useRef<HTMLTextAreaElement>(null)

  const replyKey = (r: Reply) => `${r.name}|${r.time}|${r.body[0] ?? ''}`

  const toggleReplyLike = (r: Reply) => {
    const key = replyKey(r)
    setLikedReplies((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Reset the local reply list and per-reply likes whenever the thread changes.
  useEffect(() => {
    setLocalReplies(thread.replies)
    setLikedReplies({})
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
        av: currentUser.initials,
        bg: 'var(--plum)',
        color: 'var(--cream)',
        name: 'You',
        slug: currentUser.slug,
        photo: currentUser.photo,
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
              <ProfileLink to={authorHref(thread.author)} name={thread.author.n} official={thread.author.official} className={styles.avLink}>
                <ForumAvatar
                  className={styles.opAv}
                  style={{ background: thread.author.t, color: thread.author.tt }}
                  person={{ slug: thread.author.slug, photo: thread.author.photo, initials: thread.author.i, name: thread.author.n }}
                />
              </ProfileLink>
              <div>
                <div className={styles.opName}>
                  <ProfileLink to={authorHref(thread.author)} name={thread.author.n} official={thread.author.official} className={styles.authorLink}>
                    {thread.author.n}
                  </ProfileLink>
                  {thread.author.official && <OfficialBadge />}
                </div>
                <ModeratorByline mod={thread.author.mod} />
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
              <button className={styles.report} onClick={() => setReportingAuthor(thread.author.n)}>
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
            {loading && <ThreadRepliesSkeleton count={3} />}
            {!loading && replies.length === 0 && (
              <EmptyState
                compact
                icon={<FiMessageSquare />}
                title="No replies yet"
                description="This thread is waiting for its first voice. Be the first to reply — a thoughtful answer goes a long way."
                action={{ label: 'Write a reply', onClick: () => replyBoxRef.current?.focus() }}
              />
            )}
            {!loading && replies.map((r, i) => (
              <FadeIn key={i} delay={Math.min(i, 8) * 60} className={[styles.reply, r.helpful && styles.replyHighlighted].filter(Boolean).join(' ')}>
                <ProfileLink to={authorHref(r)} name={r.name} official={r.official} className={styles.avLink}>
                  <ForumAvatar
                    className={styles.replyAv}
                    style={{ background: r.bg, color: r.color }}
                    person={{ slug: r.slug, photo: r.photo, initials: r.av, name: r.name }}
                  />
                </ProfileLink>
                <div>
                  <div className={styles.replyTop}>
                    <span className={styles.replyName}>
                      <ProfileLink to={authorHref(r)} name={r.name} official={r.official} className={styles.authorLink}>
                        {r.name}
                      </ProfileLink>
                    </span>
                    {r.official && <OfficialBadge />}
                    {r.isOP && <span className={styles.opBadge}>OP</span>}
                    {r.helpful && <span className={styles.helpfulBadge}><FiStar /> Most helpful</span>}
                    <span className={styles.replyTime}>{r.time}</span>
                  </div>
                  {r.official && r.mod && <ModeratorByline mod={r.mod} />}
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
                  {(() => {
                    const isLiked = !!likedReplies[replyKey(r)]
                    return (
                      <button
                        type="button"
                        aria-pressed={isLiked}
                        aria-label={isLiked ? 'Unlike this reply' : 'Like this reply'}
                        className={[styles.replyReact, isLiked && styles.replyReactOn].filter(Boolean).join(' ')}
                        onClick={() => toggleReplyLike(r)}
                      >
                        <FiHeart /> {r.reactions + (isLiked ? 1 : 0)}
                      </button>
                    )
                  })()}
                </div>
              </FadeIn>
            ))}
          </div>

          <div className={styles.compose}>
            <div className={styles.crHead}>
              <ForumAvatar
                className={styles.crAv}
                person={{ photo: currentUser.photo, initials: currentUser.initials, name: 'You' }}
              />
              <span>
                Replying to <strong>{thread.author.n}</strong>
              </span>
            </div>
            <textarea
              ref={replyBoxRef}
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

      {reportingAuthor && (
        <ReportReplyModal authorName={reportingAuthor} onClose={() => setReportingAuthor(null)} />
      )}
    </PageShell>
  )
}
