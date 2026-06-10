import { useState, type ReactNode } from 'react'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './funding.module.css'

const FILTERS = ['All open', 'Commissions', 'Grants', 'Residencies', 'Closing soon']

interface Call {
  id: string
  av: string
  tone?: 'jade'
  name: string
  seat: string
  tags: { label: string; cls: string }[]
  titlePre: string
  titleEm: string
  titlePost?: string
  brief: ReactNode
  amt: string
  amtLabel: string
  meta: string[]
  tracks?: { pre: string; em?: string; sub: string; tint: 'coral' | 'jade' | 'plum' }[]
  placeholder?: string
}

const CALLS: Call[] = [
  {
    id: 'c1', av: 'SM', name: 'Sara Marques', seat: 'Council · seat 1',
    tags: [{ label: 'Commission', cls: 'tagCommission' }, { label: 'Closes in 4 days', cls: 'tagUrgent' }],
    titlePre: 'A song for the ', titleEm: 'Marsha P. Johnson', titlePost: ' night',
    brief: <>We're scoring the June 28th broadcast — a 90-minute live room marking the anniversary. We want <em>one original track</em>, 3–6 minutes, that holds the room between speakers. Yours to keep and re-release.</>,
    amt: '800', amtLabel: 'flat · paid on accept', meta: ['Deadline 14 Jun', '1 track', '4 of 12 slots filled'],
    tracks: [{ pre: 'Carta para a ', em: 'santa', sub: '2026 · 4:18', tint: 'coral' }, { pre: 'A ', em: 'Beja', sub: '2025 · 3:51', tint: 'plum' }, { pre: 'Devoção ', em: '(demo)', sub: 'unreleased · 5:02', tint: 'jade' }],
    placeholder: 'A sentence on why this one (optional). The council reads the work first.',
  },
  {
    id: 'c2', av: 'DO', tone: 'jade', name: 'D. Okoye', seat: 'Council · seat 4',
    tags: [{ label: 'Grant', cls: 'tagGrantCall' }],
    titlePre: 'Spring grant — ', titleEm: 'trans composers', titlePost: ' strand',
    brief: <>Unrestricted €1,200 grants for trans and non-binary composers working in any form — score, ambient, choral, club. No deliverable required; we fund the <em>practice</em>, not a product. Twelve grants this round.</>,
    amt: '1,200', amtLabel: 'unrestricted', meta: ['Deadline 30 Jun', '1 release as evidence', '12 grants'],
    tracks: [{ pre: 'Cidade dos ', em: 'santos', sub: 'Album · 11 tracks', tint: 'coral' }, { pre: 'Devoção', sub: 'EP · 9 tracks', tint: 'plum' }],
    placeholder: 'What would the grant let you make? (optional)',
  },
  {
    id: 'c3', av: 'YR', name: 'Yara Reis', seat: 'Council · seat 3',
    tags: [{ label: 'Residency', cls: 'tagResidency' }],
    titlePre: 'Casa do Comum — ', titleEm: 'August', titlePost: ' residency',
    brief: <>Two weeks in the Lisbon venue with keys, a PA, and a recording rig. End with one live broadcast from the room. Travel and a €600 stipend covered. We're looking for someone who'll <em>use the space loudly</em>.</>,
    amt: '600', amtLabel: '+ space & travel', meta: ['Deadline 20 Jul', '1 track + note', '1 residency'],
    tracks: [{ pre: 'Carta para a ', em: 'santa', sub: '2026 · 4:18', tint: 'coral' }, { pre: 'A ', em: 'Beja', sub: '2025 · 3:51', tint: 'plum' }],
    placeholder: 'How would you use the two weeks? (optional)',
  },
]

export function StudioOpenCallsPage() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('All open')
  const [open, setOpen] = useState<string | null>(null)
  const [picked, setPicked] = useState<Record<string, number>>({})

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={`${s.eb} ${s.ebAccent}`}>From the council</div>
          <h1>
            Open <em>calls</em> &amp; commissions.
          </h1>
          <div className={s.dek}>
            Briefs the council and co-op have funded. Apply inline — attach a <em>single track or release</em> from your catalogue. No cover letters, no portfolios; the work speaks.
          </div>
        </div>

        <div className={s.filter}>
          {FILTERS.map((f) => (
            <button key={f} className={[s.chip, filter === f && s.chipOn].filter(Boolean).join(' ')} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <span className={s.filterCount}>
            <em>7</em> open · you've applied to 2
          </span>
        </div>

        <div className={s.calls}>
          {CALLS.map((c) => {
            const isOpen = open === c.id
            return (
              <div key={c.id} className={s.call}>
                <div className={s.callTop}>
                  <div className={s.callCur}>
                    <span className={[s.av, c.tone === 'jade' && s.jade].filter(Boolean).join(' ')}>{c.av}</span>
                    <div>
                      <div className={s.nm}>{c.name}</div>
                      <div className={s.ro}>{c.seat}</div>
                    </div>
                  </div>
                  <div className={s.callMain}>
                    <div className={s.callTags}>
                      {c.tags.map((tg) => (
                        <span key={tg.label} className={`${s.callTag} ${s[tg.cls as keyof typeof s] ?? ''}`}>
                          {tg.label}
                        </span>
                      ))}
                    </div>
                    <h3>
                      {c.titlePre}
                      <em>{c.titleEm}</em>
                      {c.titlePost}
                    </h3>
                    <p className={s.brief}>{c.brief}</p>
                  </div>
                  <div className={s.callAmt}>
                    <div className="v" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28, color: 'var(--cream)' }}>
                      €<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{c.amt}</em>
                    </div>
                    <div className="l" style={{ fontSize: 11, color: 'rgba(247,243,238,.4)' }}>{c.amtLabel}</div>
                  </div>
                </div>
                <div className={s.callFoot}>
                  <div className={s.callMeta}>
                    {c.meta.map((mt, i) => (
                      <span key={mt} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        {i > 0 && <span className={s.dot} />}
                        {mt}
                      </span>
                    ))}
                  </div>
                  <div className={s.callActions}>
                    <button className={s.bt} onClick={() => showToast('Brief saved to your dashboard', 'info')}>
                      Save
                    </button>
                    <button className={`${s.bt} ${s.btP}`} onClick={() => setOpen(isOpen ? null : c.id)}>
                      Apply →
                    </button>
                  </div>
                </div>
                {isOpen && c.tracks && (
                  <div className={s.attach}>
                    <div className={s.al}>Attach one track from your catalogue</div>
                    <div className={s.picker}>
                      {c.tracks.map((tr, i) => (
                        <div key={tr.pre} className={[s.trk, (picked[c.id] ?? 0) === i && s.trkOn].filter(Boolean).join(' ')} onClick={() => setPicked((p) => ({ ...p, [c.id]: i }))}>
                          <span className={s.cv}>
                            <ImageSlot tint={tr.tint} width={36} height={36} radius={6} placeholder="" />
                          </span>
                          <div>
                            <h5>
                              {tr.pre}
                              {tr.em && <em>{tr.em}</em>}
                            </h5>
                            <p>{tr.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <textarea className={s.attachTa} placeholder={c.placeholder} />
                    <div className={s.attachFoot}>
                      <button className={`${s.bt} ${s.btP}`} onClick={() => { setOpen(null); showToast('Application submitted — the council reviews in Monday triage', 'success') }}>
                        Submit application
                      </button>
                      <button className={s.bt} onClick={() => setOpen(null)}>
                        Cancel
                      </button>
                      <span className={s.singleNote}>
                        <em>One track only</em> — the council wants your sharpest, not your folder.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Applied state */}
          <div className={s.call} style={{ opacity: 0.72 }}>
            <div className={s.callTop}>
              <div className={s.callCur}>
                <span className={`${s.av} ${s.jade}`}>SM</span>
                <div>
                  <div className={s.nm}>Sara Marques</div>
                  <div className={s.ro}>Council · seat 1</div>
                </div>
              </div>
              <div className={s.callMain}>
                <div className={s.callTags}>
                  <span className={`${s.callTag} ${s.tagCommission}`}>Commission</span>
                  <span className={`${s.callTag} ${s.tagApplied}`}>Applied · 2 Jun</span>
                </div>
                <h3>
                  Closing theme for the <em>Pride assembly</em>
                </h3>
                <p className={s.brief}>
                  You attached <em>A Beja</em> and a note. Sara claimed it on 4 June. Decision by 18 June — you'll hear back here and by email, with a sentence either way.
                </p>
              </div>
              <div className={s.callAmt}>
                <div className="v" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28, color: 'var(--cream)' }}>
                  €<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>500</em>
                </div>
                <div className="l" style={{ fontSize: 11, color: 'rgba(247,243,238,.4)' }}>flat</div>
              </div>
            </div>
            <div className={s.callFoot}>
              <div className={s.callMeta}>
                <span>
                  Status · <em>in review with Sara</em>
                </span>
                <span className={s.dot} />
                <span>decision by 18 Jun</span>
              </div>
              <div className={s.callActions}>
                <button className={s.bt} onClick={() => showToast('Application withdrawn', 'info')}>
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  )
}
