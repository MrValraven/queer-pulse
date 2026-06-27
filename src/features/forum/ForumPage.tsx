import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiHome, FiBriefcase } from 'react-icons/fi'
import { LuLandmark } from 'react-icons/lu'
import { TbPin } from 'react-icons/tb'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { CATS, CAT_STYLE, THREADS, type Thread } from './forum.data'
import { ForumThreadListSkeleton } from './ForumSkeleton'
import { ComposeThreadModal, type NewThreadInput } from './ComposeThreadModal'
import styles from './ForumPage.module.css'

export function ForumPage() {
  const loading = useSimulatedLoad()
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [voted, setVoted] = useState<Set<number>>(new Set())
  const [composing, setComposing] = useState(false)
  const [extraThreads, setExtraThreads] = useState<Thread[]>([])

  const allThreads = useMemo(() => [...extraThreads, ...THREADS], [extraThreads])

  const threads = useMemo(() => {
    const filtered = allThreads.filter((t) => cat === 'all' || t.cat === cat)
    if (sort === 'new') return [...filtered].sort((a, b) => b.id - a.id)
    return [...filtered].sort((a, b) => (b.pinned ? 1000 : 0) + b.upvotes - ((a.pinned ? 1000 : 0) + a.upvotes))
  }, [allThreads, cat, sort])

  function publishThread({ title, body, cat: postCat }: NewThreadInput) {
    const id = Date.now()
    const excerpt = body.length > 160 ? `${body.slice(0, 157)}…` : body
    setExtraThreads((prev) => [
      {
        id,
        cat: postCat,
        title,
        excerpt,
        author: { i: 'SF', n: 'You', t: 'var(--plum)', tt: 'var(--cream)' },
        posted: 'just now',
        views: 1,
        upvotes: 1,
        comments: 0,
        tags: [],
        body: body.split('\n').map((p) => p.trim()).filter(Boolean),
        replies: [],
      },
      ...prev,
    ])
    // Surface the new post regardless of current filter/sort.
    setCat('all')
    setSort('new')
  }

  function toggleVote(id: number) {
    setVoted((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroRow}>
            <div>
              <div className={styles.cat}>Community forum</div>
              <h1>
                The <em>commons</em>
              </h1>
              <p>Questions, proposals, guides, and the slow work of building a community. Members only — be kind, be useful.</p>
            </div>
            <Button className={styles.newBtn} onClick={() => setComposing(true)}>
              + New post
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sbLabel}>Categories</div>
              {CATS.map((c) => (
                <button
                  key={c.id}
                  className={[styles.catItem, cat === c.id && styles.catItemOn].filter(Boolean).join(' ')}
                  onClick={() => setCat(c.id)}
                >
                  <span className={styles.catIcon}><c.icon /></span>
                  <span className={styles.catName}>{c.name}</span>
                  <span className={styles.catCount}>{c.count}</span>
                </button>
              ))}
              <div className={styles.sbDivider} />
              <Link to={routes.safety} className={styles.sbLink}>
                <FiAlertTriangle /> Emergency resources
              </Link>
              <Link to={routes.housing} className={styles.sbLink}>
                <FiHome /> Housing board
              </Link>
              <Link to={routes.jobs} className={styles.sbLink}>
                <FiBriefcase /> Job board
              </Link>
              <Link to={routes.governance} className={styles.sbLink}>
                <LuLandmark /> Governance &amp; transparency
              </Link>
            </aside>

            <div>
              <div className={styles.top}>
                <div className={styles.sort}>
                  <button className={[styles.sortBtn, sort === 'top' && styles.sortBtnOn].filter(Boolean).join(' ')} onClick={() => setSort('top')}>
                    Top
                  </button>
                  <button className={[styles.sortBtn, sort === 'new' && styles.sortBtnOn].filter(Boolean).join(' ')} onClick={() => setSort('new')}>
                    New
                  </button>
                </div>
                <span className={styles.count}>
                  {threads.length} thread{threads.length === 1 ? '' : 's'}
                </span>
              </div>

              {loading && <ForumThreadListSkeleton count={5} />}
              {!loading && threads.map((t, idx) => {
                const isVoted = voted.has(t.id)
                const catMeta = CATS.find((c) => c.id === t.cat)
                const cs = CAT_STYLE[t.cat]
                return (
                  <FadeIn key={t.id} delay={Math.min(idx, 8) * 60}>
                  <Link to={`/thread/${t.id}`} className={[styles.thread, t.pinned && styles.threadPinned].filter(Boolean).join(' ')}>
                    <div
                      className={styles.voteCol}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isVoted}
                      onClick={(e) => { e.preventDefault(); toggleVote(t.id) }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleVote(t.id)
                        }
                      }}
                    >
                      <button className={[styles.voteUp, isVoted && styles.voteUpOn].filter(Boolean).join(' ')}>▲</button>
                      <span className={styles.voteN}>{t.upvotes + (isVoted ? 1 : 0)}</span>
                    </div>
                    <div>
                      <div className={styles.badges}>
                        {t.pinned && <span className={styles.pinBadge}><TbPin /> Pinned</span>}
                        <span className={styles.catBadge} style={{ background: cs.bg, color: cs.color }}>
                          {catMeta && <catMeta.icon />} {catMeta?.name}
                        </span>
                        {t.tags.map((tg) => (
                          <span key={tg} className={styles.tag}>
                            #{tg}
                          </span>
                        ))}
                      </div>
                      <div className={styles.threadTitle}>{t.title}</div>
                      <div className={styles.threadExcerpt}>{t.excerpt}</div>
                      <div className={styles.threadMeta}>
                        <span className={styles.tmAv} style={{ background: t.author.t, color: t.author.tt }}>
                          {t.author.i}
                        </span>
                        <span className={styles.tmAuthor}>{t.author.n}</span>
                        <span className={styles.tmDot} />
                        <span>{t.posted}</span>
                        <span className={styles.tmDot} />
                        <span>{t.comments} replies</span>
                      </div>
                    </div>
                  </Link>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {composing && (
        <ComposeThreadModal onClose={() => setComposing(false)} onPublish={publishThread} />
      )}
    </PageShell>
  )
}
