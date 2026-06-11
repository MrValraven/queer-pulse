import { useState } from 'react'
import { useToast } from '../../shared/components/feedback/useToast'
import { BOILER, COVERAGE, DOWNLOADS, FACTS, IMAGES, LOGOS, SWATCHES, TEAM } from './pressKit.data'
import styles from './PressKitPage.module.css'

export function BoilerplateSection() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (id: string, text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1600)
  }
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Boilerplate · <em>cleared for reuse</em>
        </h2>
        <span className={styles.secNum}>§01</span>
      </div>
      <p>
        Three lengths, all approved for direct quotation without further sign-off. Click <b>copy</b>{' '}
        to put a clean version on your clipboard.
      </p>
      {BOILER.map((b) => (
        <div className={styles.boiler} key={b.id}>
          <div className={styles.boilerH}>
            {b.label}
            <span className={styles.wc}>{b.wc}</span>
          </div>
          <button type="button" className={[styles.boilerCopy, copied === b.id && styles.copied].filter(Boolean).join(' ')} onClick={() => copy(b.id, b.text)}>
            {copied === b.id ? 'Copied' : 'Copy'}
          </button>
          <div className={styles.boilerText}>{b.text}</div>
        </div>
      ))}
    </section>
  )
}

export function MarkSection() {
  const { showToast } = useToast()
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          The <em>mark</em> and how to use it
        </h2>
        <span className={styles.secNum}>§02</span>
      </div>
      <p>
        Three approved variations. The wordmark always carries the coral pulse dot — except in the
        inverse "coral" variant, where the dot becomes plum. Don't recolour the dot to anything else.
      </p>
      <div className={styles.logoGrid}>
        {LOGOS.map((l, i) => (
          <div className={styles.logoCard} key={i}>
            <div className={`${styles.logoDisplay} ${styles[l.display]}`}>
              <span className={[styles.logoMark, ...l.mark.split(' ').map((m) => styles[m])].join(' ')}>
                <span className={styles.logoDot} />
                Queer<span className={styles.q}>Pulse</span>
              </span>
            </div>
            <div className={styles.logoMeta}>
              <span>{l.meta}</span>
              <a onClick={() => showToast('Downloading SVG', 'success')}>SVG · PNG</a>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14, color: 'var(--ink-60)', marginTop: 18 }}>
        <b>Spacing:</b> always leave one full <em>P</em>-height of clear space around the mark.{' '}
        <b>Minimum size:</b> 88px wide on screen, 18 mm in print. <b>Don't:</b> stretch, recolour,
        set on busy photos, or pair with rainbow gradients we didn't make.
      </p>
    </section>
  )
}

export function ColourSection() {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Colour, <em>full system</em>
        </h2>
        <span className={styles.secNum}>§03</span>
      </div>
      <p>The whole brand runs on four hues. We do not introduce additional accent colours — including campaign-specific ones.</p>
      <div className={styles.swatchRow}>
        {SWATCHES.map((s) => (
          <div className={styles.swatch} key={s.name}>
            <div className={styles.swatchChip} style={{ background: s.bg, border: s.border ? '1px solid rgba(45,27,61,.10)' : undefined }} />
            <div className={styles.swatchName}>{s.name}</div>
            <div className={styles.swatchHex}>{s.hex}</div>
            <div className={styles.swatchMeta}>{s.meta}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function PhotographySection() {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Cleared <em>photography</em>
        </h2>
        <span className={styles.secNum}>§04</span>
      </div>
      <p>
        Six images, model-released and pre-cleared for editorial use. Credit:{' '}
        <em>photographs by André Bento for QueerPulse</em>. Resolution: 3000 × 2000 px JPG.
      </p>
      <div className={styles.imgGrid}>
        {IMAGES.map((img, i) => (
          <div className={`${styles.imgCard} ${styles[img.tint]}`} key={i}>
            {img.label}
          </div>
        ))}
      </div>
    </section>
  )
}

export function TeamSection() {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Named <em>spokespeople</em>
        </h2>
        <span className={styles.secNum}>§05</span>
      </div>
      <p>
        Three founding members are available for press comment. Quote them on their stated topics;
        don't paraphrase. <em>Other members are not available without explicit consent</em> — please
        don't approach members directly through the platform.
      </p>
      <div className={styles.teamGrid}>
        {TEAM.map((t) => (
          <div className={styles.teamCard} key={t.email}>
            <div className={[styles.ph, t.phCls && styles[t.phCls]].filter(Boolean).join(' ')}>{t.ph}</div>
            <h4>{t.name}</h4>
            <div className={styles.teamRole}>{t.role}</div>
            <p>{t.desc}</p>
            <div className={styles.teamLangs}>{t.langs}</div>
            <div className={styles.teamContact}>
              <a href={`mailto:${t.email}`}>{t.email}</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function FactsSection() {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Quick <em>facts</em> · as of 14 May 2026
        </h2>
        <span className={styles.secNum}>§06</span>
      </div>
      <p>
        Sourced from the 2025 transparency report. <em>Please link to the transparency page when citing.</em>
      </p>
      <div className={styles.factsGrid}>
        {FACTS.map((f, i) => (
          <div className={styles.fact} key={i}>
            <b>{f.b}</b>
            <span>{f.s}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CoverageSection() {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          Recent <em>coverage</em>
        </h2>
        <span className={styles.secNum}>§07</span>
      </div>
      <p>
        Selected English- and Portuguese-language pieces from 2024–2026. <em>Hit-counts welcome but
        not necessary</em> — link to Press instead.
      </p>
      <div className={styles.covList}>
        {COVERAGE.map((c, i) => (
          <a href="#" className={styles.covRow} key={i} onClick={(e) => e.preventDefault()}>
            <div>
              <div className={styles.covSource}>{c.source}</div>
              <div className={styles.covTitle}>{c.title}</div>
              <div className={styles.covMeta}>{c.meta}</div>
            </div>
            <div className={styles.covDate}>
              {c.day}
              <em>{c.month}</em>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

export function DownloadsSection() {
  const { showToast } = useToast()
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <em>Downloads</em>
        </h2>
        <span className={styles.secNum}>§08</span>
      </div>
      <p>Direct file links. The full kit is a 38 MB ZIP with everything below; individual files are smaller.</p>
      <div className={styles.downloadRow}>
        {DOWNLOADS.map((d, i) => (
          <button type="button" className={styles.dlCard} key={i} onClick={() => showToast('Downloading…', 'success')}>
            <div className={[styles.dlIc, d.icCls && styles[d.icCls]].filter(Boolean).join(' ')}>{d.ic}</div>
            <div className={styles.dlInfo}>
              <b>{d.title}</b>
              <span>{d.desc}</span>
            </div>
            <div className={styles.dlArrow}>↓</div>
          </button>
        ))}
      </div>
    </section>
  )
}
