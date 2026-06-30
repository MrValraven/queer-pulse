import { useEffect, useMemo, useState } from 'react'
import { parseDur, seededHeights, type MusicArtist } from './creatives.data'
import styles from './CreativesPage.module.css'

export function MusicPlayer({
  artist,
  active,
  onPlay,
}: {
  artist: MusicArtist
  active: boolean
  onPlay: () => void
}) {
  const [playing, setPlaying] = useState(false)
  const [trackIdx, setTrackIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const heights = useMemo(() => seededHeights(artist.id, 40), [artist.id])
  const duration = parseDur(artist.tracks[trackIdx]!.dur)

  // Stop playing if another player takes over (adjust state during render).
  if (!active && playing) setPlaying(false)

  useEffect(() => {
    if (!playing) return
    const interval = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 0.4 / duration
        if (next >= 1) {
          setTrackIdx((t) => (t + 1) % artist.tracks.length)
          return 0
        }
        return next
      })
    }, 400)
    return () => window.clearInterval(interval)
  }, [playing, duration, artist.tracks.length])

  const toggle = () => {
    if (playing) {
      setPlaying(false)
    } else {
      onPlay()
      setPlaying(true)
    }
  }

  const selectTrack = (i: number) => {
    setTrackIdx(i)
    setProgress(0)
  }

  const sec = Math.floor(progress * duration)
  const time = `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`

  return (
    <div className={styles.player}>
      <div className={styles.playerTrack}>
        <span>{artist.tracks[trackIdx]!.title}</span>
        <span className={styles.trackNum}>
          {trackIdx + 1} / {artist.tracks.length}
        </span>
      </div>
      <div className={styles.playerControls}>
        <button type="button" className={styles.playBtn} onClick={toggle} aria-label="Play">
          {playing ? (
            <svg viewBox="0 0 24 24">
              <rect x="5" y="3" width="4" height="18" rx="1" />
              <rect x="15" y="3" width="4" height="18" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div
          className={styles.waveform}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setProgress(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
          }}
        >
          {heights.map((h, i) => (
            <div
              key={i}
              className={[styles.wfBar, i / heights.length < progress && styles.wfBarPlayed].filter(Boolean).join(' ')}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
        <span className={styles.playerTime}>{time}</span>
      </div>
      <div className={styles.trackList}>
        {artist.tracks.map((t, i) => (
          <button
            type="button"
            key={t.title}
            className={[styles.trackItem, i === trackIdx && styles.trackItemActive].filter(Boolean).join(' ')}
            onClick={() => selectTrack(i)}
          >
            <span className={styles.tiNum}>{i + 1}</span>
            <span className={styles.tiTitle}>{t.title}</span>
            <span className={styles.tiDur}>{t.dur}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
