import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { getPartner, type Tint } from './partnerDetails'
import s from './PartnerDetailPage.module.css'

type Tab = 'about' | 'work' | 'timeline' | 'how'

const TL_CLASS: Record<Tint, string> = { coral: '', jade: s.tlJade, plum: s.tlPlum }

function emName(name: string) {
  const words = name.split(' ')
  const last = words.pop()
  return { lead: words.join(' '), last }
}

export function PartnerDetailPage() {
  const { slug } = useParams()
  const [tab, setTab] = useState<Tab>('about')

  const p = getPartner(slug)
  if (!p) return <Navigate to="/partners" replace />

  const { lead, last } = emName(p.name)

  return (
    <PageShell>
      <div className={s.page}>
        <Link to="/partners" className={s.back}>← All partners</Link>

        <header className={s.hero}>
          <div className={s.logo}>{p.logo}</div>
          <div>
            <div className={s.eyebrow}>{p.eyebrow}</div>
            <h1 className={s.name}>{lead && `${lead} `}<em>{last}.</em></h1>
            <p className={s.tagline}>{p.tagline}</p>
          </div>
          <div className={s.actions}>
            <span className={s.tier}>{p.tier}</span>
            <span className={s.since}>{p.since}</span>
          </div>
        </header>

        <div className={s.tabs}>
          <button type="button" className={[s.tab, tab === 'about' && s.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('about')}>
            About
          </button>
          <button type="button" className={[s.tab, tab === 'work' && s.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('work')}>
            Joint work <span className={s.tabCount}>{p.jointWork.length}</span>
          </button>
          <button type="button" className={[s.tab, tab === 'timeline' && s.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('timeline')}>
            Timeline
          </button>
          <button type="button" className={[s.tab, tab === 'how' && s.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('how')}>
            How we work together
          </button>
        </div>

        <div className={s.grid}>
          <main>
            {tab === 'about' && (
              <>
                <div className={s.prose}>
                  {p.about.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className={s.stats}>
                  {p.stats.map((st, i) => (
                    <div className={s.stat} key={i}>
                      <b>{st.value}</b>
                      {st.label}
                    </div>
                  ))}
                </div>
                <div className={s.prose}>
                  {p.aboutMore.map((sec) => (
                    <div key={sec.heading}>
                      <h3>{sec.heading}</h3>
                      <p>{sec.body}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'work' && (
              <div className={s.collabGrid}>
                {p.jointWork.map((c) => (
                  <div className={s.collab} key={c.title}>
                    <div className={s.collabKicker}>{c.kicker}</div>
                    <div className={s.collabTitle}>{c.title}</div>
                    <div className={s.collabDek}>{c.dek}</div>
                    <div className={s.collabFoot}>
                      <span>{c.footLeft}</span>
                      <b>{c.footRight}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'timeline' && (
              <div className={s.timeline}>
                {p.timeline.map((t, i) => (
                  <div className={[s.tlItem, t.tint && TL_CLASS[t.tint]].filter(Boolean).join(' ')} key={i}>
                    <div className={s.tlDate}>{t.date}</div>
                    <div className={s.tlTitle}>{t.title}</div>
                    <div className={s.tlBody}>{t.body}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'how' && (
              <>
                <div className={s.prose}>
                  {p.how.map((sec) => (
                    <div key={sec.heading}>
                      <h3>{sec.heading}</h3>
                      <p>{sec.body}</p>
                    </div>
                  ))}
                </div>
                <div className={s.fundNote}>{p.funding}</div>
              </>
            )}
          </main>

          <aside className={s.side}>
            <div className={s.sideCard}>
              <h4>At a glance</h4>
              {p.atGlance.map((row) => (
                <div className={s.infoRow} key={row.label}>
                  <span>{row.label}</span>
                  <b className={row.accent === 'coral' ? s.accentCoral : row.accent === 'jade' ? s.accentJade : undefined}>
                    {row.value}
                  </b>
                </div>
              ))}
            </div>

            <div className={s.sideCard}>
              <h4>Contact {p.name} directly</h4>
              {p.contact.phone && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72" /></svg>
                  <span>
                    <a href={`tel:${p.contact.phone.replace(/\s/g, '')}`}>{p.contact.phone}</a>
                    {p.contact.phoneNote ? ` · ${p.contact.phoneNote}` : null}
                  </span>
                </div>
              )}
              {p.contact.email && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><rect x={2} y={4} width={20} height={16} rx={2} /><polyline points="22,6 12,13 2,6" /></svg>
                  <a href={`mailto:${p.contact.email}`}>{p.contact.email}</a>
                </div>
              )}
              {p.contact.website && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><path d="M21 13.32V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6.68" /></svg>
                  <a href={`https://${p.contact.website}`} target="_blank" rel="noopener noreferrer">{p.contact.website}</a>
                </div>
              )}
              {p.contact.address && (
                <div className={s.contactRow}>
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx={12} cy={10} r={3} /></svg>
                  {p.contact.address}
                </div>
              )}
            </div>

            <div className={[s.sideCard, s.becomeCard].join(' ')}>
              <h4>Become a partner</h4>
              <p>Are you an org that ought to be operationally connected to QueerPulse? We're small and slow about this — write to us.</p>
              <Button variant="primary" className={s.becomeBtn} href="mailto:partners@queerpulse.pt">
                Get in touch →
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
