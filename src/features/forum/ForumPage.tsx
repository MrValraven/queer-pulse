import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './ForumPage.module.css'

const CATS = [
  { id: 'all', name: 'All posts', icon: '🌐', count: 61 },
  { id: 'general', name: 'General', icon: '💬', count: 12 },
  { id: 'housing', name: 'Housing', icon: '🏠', count: 8 },
  { id: 'health', name: 'Health & Wellbeing', icon: '🧠', count: 9 },
  { id: 'arts', name: 'Arts & Culture', icon: '🎨', count: 6 },
  { id: 'activism', name: 'Activism & Proposals', icon: '✊', count: 8 },
  { id: 'guides', name: 'Guides & Resources', icon: '📖', count: 6 },
  { id: 'jobs', name: 'Jobs & Skills', icon: '💼', count: 7 },
  { id: 'trans', name: 'Trans & Non-Binary', icon: '⚡', count: 5 },
]

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  general: { bg: 'rgba(45,27,61,.08)', color: 'var(--plum)' },
  housing: { bg: 'rgba(74,140,111,.1)', color: 'var(--jade)' },
  health: { bg: 'rgba(122,82,184,.1)', color: '#7A52B8' },
  arts: { bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)' },
  activism: { bg: 'rgba(220,50,50,.07)', color: '#B91C1C' },
  guides: { bg: 'rgba(74,140,111,.1)', color: 'var(--jade)' },
  jobs: { bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)' },
  trans: { bg: 'rgba(122,82,184,.1)', color: '#7A52B8' },
}

interface Thread {
  id: number
  cat: string
  pinned?: boolean
  title: string
  excerpt: string
  author: { i: string; n: string; t: string; tt: string }
  posted: string
  upvotes: number
  comments: number
  tags: string[]
}

const THREADS: Thread[] = [
  { id: 1, cat: 'guides', pinned: true, title: 'Master resource guide: LGBTQ+ in Lisbon', excerpt: 'Everything you need to navigate Lisbon as a queer person — organisations, healthcare, housing, legal rights, and community. Updated monthly.', author: { i: 'QP', n: 'QueerPulse', t: '#E8775A', tt: '#fff' }, posted: '2 months ago', upvotes: 201, comments: 12, tags: ['guide', 'resources'] },
  { id: 2, cat: 'health', pinned: true, title: 'Trans-affirming healthcare in Lisbon — the full guide', excerpt: 'How to find a GP who will treat you with respect, how the SNS system handles trans healthcare, and who to call when it goes wrong.', author: { i: 'JF', n: 'Jonas Ferreira', t: '#4A8C6F', tt: '#fff' }, posted: '5 weeks ago', upvotes: 87, comments: 31, tags: ['health', 'trans', 'guide'] },
  { id: 3, cat: 'general', pinned: true, title: 'Welcome thread — introduce yourself 👋', excerpt: "Say hello. Tell us who you are, where you're from, what you make, and what brought you to QueerPulse. We read every one.", author: { i: 'QP', n: 'QueerPulse', t: '#E8775A', tt: '#fff' }, posted: '3 weeks ago', upvotes: 156, comments: 89, tags: ['welcome'] },
  { id: 5, cat: 'activism', title: 'Proposal: Monthly queer film night at Cinema São Jorge', excerpt: "Sofia is proposing a monthly queer film screening at Cinema São Jorge. She has a relationship with their programming team. Upvote if you'd come.", author: { i: 'SA', n: 'Sofia Andrade', t: '#4A8C6F', tt: '#fff' }, posted: '4 days ago', upvotes: 38, comments: 24, tags: ['proposal', 'film'] },
  { id: 6, cat: 'general', title: 'What queer spaces in Lisbon do you miss or want to see return?', excerpt: "Bars, clubs, bookshops, community centres — what's been lost, what never existed but should, and what we could build. Share yours.", author: { i: 'DV', n: 'Diogo Vasques', t: '#4A8C6F', tt: '#fff' }, posted: '6 days ago', upvotes: 44, comments: 28, tags: ['spaces', 'culture'] },
  { id: 8, cat: 'housing', title: 'Honest guide to finding a flat in Lisbon as a newcomer', excerpt: "Carla wrote this after three weeks on the rental market. Not encouraging. But useful, and more honest than anything you'll find on a portal.", author: { i: 'CN', n: 'Carla Nogueira', t: '#E8775A', tt: '#fff' }, posted: '2 weeks ago', upvotes: 41, comments: 22, tags: ['housing', 'guide'] },
  { id: 16, cat: 'trans', pinned: true, title: 'Trans healthcare in Portugal 2026 — the complete SNS guide', excerpt: 'How the SNS pathway works, which gender clinics in Lisbon are actually welcoming, and what to do when the system pushes back.', author: { i: 'JF', n: 'Jonas Ferreira', t: '#4A8C6F', tt: '#fff' }, posted: '2 weeks ago', upvotes: 92, comments: 26, tags: ['trans', 'healthcare'] },
  { id: 11, cat: 'arts', title: 'Vote: Queer film series — what do we watch in July?', excerpt: "We're doing our first proper screening. Submit and upvote films below. Foreign language films very welcome.", author: { i: 'SA', n: 'Sofia Andrade', t: '#4A8C6F', tt: '#fff' }, posted: '2 days ago', upvotes: 18, comments: 12, tags: ['film', 'vote'] },
  { id: 13, cat: 'general', title: 'Should QueerPulse be more accessible to non-professionals?', excerpt: "The invite-only + 'professional network' framing might be excluding people who need community most. Thoughts?", author: { i: 'CV', n: 'Catarina Vaz', t: '#2D1B3D', tt: '#F7F3EE' }, posted: '1 week ago', upvotes: 41, comments: 23, tags: ['platform', 'inclusion'] },
  { id: 18, cat: 'activism', title: 'Micro-grants: Q3 2026 applications now open', excerpt: 'The community fund has €840 available this quarter for projects, events, and emergencies. €50–200 grants, no bureaucracy.', author: { i: 'QP', n: 'QueerPulse', t: '#E8775A', tt: '#fff' }, posted: '4 days ago', upvotes: 22, comments: 9, tags: ['grants', 'fund'] },
  { id: 15, cat: 'jobs', title: 'Queer-run bookshop in Anjos — hiring a bookseller', excerpt: "The bookshop we've been building is opening in September. Looking for a part-time bookseller with a love of queer literature.", author: { i: 'IT', n: 'Inês Tavares', t: '#E8775A', tt: '#fff' }, posted: '1 day ago', upvotes: 31, comments: 14, tags: ['jobs', 'bookshop'] },
  { id: 19, cat: 'trans', title: 'Legal name change in Portugal — sharing experiences and tips', excerpt: 'Possible since 2018, but in practice it depends heavily on which conservatória and official you see. Share your story.', author: { i: 'CV', n: 'Catarina Vaz', t: '#2D1B3D', tt: '#F7F3EE' }, posted: '1 week ago', upvotes: 34, comments: 18, tags: ['trans', 'legal'] },
]

export function ForumPage() {
  const { showToast } = useToast()
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [voted, setVoted] = useState<Set<number>>(new Set())

  const threads = useMemo(() => {
    const filtered = THREADS.filter((t) => cat === 'all' || t.cat === cat)
    if (sort === 'new') return [...filtered].sort((a, b) => b.id - a.id)
    return [...filtered].sort((a, b) => (b.pinned ? 1000 : 0) + b.upvotes - ((a.pinned ? 1000 : 0) + a.upvotes))
  }, [cat, sort])

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
            <Button className={styles.newBtn} onClick={() => showToast('Draft started — write your post', 'success')}>
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
                  <span className={styles.catIcon}>{c.icon}</span>
                  <span className={styles.catName}>{c.name}</span>
                  <span className={styles.catCount}>{c.count}</span>
                </button>
              ))}
              <div className={styles.sbDivider} />
              <Link to="/safety" className={styles.sbLink}>
                🆘 Emergency resources
              </Link>
              <Link to="/housing" className={styles.sbLink}>
                🏠 Housing board
              </Link>
              <Link to="/jobs" className={styles.sbLink}>
                💼 Job board
              </Link>
              <Link to="/governance" className={styles.sbLink}>
                🏛️ Governance &amp; transparency
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

              {threads.map((t) => {
                const isVoted = voted.has(t.id)
                const catMeta = CATS.find((c) => c.id === t.cat)
                const cs = CAT_STYLE[t.cat]
                return (
                  <Link key={t.id} to="/thread" className={[styles.thread, t.pinned && styles.threadPinned].filter(Boolean).join(' ')}>
                    <div className={styles.voteCol} onClick={(e) => { e.preventDefault(); toggleVote(t.id) }}>
                      <button className={[styles.voteUp, isVoted && styles.voteUpOn].filter(Boolean).join(' ')}>▲</button>
                      <span className={styles.voteN}>{t.upvotes + (isVoted ? 1 : 0)}</span>
                    </div>
                    <div>
                      <div className={styles.badges}>
                        {t.pinned && <span className={styles.pinBadge}>📌 Pinned</span>}
                        <span className={styles.catBadge} style={{ background: cs.bg, color: cs.color }}>
                          {catMeta?.icon} {catMeta?.name}
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
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
