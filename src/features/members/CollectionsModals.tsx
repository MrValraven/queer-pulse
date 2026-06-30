import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiFolder, FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { linkToPath } from "../../app/routeMap";
import type { SavedItem } from "../../app/providers/SavedProvider";
import type { Collection, Privacy } from "./collections.data";
import styles from "./CollectionsModals.module.css";

/** Shared frame: backdrop click-to-close, close button, scroll lock. */
function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  useScrollLock();
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden />
        </button>
        {children}
      </div>
    </div>
  );
}

const PRIVACY_OPTIONS: { value: Privacy; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "shared", label: "Shared with members" },
  { value: "public", label: "Public" },
];

/** Name a new collection and pick its privacy. */
export function NewCollectionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, privacy: Privacy) => void;
}) {
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("private");
  const canCreate = name.trim().length > 0;

  return (
    <Modal onClose={onClose}>
      <div className={styles.eyebrow}>New collection</div>
      <h2 className={styles.title}>
        What are you <em>gathering?</em>
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canCreate) return;
          onCreate(name.trim(), privacy);
        }}
      >
        <div className={styles.field}>
          <label htmlFor="nc-name">Collection name</label>
          <input
            id="nc-name"
            type="text"
            autoFocus
            placeholder="e.g. Lisbon recs, Bring to therapy…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="nc-priv">Who can see it</label>
          <select
            id="nc-priv"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as Privacy)}
          >
            {PRIVACY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.foot}>
          <button type="button" className={styles.back} onClick={onClose}>
            ← Cancel
          </button>
          <Button type="submit" disabled={!canCreate}>
            Create collection →
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Read a collection: list its saved items (live), each linking out. */
export function ViewCollectionModal({
  collection,
  items,
  onClose,
}: {
  collection: Collection;
  items: SavedItem[];
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className={styles.eyebrow}>
        {collection.privacyLabel} · {collection.updated}
      </div>
      <h2 className={styles.title}>{collection.name}</h2>
      <p className={styles.sub}>{collection.meta}</p>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <FiFolder aria-hidden />
          <p>Nothing in here yet. Add saves from the list below the grid.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((it) => (
            <div key={it.id} className={styles.row}>
              <span className={styles.rowBadge}>
                {it.kind.slice(0, 3).toUpperCase()}
              </span>
              <div className={styles.rowInfo}>
                {it.href ? (
                  <Link
                    to={linkToPath(it.href)}
                    className={styles.rowTitle}
                    onClick={onClose}
                  >
                    {it.title}
                  </Link>
                ) : (
                  <span className={styles.rowTitle}>{it.title}</span>
                )}
                {it.meta && <span className={styles.rowMeta}>{it.meta}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

/** Pick which collection to add a recent save into. */
export function AddToCollectionModal({
  itemTitle,
  collections,
  onClose,
  onPick,
}: {
  itemTitle: string;
  collections: Collection[];
  onClose: () => void;
  onPick: (collectionId: string) => void;
}) {
  const [added, setAdded] = useState<string | null>(null);

  if (added) {
    const c = collections.find((x) => x.id === added);
    return (
      <Modal onClose={onClose}>
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <FiCheck size={26} aria-hidden />
          </div>
          <h2>
            Added to <em>your collection.</em>
          </h2>
          <p>
            Saved into <b>{c?.name}</b>. You'll find it there whenever you come
            back.
          </p>
          <Button variant="ghost-dark" onClick={onClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className={styles.eyebrow}>Add to collection</div>
      <h2 className={styles.title}>Where should this live?</h2>
      <p className={styles.sub}>{itemTitle}</p>
      <div className={styles.pickList}>
        {collections.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.pick}
            onClick={() => {
              onPick(c.id);
              setAdded(c.id);
            }}
          >
            <span className={styles.pickIc}>{c.count}</span>
            <span className={styles.pickInfo}>
              <span className={styles.pickName}>{c.name}</span>
              <span className={styles.pickMeta}>{c.privacyLabel}</span>
            </span>
            <FiPlus aria-hidden className={styles.pickAdd} />
          </button>
        ))}
      </div>
      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          ← Cancel
        </button>
      </div>
    </Modal>
  );
}
