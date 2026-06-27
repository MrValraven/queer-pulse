import { useState, type ReactNode } from 'react'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './council.module.css'

interface Flag {
  id: string
  tint: 'coral' | 'jade' | 'plum'
  titlePre: string
  titleEm?: string
  titlePost?: string
  who: string
  cat: string
  reason: ReactNode
  rmeta: string
  claimAv: string
  claim: ReactNode
  deadline: string
  unclaimed?: boolean
  image?: string
}

const resolvedFlagImage = 'https://plus.unsplash.com/premium_photo-1757392183531-16c1990f7b43?q=80&w=400&auto=format&fit=crop'

const FLAGS: Flag[] = [
  {
    id: 'f1', tint: 'plum', titlePre: 'Salt water, ', titleEm: 'slowly', who: 'Akin Diallo · single · uploaded 3 weeks ago',
    cat: 'Possible uncleared sample', reason: <>"There's a field recording under the second half that sounds lifted from a known archive. <em>Worth checking it's cleared</em> before it keeps earning."</>,
    rmeta: 'Flagged by 2 listeners · the artist has been notified to respond', claimAv: 'SM', claim: <>Claimed by <em>Sara Marques</em> · awaiting artist reply</>, deadline: 'decide by 19 Jun',
    image: 'https://plus.unsplash.com/premium_photo-1669876271015-55e215f60bc4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'f2', tint: 'coral', titlePre: 'Bicha, with ', titleEm: 'love', titlePost: ' (remix)', who: 'Mateus F. & DJ Carrasco · single · uploaded 1 month ago',
    cat: 'Wrong / missing credit or split', reason: <>"The remix credits DJ Carrasco but the original vocal is by someone uncredited. <em>The split table doesn't list them</em> — they should be getting paid."</>,
    rmeta: 'Flagged by 1 listener · the named artist has been notified to respond', claimAv: 'DO', claim: <>Claimed by <em>D. Okoye</em> · awaiting artist reply</>, deadline: 'decide by 21 Jun',
    image: 'https://images.unsplash.com/photo-1774394027421-9daa1181f9ea?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'f3', tint: 'jade', titlePre: 'The Anjos ', titleEm: 'tape', who: 'Recorded live · Casa do Comum · 7 artists',
    cat: 'Not the artist it claims to be', reason: <>"Pretty sure this live tape lists a performer who wasn't actually there that night. <em>Could be an honest mistake</em> in the lineup."</>,
    rmeta: 'Flagged by 1 listener · unclaimed · in the queue 2 days', claimAv: '?', claim: <>Unclaimed · any curator can take it</>, deadline: 'decide by 23 Jun', unclaimed: true,
    image: 'https://plus.unsplash.com/premium_photo-1666232835461-f49509f2a97c?q=80&w=800&auto=format&fit=crop',
  },
]

export function StudioFlagReviewPage() {
  const { showToast } = useToast()
  const [resolved, setResolved] = useState<Record<string, string>>({})

  function resolve(id: string, verb: string, msg: string) {
    setResolved((r) => ({ ...r, [id]: verb }))
    showToast(msg, 'success')
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={`${s.eb} ${s.ebJade}`}>Council · flag review</div>
          <h1>
            When the room <em>flags</em> something.
          </h1>
          <div className={s.dek}>
            Listeners can flag a release for uncleared samples, missing credits, or misattribution. A curator claims each one, the named artist gets to respond, and <em>every decision is logged with a reason</em>. Nothing is taken down silently.
          </div>
        </div>

        <div className={s.flags}>
          {FLAGS.map((f) => {
            const done = resolved[f.id]
            return (
              <div key={f.id} className={[s.flag, done && s.flagResolved].filter(Boolean).join(' ')}>
                <div className={s.flagTop}>
                  <span className={s.flagCv}>
                    <ImageSlot src={f.image} tint={f.tint} width={46} height={46} radius={8} placeholder="" />
                  </span>
                  <div className={s.flagTi}>
                    <h3>
                      {f.titlePre}
                      {f.titleEm && <em>{f.titleEm}</em>}
                      {f.titlePost}
                    </h3>
                    <div className="who">{f.who}</div>
                  </div>
                  {done ? (
                    <span className={s.flagResolvedTag}>Resolved · {done}</span>
                  ) : (
                    <button className={s.flagPlay} aria-label="Play">
                      <svg viewBox="0 0 12 14" fill="currentColor">
                        <path d="M1 1l10 6-10 6z" />
                      </svg>
                    </button>
                  )}
                </div>

                {!done && (
                  <>
                    <div className={s.flagReason}>
                      <span className={s.flagCat}>{f.cat}</span>
                      <p>{f.reason}</p>
                      <div className={s.rmeta}>{f.rmeta}</div>
                    </div>
                    <div className={s.flagClaim}>
                      <span className="av" style={f.unclaimed ? { background: 'rgba(247,243,238,.1)', color: 'rgba(247,243,238,.4)' } : undefined}>
                        {f.claimAv}
                      </span>
                      {f.claim}
                      <span className={s.dl}>{f.deadline}</span>
                    </div>
                    <div className={s.flagActions}>
                      {f.unclaimed ? (
                        <>
                          <button className={`${s.bt} ${s.btP}`} onClick={() => showToast("Claimed — it's yours to review", 'success')}>
                            Claim &amp; review
                          </button>
                          <span className={s.grow} />
                          <button className={`${s.bt} ${s.btDismiss}`} onClick={() => resolve(f.id, 'dismissed', 'Lineup confirmed accurate')}>
                            Dismiss
                          </button>
                          <button className={`${s.bt} ${s.btUphold}`} onClick={() => resolve(f.id, 'corrected', 'Lineup corrected')}>
                            Correct lineup
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={`${s.bt} ${s.btDismiss}`} onClick={() => resolve(f.id, 'dismissed', 'Flag dismissed — credits confirmed correct')}>
                            Dismiss
                          </button>
                          <button className={s.bt} onClick={() => showToast('Correction requested from the artist', 'info')}>
                            Request fix
                          </button>
                          <span className={s.grow} />
                          <button className={`${s.bt} ${s.btUphold}`} onClick={() => resolve(f.id, 'held', 'Held until corrected')}>
                            Hold until fixed
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Already resolved */}
          <div className={`${s.flag} ${s.flagResolved}`}>
            <div className={s.flagTop}>
              <span className={s.flagCv}>
                <ImageSlot src={resolvedFlagImage} tint="coral" width={46} height={46} radius={8} placeholder="" />
              </span>
              <div className={s.flagTi}>
                <h3>
                  Kitchen <em>warm-up</em>
                </h3>
                <div className="who">João Ribeiro · resolved 6 Jun</div>
              </div>
              <span className={s.flagResolvedTag}>Dismissed · cleared</span>
            </div>
            <div className={s.flagClaim} style={{ marginTop: 14 }}>
              <span className="av">SM</span>
              Reviewed by <em>Sara Marques</em> · reporter was told the sample is public-domain, with a link
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  )
}
