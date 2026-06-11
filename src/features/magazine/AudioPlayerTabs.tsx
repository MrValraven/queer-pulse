import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../shared/components/feedback/useToast'
import { ARTICLE, CHAPTERS, TRANSCRIPT } from './audioPlayer.data'
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

export function ChaptersTab() {
  const [chapter, setChapter] = useState(2)
  return (
    <div className={styles.chapters}>
      {CHAPTERS.map((c, i) => (
        <button type="button" key={c.time} className={[styles.chapter, chapter === i && styles.chapterCurrent].filter(Boolean).join(' ')} onClick={() => setChapter(i)}>
          <div className={styles.chTime}>{c.time}</div>
          <div className={styles.chTitle}>{c.title}</div>
          {chapter === i ? <div className={styles.chNow}>Now</div> : <div className={styles.chArrow}>→</div>}
        </button>
      ))}
    </div>
  )
}

export function TranscriptTab() {
  const { showToast } = useToast()
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
        <button type="button" className={styles.actionBtn} onClick={() => showToast('Auto-scroll on', 'info')}>
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          Auto-scroll
        </button>
        <button type="button" className={styles.actionBtn} onClick={() => showToast('Download transcript .txt', 'success')}>
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
          <div key={i} className={[styles.trBlock, t.current && styles.trCurrent].filter(Boolean).join(' ')}>
            <div className={styles.trWho}>
              {t.who} <time>{t.time}</time>
            </div>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}
