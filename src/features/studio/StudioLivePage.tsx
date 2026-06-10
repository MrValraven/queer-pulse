import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { StudioShell } from './StudioShell'
import s from './live.module.css'

const WF = [30, 55, 70, 90, 65, 80, 50, 42, 60, 75, 55, 88, 62, 48, 72, 80, 34, 58, 80, 46, 64, 78, 42, 90, 54, 38, 66, 74, 48, 60, 35, 50, 42, 65, 78, 50, 68, 42, 36]
const PLAYED = 15 // bars before "now"

const SET = [
  { n: '1', pre: 'A summer in ', em: 'Cascais', who: 'Inês Tavares · played 21:00 → 21:04', pay: '€0.05 to Inês', tm: '4:12', state: 'played', tint: 'coral' },
  { n: '2', pre: 'Paris is ', em: 'still', post: ' burning', who: 'Akin Diallo · played 21:04 → 21:09', pay: '€0.05 to Akin', tm: '5:08', state: 'played', tint: 'plum' },
  { n: '3', pre: 'If you have to ', em: 'ask', who: 'Yara Reis · played 21:09 → 21:10', pay: '€0.05 to Yara', tm: '1:22', state: 'played', tint: 'jade' },
  { n: '4', pre: 'Salt water, ', em: 'slowly', who: 'Akin Diallo · played 21:10 → 21:16', pay: '€0.05 to Akin', tm: '5:31', state: 'played', tint: 'coral' },
  { n: '5', pre: 'Cantiga para a ', em: 'vizinha', who: 'Coro de Outubro · played 21:16 → 21:22', pay: '€0.05 to Coro', tm: '6:08', state: 'played', tint: 'plum' },
  { n: '6', pre: 'Carta para a ', em: 'santa', who: 'Mariana Sol · playing now · 1:42 / 4:18', payNote: 'paying now', pay: '€0.05 to Mariana', tm: '4:18', state: 'now', tint: 'coral' },
  { n: '7', pre: 'Pedro on the ', em: '25', who: 'Pedro Limão · up next · starts in 2:36', payEm: 'queued by Sara', tm: '4:20', state: 'upnext', tint: 'jade' },
  { n: '8', pre: 'Mother, ', em: 'weather', who: 'Yuki Tanaka · planned, may rotate', pay: '€0.05 / play', tm: '7:14', state: 'queued', tint: 'plum' },
]

const stateClass: Record<string, string> = { played: s.setPlayed, now: s.setNow, upnext: s.setUpNext, queued: s.setQueued }

type Msg =
  | { system: string }
  | { av: string; tone?: 'jade' | 'plum'; name: string; curator?: boolean; role?: string; roleClass?: string; text: ReactNode; time: string; tip?: boolean }

const CHAT: Msg[] = [
  { system: '21:00 · Sara Marques opened the room' },
  { av: 'SM', tone: 'jade', name: 'Sara Marques', curator: true, role: 'Curator', roleClass: 'cu', text: <>welcome in. tonight: twelve tracks, mostly piano, some choir. don't shuffle — <em>i'll know</em>.</>, time: '21:01 · pinned' },
  { av: 'RT', name: 'Rita T.', text: 'first 🥹', time: '21:01' },
  { av: 'PL', name: 'Pedro L.', text: 'cascais opener, classic move', time: '21:02' },
  { system: '21:10 · 312 in the room · 41 cities' },
  { av: 'DO', tone: 'jade', name: 'D. Okoye', role: 'Sustainer', text: 'the akin double is so good. how did you sequence that 🤍', time: '21:15' },
  { av: 'SM', tone: 'jade', name: 'Sara Marques', curator: true, role: 'Curator', roleClass: 'cu', text: <>honestly? <em>by accident.</em> i had paris in slot 4 last week and it didn't land. moved it earlier, then salt water followed it home.</>, time: '21:16' },
  { av: 'PL', tone: 'jade', name: 'Pedro L.', role: 'Artist', roleClass: 'artist', tip: true, text: <><b>tipped €5 to Akin</b> · "salt water is the whole record"</>, time: '21:17' },
  { system: '21:22 · now playing: Carta para a santa, Mariana Sol' },
  { av: 'RT', name: 'Rita T.', text: <>second verse just broke me. <em>again.</em></>, time: '21:23' },
  { av: 'DO', tone: 'jade', name: 'D. Okoye', role: 'Sustainer', text: '@yara it\'s pinned in track notes 👇', time: '21:23' },
  { av: 'PL', name: 'Pedro L.', role: 'Artist', roleClass: 'artist', tip: true, text: <><b>tipped €5 to Mariana</b> · "earn it, mariana."</>, time: '21:24' },
  { av: 'SM', tone: 'jade', name: 'Sara Marques', curator: true, role: 'Curator', roleClass: 'cu', text: <>the piano leaves you here on purpose. <em>wait.</em></>, time: '21:24' },
  { av: '·', tone: 'plum', name: 'Anonymous', tip: true, text: <><b>tipped €10 to Mariana</b></>, time: '21:24' },
]

const TABS = [
  { label: 'Chat', ct: '312' },
  { label: 'Tips', ct: '87' },
  { label: 'Listeners', ct: '' },
]

export function StudioLivePage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('Chat')

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
                <ImageSlot tint="coral" width="100%" height="100%" radius={14} placeholder="cover · Carta para a santa" style={{ position: 'absolute', inset: 0 }} />
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
                  <button className={s.bt}>＋ Save track</button>
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
            {SET.map((r) => (
              <div key={r.n} className={`${s.setRow} ${stateClass[r.state]}`}>
                <span className={s.srN}>{r.n}</span>
                <span className={s.srCov}>
                  <ImageSlot tint={r.tint as 'coral' | 'jade' | 'plum'} width={34} height={34} radius={5} placeholder="" />
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
              </div>
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
