import { useState } from 'react'
import { type TabId } from './audioPlayer.data'
import { useAudioPlayer } from './useAudioPlayer'
import { AudioPlayerMain } from './AudioPlayerMain'
import { ChaptersTab, NotesTab, TranscriptTab } from './AudioPlayerTabs'
import { Footer } from '../../shared/components/layout'
import styles from './AudioPlayerPage.module.css'

export function AudioPlayerPage() {
  const [tab, setTab] = useState<TabId>('notes')
  const player = useAudioPlayer()

  return (
    <>
    <div className={styles.page}>
      <AudioPlayerMain player={player} />

      <section className={styles.below}>
        <div className={styles.tabs}>
          <button type="button" className={[styles.tab, tab === 'notes' && styles.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('notes')}>
            Show notes
          </button>
          <button type="button" className={[styles.tab, tab === 'chapters' && styles.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('chapters')}>
            Chapters · 6
          </button>
          <button type="button" className={[styles.tab, tab === 'transcript' && styles.tabActive].filter(Boolean).join(' ')} onClick={() => setTab('transcript')}>
            Transcript
          </button>
        </div>

        {tab === 'notes' && <NotesTab />}
        {tab === 'chapters' && <ChaptersTab player={player} />}
        {tab === 'transcript' && <TranscriptTab player={player} />}
      </section>
    </div>
    <Footer />
    </>
  )
}
