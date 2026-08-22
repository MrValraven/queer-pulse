import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiFolder,
  FiPlus,
  FiX,
} from "react-icons/fi";
import {
  Button,
  Select,
  Spinner,
  useDismiss,
} from "../../shared/components/ui";
import { useFocusOnMount } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { SavedItem } from "../../app/providers/useSaved";
import {
  privacyLabel,
  type Collection,
  type Privacy,
} from "./collections.data";
import {
  CollectionTitleRow,
  DeleteCollectionAction,
} from "./CollectionEditControls";
import styles from "./CollectionsModals.module.css";

/**
 * Shared frame: backdrop click-to-close, close button, and the full modal a11y
 * contract borrowed from the design system's `useDismiss` — scroll lock, an
 * initial focus inside the dialog, a Tab focus-trap, Escape-to-dismiss while
 * topmost, and focus restored to whatever opened it. The bespoke markup stays
 * (these dialogs carry their own eyebrow/title/success chrome) but the
 * behaviour is the shared one, so keyboard and screen-reader users can't tab
 * out into the page behind the overlay.
 */
function Modal({
  onClose,
  label,
  contentKey,
  children,
}: {
  onClose: () => void;
  /** Accessible dialog name announced to screen readers. */
  label?: string;
  /** Change this to replay the modal's entrance animation when its content
   *  is swapped in place (e.g. a picker giving way to a success screen)
   *  instead of just popping — the overlay backdrop stays mounted. */
  contentKey?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        key={contentKey}
        ref={dialogRef}
        tabIndex={-1}
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
    </div>,
    document.body,
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

/**
 * Name a new collection.
 *
 * The Private / Shared / Public select only renders in demo mode, where the
 * seeded grid genuinely stores whatever is picked. Live collections are
 * owner-private and `CreateCollectionBody` carries no visibility field, so
 * offering the choice there would hand a member a "Public" collection that
 * comes back labelled private. Bring the select back when the backend grows a
 * visibility field (see `useCollectionsController.createCollection`).
 */
export function NewCollectionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, privacy: Privacy) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
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
        {demoMode ? (
          <div className={styles.field}>
            <label htmlFor="nc-priv">
              {t("members:collections.modal.newCollection.visibilityLabel")}
            </label>
            <Select
              id="nc-priv"
              options={PRIVACY_OPTION_KEYS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              value={privacy}
              onChange={(value) => setPrivacy(value as Privacy)}
            />
          </div>
        ) : (
          <p className={styles.fieldNote}>
            {t("members:collections.modal.newCollection.privateOnlyNote")}
          </p>
        )}
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

/** Read a collection: list its saved items (live), each linking out. When
 *  `onRemoveItem` is supplied (live mode), each row gets an unfile control.
 *  `onRename`/`onDelete` add the two lifecycle actions the modal used to be
 *  missing, so a mistyped or unwanted collection is no longer permanent. */
export function ViewCollectionModal({
  collection,
  items,
  onClose,
  onRemoveItem,
  onRename,
  onDelete,
  isRenaming = false,
  isDeleting = false,
}: {
  collection: Collection;
  items: SavedItem[];
  onClose: () => void;
  onRemoveItem?: (id: string) => void;
  onRename?: (nextName: string) => Promise<void>;
  onDelete?: (collectionId: string) => Promise<void>;
  isRenaming?: boolean;
  isDeleting?: boolean;
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
      <CollectionTitleRow
        collection={collection}
        onRename={onRename}
        isRenaming={isRenaming}
      />
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
              {onRemoveItem && (
                <button
                  type="button"
                  className={styles.rowRemove}
                  onClick={() => onRemoveItem(it.id)}
                  aria-label={t("members:collections.modal.view.removeItem")}
                >
                  <FiX aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.foot}>
        {onDelete && (
          <DeleteCollectionAction
            collection={collection}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        )}
        <Button variant="ghost" onClick={onClose}>
          {t("members:collections.modal.view.close")}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Pick which collection to add a recent save into.
 *
 * The success panel is gated on the write, not on the click: `onPick` returns
 * the mutation's promise, the pressed row shows a spinner while it's in flight,
 * and only a resolved promise swaps this to "Added to X". A rejected one leaves
 * the picker open (the controller toasts the failure) so the member can retry
 * or choose somewhere else, instead of reading a success screen for a filing
 * that never happened.
 */
export function AddToCollectionModal({
  itemTitle,
  collections,
  onClose,
  onPick,
}: {
  itemTitle: string;
  collections: Collection[];
  onClose: () => void;
  onPick: (collectionId: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [added, setAdded] = useState<string | null>(null);
  const [pendingCollectionId, setPendingCollectionId] = useState<string | null>(
    null,
  );

  const handlePick = async (collectionId: string) => {
    if (pendingCollectionId) return;
    setPendingCollectionId(collectionId);
    try {
      await onPick(collectionId);
      setAdded(collectionId);
    } catch {
      // Already toasted upstream — stay on the picker.
    } finally {
      setPendingCollectionId(null);
    }
  };

  if (added) {
    const c = collections.find((x) => x.id === added);
    return (
      <Modal
        onClose={onClose}
        label={t("members:collections.modal.add.success.dialogLabel")}
        contentKey="success"
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
      contentKey="pick"
    >
      <div className={styles.eyebrow}>
        {t("members:collections.modal.add.eyebrow")}
      </div>
      <h2 className={styles.title}>
        {t("members:collections.modal.add.title")}
      </h2>
      <p className={styles.sub}>{itemTitle}</p>
      <div className={styles.pickList}>
        {collections.map((c) => {
          const isPending = pendingCollectionId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={styles.pick}
              disabled={pendingCollectionId !== null}
              aria-busy={isPending || undefined}
              onClick={() => void handlePick(c.id)}
            >
              <span className={styles.pickIc}>{c.count}</span>
              <span className={styles.pickInfo}>
                <span className={styles.pickName}>{c.name}</span>
                <span className={styles.pickMeta}>
                  {isPending
                    ? t("members:collections.modal.add.filing")
                    : privacyLabel(c.privacy, c.sharedWithCount, t)}
                </span>
              </span>
              {isPending ? (
                <Spinner className={styles.pickAdd} />
              ) : (
                <FiPlus aria-hidden className={styles.pickAdd} />
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          <FiArrowLeft aria-hidden /> {t("members:collections.modal.add.cancel")}
        </button>
      </div>
    </Modal>
  );
}
