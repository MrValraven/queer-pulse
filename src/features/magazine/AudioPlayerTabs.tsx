import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrefersReducedMotion } from '../../shared/hooks'
import { ARTICLE, CHAPTERS, TRANSCRIPT } from './audioPlayer.data'
import { TranscriptDownloadModal } from './AudioPlayerModals'
import type { AudioPlayer } from './useAudioPlayer'
import styles from './AudioPlayerPage.module.css'

export function NotesTab() {
  return (
    <div className={styles.notesText}>
      <p>
        Dr. Inês Pereira is the Anjos GP who quietly changed the protocol at Clínica do Largo, the
        clinic where most of our members go for trans-affirming care in Lisbon. We sat with her for
        an hour, after closing time, with two glasses of port. <em>She drank one.</em>
      </p>
      <p>
        This conversation is about <strong>the fifteen minutes</strong> that most trans patients
        spend, every visit, explaining themselves before any clinical work begins. Inês has spent ten
        years removing that fifteen minutes from her practice — sometimes through paperwork, sometimes
        through a phone call to a pharmacist at 06:00. The result is a clinic with 600 trans patients
        and a waiting list.
      </p>
      <p>
        We talk about the protocol change of 2022, the moment she nearly quit medicine in 2018, why
        she does <em>not</em> consider herself a "trans-affirming GP" but rather a GP who can read a
        paper, and a cameo from her former boss who tried to fire her over it.
      </p>
      <p>
        <strong>Mentioned in this episode:</strong>
      </p>
      <p>
        Clínica do Largo · the 2022 protocol PDF (linked) · WPATH SOC 8 · Farmácia do Carmo · the{' '}
        <Link to={ARTICLE}>cover piece of Issue 09</Link> by Sara Pinheiro, which prompted the
        recording.
      </p>
      <p>
        <strong>Music:</strong> "Verde" by Tó Cunha, used with permission. The Back Room is produced
        by Jonas Ferreira, recorded at Café Beirão, mixed at Atelier Pulso.
      </p>
    </div>
  )
}

export function ChaptersTab({ player }: { player: AudioPlayer }) {
  return (
    <div className={styles.chapters}>
      {CHAPTERS.map((c, i) => {
        const current = player.chapterIndex === i
        return (
          <button type="button" key={c.time} className={[styles.chapter, current && styles.chapterCurrent].filter(Boolean).join(' ')} onClick={() => player.seek(c.sec)}>
            <div className={styles.chTime}>{c.time}</div>
            <div className={styles.chTitle}>{c.title}</div>
            {current ? <div className={styles.chNow}>Now</div> : <div className={styles.chArrow}>→</div>}
          </button>
        )
      })}
    </div>
  )
}

export function TranscriptTab({ player }: { player: AudioPlayer }) {
  const [autoScroll, setAutoScroll] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const reduceMotion = usePrefersReducedMotion()

  // Which transcript cue is currently playing.
  const currentIndex = useMemo(() => {
    let idx = 0
    for (let i = 0; i < TRANSCRIPT.length; i++) {
      if (player.currentTime >= TRANSCRIPT[i]!.sec) idx = i
    }
    return idx
  }, [player.currentTime])

  // Smooth-scroll the active block into view when auto-scroll is on.
  useEffect(() => {
    if (!autoScroll) return
    blockRefs.current[currentIndex]?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }, [autoScroll, currentIndex, reduceMotion])

  return (
    <>
      <div className={styles.trControls}>
        <div className={styles.trSearch}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search transcript" />
        </div>
        <button type="button" className={[styles.actionBtn, autoScroll && styles.actionActive].filter(Boolean).join(' ')} onClick={() => setAutoScroll((v) => !v)} aria-pressed={autoScroll}>
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          Auto-scroll{autoScroll ? ' · on' : ''}
        </button>
        <button type="button" className={styles.actionBtn} onClick={() => setDownloadOpen(true)}>
          <svg viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
      </div>
      <div className={styles.transcript}>
        {TRANSCRIPT.map((t, i) => (
          <div
            key={i}
            ref={(el) => {
              blockRefs.current[i] = el
            }}
            className={[styles.trBlock, currentIndex === i && styles.trCurrent].filter(Boolean).join(' ')}
            onClick={() => player.seek(t.sec)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                player.seek(t.sec)
              }
            }}
          >
            <div className={styles.trWho}>
              {t.who} <time>{t.time}</time>
            </div>
            <p>{t.text}</p>
          </div>
        ))}
      </div>

      {downloadOpen && <TranscriptDownloadModal onClose={() => setDownloadOpen(false)} />}
    </>
  )
}
