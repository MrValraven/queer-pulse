import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './ThreadPage.module.css'

interface Reply {
  av: string
  bg: string
  color: string
  name: string
  time: string
  isOP?: boolean
  helpful?: boolean
  quote?: { cite: string; text: string }
  body: string[]
  reactions: number
}

const REPLIES: Reply[] = [
  { av: 'RF', bg: 'rgba(232,119,90,.14)', color: 'var(--accent-ink)', name: 'Rita Fonseca', time: '1h 50m ago', helpful: true, body: ['I used Dr. Ana Marques at the office on Rua da Mouraria when I was setting up my current lease last year. Self-employed, similar documentation situation. She didn\'t bat an eye — just asked for two years of IRS returns and bank statements from the last three months.', 'Her English is functional but not fluent, so if you need the whole thing in English you might want to bring someone along for the technical bits. Her email is in the member directory under legal services.'], reactions: 8 },
  { av: 'PC', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', name: 'Paulo Costa', time: '1h 32m ago', body: ["Second the Rita recommendation — Ana Marques is excellent. I'd also add that with the March rule changes, some notaries are still getting up to speed on the new requirements for short-term fixed contracts. Worth explicitly asking whether they've handled any post-March leases before you book."], reactions: 4 },
  { av: 'ML', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)', name: 'Mateus Lima', time: '1h 18m ago', isOP: true, quote: { cite: 'Rita Fonseca', text: 'Dr. Ana Marques at the office on Rua da Mouraria…' }, body: ["This is really helpful — thank you. And good point Paulo, I'll ask about post-March experience when I contact her. Does anyone know if she typically charges a flat fee or hourly for this kind of review?"], reactions: 2 },
  { av: 'KN', bg: 'rgba(112,80,170,.12)', color: '#7050AA', name: 'Karina Neves', time: '55m ago', body: ['Not a notary recommendation, but worth knowing: the Ordem dos Notários website has a lookup by postal code. Several in the 1100-* area have flagged themselves as experienced with new-regime contracts since March.', 'Also — if you\'re using a standard arrendamento habitacional contract, the notary mostly just needs to authenticate signatures. The heavy lifting is in the contract itself. Might be worth getting a lawyer to check the wording separately.'], reactions: 6 },
  { av: 'DF', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', name: 'Daniel F.', time: '38m ago', body: ['Ana Marques charges a flat rate for standard residential contracts — around €180–220 last time I checked, which includes the registration. She was upfront about it from the first email.'], reactions: 5 },
]

const SORTS = ['Oldest', 'Newest', 'Most helpful'] as const

export function ThreadPage() {
  const { showToast } = useToast()
  const [liked, setLiked] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Oldest')
  const [reply, setReply] = useState('')

  return (
    <PageShell>
      <section className={styles.topbar}>
        <div className="wrap">
          <div className={styles.topbarInner}>
            <Link to="/forum" className={styles.back}>
              <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="10,4 6,8 10,12" />
              </svg>
              Forum
            </Link>
            <span className={styles.sep} />
            <span className={styles.topCat}>Housing</span>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={styles.layout}>
          <div className={styles.opCard}>
            <div className={styles.opHead}>
              <div className={styles.opAv} style={{ background: 'rgba(74,140,111,.15)', color: 'var(--jade)' }}>
                ML
              </div>
              <div>
                <div className={styles.opName}>Mateus Lima</div>
                <div className={styles.opSub}>
                  <span className={styles.opCat} style={{ color: 'var(--jade)' }}>
                    Housing
                  </span>
                  <span>·</span>
                  <span>Posted 2 hours ago</span>
                  <span>·</span>
                  <span>34 views</span>
                </div>
              </div>
            </div>
            <h1 className={styles.opTitle}>Anyone know a landlord-friendly notary in Mouraria or Intendente?</h1>
            <div className={styles.opBody}>
              <p>
                My current rental contract is up in August and I need to navigate the updated
                residential rental rules that came into force in March. The issue isn't the contract
                itself — I have a template — it's finding a notary who's actually comfortable with
                tenants who have non-traditional income documentation.
              </p>
              <p>
                I'm self-employed (mix of freelance and a small consultancy), and my previous notary
                kept asking for payslips I obviously don't have. I need someone who's dealt with this
                before and won't make it a negotiation.
              </p>
              <p>Any recommendations — ideally in the Mouraria/Intendente area, or willing to work remotely? Portuguese or English both fine.</p>
            </div>
            <div className={styles.opTags}>
              {['housing', 'legal', 'freelance', 'Mouraria'].map((t) => (
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
                {14 + (liked ? 1 : 0)}
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
            <span className={styles.replyCount}>11 replies</span>
            <div className={styles.replySort}>
              {SORTS.map((s) => (
                <button key={s} className={[styles.sortBtn, sort === s && styles.sortBtnOn].filter(Boolean).join(' ')} onClick={() => setSort(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            {REPLIES.map((r, i) => (
              <div key={i} className={[styles.reply, r.helpful && styles.replyHighlighted].filter(Boolean).join(' ')}>
                <div className={styles.replyAv} style={{ background: r.bg, color: r.color }}>
                  {r.av}
                </div>
                <div>
                  <div className={styles.replyTop}>
                    <span className={styles.replyName}>{r.name}</span>
                    {r.isOP && <span className={styles.opBadge}>OP</span>}
                    {r.helpful && <span className={styles.helpfulBadge}>★ Most helpful</span>}
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
                    ♥ {r.reactions}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.compose}>
            <div className={styles.crHead}>
              <span className={styles.crAv}>SF</span>
              <span>
                Replying to <strong>Mateus Lima</strong>
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
                  showToast('Reply posted', 'success')
                  setReply('')
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
