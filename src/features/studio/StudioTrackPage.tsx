import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot } from '../../shared/components/ui'
import { StudioShell } from './StudioShell'
import { StudioTrackSidebar } from './StudioTrackSidebar'
import { MORE } from './studioTrack.data'
import ss from './studio.module.css'
import t from './track.module.css'

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
            <h1>Carta para a <em>santa</em></h1>
            <div className={ss.by}>by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em> · 2026</div>
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
                <svg viewBox="0 0 12 14" fill="currentColor"><path d="M1 1l10 6-10 6z" /></svg>
              </button>
              <button>＋ Library</button>
              <button className={ss.tip}>♥ Tip €2</button>
            </div>
            <div className={ss.payPill}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>This listen pays Mariana <em>€0.05</em>. <span className={ss.small}>Tip on top? 100% to her.</span></span>
            </div>
          </div>
        </div>
      </section>

      <div className={t.inSet}>
        <span className={t.live} />
        <span>You're listening with <b>312 people</b> in the <em>Wednesday set</em>, programmed by Sara Marques. Track 7 starts in <b>2:36</b>.</span>
        <Link to="/studio/live">Join the room →</Link>
      </div>

      <div className={t.body}>
        <div className={t.lyrCard}>
          <div className={t.lyrH}>
            <h3>Lyrics &amp; <em>translation</em></h3>
            <div className={t.lyrLang}>
              {['PT', 'EN', 'FR'].map((l) => (
                <button key={l} className={lang === l ? t.lyrLangOn : undefined} onClick={() => setLang(l)}>{l}</button>
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

        <StudioTrackSidebar />
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>More from <em>Cidade dos santos</em></h2>
          <Link to="/studio/album" className={ss.all}>Full album →</Link>
        </div>
        <div className={ss.rowGrid}>
          {MORE.map((mr) => (
            <Link key={mr.pre} to="/studio/track" className={ss.card}>
              <div className={ss.cardCov}>
                <ImageSlot tint={mr.tint} width="100%" height="100%" radius={10} placeholder="cv" style={{ position: 'absolute', inset: 0 }} />
              </div>
              <h4>{mr.pre}{mr.em && <em>{mr.em}</em>}{mr.post}</h4>
              <div className={ss.meta}>{mr.meta}</div>
            </Link>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
