import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiFolder,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFocusOnMount, useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import type { SavedItem } from "../../app/providers/useSaved";
import {
  privacyLabel,
  type Collection,
  type Privacy,
} from "./collections.data";
import styles from "./CollectionsModals.module.css";

/** Shared frame: backdrop click-to-close, close button, scroll lock. */
function Modal({
  onClose,
  label,
  children,
}: {
  onClose: () => void;
  /** Accessible dialog name announced to screen readers. */
  label?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={label ?? t("members:collections.modal.defaultDialogLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("members:collections.modal.close")}
        >
          <FiX aria-hidden />
        </button>
        {children}
      </div>
    </div>
  );
}

const PRIVACY_OPTION_KEYS: { value: Privacy; labelKey: string }[] = [
  {
    value: "private",
    labelKey: "members:collections.modal.privacyOption.private",
  },
  {
    value: "shared",
    labelKey: "members:collections.modal.privacyOption.shared",
  },
  {
    value: "public",
    labelKey: "members:collections.modal.privacyOption.public",
  },
];

/** Name a new collection and pick its privacy. */
export function NewCollectionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, privacy: Privacy) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("private");
  const nameRef = useFocusOnMount<HTMLInputElement>();
  const canCreate = name.trim().length > 0;

  return (
    <Modal
      onClose={onClose}
      label={t("members:collections.modal.newCollection.dialogLabel")}
    >
      <div className={styles.eyebrow}>
        {t("members:collections.modal.newCollection.eyebrow")}
      </div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="members:collections.modal.newCollection.title"
          components={{ em: <em /> }}
        />
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canCreate) return;
          onCreate(name.trim(), privacy);
        }}
      >
        <div className={styles.field}>
          <label htmlFor="nc-name">
            {t("members:collections.modal.newCollection.nameLabel")}
          </label>
          <input
            id="nc-name"
            ref={nameRef}
            type="text"
            placeholder={t(
              "members:collections.modal.newCollection.namePlaceholder",
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="nc-priv">
            {t("members:collections.modal.newCollection.visibilityLabel")}
          </label>
          <select
            id="nc-priv"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as Privacy)}
          >
            {PRIVACY_OPTION_KEYS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.foot}>
          <button type="button" className={styles.back} onClick={onClose}>
            <FiArrowLeft aria-hidden />{" "}
            {t("members:collections.modal.newCollection.cancel")}
          </button>
          <Button type="submit" disabled={!canCreate}>
            {t("members:collections.modal.newCollection.submit")}{" "}
            <FiArrowRight aria-hidden />
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
  const { t } = useTranslation();
  return (
    <Modal
      onClose={onClose}
      label={t("members:collections.modal.view.dialogLabel")}
    >
      <div className={styles.eyebrow}>
        {privacyLabel(collection.privacy, collection.sharedWithCount, t)} ·{" "}
        {collection.updated}
      </div>
      <h2 className={styles.title}>{collection.name}</h2>
      <p className={styles.sub}>{collection.meta}</p>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <FiFolder aria-hidden />
          <p>{t("members:collections.modal.view.emptyText")}</p>
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
          {t("members:collections.modal.view.close")}
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
  const { t } = useTranslation();
  const [added, setAdded] = useState<string | null>(null);

  if (added) {
    const c = collections.find((x) => x.id === added);
    return (
      <Modal
        onClose={onClose}
        label={t("members:collections.modal.add.success.dialogLabel")}
      >
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <FiCheck size={26} aria-hidden />
          </div>
          <h2>
            <Translation
              i18nKey="members:collections.modal.add.success.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>
            <Translation
              i18nKey="members:collections.modal.add.success.body"
              components={{ b: <b /> }}
              values={{ name: c?.plainName }}
            />
          </p>
          <Button variant="ghost-dark" onClick={onClose}>
            {t("members:collections.modal.add.success.done")}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      onClose={onClose}
      label={t("members:collections.modal.add.dialogLabel")}
    >
      <div className={styles.eyebrow}>
        {t("members:collections.modal.add.eyebrow")}
      </div>
      <h2 className={styles.title}>
        {t("members:collections.modal.add.title")}
      </h2>
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
              <span className={styles.pickMeta}>
                {privacyLabel(c.privacy, c.sharedWithCount, t)}
              </span>
            </span>
            <FiPlus aria-hidden className={styles.pickAdd} />
          </button>
        ))}
      </div>
      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          <FiArrowLeft aria-hidden /> {t("members:collections.modal.add.cancel")}
        </button>
      </div>
    </Modal>
  );
}
