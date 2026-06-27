import { useMemo, useState, type ReactNode } from 'react'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSaved, type SavedItem } from '../../app/providers/SavedProvider'
import {
  COLLECTIONS,
  RECENT_SAVES,
  type Collection,
  type Privacy,
  type Thumb,
  type RecentSave,
} from './collections.data'
import { SavedByYou } from './SavedByYou'
import {
  AddToCollectionModal,
  NewCollectionModal,
  ViewCollectionModal,
} from './CollectionsModals'
import styles from './CollectionsPage.module.css'

type ModalState =
  | { type: 'new' }
  | { type: 'view'; id: string }
  | { type: 'add'; save: RecentSave }
  | null

const PRIVACY_LABEL: Record<Privacy, string> = {
  private: 'Private',
  shared: 'Shared',
  public: 'Public',
}

const thumbClass: Record<Thumb, string> = {
  a: styles.thumbA,
  b: styles.thumbB,
  c: styles.thumbC,
  d: styles.thumbD,
  e: styles.thumbE,
}

const kindClass: Record<RecentSave['kindVariant'], string> = {
  therapist: styles.kindTherapist,
  article: styles.kindArticle,
  business: styles.kindBusiness,
}

const privacyIcon: Record<Privacy, ReactNode> = {
  private: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  shared: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4" />
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  public: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
}

/** A single collection card in the grid. */
function CollectionCard({ c, onOpen }: { c: Collection; onOpen: () => void }) {
  return (
    <button
      className={`${styles.card} ${c.featured ? styles.featured : ''}`}
      onClick={onOpen}
    >
      <div className={styles.ic}>{c.count}</div>
      <div>
        <div className={styles.name}>{c.name}</div>
        <div className={styles.meta}>{c.meta}</div>
      </div>
      <div className={styles.thumbs}>
        {c.thumbs.map((t, i) => (
          <span key={i} className={`${styles.thumb} ${thumbClass[t]}`} />
        ))}
        <span className={styles.more}>{c.more}</span>
      </div>
      <div className={styles.foot}>
        <span className={styles.priv}>
          {privacyIcon[c.privacy]}
          {c.privacyLabel}
        </span>
        <span>{c.updated}</span>
      </div>
    </button>
  )
}

/** A recent, unfiled save — clicking opens the "add to collection" picker. */
function RecentSaveRow({ r, onAdd }: { r: RecentSave; onAdd: () => void }) {
  return (
    <button className={styles.recentRow} onClick={onAdd}>
      <div className={`${styles.recentKind} ${kindClass[r.kindVariant]}`}>{r.kind}</div>
      <div className={styles.recentInfo}>
        <b>{r.title}</b>
        <span>{r.saved}</span>
      </div>
      <span className={styles.recentAdd}>+ Add to collection →</span>
    </button>
  )
}

export function CollectionsPage() {
  const { showToast } = useToast()
  const { items: savedItems } = useSaved()

  const [collections, setCollections] = useState<Collection[]>(COLLECTIONS)
  // collectionId -> the saved items inside it. Seeded from live saves so the
  // view modal has real content to show, then grown via "Add to collection".
  const [contents, setContents] = useState<Record<string, SavedItem[]>>({})
  const [modal, setModal] = useState<ModalState>(null)

  // For each collection, blend any seeded saves with items the user has added.
  const contentsFor = useMemo(() => {
    return (id: string): SavedItem[] => {
      if (contents[id]) return contents[id]
      // Seed deterministically from the live saved store the first time.
      const seed = savedItems.slice(0, 3)
      return seed
    }
  }, [contents, savedItems])

  const createCollection = (name: string, privacy: Privacy) => {
    const id = `c-${Date.now()}`
    setCollections((prev) => [
      {
        id,
        count: '0',
        name,
        meta: 'Just created — start adding saves',
        thumbs: ['a', 'b', 'c'],
        more: '',
        privacy,
        privacyLabel: PRIVACY_LABEL[privacy],
        updated: 'Updated just now',
      },
      ...prev,
    ])
    setModal(null)
    showToast('Collection created', 'success')
  }

  const addSaveToCollection = (collectionId: string, save: RecentSave) => {
    const item: SavedItem = {
      id: `recent:${save.id}`,
      kind: 'article',
      title: save.title,
      meta: save.saved,
    }
    setContents((prev) => {
      const existing = prev[collectionId] ?? savedItems.slice(0, 3)
      if (existing.some((it) => it.id === item.id)) return prev
      return { ...prev, [collectionId]: [item, ...existing] }
    })
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, count: String((Number(c.count) || 0) + 1), updated: 'Updated just now' }
          : c,
      ),
    )
  }

  const viewing =
    modal?.type === 'view' ? collections.find((c) => c.id === modal.id) ?? null : null

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Collections · folders for saves</div>
            <h1 className={styles.h1}>
              Things you keep <em>coming back to.</em>
            </h1>
            <p className={styles.lead}>
              Saved items, grouped however makes sense to you. Folders can be private (default),
              shared with specific members, or public.
            </p>
          </div>
          <Button variant="primary" onClick={() => setModal({ type: 'new' })}>
            + New collection
          </Button>
        </header>

        <SavedByYou />

        <div className={styles.grid}>
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              c={c}
              onOpen={() => setModal({ type: 'view', id: c.id })}
            />
          ))}

          <button className={styles.newCard} onClick={() => setModal({ type: 'new' })}>
            <div className={styles.plus}>+</div>
            <b>New collection</b>
            <span>Group saves by why they matter</span>
          </button>
        </div>

        <div className={styles.secH}>
          <span>Recently saved · not yet in a collection</span>
          <span className={styles.ct}>+ 7 unfiled</span>
        </div>
        <div className={styles.recentList}>
          {RECENT_SAVES.map((r) => (
            <RecentSaveRow key={r.id} r={r} onAdd={() => setModal({ type: 'add', save: r })} />
          ))}
        </div>
      </div>

      {modal?.type === 'new' && (
        <NewCollectionModal onClose={() => setModal(null)} onCreate={createCollection} />
      )}
      {viewing && (
        <ViewCollectionModal
          collection={viewing}
          items={contentsFor(viewing.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'add' && (
        <AddToCollectionModal
          itemTitle={modal.save.title}
          collections={collections}
          onClose={() => setModal(null)}
          onPick={(id) => addSaveToCollection(id, modal.save)}
        />
      )}
    </AppShell>
  )
}
