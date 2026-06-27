import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import s from './flows.module.css'
import { routes } from '../../app/routeMap'

type State = 'choose' | 'muted' | 'blocked'

export function BlockMutePage() {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('choose')
  const [chosen, setChosen] = useState<'mute' | 'block' | null>(null)
  const [muteDur, setMuteDur] = useState('Until I unmute')

  return (
    <div className={s.page}>
      {state === 'choose' && (
        <div className={`${s.card} ${s.screenIn}`}>
          <div className={s.memberRow}>
            <div className={s.memAv}>SR</div>
            <div>
              <div className={s.memName}>Sofia Rodrigues</div>
              <div className={s.memMeta}>she/her · Lisbon</div>
            </div>
          </div>

          <div className={s.cardHead}>
            Privacy <em>controls</em>
          </div>
          <div className={s.cardSub}>These actions are private. Sofia will not be notified.</div>

          <div
            className={[s.optionCard, chosen === 'mute' && s.optionSelected].filter(Boolean).join(' ')}
            onClick={() => setChosen('mute')}
          >
            <div className={s.ocHeader}>
              <span className={s.ocRadio}>
                <span className={s.ocDot} />
              </span>
              <span className={s.ocTitle}>Mute Sofia</span>
            </div>
            <div className={s.ocDesc}>You won't see her posts or activity. She won't know she's been muted. You can unmute at any time.</div>
            {chosen === 'mute' && (
              <div className={s.subOpts}>
                <div className={s.subLabel}>What to mute</div>
                <label className={s.checkRow}>
                  <input type="checkbox" defaultChecked /> Posts &amp; updates
                </label>
                <label className={s.checkRow}>
                  <input type="checkbox" defaultChecked /> Comments &amp; replies
                </label>
                <label className={s.checkRow}>
                  <input type="checkbox" /> Gathering invites
                </label>
                <div className={s.subLabel} style={{ marginTop: 14 }}>
                  Duration
                </div>
                <div className={s.durationRow}>
                  {['Until I unmute', '7 days', '30 days'].map((d) => (
                    <button
                      key={d}
                      className={[s.durBtn, muteDur === d && s.durBtnActive].filter(Boolean).join(' ')}
                      onClick={(e) => {
                        e.stopPropagation()
                        setMuteDur(d)
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className={[s.optionCard, chosen === 'block' && s.optionSelected].filter(Boolean).join(' ')}
            onClick={() => setChosen('block')}
          >
            <div className={s.ocHeader}>
              <span className={s.ocRadio}>
                <span className={s.ocDot} />
              </span>
              <span className={s.ocTitle}>Block Sofia</span>
            </div>
            <div className={s.ocDesc}>She can't view your profile, message you, or see you in search. Neither of you can connect with the other.</div>
            {chosen === 'block' && (
              <div className={s.subOpts}>
                <div className={s.warnBox}>
                  <strong>Note:</strong> If you share communities, Sofia will still appear in member lists — but won't be able to interact with you directly.
                </div>
              </div>
            )}
          </div>

          <div className={s.actions}>
            <Button disabled={!chosen} onClick={() => setState(chosen === 'mute' ? 'muted' : 'blocked')}>
              Continue
            </Button>
            <button className={s.cancelLink} onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {state === 'muted' && (
        <div className={`${s.card} ${s.center} ${s.screenIn}`}>
          <div className={s.icon} style={{ background: 'rgba(45,27,61,.07)' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M5.5 8.5h13M5.5 12h8M5.5 15.5h5" stroke="var(--plum)" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
          <div className={s.title}>
            You've <em>muted</em> Sofia
          </div>
          <div className={s.sub}>Her posts and replies are now hidden from your feed. She doesn't know.</div>
          <div className={s.summary}>
            <div className={s.csRow}>
              <span className={s.csLabel}>What's muted</span>
              <span className={s.csVal}>Posts &amp; comments</span>
            </div>
            <div className={s.csRow}>
              <span className={s.csLabel}>Duration</span>
              <span className={s.csVal}>{muteDur}</span>
            </div>
            <div className={s.csRow}>
              <span className={s.csLabel}>Sofia notified?</span>
              <span className={s.csVal}>No</span>
            </div>
          </div>
          <Link to={routes.settings} className={s.manageLink}>
            Manage muted members →
          </Link>
          <span className={s.undoLink} onClick={() => setState('choose')}>
            Undo — unmute Sofia
          </span>
        </div>
      )}

      {state === 'blocked' && (
        <div className={`${s.card} ${s.center} ${s.screenIn}`}>
          <div className={s.icon} style={{ background: 'rgba(45,27,61,.08)' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <circle cx={12} cy={12} r={8} stroke="var(--plum)" strokeWidth={2} />
              <path d="M6.5 6.5l11 11" stroke="var(--plum)" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
          <div className={s.title}>
            You've <em>blocked</em> Sofia
          </div>
          <div className={s.sub}>Sofia can no longer view your profile, message you, or find you in search.</div>
          <div className={s.summary}>
            <div className={s.csRow}>
              <span className={s.csLabel}>Profile visible to her</span>
              <span className={s.csVal}>No</span>
            </div>
            <div className={s.csRow}>
              <span className={s.csLabel}>Can she message you</span>
              <span className={s.csVal}>No</span>
            </div>
            <div className={s.csRow}>
              <span className={s.csLabel}>Sofia notified?</span>
              <span className={s.csVal}>No</span>
            </div>
          </div>
          <Link to={routes.settings} className={s.manageLink}>
            Manage blocked members →
          </Link>
          <span className={s.undoLink} onClick={() => setState('choose')}>
            Undo — unblock Sofia
          </span>
          <div className={s.reportNote}>
            Need to report harmful behaviour? <Link to={routes.report}>File a report →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
