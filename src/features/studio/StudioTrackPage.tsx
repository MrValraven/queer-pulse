import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import ss from './studio.module.css'
import t from './track.module.css'

const SPLIT = [
  { c: 'var(--accent)', k: 'Mariana Sol', sub: 'Direct, monthly', v: <>€<em>0.80</em></> },
  { c: 'var(--jade)', k: 'Solidarity fund', sub: 'Grants & mastering vouchers', v: '€0.08' },
  { c: '#2D1B3D', k: 'Platform & staff', sub: 'Hosting, captions, council', v: '€0.08' },
  { c: 'rgba(247,243,238,.2)', k: 'Payment fees', sub: 'Stripe / SEPA only', v: '€0.04' },
]
const CREDITS = [
  { who: 'Mariana Sol · voice, piano, words', role: '85% · songwriter' },
  { who: 'João Anjos · cello', role: '10%' },
  { who: 'Inês T. · mix & master', role: '5%' },
  { who: 'Helena P. · translator', role: '€40 from solidarity fund' },
]
const MORE = [
  { pre: 'Mãe, três ', em: 'vezes', meta: 'Track 3 · CDS', tint: 'plum' as const },
  { pre: 'A ', em: 'vizinha', post: ' que reza', meta: 'Track 4 · CDS', tint: 'jade' as const },
  { pre: 'O ', em: 'nome', meta: 'Track 8 · CDS', tint: 'coral' as const },
  { pre: 'Mãe, ', em: 'vento', meta: 'Single · 2025', tint: 'plum' as const },
]

export function StudioTrackPage() {
  const [lang, setLang] = useState('PT')

  return (
    <StudioShell>
      <div className={t.crumb}>
        <Link to="/studio/artist">Mariana Sol</Link>
        <span>›</span>
        <Link to="/studio/album">Cidade dos santos</Link>
        <span>›</span>
        <em>track 6</em>
      </div>

      <section className={ss.hero} style={{ padding: '24px 0 32px' }}>
        <div className={ss.heroInner}>
          <div className={ss.heroArt}>
            <ImageSlot tint="coral" width="100%" height="100%" radius={16} placeholder="cover · track 6" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div className={ss.heroInfo}>
            <div className={ss.eb}>
              <span className={ss.live} /> Track 6 of 11 · playing now in the set
            </div>
            <h1>
              Carta para a <em>santa</em>
            </h1>
            <div className={ss.by}>
              by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em> · 2026
            </div>
            <div className={ss.stats}>
              <span><em>312</em> listening</span>
              <span className={ss.dot} />
              <span>4:18</span>
              <span className={ss.dot} />
              <span>Flac · 24/48</span>
              <span className={ss.dot} />
              <span><em>€2,140</em> to Mariana this month</span>
            </div>
            <div className={ss.heroActions}>
              <button className={ss.playBig} aria-label="Play">
                <svg viewBox="0 0 12 14" fill="currentColor">
                  <path d="M1 1l10 6-10 6z" />
                </svg>
              </button>
              <button>＋ Library</button>
              <button className={ss.tip}>♥ Tip €2</button>
            </div>
            <div className={ss.payPill}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>
                This listen pays Mariana <em>€0.05</em>. <span className={ss.small}>Tip on top? 100% to her.</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={t.inSet}>
        <span className={t.live} />
        <span>
          You're listening with <b>312 people</b> in the <em>Wednesday set</em>, programmed by Sara Marques. Track 7 starts in <b>2:36</b>.
        </span>
        <Link to="/studio/live">Join the room →</Link>
      </div>

      <div className={t.body}>
        <div className={t.lyrCard}>
          <div className={t.lyrH}>
            <h3>
              Lyrics &amp; <em>translation</em>
            </h3>
            <div className={t.lyrLang}>
              {['PT', 'EN', 'FR'].map((l) => (
                <button key={l} className={lang === l ? t.lyrLangOn : undefined} onClick={() => setLang(l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className={t.lyric}>
            <div className={t.annot}>Verse one — addressed to St. Iria, plainly</div>
            <p className={t.played}>Querida santa, não me ouves —</p>
            <p className={t.played}>e ainda assim te escrevo.</p>
            <p className={t.played}>A casa está vazia, a <em>rádio</em> ligada,</p>
            <p className={t.now}>e a luz que entra é a tua.</p>
            <p>O dia inteiro à porta, à espera —</p>
            <p>como quem espera a chuva.</p>
            <div className={t.annot}>Verse two — to her mother, the same day</div>
            <p>Mãe deixou a chave por baixo da pedra,</p>
            <p>a manhã que partiu.</p>
            <p>Disseste-me: <em>não voltes.</em></p>
            <p>Eu não voltei.</p>
            <div className={t.annot}>Chorus</div>
            <p>Santa que ouve quem ninguém ouve —</p>
            <p>esta casa é tua também.</p>
          </div>
          <div className={t.lyrFoot}>
            <span>Translated by Helena P. · approved by the artist · Apr 2026</span>
            <Link to="/studio/sheet-store">Lead sheet &amp; chords →</Link>
          </div>
        </div>

        <div className={t.rSide}>
          <div className={t.sCard}>
            <div className={t.sEb}>Curator's note</div>
            <div className={t.noteHead}>
              <div className={t.noteAv}>SM</div>
              <div>
                <div className={t.noteName}>Sara Marques</div>
                <div className={t.noteRole}>programming lead · the Wednesday set</div>
              </div>
            </div>
            <p>"Track six of an album I have not stopped playing since April. A devotional addressed plainly to a saint who isn't listening; a piano arrangement that knows when to step out of the room. <em>Stay through the second verse.</em>"</p>
          </div>

          <div className={t.sCard}>
            <div className={t.sEb}>Where €1 goes when you play this</div>
            <div className={t.splitLead}>
              €<em>0.80</em> to Mariana. €<em>0.20</em> keeps the room open.
            </div>
            <div className={t.splitBar}>
              <span style={{ width: '80%', background: 'var(--accent)' }} />
              <span style={{ width: '8%', background: 'var(--jade)' }} />
              <span style={{ width: '8%', background: '#2D1B3D' }} />
              <span style={{ width: '4%', background: 'rgba(247,243,238,.2)' }} />
            </div>
            <div>
              {SPLIT.map((r) => (
                <div key={r.k} className={t.splRow}>
                  <span className={t.splDot} style={{ background: r.c }} />
                  <span className={t.splK}>
                    <b>{r.k}</b>
                    {r.sub}
                  </span>
                  <span className={t.splV}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={t.sCard}>
            <div className={t.sEb}>Credits · per-track splits</div>
            {CREDITS.map((c) => (
              <div key={c.who} className={t.credRow}>
                <span className="who">{c.who}</span>
                <span className="role">{c.role}</span>
              </div>
            ))}
          </div>

          <div className={t.sheetMini}>
            <span className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 4h12l4 4v12H4z" />
                <path d="M16 4v4h4M8 13h8M8 17h5" />
              </svg>
            </span>
            <div className="nm">
              <b>
                Lead sheet · <em>Carta para a santa</em>
              </b>
              <small>6 pages · piano + voice · CC-BY-NC · Mariana Sol</small>
            </div>
            <Link to="/studio/sheet-store">Download →</Link>
          </div>
        </div>
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            More from <em>Cidade dos santos</em>
          </h2>
          <Link to="/studio/album" className={ss.all}>
            Full album →
          </Link>
        </div>
        <div className={ss.rowGrid}>
          {MORE.map((mr) => (
            <Link key={mr.pre} to="/studio/track" className={ss.card}>
              <div className={ss.cardCov}>
                <ImageSlot tint={mr.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
              </div>
              <h4>
                {mr.pre}
                {mr.em && <em>{mr.em}</em>}
                {mr.post}
              </h4>
              <div className={ss.meta}>{mr.meta}</div>
            </Link>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
