import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiCheck } from 'react-icons/fi'
import { ImageSlot, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSaved } from '../../app/providers/SavedProvider'
import { StudioShell } from './StudioShell'
import { StudioLine } from './StudioSkeletons'
import s from './live.module.css'
import { WF, PLAYED, SET, CHAT, TABS, coverImage } from './studioLive.data'

const stateClass: Record<string, string> = { played: s.setPlayed, now: s.setNow, upnext: s.setUpNext, queued: s.setQueued }

/** Mirrors live .setRow: number, cover, title, pay, time. */
function LiveSetRowSkeleton() {
  return (
    <div className={s.setRow}>
      <StudioLine width={14} height={11} />
      <StudioLine width={34} height={34} style={{ borderRadius: 5 }} />
      <div>
        <StudioLine width="55%" height={13} />
        <StudioLine width="35%" height={11} style={{ marginTop: 6 }} />
      </div>
      <StudioLine width={56} height={11} />
      <StudioLine width={28} height={11} />
    </div>
  )
}

const LIVE_TRACK = {
  id: 'post:studio-live-carta-para-a-santa',
  kind: 'post' as const,
  title: 'Carta para a santa',
  href: '/studio/live',
  meta: 'Mariana Sol · live set',
}

export function StudioLivePage() {
  const { showToast } = useToast()
  const { isSaved, toggleSave } = useSaved()
  const [tab, setTab] = useState('Chat')
  const saved = isSaved(LIVE_TRACK.id)
  const loading = useSimulatedLoad()

  return (
    <StudioShell>
      <div className={s.ribbon}>
        <span className={s.live} />
        On the air now
        <span className={s.show}>"Vespertina, vol. iv" · programmed &amp; hosted by Sara Marques</span>
        <span className={s.clock}>
          Wed 9 Jun · <em>21:18 Lisbon</em> · 1h 42m show, 22 min in
        </span>
      </div>

      <div className={s.grid}>
        <div>
          <div className={s.nowCard}>
            <div className={s.nowInner}>
              <div className={s.nowArt}>
                <ImageSlot src={coverImage} tint="coral" width="100%" height="100%" radius={14} placeholder="cover · Carta para a santa" style={{ position: 'absolute', inset: 0 }} />
                <span className={s.stamp}>
                  <span className={s.live} /> on air
                </span>
              </div>
              <div className={s.nowInfo}>
                <div className={s.eb}>Track 6 of 12 · jumped from queue</div>
                <h2>
                  Carta para a <em>santa</em>
                </h2>
                <div className={s.by}>
                  by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em>
                </div>
                <div className={s.wf}>
                  {WF.map((h, i) => (
                    <span key={i} className={i < PLAYED ? s.played : i === PLAYED ? s.nowPulse : undefined} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className={s.times}>
                  <span className={s.e}>1:42</span>
                  <span>4:18</span>
                </div>
                <div className={s.liveActions}>
                  <button className={`${s.bt} ${s.btP}`} onClick={() => showToast('Tipped €2 to Mariana', 'success')}>
                    Tip Mariana · €2
                  </button>
                  <button className={s.bt} onClick={() => { const now = toggleSave(LIVE_TRACK); showToast(now ? 'Track saved to your library' : 'Removed from your library', now ? 'success' : 'info') }}>
                    {saved ? <><FiCheck /> Saved</> : <><FiPlus /> Save track</>}
                  </button>
                  <Link to="/studio/track" className={s.bt}>
                    Lyrics &amp; notes →
                  </Link>
                </div>
              </div>
            </div>
            <div className={s.listeners}>
              <div>
                <div className={s.lsV}>
                  <em>312</em>
                </div>
                <div className={s.lsL}>in the room with you · 89 sustainers, 223 casual</div>
              </div>
              <div>
                <div className={`${s.lsV} ${s.jade}`}>
                  €<em>448</em>
                </div>
                <div className={s.lsL}>tipped during this set · 100% to artists</div>
              </div>
              <div>
                <div className={s.lsV}>
                  €<em>0.05</em>
                </div>
                <div className={s.lsL}>per qualifying play · pays Mariana right now</div>
              </div>
            </div>
          </div>

          <div className={s.tlH}>
            <h3>
              The set · <em>building live</em>
            </h3>
            <div className="meta">
              Sara typed the up-next track <em>2 sec ago</em>
            </div>
          </div>
          <div className={s.setCard}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <LiveSetRowSkeleton key={i} />)
              : SET.map((r, i) => (
              <FadeIn key={r.n} delay={Math.min(i, 8) * 60} className={`${s.setRow} ${stateClass[r.state]}`}>
                <span className={s.srN}>{r.n}</span>
                <span className={s.srCov}>
                  <ImageSlot src={r.image} tint={r.tint as 'coral' | 'jade' | 'plum'} width={34} height={34} radius={5} placeholder="" />
                </span>
                <div className={s.srInfo}>
                  <h5>
                    {r.pre}
                    {r.em && <em>{r.em}</em>}
                    {r.post}
                  </h5>
                  <div className={s.srWho}>{r.who}</div>
                </div>
                <div className={s.srPay}>
                  {r.payNote && <b style={{ color: 'var(--accent)' }}>{r.payNote}</b>}
                  {r.payEm ? <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{r.payEm}</em> : r.pay}
                </div>
                <span className={s.srTm}>{r.tm}</span>
              </FadeIn>
            ))}
          </div>
        </div>

        <aside className={s.chat}>
          <div className={s.chatTabs}>
            {TABS.map((tb) => (
              <button key={tb.label} className={[s.chatTab, tab === tb.label && s.chatTabOn].filter(Boolean).join(' ')} onClick={() => setTab(tb.label)}>
                {tb.label} {tb.ct && <span className={s.ct}>{tb.ct}</span>}
              </button>
            ))}
          </div>
          <div className={s.chatBody}>
            {CHAT.map((mAny, i) => {
              if ('system' in mAny) {
                return (
                  <div key={i} className={`${s.msg} ${s.msgSystem}`}>
                    <div className={s.text}>— {mAny.system} —</div>
                  </div>
                )
              }
              const m = mAny
              return (
                <div key={i} className={[s.msg, m.tip && s.msgTip].filter(Boolean).join(' ')}>
                  <span className={[s.mAv, m.tone === 'jade' && s.jade, m.tone === 'plum' && s.plum].filter(Boolean).join(' ')}>
                    {m.av}
                  </span>
                  <div>
                    <span className={[s.mName, m.curator && s.curator].filter(Boolean).join(' ')}>{m.name}</span>
                    {m.role && <span className={`${s.mRole} ${m.roleClass === 'cu' ? s.cu : m.roleClass === 'artist' ? s.artist : ''}`}>{m.role}</span>}
                    <div className={s.mText}>{m.text}</div>
                    <div className={s.mTime}>{m.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={s.chatFoot}>
            <div className={s.chatInput}>
              <input placeholder="say something to the room…" />
              <button title="Send" onClick={() => showToast('Sent to the room', 'success')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
            <div className={s.chatActions}>
              <button onClick={() => showToast('Tipped €2', 'success')}>Tip €2</button>
              <button onClick={() => showToast('Tipped €5', 'success')}>Tip €5</button>
              <button onClick={() => showToast('Choose a tip amount', 'info')}>Tip €__</button>
            </div>
          </div>
        </aside>
      </div>
    </StudioShell>
  )
}
