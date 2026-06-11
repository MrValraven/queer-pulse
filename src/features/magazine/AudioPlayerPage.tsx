import { useState } from 'react'
import { type TabId } from './audioPlayer.data'
import { AudioPlayerMain } from './AudioPlayerMain'
import { ChaptersTab, NotesTab, TranscriptTab } from './AudioPlayerTabs'
import styles from './AudioPlayerPage.module.css'

export function AudioPlayerPage() {
  const [tab, setTab] = useState<TabId>('notes')

  return (
    <div className={styles.page}>
      <AudioPlayerMain />

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
        {tab === 'chapters' && <ChaptersTab />}
        {tab === 'transcript' && <TranscriptTab />}
      </section>
    </div>
  )
}
