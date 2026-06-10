import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import styles from './studio.module.css'

const TRACKS = [
  { n: 1, pre: 'Abertura — ', em: 'a luz', who: 'instrumental · piano', tm: '2:10' },
  { n: 2, pre: 'Cidade dos ', em: 'santos', who: 'solo voice + piano', tm: '3:54' },
  { n: 3, pre: 'Mãe, três ', em: 'vezes', who: 'solo voice + piano', tm: '4:08' },
  { n: 4, pre: 'A ', em: 'vizinha', post: ' que reza', who: 'duet with Coro de Outubro', tm: '5:31' },
  { n: 5, pre: 'Intervalo', who: 'instrumental · piano', tm: '1:48' },
  { n: 6, pre: 'Carta para a ', em: 'santa', who: 'now playing · in the Wednesday set', tm: '4:18', now: true },
  { n: 7, pre: 'Festa ', em: 'pequena', who: 'João Anjos · cello, Inês T. · percussion', tm: '3:24' },
  { n: 8, pre: 'O ', em: 'nome', who: 'solo voice + piano', tm: '4:55' },
  { n: 9, pre: 'Casa da ', em: 'avó', who: 'field recording + voice', tm: '3:12' },
  { n: 10, pre: 'Pedido', who: 'solo voice + piano', tm: '4:38' },
  { n: 11, pre: 'Fecho — ', em: 'a luz que entra', who: 'instrumental · piano + cello', tm: '3:32' },
]

const TABS = ['Tracklist', 'Liner notes', 'Credits'] as const

const MORE = [
  { pre: 'A ', em: 'Beja', meta: 'EP · 5 tracks · 2024', tag: 'mem' as const, tagLabel: 'Sustainer', tint: 'plum' as const },
  { pre: 'Devoção', meta: 'Album · 9 tracks · 2023', tag: 'mem' as const, tagLabel: 'Sustainer', tint: 'coral' as const },
  { pre: 'Mãe, ', em: 'vento', meta: 'Single · 2025', tag: 'free' as const, tagLabel: 'Free', tint: 'jade' as const },
  { pre: 'Bairro ', em: 'quente', meta: 'Single · 2024', tag: 'free' as const, tagLabel: 'Free', tint: 'plum' as const },
]
const tagClass = { free: styles.tagFree, mem: styles.tagMem }

export function StudioAlbumPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Tracklist')

  return (
    <StudioShell>
      <section className={styles.detailHero}>
        <div className={styles.detailArt}>
          <ImageSlot tint="coral" width="100%" height="100%" radius={16} placeholder="cover · Cidade dos santos" style={{ position: 'absolute', inset: 0 }} />
        </div>
        <div>
          <div className={styles.kind}>Album · 11 tracks · 42 min</div>
          <h1>
            Cidade dos <em>santos</em>
          </h1>
          <div className={styles.by}>
            by <strong>Mariana Sol</strong> · 2026 · Sintra
          </div>
          <div className={styles.heroActions}>
            <Link to="/studio" className={styles.playBig} aria-label="Play">
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </Link>
            <button>＋ Library</button>
            <button className={styles.tip}>♥ Tip Mariana</button>
            <button>Share</button>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} className={[styles.tab, tab === t && styles.tabOn].filter(Boolean).join(' ')} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <section className={styles.detailGrid}>
        <div>
          {tab === 'Tracklist' && (
            <div className={styles.setCard}>
              {TRACKS.map((t) => (
                <div key={t.n} className={[styles.setRow, t.now && styles.setRowNow].filter(Boolean).join(' ')}>
                  <div className={styles.n}>{t.n}</div>
                  <div className={styles.srCov}>
                    <ImageSlot tint="coral" width={36} height={36} radius={5} placeholder="" />
                  </div>
                  <div>
                    <h5>
                      {t.pre}
                      {t.em && <em>{t.em}</em>}
                      {t.post}
                    </h5>
                    <div className={styles.who}>{t.who}</div>
                  </div>
                  <div className={styles.pay}>
                    {t.now ? (
                      <>
                        <b>paying now</b>€0.05 to Mariana
                      </>
                    ) : (
                      '€0.05 / play'
                    )}
                  </div>
                  <div className={styles.tm}>{t.tm}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Liner notes' && (
            <div className={styles.prose}>
              <p>
                This is a record I have been writing in pieces since I was nineteen. In Sintra,
                mostly. Some of it in Beja, where my mother is from and where the saint of the title
                lived, briefly, before she went to Lisbon to be martyred.
              </p>
              <p>
                I wrote eleven songs and recorded ten in a kitchen in Anjos with one cellist, one
                engineer, and an upright piano that belonged to my landlady. Track nine has my
                grandmother in it — a field recording I made of her humming, before she knew I was
                recording.
              </p>
              <p>
                If you can pay, buy the record at €8 and <em>€6.40 of that comes to me directly.</em>{' '}
                If you can't, play it as many times as you like and €0.05 still finds me each time.
                This is the room I make a living in. Thank you for being in it.
              </p>
              <div className={styles.author}>
                <span className={styles.av}>MS</span>
                Mariana Sol · Sintra, April 2026
              </div>
            </div>
          )}

          {tab === 'Credits' && (
            <div className={styles.prose}>
              <p>
                <strong style={{ color: 'var(--text)' }}>Mariana Sol</strong> — voice, piano, words
                on all 11 tracks · 85% of writer share
              </p>
              <p>João Anjos — cello (2, 7, 11) · Coro de Outubro — choir (4) · Inês T. — percussion (7)</p>
              <p>
                Sofia Andrade — engineer + mix · Pedro G. — mastering · Helena P. — lyric
                translation, <em>paid from the solidarity fund.</em>
              </p>
              <p>Recorded at Casa do Comum, in-kind. Every fee is on the public ledger.</p>
            </div>
          )}
        </div>

        <div className={styles.sideCol}>
          <div className={styles.buyCard}>
            <div className={styles.eb}>The room is open to you</div>
            <div className={styles.price}>
              €<em>8</em>
            </div>
            <div className={styles.sub}>Buy the album · keep it offline · FLAC + AAC.</div>
            <div className={styles.buyActions}>
              <Link to="/checkout" className={`${styles.bt} ${styles.btP}`}>
                Buy · €8
              </Link>
              <button className={styles.bt}>Pay what you can · €1 min</button>
              <button className={styles.bt}>Streaming included with Sustain</button>
            </div>
            <div className={styles.splitHint}>
              If you buy at €8 — <em>€6.40 to Mariana</em>, €0.80 to the solidarity fund, €0.80 to
              the platform, processing absorbed.
            </div>
          </div>

          <div className={styles.ledgerCard}>
            <div className={styles.head}>
              Public ledger for <em>this release</em>
            </div>
            <div className={styles.lrow}>
              <span className={styles.k}>Paid to Mariana, lifetime</span>
              <span className={styles.v}>€<em>8,940</em></span>
            </div>
            <div className={styles.lrow}>
              <span className={styles.k}>Paid to collaborators</span>
              <span className={styles.v}>€<em>1,420</em></span>
            </div>
            <div className={styles.lrow}>
              <span className={styles.k}>Plays this month</span>
              <span className={styles.v}>42,840</span>
            </div>
            <Link to="/governance" className={styles.cta}>
              Full ledger →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.row} style={{ paddingBottom: 60 }}>
        <div className={styles.rowH}>
          <h2>
            More from <em>Mariana Sol</em>
          </h2>
          <Link to="/studio/artist" className={styles.all}>
            Artist page →
          </Link>
        </div>
        <div className={styles.rowGrid}>
          {MORE.map((m) => (
            <Link key={m.pre} to="/studio/album" className={styles.card}>
              <div className={styles.cardCov}>
                <ImageSlot tint={m.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
                <span className={`${styles.tag} ${tagClass[m.tag]}`}>{m.tagLabel}</span>
              </div>
              <h4>
                {m.pre}
                {m.em && <em>{m.em}</em>}
              </h4>
              <div className={styles.meta}>{m.meta}</div>
            </Link>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
